// ============================================================
//  EcoTrace – content.js  v4.0
//  Neue Features:
//    · Preis-CO₂-Index (kg CO₂ / €)
//    · Reparierbarkeits-Score (iFixit)
//    · Versandweg-Erkennung (DOM)
//    · CO₂-Monatsbudget Fortschrittsbalken
//    · Achievement-Unlocks
// ============================================================

"use strict";

(function () {
  // ── SPA-Navigation: IMMER aufsetzen, auch wenn aktuell kein Produktartikel ──
  // Wird zuerst aufgerufen, damit navigation.pushState gepatch wird bevor
  // der User zu einem Produkt navigiert. Ohne das würde EcoTrace nie feuern
  // wenn der User von Startseite/Suche zu einem Produkt navigiert.
  let _lastUrl = location.href;
  let _booting = false;

  function watchNavigation() {
    const _push = history.pushState.bind(history);
    history.pushState = function(...args) {
      _push(...args);
      onUrlMaybeChanged();
    };
    window.addEventListener("popstate", onUrlMaybeChanged);

    // MutationObserver als zusätzlicher Fallback (Amazon ändert DOM ohne URL-Change)
    const observer = new MutationObserver(() => onUrlMaybeChanged());
    const target = document.getElementById("dp") || document.body;
    observer.observe(target, { childList: true, subtree: true });
  }

  function onUrlMaybeChanged() {
    if (location.href === _lastUrl) return;
    _lastUrl = location.href;
    if (!isProductPage()) return;
    if (_booting) return;
    _booting = true;
    // Warten bis Amazon das neue Produkt ins DOM geschrieben hat
    setTimeout(() => { _booting = false; boot(); }, 600);
  }

  watchNavigation();

  // Direkt booten wenn wir schon auf einem Produktartikel sind
  if (isProductPage()) setTimeout(boot, 400);

  function isProductPage() {
    return (
      window.location.pathname.includes("/dp/") ||
      window.location.pathname.includes("/gp/product/") ||
      !!document.getElementById("productTitle")
    );
  }

  // ────────────────────────────────────────────────────────
  //  BOOT
  // ────────────────────────────────────────────────────────
  async function boot() {
    // API-Key laden (aus chrome.storage, synchron gecacht)
    try {
      await Promise.all([
        EcoTrace.CarbonService.loadApiKey(),
        EcoTrace.IFixitService.loadMode(),
        // Sprache + Land aus chrome.storage laden
        new Promise(resolve => {
          chrome.storage.local.get(["userCountry","userLang"], d => {
            EcoTrace._userCountry = d.userCountry || "de";
            EcoTrace._userLang    = d.userLang    || "de";
            EcoTrace.I18n.setLang(EcoTrace._userLang);
            resolve();
          });
        })
      ]);
    } catch (_) {}

    let productData = scrapeProductData();
    // Wenn Titel noch nicht im DOM (Amazon Lazy-Loading) → bis zu 3 Sekunden warten
    if (!productData?.title || productData.title === "Unbekanntes Produkt") {
      for (let i = 0; i < 6; i++) {
        await new Promise(r => setTimeout(r, 500));
        productData = scrapeProductData();
        if (productData?.title && productData.title !== "Unbekanntes Produkt") break;
      }
    }
    if (!productData?.title) return;

    // Scan-Statistik im Hintergrund
    try {
      chrome.storage.local.get(["achStats"], d => {
        const s = d.achStats || {};
        s.totalScans = (s.totalScans || 0) + 1;
        if (productData.title.toLowerCase().includes("fairphone")) s.fairphoneScanned = true;
        chrome.storage.local.set({ achStats: s }, () => EcoTrace.AchievementService?.checkAndUnlock(s));
      });
    } catch (_) {}

    // ── Phase 1: Skeleton mit sanftem Fade-Übergang ─────
    // Bestehendes Widget fade-out bei SPA-Navigation
    const existingHost   = document.getElementById("ecotrace-host");
    const existingWidget = existingHost?.shadowRoot?.getElementById("et-widget");
    if (existingWidget) {
      existingWidget.style.transition = "opacity 0.18s ease";
      existingWidget.style.opacity    = "0";
      await new Promise(r => setTimeout(r, 180));
    }
    const shadow = injectSkeleton(productData);
    if (!shadow) return;
    // Fade-in des neuen Widgets
    const newWidget = shadow.getElementById("et-widget");
    if (newWidget) {
      newWidget.style.opacity = "0";
      requestAnimationFrame(() => {
        newWidget.style.transition = "opacity 0.25s ease";
        newWidget.style.opacity    = "1";
      });
    }

    // ── Phase 2: Alle lokalen Daten parallel laden (~0ms) ─
    // CO₂       → 304-Geräte-DB (offline)
    // Versand   → DOM-Analyse (offline)
    // Budget    → chrome.storage (offline)
    // Reparatur → 250-Geräte-DB (offline) ← neu: kein API-Call mehr
    let analysis, shippingInfo, budgetData, predecessor, platforms;

    try {
      [analysis, shippingInfo, budgetData] = await Promise.all([
        EcoTrace.CarbonService.analyzeProduct(productData).catch(() => ({
          product:       { co2_kg: 80, source: t("pci_estimate"), live: false, specific: false },
          shipping:      { co2_kg: 2.0 },
          totalCO2:      82, secondHandCO2: 24,
          savings: 58, savingsPercent: 71, usingLiveData: false
        })),
        Promise.resolve().then(() => {
          try   { return EcoTrace.EcobalyseService.detectShippingOrigin(); }
          catch { return { co2_kg: 2.0, label: "🌍 International", confidence: "low" }; }
        }),
        loadBudgetData().catch(() => ({ budget: null, monthUsed: 0 }))
      ]);
    } catch (e) {
      console.warn("[EcoTrace] Phase 2 Fehler:", e.message);
      analysis     = { product: { co2_kg: 80, source: t("pci_estimate"), live: false, specific: false }, shipping: { co2_kg: 2.0 }, totalCO2: 82, secondHandCO2: 24, savings: 58, savingsPercent: 71, usingLiveData: false };
      shippingInfo = { co2_kg: 2.0, label: "🌍 International", confidence: "low" };
      budgetData   = { budget: null, monthUsed: 0 };
    }

    // Reparierbarkeit: DB-Modus=synchron, API-Modus=async
    let repairResult = null;
    try {
      if (productData.category === "electronics") {
        const scoreResult = EcoTrace.IFixitService.getRepairScore(productData.title);
        // Wenn async (API-Modus): sofort Widget rendern, Ergebnis nachladen
        if (scoreResult instanceof Promise) {
          repairResult = null;  // Widget erstmal ohne Repair-Card
          scoreResult.then(result => {
            if (!result) return;
            const slot = shadow?.getElementById("et-repair-slot");
            if (slot) {
              slot.innerHTML = buildRepairCard(result);
              slot.style.animation = "et-in 0.3s ease";
            }
          }).catch(e => console.warn("[EcoTrace] getRepairScore async:", e.message));
        } else {
          repairResult = scoreResult;
        }
      }
    } catch (e) { console.warn("[EcoTrace] getRepairScore:", e.message); }

    const shippingCO2actual = shippingInfo?.co2_kg ?? 2.0;
    const totalCO2adjusted  = Math.round((analysis.product.co2_kg + shippingCO2actual) * 10) / 10;

    try {
      // Vorgänger-Check für electronics UND generic (Laptops/Watches die nicht erkannt wurden)
      predecessor = (productData.category === "electronics" || productData.category === "generic")
        ? EcoTrace.findPredecessor(productData.title) : null;
      platforms = EcoTrace.getRecommendedPlatforms(productData.category, productData.title, EcoTrace._userCountry);
    } catch { predecessor = null; platforms = []; }

    // ── Widget sofort & vollständig rendern ──
    try {
      renderFullWidget(shadow, {
        productData, analysis, repairResult, shippingInfo,
        shippingCO2actual, totalCO2adjusted, predecessor, platforms, budgetData
      });
    } catch (e) {
      console.error("[EcoTrace] renderFullWidget:", e);
      const body = shadow.getElementById("et-body");
      if (body) body.innerHTML = `<div style="padding:14px;font-size:12px;color:#C62828;text-align:center">
        ⚠️ Fehler beim Laden.<br><span style="font-size:10px;color:#6B6B50">Bitte F5 drücken.</span></div>`;
      return;
    }

    // ── Lokale Shops async – nicht bei Elektronik, nur wenn Einstellung aktiv ──
    chrome.storage.local.get(["prefLocal"], d => {
      const shopEnabled   = d.prefLocal !== false;
      const isElectronics = productData.category === "electronics";
      const placeholder   = shadow.getElementById("et-local-placeholder");

      if (!shopEnabled || isElectronics) {
        if (placeholder) placeholder.style.display = "none";
      } else {
        loadLocalShops(shadow, analysis, productData.category).catch(e =>
          console.warn("[EcoTrace] loadLocalShops:", e.message)
        );
      }
    });
  }

  function loadBudgetData() {
    return new Promise(resolve => {
      chrome.storage.local.get(["monthlyCO2Budget", "savingsLog"], d => {
        const budget = d.monthlyCO2Budget || null;
        const log    = d.savingsLog || [];
        const now    = new Date();
        const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
        let monthUsed = 0;
        for (const e of log) {
          const [day, month, year] = (e.date || "01.01.2000").split(".");
          if (`${year}-${month}` === thisMonth) monthUsed += e.savings || 0;
        }
        resolve({ budget, monthUsed: Math.round(monthUsed * 10) / 10 });
      });
    });
  }

  // ────────────────────────────────────────────────────────
  //  DOM-SCRAPING
  // ────────────────────────────────────────────────────────
  function scrapeProductData() {
    const titleEl = (
      document.getElementById("productTitle") ||
      document.querySelector("h1.a-size-large")
    );
    const title = titleEl?.textContent.trim() || "Unbekanntes Produkt";

    const breadcrumbEl = (
      document.getElementById("wayfinding-breadcrumbs_feature_div") ||
      document.querySelector(".a-breadcrumb")
    );
    const breadcrumb = breadcrumbEl?.textContent.trim() || "";

    const details = [
      "#productDetails_techSpec_section_1",
      "#productDetails_detailBullets_sections1",
      "#detail-bullets", "#feature-bullets"
    ].map(s => document.querySelector(s)?.textContent || "").join(" ");

    // Preis scrapen
    const priceRaw = (
      document.querySelector(".a-price .a-offscreen") ||
      document.querySelector("#priceblock_ourprice") ||
      document.querySelector(".a-price-whole")
    )?.textContent || "";
    const priceEur = parseFloat(
      priceRaw.replace(/[^0-9,\.]/g, "").replace(",", ".")
    ) || null;

    // ASIN
    const asin = EcoTrace.EcobalyseService.extractASIN();

    return {
      title,
      breadcrumb,
      category: EcoTrace.detectCategory(title, breadcrumb),
      weightKg:  EcoTrace.parseWeight(details + " " + title),
      material:  EcoTrace.detectMaterial(details + " " + title),
      priceEur,
      asin
    };
  }

  // ────────────────────────────────────────────────────────
  //  SKELETON
  // ────────────────────────────────────────────────────────
  function injectSkeleton(productData) {
    document.getElementById("ecotrace-host")?.remove();
    const host = document.createElement("div");
    host.id = "ecotrace-host";
    host.style.cssText = "position:fixed;top:80px;right:20px;z-index:2147483647;";
    document.body.appendChild(host);
    const shadow = host.attachShadow({ mode: "open" });
    shadow.innerHTML = `<style>${getCSS()}</style>
      <div class="et-widget" id="et-widget">
        ${buildHeader()}
        <div class="et-body" id="et-body">
          <div class="sk-line" style="width:90%;height:11px"></div>
          <div class="et-leaves">${[...Array(5)].map(()=>`<div class="sk-leaf"></div>`).join("")}</div>
          <div class="et-co2-section">
            ${[...Array(3)].map(()=>`<div class="et-co2-row"><span class="sk-line" style="width:55%"></span><span class="sk-line" style="width:25%"></span></div>`).join("")}
          </div>
          <div class="et-badge" style="border-color:#D4D4AA;min-height:80px">
            <div class="sk-line" style="width:50%;margin:0 auto 8px"></div>
            <div class="sk-line" style="width:40%;height:26px;margin:0 auto"></div>
          </div>
          <div class="et-loading-status"><span class="et-spinner"></span><span>${t('loading_co2')}</span></div>
        </div>
      </div>
      <div class="et-pill" id="et-pill" style="display:none">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><path d="M12 3C8 7 7 10 9 14c1 2 3 3 3 3s2-1 3-3c2-4 1-7-3-11z"/></svg>
        <span>${t('loading_calculating')}</span>
      </div>`;
    attachBaseListeners(shadow);
    return shadow;
  }

  // ────────────────────────────────────────────────────────
  //  VOLLSTÄNDIGES WIDGET
  // ────────────────────────────────────────────────────────
  function renderFullWidget(shadow, ctx) {
    const { productData, analysis, repairResult, shippingInfo,
            shippingCO2actual, totalCO2adjusted, predecessor,
            platforms, budgetData } = ctx;

    const savings      = EcoTrace.calculateSavings(
      totalCO2adjusted, analysis.secondHandCO2
    );
    const savingsColor  = savings > 0 ? "#228B22" : "#CC4444";
    const leafRating    = EcoTrace.getLeafRating(savings);
    const comparison    = EcoTrace.getComparison(savings);

    // Quelle-Badge: DB-Treffer > Climatiq Live > Schätzung
    const p = analysis.product;
    const liveTag = p.specific
      ? `<span class="et-live-tag specific">${t('badge_specific')}</span>`
      : p.live
        ? `<span class="et-live-tag">${t('badge_live')}</span>`
        : `<span class="et-mock-tag">${t('badge_estimate')}</span>`;

    // Quelle-Zeile mit optionalem Modell-Match
    const sourceHintText = p.specific && p.matched
      ? `${esc(p.source)} · Match: "${esc(p.matched)}" · ${esc(p.notes || "")}`
      : `${esc(p.source)}`;

    // Preis-CO₂-Index
    // Formel: kg CO₂ pro Euro – je niedriger, desto besser
    // Neukauf:     totalCO2 / Neupreis
    // Refurbished: (Produktion × 0.30 + 1.2 kg Versand) / Refurbished-Preis
    //
    // Refurbished-Preis-Schätzung: Ø 65–70% des Neupreises
    //   Quelle: Back Market DE Preisanalyse 2024 (Durchschnitt über Kategorien)
    //   Smartphones: ~70% | Laptops: ~65% | Tablets: ~68%
    // Refurbished-CO₂: Produktion = 0 (keine Neuproduktion) + Back Market EU-Versand 1.2 kg
    const priceCO2 = productData.priceEur && productData.priceEur > 0
      ? (totalCO2adjusted / productData.priceEur).toFixed(3)
      : null;
    const refurbishedPrice = productData.priceEur
      ? Math.round(productData.priceEur * 0.68)   // Ø 68% des Neupreises (Back Market 2024)
      : null;
    // Refurbished-CO₂: 30% der Produktion (kein Neukauf) + 1.2 kg EU-Versand (Back Market)
    const refurbishedCO2 = analysis.product
      ? Math.round((analysis.product.co2_kg * 0.30 + 1.2) * 10) / 10
      : analysis.secondHandCO2;
    const refurbishedPriceCO2 = refurbishedPrice && refurbishedPrice > 0
      ? (refurbishedCO2 / refurbishedPrice).toFixed(3)
      : null;

    // Pill
    const pill = shadow.getElementById("et-pill");
    if (pill) pill.querySelector("span:last-child").textContent =
      savings > 0 ? `−${savings} kg CO₂` : `${totalCO2adjusted} kg CO₂`;

    const body = shadow.getElementById("et-body");
    if (!body) return;

    body.innerHTML = `
      <!-- Produktname + Quelle-Badge -->
      <div class="et-product-row">
        <div class="et-product-name">${esc(truncate(productData.title, 60))}</div>
        ${liveTag}
      </div>

      <!-- Leaf Rating -->
      <div class="et-leaves">${buildLeaves(leafRating)}</div>

      <!-- CO₂ Breakdown + Versandweg -->
      <div class="et-co2-section">
        <div class="et-co2-row">
          <span class="et-label">${t('production')}</span>
          <span class="et-value">${analysis.product.co2_kg} kg CO₂</span>
        </div>
        <div class="et-co2-row">
          <span class="et-label">
            ${shippingInfo.label} ${t('shipping')}
            ${shippingInfo.confidence === "high"
              ? `<span class="et-confidence-badge high">${t('shipping_detected')}</span>`
              : `<span class="et-confidence-badge low">${t('shipping_estimated')}</span>`}
          </span>
          <span class="et-value">+${shippingCO2actual} kg CO₂</span>
        </div>
        <div class="et-co2-row et-co2-total">
          <span class="et-label">${t('total_new')}</span>
          <span class="et-value">${totalCO2adjusted} kg CO₂</span>
        </div>
        <div class="et-source-hint">📖 ${sourceHintText}</div>
      </div>

      <!-- Impact Badge -->
      <div class="et-badge" style="border-color:${savingsColor}">
        <div class="et-badge-label">${t('savings_vs_used')}</div>
        <div class="et-badge-value" style="color:${savingsColor}">
          ${savings > 0 ? "−" : "+"}${Math.abs(savings)} kg CO₂
        </div>
        ${comparison ? `<div class="comparison">🌱 ${esc(comparison.text)}</div>` : ""}
      </div>

      <!-- ── NEU: Preis-CO₂-Index ── -->
      ${buildPriceCO2Card(
        productData.priceEur, priceCO2,
        refurbishedPrice, refurbishedCO2, refurbishedPriceCO2,
        totalCO2adjusted, productData.category
      )}

      <!-- ── Reparierbarkeits-Score ── -->
      ${productData.category === "electronics"
        ? repairResult
          ? `<div id="et-repair-slot">${buildRepairCard(repairResult)}</div>`
          : `<div id="et-repair-slot">
               <div class="et-repair-card" style="background:#F5F5F5">
                 <div class="repair-header-row">
                   <div class="et-section-label" style="margin-bottom:0">${t('repair_title')}</div>
                   <span class="repair-source-badge cache">⏳ Live-API…</span>
                 </div>
                 <div style="font-size:10.5px;color:#9E9E9E;margin-top:6px">${t('loading_repair')}</div>
               </div>
             </div>`
        : ""}

      <!-- ── NEU: CO₂-Budget-Balken ── -->
      ${budgetData.budget ? buildBudgetBar(budgetData) : ""}

      <!-- Vorgänger (Elektronik) / Secondhand-Suche (Textil) -->
      ${productData.category === "textile"
        ? buildTextileSecondhandCard(productData.title)
        : (predecessor ? buildPredecessorCard(predecessor) : "")}

      <!-- ── GEBRAUCHT KAUFEN (Circular + Plattformen zusammengeführt) ── -->
      ${buildUsedSection(productData.title, totalCO2adjusted, platforms)}

      <!-- Lokale Shops Placeholder -->
      <div id="et-local-placeholder">
        <div class="et-section-label">${getCategoryRepairLabel(productData.category)}</div>
        <div class="et-local-loading"><span class="et-spinner"></span><span>${t('local_loading')}</span></div>
      </div>

      <!-- Aktions-Buttons -->
      <div class="et-actions">
        <button class="et-btn-action et-btn-repair" id="et-btn-repair">
          ${t("repair_btn") || "🔧 Altes Gerät reparieren lassen"}
        </button>
<button class="et-btn-save" id="et-save-savings">
          ${t('save_btn')}
        </button>
      </div>

      <!-- Footer -->
      <div class="et-footer">
        <a class="et-options-link" id="et-open-options">${t('footer_settings')}</a>
        · <a class="et-options-link" id="et-open-info">${t('footer_info')}</a>
        · <a class="et-options-link et-kofi-link" id="et-kofi-btn"
             href="https://ko-fi.com/maxation" target="_blank" rel="noopener"
             title="EcoTrace unterstützen">${t('footer_support')}</a>
        ${EcoTrace.hasAffiliateLinks?.() ? '<span class="et-affiliate-note" title="Einige Links sind Affiliate-Links – mehr im ℹ Panel">*</span>' : ""}
      </div>

      <!-- Einstellungs-Panel (initial versteckt) -->
      <div class="et-settings-panel" id="et-settings-panel" style="display:none"></div>

      <!-- Info-Panel (initial versteckt) -->
      <div class="et-info-panel" id="et-info-panel" style="display:none">
        ${buildInfoPanel(analysis.product)}
      </div>
    `;

    attachFullListeners(shadow, { productData, analysis, platforms,
                                   savings, totalCO2adjusted });
  }

  // ────────────────────────────────────────────────────────
  //  HTML-BAUSTEINE
  // ────────────────────────────────────────────────────────

  function buildHeader() {
    return `<div class="et-header">
      <div class="et-logo">
        <svg width="20" height="20" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="rgba(255,255,255,0.15)"/>
          <path d="M12 3C8 7 7 10 9 14c1 2 3 3 3 3s2-1 3-3c2-4 1-7-3-11z" fill="#fff"/>
          <path d="M12 14 Q10 11 8 9" stroke="rgba(255,255,255,0.5)" stroke-width="1.5" fill="none" stroke-linecap="round"/>
        </svg>
        <span class="et-brand">EcoTrace</span>
      </div>
      <div class="et-controls">
        <button class="et-btn-icon" id="et-minimize">−</button>
        <button class="et-btn-icon" id="et-close">✕</button>
      </div>
    </div>`;
  }

  function buildLeaves(rating) {
    return [...Array(5)].map((_, i) =>
      `<svg class="leaf ${i < rating ? "on" : "off"}" width="16" height="16" viewBox="0 0 24 24">
        <path d="M12 3C8 7 7 10 9 14c1 2 3 3 3 3s2-1 3-3c2-4 1-7-3-11z"
              fill="${i < rating ? "#228B22" : "#C8C8B0"}"/></svg>`
    ).join("");
  }

  // ── Preis-CO₂-Index ──────────────────────────────────────
  function buildPriceCO2Card(price, priceCO2, refPrice, refCO2, refPriceCO2, totalCO2, category) {
    const isTextile = category === "textile";

    // ── TEXTIL-MODUS ─────────────────────────────────────────
    // Second-Hand Kleidung kostet ~10% des Neupreises (Vinted/Kleinanzeigen Durchschnitt)
    if (isTextile) {
      const country = EcoTrace._userCountry || "de";
      const shPlats = country === "at" ? "Willhaben, Vinted" :
                      country === "ch" ? "Vinted, Ricardo" :
                      "Kleinanzeigen, Vinted";

      // Kein Preis erkannt → manuelle Eingabe
      if (!price || !priceCO2) {
        return `
          <div class="et-price-co2">
            <div class="et-section-label">💶 Second-Hand Preisvorteil</div>
            <div class="pci-explain">Trage den Neupreis ein – wir zeigen dir was du gebraucht zahlst:</div>
            <div class="pci-manual-row">
              <input class="pci-manual-input" id="pci-price-input"
                type="number" min="1" max="99999" placeholder="z.B. 49"
                data-totalco2="${totalCO2}" data-category="textile"/>
              <span class="pci-manual-unit">€</span>
            </div>
            <div id="pci-manual-result" class="pci-manual-result" style="display:none"></div>
          </div>`;
      }

      const usedPrice    = Math.round(price * 0.10);   // ~10% des Neupreises
      const usedPriceLow = Math.round(price * 0.05);   // günstigstes
      const usedCO2      = Math.round(totalCO2 * 0.05 * 10) / 10; // Transport ~5% (kein Neuproduktion)
      const usedPriceCO2 = usedPrice > 0 ? (usedCO2 / usedPrice).toFixed(3) : null;
      const usedBarPct   = usedPriceCO2
        ? Math.min(100, Math.round((parseFloat(usedPriceCO2) / parseFloat(priceCO2)) * 100))
        : 0;
      const ratio = usedPriceCO2
        ? Math.round((1 - parseFloat(usedPriceCO2) / parseFloat(priceCO2)) * 100)
        : null;

      return `
        <div class="et-price-co2">
          <div class="et-section-label">💶 Second-Hand Preisvorteil</div>
          <div class="pci-explain">
            Gebraucht kaufen spart Geld <em>und</em> CO₂.
            <strong>Niedriger = besser.</strong>
          </div>
          <div class="price-co2-grid">
            <div class="price-co2-item">
              <div class="pci-label">🆕 Neu ${price}€</div>
              <div class="pci-bar-wrap">
                <div class="pci-bar pci-bar-new" style="width:100%"></div>
              </div>
              <div class="pci-val pci-bad">${priceCO2} kg/€</div>
            </div>
            ${usedPrice && usedPriceCO2 ? `
            <div class="price-co2-item">
              <div class="pci-label">👗 Gebraucht ~${usedPriceLow}–${usedPrice}€
                <span class="pci-est">${shPlats}</span></div>
              <div class="pci-bar-wrap">
                <div class="pci-bar pci-bar-ref" style="width:${usedBarPct}%"></div>
              </div>
              <div class="pci-val pci-good">${usedPriceCO2} kg/€</div>
            </div>` : ""}
          </div>
          ${ratio !== null ? `
          <div class="pci-conclusion">
            ✅ Gebraucht: <strong>${ratio}% CO₂-effizienter</strong> pro Euro
          </div>
          <div class="pci-footnote">
            Second-Hand Preis: ~5–10% des Neupreises (${shPlats} Ø) ·
            CO₂ = nur Transport, keine Neuproduktion
          </div>` : ""}
        </div>`;
    }

    // ── ELEKTRONIK / STANDARD-MODUS ──────────────────────────
    // Kein Preis erkannt → manuelle Eingabe
    if (!price || !priceCO2) {
      return `
        <div class="et-price-co2">
          <div class="et-section-label">${t('pci_title')}</div>
          <div class="pci-explain">${t('pci_no_price')}</div>
          <div class="pci-manual-row">
            <input class="pci-manual-input" id="pci-price-input"
              type="number" min="1" max="99999" placeholder="z.B. 999"
              data-totalco2="${totalCO2}"/>
            <span class="pci-manual-unit">€</span>
          </div>
          <div id="pci-manual-result" class="pci-manual-result" style="display:none"></div>
        </div>`;
    }

    const ratio = refPriceCO2
      ? Math.round((1 - refPriceCO2 / priceCO2) * 100)
      : null;
    const refBarPct = refPriceCO2
      ? Math.min(100, Math.round((refPriceCO2 / priceCO2) * 100))
      : 0;

    return `
      <div class="et-price-co2">
        <div class="et-section-label">${t('pci_title')}</div>
        <div class="pci-explain">${t('pci_explain')}</div>
        <div class="price-co2-grid">
          <div class="price-co2-item">
            <div class="pci-label">${t('pci_new')} ${price}€</div>
            <div class="pci-bar-wrap">
              <div class="pci-bar pci-bar-new" style="width:100%"></div>
            </div>
            <div class="pci-val pci-bad">${priceCO2} kg/€</div>
          </div>
          ${refPrice && refPriceCO2 ? `
          <div class="price-co2-item">
            <div class="pci-label">${t('pci_ref')} ~${refPrice}€ <span class="pci-est">${t('pci_estimate')}</span></div>
            <div class="pci-bar-wrap">
              <div class="pci-bar pci-bar-ref" style="width:${refBarPct}%"></div>
            </div>
            <div class="pci-val pci-good">${refPriceCO2} kg/€</div>
          </div>` : ""}
        </div>
        ${ratio !== null ? `
        <div class="pci-conclusion">
          ✅ Refurbished: <strong>${ratio}% ${t('pci_better')}</strong> ${t('pci_per_euro')}
        </div>
        <div class="pci-footnote">${t('pci_footnote')}</div>` : ""}
      </div>`;
  }

  // ── Reparierbarkeits-Score ────────────────────────────────
  function buildRepairCard(r) {
    const wrenches = EcoTrace.IFixitService.buildWrenchIcons(r.score);
    const isEN     = EcoTrace._userLang === "en";

    // Quelle-Badge
    const sourceBadge = {
      api:      `<span class="repair-source-badge live">${t('repair_badge_live')}</span>`,
      cache:    `<span class="repair-source-badge cache">${t('repair_badge_cache')}</span>`,
      static:   `<span class="repair-source-badge static">${t('repair_badge_local')}</span>`,
      fallback: `<span class="repair-source-badge fallback">${t('repair_badge_est')}</span>`,
    }[r.source] || "";

    // Anleitungs-Anzahl
    const guidesText = r.guideCount > 0
      ? `${r.guideCount} ${t('repair_guides')}`
      : "";

    // Reparaturkosten-Schätzung
    const costData = EcoTrace.IFixitService.getRepairCost(r.deviceName || "");
    const costHTML = costData ? (() => {
      const rows = costData.repairs.map(rep => {
        const werkstatt = `${rep.costMin}–${rep.costMax}€`;
        const diy = rep.diyMin !== null ? `${rep.diyMin}–${rep.diyMax}€` : null;
        const lifeLabel = isEN
          ? `+${rep.lifespan}y device life`
          : `+${rep.lifespan} Jahre Gerätelebensdauer`;
        return `
          <div class="repair-cost-row">
            <div class="repair-cost-part">🔧 ${esc(rep.part)}</div>
            <div class="repair-cost-prices">
              <span class="repair-cost-shop" title="${isEN?"Workshop price":"Werkstattpreis"}">🏪 ${werkstatt}</span>
              ${diy ? `<span class="repair-cost-diy" title="${isEN?"DIY parts only":"Selbst, nur Teile"}">🛠 ${diy}</span>` : ""}
              <span class="repair-cost-life">⏱ ${lifeLabel}</span>
            </div>
          </div>`;
      }).join("");
      const header = isEN ? "💶 Repair cost estimate" : "💶 Reparaturkosten-Schätzung";
      const source = isEN ? "Sources: iFixit Parts Store, Apple Self Repair DE, Handyreparatur.de 2024"
                          : "Quellen: iFixit Parts Store, Apple Self Repair DE, Handyreparatur.de 2024";
      return `
        <div class="repair-cost-section">
          <div class="repair-cost-header">${header}</div>
          ${rows}
          <div class="repair-cost-source">${source}</div>
        </div>`;
    })() : "";

    return `
      <div class="et-repair-card" style="background:${r.bg}">
        <div class="repair-header-row">
          <div class="et-section-label" style="margin-bottom:0">${t("sp_repair_title")}</div>
          ${sourceBadge}
        </div>
        ${r.deviceName ? `<div class="repair-device-name">${esc(r.deviceName)}</div>` : ""}
        <div class="repair-row">
          <div class="repair-wrenches">${wrenches}</div>
          <div class="repair-score" style="color:${r.color}">${r.score}/10</div>
        </div>
        <div class="repair-label" style="color:${r.color}">${esc(r.label)}</div>
        <div class="repair-meta-row">
          ${r.partsLabel ? `<span class="repair-parts-pill">🔩 ${esc(r.partsLabel)}</span>` : ""}
          ${guidesText   ? `<span class="repair-guides-pill">📖 ${esc(guidesText)}</span>` : ""}
        </div>
        ${costHTML}
        <div class="repair-link-row">
          <a class="repair-guide-link" href="${r.guideUrl}" target="_blank" rel="noopener">
            ${t('repair_guides_link')}
          </a>
          ${r.partsUrl ? `<a class="repair-parts-link" href="${r.partsUrl}" target="_blank" rel="noopener">
            ${t('repair_parts_link')}
          </a>` : ""}
        </div>
        ${r.dataAge ? `<div class="repair-age">${esc(r.dataAge)}</div>` : ""}
      </div>`;
  }

  // ── CO₂-Budget-Fortschrittsbalken ────────────────────────
  function buildBudgetBar({ budget, monthUsed }) {
    const pct      = Math.min(Math.round((monthUsed / budget) * 100), 100);
    const over     = monthUsed > budget;
    const barColor = over ? "#B71C1C" : pct > 75 ? "#F57F17" : "#228B22";
    const bgColor  = over ? "#FFEBEE" : pct > 75 ? "#FFF8E1" : "#E8F5E9";
    return `
      <div class="et-budget-bar" style="background:${bgColor}">
        <div class="et-section-label">📊 CO₂-Monatsbudget</div>
        <div class="budget-numbers">
          <span>${monthUsed.toFixed(1)} kg genutzt</span>
          <span>/ ${budget} kg Budget</span>
        </div>
        <div class="budget-track">
          <div class="budget-fill" style="width:${pct}%;background:${barColor}">
            ${pct > 15 ? `<span>${pct}%</span>` : ""}
          </div>
        </div>
        ${over ? `<div class="budget-over">⚠ Budget überschritten (+${(monthUsed-budget).toFixed(1)} kg)</div>` : ""}
      </div>`;
  }

  // ── Textil: Secondhand-Suche in der Nähe ────────────────────
  function buildTextileSecondhandCard(productTitle) {
    const clean = EcoTrace._cleanSearchQuery(productTitle);
    const lang  = EcoTrace._userLang || "de";

    // Google Maps Suche nach Second-Hand Shops in der Nähe
    // Wenn wir die Position haben → mit Koordinaten, sonst "near me"
    const pos = EcoTrace.LocationService?._cachedPosition;
    const gmapsBase = "https://www.google.com/maps/search/";
    const shopQuery = lang === "de"
      ? encodeURIComponent("Secondhand Kleidung in der Nähe")
      : encodeURIComponent("second hand clothing near me");
    const gmapsUrl = pos
      ? `${gmapsBase}${shopQuery}/@${pos.lat},${pos.lng},14z`
      : `${gmapsBase}${shopQuery}`;

    // Plattform-Suche-URLs für den Artikel
    const textilePlatforms = [
      { id: "vinted",    emoji: "👗" },
      { id: "kleinanzeigen", emoji: "📍" },
      { id: "willhaben", emoji: "🇦🇹" },
      { id: "sellpy",    emoji: "👔" },
    ].filter(p => {
      const pl = EcoTrace.platformDB[p.id];
      if (!pl) return false;
      const country = EcoTrace._userCountry || "de";
      return !pl.countries || pl.countries.includes(country) || pl.countries.includes("all");
    }).slice(0, 4);

    return `
      <div class="et-textile-sh">
        <div class="textile-sh-header">
          ${t("textile_sh_header")}
        </div>
        <div class="textile-sh-body">
          <div class="textile-sh-title">"${esc(clean)}"</div>
          <div class="textile-sh-subtitle">
            ${t("textile_sh_sub")}
          </div>

          <!-- Google Maps: Shops in der Stadt -->
          <a class="textile-gmaps-btn" href="${gmapsUrl}" target="_blank" rel="noopener">
            <span class="textile-gmaps-icon">📍</span>
            <span>${t("textile_gmaps")}</span>
            <span class="textile-gmaps-arrow">→</span>
          </a>

          <!-- Online Plattformen -->
          <div class="textile-sh-platforms">
            ${textilePlatforms.map(({ id }) => {
              const pl  = EcoTrace.platformDB[id];
              const url = EcoTrace.searchAlternative(productTitle, id);
              return `<a class="textile-plat-btn" href="${url}" target="_blank" rel="noopener"
                         style="border-color:${pl.color};color:${pl.color}">
                        ${pl.emoji} ${pl.name}
                      </a>`;
            }).join("")}
          </div>
        </div>
      </div>`;
  }

  function buildPredecessorCard(entry) {
    const p       = entry.predecessor;
    const p2      = entry.predecessor.predecessor2 || null;
    const country = EcoTrace._userCountry || "de";
    const isEN    = EcoTrace._userLang === "en";

    // Plattformen je nach Land anpassen
    const basePlatforms = ["backmarket", "rebuy"];
    if (country === "at") basePlatforms.push("willhaben");
    else if (country === "ch") basePlatforms.push("revendo");
    else basePlatforms.push("kleinanzeigen");
    const showWillhaben = country !== "at" && EcoTrace.platformDB["willhaben"];

    // Hilfsfunktion: Links für eine predecessor-Option
    const buildLinks = (pred) => `
      <div class="pred-links">
        ${basePlatforms.map(pid => {
          const pl  = EcoTrace.platformDB[pid];
          if (!pl) return "";
          const url = EcoTrace.searchAlternative(pred.searchHint, pid);
          return `<a class="pred-link" href="${url}" target="_blank" rel="noopener"
                     style="border-color:${pl.color};color:${pl.color}">
                    ${pl.emoji} ${pl.name}</a>`;
        }).join("")}
        ${showWillhaben ? (() => {
          const pl  = EcoTrace.platformDB["willhaben"];
          const url = EcoTrace.searchAlternative(pred.searchHint, "willhaben");
          return `<a class="pred-link" href="${url}" target="_blank" rel="noopener"
                     style="border-color:${pl.color};color:${pl.color}">
                    ${pl.emoji} ${pl.name}</a>`;
        })() : ""}
      </div>`;

    // Gen1-Pill
    const absPerf1 = Math.abs(p.perfDelta);
    const gen1Note = isEN && p.notesEN ? p.notesEN : p.notes;

    // Gen2-Pill (wenn vorhanden)
    const gen2HTML = p2 ? (() => {
      const absPerf2 = Math.abs(p2.perfDelta);
      const gen2Label = isEN ? `2 generations back · ~${p2.priceSave||35}% cheaper` : `2 Generationen zurück · ~${p2.priceSave||35}% günstiger`;
      return `
        <div class="pred-gen2">
          <div class="pred-gen2-label">💰 ${gen2Label}</div>
          <div class="pred-name pred-name-sm">${esc(p2.name)}</div>
          <div class="pred-perf">
            <span class="pred-pill" style="background:#FFF3E0;color:#E65100">${p2.perfDelta}${t("pred_perf")}</span>
            <span class="pred-note">${esc(isEN && p2.notesEN ? p2.notesEN : p2.notes)}</span>
          </div>
          ${buildLinks(p2)}
        </div>`;
    })() : "";

    return `
      <div class="et-predecessor">
        <div class="pred-header">${t("pred_header")}</div>
        <div class="pred-body">
          <div class="pred-gen1-label">${isEN ? "1 generation back" : "1 Generation zurück"}</div>
          <div class="pred-name">${esc(p.name)}</div>
          <div class="pred-perf">
            <span class="pred-pill" style="background:${absPerf1<=8?"#E8F5E9":"#FFF8E1"};
                  color:${absPerf1<=8?"#2E7D32":"#F57F17"}">${p.perfDelta}${t("pred_perf")}</span>
            <span class="pred-note">${esc(gen1Note)}</span>
          </div>
          ${buildLinks(p)}
          ${gen2HTML}
        </div>
      </div>`;
  }

  // ── Kombinierte "Gebraucht kaufen" Sektion ───────────────
  // Vereint Circular Swap (Solarpunk-Motto + CO₂-Vergleich)
  // mit den Plattform-Links im bewährten plat-item Design.
  function buildUsedSection(productTitle, totalCO2, platforms) {
    // Beste Ersparnis: Back Market (EU) als Referenz
    const bestImpact  = EcoTrace.CircularSwap.calculateUsedImpact(totalCO2, "backmarket");
    const localImpact = EcoTrace.CircularSwap.calculateUsedImpact(totalCO2, "kleinanzeigen");
    const compare     = EcoTrace.CircularSwap.getComparison(bestImpact.saved);

    // Alle Plattformen: platformDB-Liste + CircularSwap-Links vereint
    // CircularSwap-Plattformen die NICHT schon in platforms sind, hinten anhängen
    const circularIds = new Set(["kleinanzeigen", "vinted", "rebuy"]);
    const platIds     = new Set((platforms || []).map(p => p.id));
    const extraLinks  = EcoTrace.CircularSwap.generateCircularLinks(productTitle)
      .filter(l => !platIds.has(l.id))
      .map(l => ({ ...l, fromCircular: true }));

    const allPlatforms = [...(platforms || []), ...extraLinks];

    const platRows = allPlatforms.map(p => {
      const url  = p.fromCircular
        ? p.url
        : EcoTrace.searchAlternative(productTitle, p.id);
      // Echte Ersparnis berechnen (inkl. Versand des Händlers)
      const imp  = EcoTrace.CircularSwap.calculateUsedImpact(totalCO2, p.id);
      const savedKg = imp.saved;
      const pct     = imp.savedPercent;

      return `<a class="plat-item used-plat-item"
                 data-platform="${p.id}"
                 data-url="${esc(url)}"
                 data-co2="${totalCO2}"
                 href="${esc(url)}" target="_blank" rel="noopener"
                 style="--pc:${p.color}">
        <span class="plat-emoji">${p.emoji}</span>
        <div class="plat-info">
          <span class="plat-name">${esc(p.name)}</span>
          <span class="plat-badge">${esc(EcoTrace.getBadge?.(p) || p.tagline || "")}</span>
        </div>
        <div class="plat-saving-block">
          <span class="plat-saving-kg">−${savedKg} kg</span>
          <span class="plat-saving-pct">−${pct}%</span>
        </div>
      </a>`;
    }).join("");

    return `
      <div class="et-used-section">
        <!-- Header mit Solarpunk-Motto -->
        <div class="used-header">
          <span class="used-icon">🌿</span>
          <span class="used-title">${t("used_title")}</span>
        </div>
        <div class="used-motto">
          ${t('used_motto')}
        </div>

        <!-- CO₂-Vergleich Zeile -->
        <div class="used-co2-row">
          <div class="used-co2-block new-block">
            <span class="used-co2-val">${totalCO2} kg</span>
            <span class="used-co2-lbl">${t('used_new')}</span>
          </div>
          <span class="used-arrow">→</span>
          <div class="used-co2-block save-block">
            <span class="used-co2-val">~${Math.round(bestImpact.usedCO2 * 10)/10} kg</span>
            <span class="used-co2-lbl">${t('used_ref')}</span>
          </div>
          <div class="used-co2-block local-block">
            <span class="used-co2-val">~${Math.round(localImpact.usedCO2 * 10)/10} kg</span>
            <span class="used-co2-lbl">${t('used_local')}</span>
          </div>
        </div>

        ${compare ? `<div class="used-compare">🌱 ${esc(compare.text)}</div>` : ""}

        <!-- Plattform-Liste -->
        <div class="plat-list used-plat-list">
          ${platRows}
        </div>

        <!-- Bestätigungs-Banner -->
        <div class="circular-confirm" id="circular-confirm" style="display:none">
          ${t('used_confirm')}
        </div>
      </div>
    `;
  }

  // ── Einstellungs-Panel (Overlay im Widget) ────────────────
  function buildSettingsPanel(currentSettings) {
    const { climatiqKey = "", modeCO2 = "db", modeRepair = "db",
            budgetOn = false, budgetVal = "", radiusVal = 5,
            prefPredecessor = true, prefPriceIndex = true, prefLocal = true,
            userCountry = "de", userLang = "de" } = currentSettings;

    const modeBtn = (id, mode, current, label, sub, color) =>
      `<button class="sp-mode-btn ${current === mode ? "active-"+color : ""}"
               data-setting="${id}" data-value="${mode}">
        ${label}<br><small>${sub}</small>
      </button>`;

    return `
      <div class="sp-header">
        <span class="sp-title">${t("sp_title")}</span>
        <button class="sp-close" id="sp-close">✕</button>
      </div>
      <div class="sp-body">

        <!-- CO₂-Datenquelle -->
        <div class="sp-section">
          <div class="sp-section-title">${t("sp_co2_title")}</div>
          <div class="sp-mode-row" id="sp-mode-co2">
            ${modeBtn("modeCO2","db",modeCO2,"📋 Offline-DB",t("sp_db_sub_devices"),"green")}
            ${modeBtn("modeCO2","api",modeCO2,"🌐 Climatiq API",t("sp_api_sub"),"blue")}
          </div>
          <div class="sp-api-block" id="sp-co2-api-block" style="display:${modeCO2==="api"?"block":"none"}">
            <div class="sp-label">Climatiq API-Key</div>
            <div class="sp-key-row">
              <input class="sp-input" id="sp-climatiq-key" type="password"
                     placeholder="Dein Key…" value="${esc(climatiqKey)}" autocomplete="off"/>
              <button class="sp-eye" id="sp-toggle-key" type="button">👁</button>
            </div>
            <div class="sp-hint">Kostenlos auf <a href="https://climatiq.io" target="_blank" class="sp-link">climatiq.io</a> · 100 Anfragen/Monat gratis</div>
          </div>
        </div>

        <!-- Reparierbarkeit -->
        <div class="sp-section">
          <div class="sp-section-title">${t("info_repair_section")}</div>
          <div class="sp-mode-row" id="sp-mode-repair">
            ${modeBtn("modeRepair","db",modeRepair,"📋 Offline-DB",t("sp_db_sub"),"green")}
            ${modeBtn("modeRepair","api",modeRepair,"🌐 iFixit API",t("sp_ifixit_api_sub"),"blue")}
          </div>
        </div>

        <!-- Lokale Shops -->
        <div class="sp-section">
          <div class="sp-section-title">${t("sp_shops_title")}</div>
          <div class="sp-pref-row">
            <div>
              <div class="sp-pref-lbl">${t("sp_shops_enable")}</div>
            </div>
            <label class="sp-toggle">
              <input type="checkbox" id="sp-pref-local" ${prefLocal?"checked":""}>
              <span class="sp-slider"></span>
            </label>
          </div>
          <div class="sp-pref-row">
            <div>
              <div class="sp-pref-lbl">${t("sp_radius_label")}</div>
              <div class="sp-pref-sub" id="sp-radius-label">${radiusVal} km</div>
            </div>
            <input type="range" id="sp-search-radius" min="1" max="20" value="${radiusVal}"
              style="width:90px;accent-color:var(--green)"
/>
          </div>
        </div>

        <!-- Overlay-Optionen -->
        <div class="sp-section">
          <div class="sp-section-title">${t("sp_overlay_title")}</div>
          <div class="sp-pref-row">
            <div class="sp-pref-lbl">${t("sp_predecessor")}</div>
            <label class="sp-toggle">
              <input type="checkbox" id="sp-pref-predecessor" ${prefPredecessor?"checked":""}>
              <span class="sp-slider"></span>
            </label>
          </div>
          <div class="sp-pref-row">
            <div class="sp-pref-lbl">${t("sp_price_index")}</div>
            <label class="sp-toggle">
              <input type="checkbox" id="sp-pref-price-index" ${prefPriceIndex?"checked":""}>
              <span class="sp-slider"></span>
            </label>
          </div>
          <div class="sp-pref-row">
            <div>
              <div class="sp-pref-lbl">${t("sp_budget_label")}</div>
              <div class="sp-pref-sub" id="sp-budget-sub">${budgetOn&&budgetVal ? budgetVal+" kg/Monat" : t("sp_budget_off")}</div>
            </div>
            <label class="sp-toggle">
              <input type="checkbox" id="sp-pref-budget" ${budgetOn?"checked":""}
>
              <span class="sp-slider"></span>
            </label>
          </div>
          <div class="sp-budget-field" id="sp-budget-field" style="display:${budgetOn?"flex":"none"}">
            <input class="sp-input sp-budget-input" id="sp-budget-val" type="number"
                   min="1" max="9999" placeholder="z.B. 50" value="${esc(String(budgetVal||""))}"/>
            <span class="sp-pref-sub">${t("sp_budget_unit")}</span>
          </div>
        </div>

        <!-- Sprache & Land -->
        <div class="sp-section">
          <div class="sp-section-title">${t("sp_region_title")}</div>
          <div class="sp-pref-row">
            <div class="sp-pref-lbl">${t('sp_country_label')}</div>
            <select class="sp-select" id="sp-country">
              <option value="de" ${userCountry==="de"?"selected":""}>${EcoTrace._userLang==="en"?"🇩🇪 Germany":"🇩🇪 Deutschland"}</option>
              <option value="at" ${userCountry==="at"?"selected":""}>${EcoTrace._userLang==="en"?"🇦🇹 Austria":"🇦🇹 Österreich"}</option>
              <option value="ch" ${userCountry==="ch"?"selected":""}>${EcoTrace._userLang==="en"?"🇨🇭 Switzerland":"🇨🇭 Schweiz"}</option>
              <option value="nl" ${userCountry==="nl"?"selected":""}>${EcoTrace._userLang==="en"?"🇳🇱 Netherlands":"🇳🇱 Niederlande"}</option>
              <option value="all" ${userCountry==="all"?"selected":""}>🌍 International</option>
            </select>
          </div>
          <div class="sp-hint" style="margin-top:4px">
            ${t("sp_country_hint")}
          </div>
          <div class="sp-pref-row" style="margin-top:8px">
            <div class="sp-pref-lbl">${t('sp_lang_label')}</div>
            <select class="sp-select" id="sp-lang">
              <option value="de" \${userLang==="de"?"selected":""}>🇩🇪 Deutsch</option>
              <option value="en" \${userLang==="en"?"selected":""}>🇬🇧 English</option>
            </select>
          </div>
        </div>

        <!-- Speichern -->
        <button class="sp-save-btn" id="sp-apply">${t("sp_save_btn")}</button>
        <div class="sp-saved-msg" id="sp-saved-msg" style="display:none">${t("sp_saved_msg")}</div>

      </div>
    `;
  }

  // ── Transparenz-Info-Panel ───────────────────────────────
  function buildInfoPanel(product) {
    const isSpecific = product?.specific;
    const isLive     = product?.live;

    const sourceRow = isSpecific
      ? `<div class="info-source-pill specific">📋 Produktspezifisch: ${esc(product?.source || "")}</div>`
      : isLive
        ? `<div class="info-source-pill live">● Climatiq Live-Daten</div>`
        : `<div class="info-source-pill mock">~ Kategorie-Schätzwert</div>`;

    return `
      <div class="info-header">
        <span class="info-title">🔍 Datenquellen &amp; Transparenz</span>
        <button class="info-close" id="info-close">✕</button>
      </div>

      <div class="info-body">

        <!-- Philosophie: Offline-Datenbanken -->
        <div class="info-section info-section-philosophy">
          <div class="info-section-title" style="color:#228B22">${t("info_why_title")}</div>
          <div class="info-text">
            EcoTrace setzt bevorzugt auf <strong>lokal eingebettete Datenbanken</strong>,
            die in regelmäßigen Abständen aktualisiert werden –
            statt bei jedem Produktaufruf live API-Anfragen zu stellen.
          </div>
          <div class="info-philosophy-row">
            <span class="info-phil-icon">⚡</span>
            <div>
              ${t("info_energy_title")} ${t("info_energy_body")}
            </div>
          </div>
          <div class="info-philosophy-row">
            <span class="info-phil-icon">🚀</span>
            <div>
              ${t("info_instant_title")} ${t("info_instant_body")}
            </div>
          </div>
          <div class="info-philosophy-row">
            <span class="info-phil-icon">🔒</span>
            <div>
              ${t("info_priv_title")} ${t("info_priv_body")}
            </div>
          </div>
          <div class="info-text" style="margin-top:5px">
            ${t("info_live_cta")}
          </div>
        </div>

        <!-- CO₂-Daten -->
        <div class="info-section">
          <div class="info-section-title">${t("info_co2_section")}</div>
          ${sourceRow}
          <div class="info-tier">
            <span class="info-tier-num">1</span>
            <div>
              <strong>${t("info_co2_db")}</strong><br>
              ${t("info_co2_db_body")}
              <a class="info-link" href="https://www.apple.com/environment/" target="_blank" rel="noopener">Apple ↗</a>
              <a class="info-link" href="https://www.samsung.com/global/sustainability/" target="_blank" rel="noopener">Samsung ↗</a>
              <a class="info-link" href="https://store.google.com/intl/en/ideas/articles/sustainability" target="_blank" rel="noopener">Google ↗</a>
            </div>
          </div>
          <div class="info-tier">
            <span class="info-tier-num">2</span>
            <div>
              <strong>Climatiq API</strong> (${t("info_co2_tier2")})<br>
              ${t("info_co2_api_body")}
              <a class="info-link" href="https://www.climatiq.io" target="_blank" rel="noopener">climatiq.io ↗</a>
            </div>
          </div>
          <div class="info-tier">
            <span class="info-tier-num">3</span>
            <div>
              <strong>${t("info_co2_mock")}</strong><br>
              ${t("info_co2_mock_body")}
            </div>
          </div>
        </div>

        <!-- Versand -->
        <div class="info-section">
          <div class="info-section-title">${t("info_shipping_section")}</div>
          <div class="info-text">
            <strong>${t("info_shipping_detect")}</strong><br>
            ${t("info_shipping_body")}
          </div>
        </div>

        <!-- Reparierbarkeit -->
        <div class="info-section">
          <div class="info-section-title">${t("info_repair_section")}</div>
          <div class="info-text">
            <strong>${t("info_repair_db")}</strong> –
            ${t("info_repair_db_body")}<br>
            ${t("info_repair_old_body")}
            ${t("info_repair_links")}
            ${t("info_repair_updated")}
            <a class="info-link" href="https://www.ifixit.com/repairability" target="_blank" rel="noopener">iFixit Scores ↗</a>
          </div>
        </div>

        <!-- Lokale Shops -->
        <div class="info-section">
          <div class="info-section-title">${t("info_shops_section")}</div>
          <div class="info-text">
            ${t("info_shops_old_body")}
            <a class="info-link" href="https://overpass-api.de" target="_blank" rel="noopener">Overpass API ↗</a>
          </div>
        </div>

        <!-- Datenschutz -->
        <div class="info-section info-section-privacy">
          <div class="info-section-title">${t("info_privacy_title2")}</div>
          <ul class="info-list">
            <li>${t("info_priv_overpass")}</li>
            <li>${t("info_priv_climatiq")}</li>
            <li>${t("info_priv_links")}</li>
          </ul>
          <div class="info-text" style="margin-top:5px;color:#228B22;font-weight:600">
            ${t("info_privacy_footer")}
          </div>
        </div>

        <!-- Ko-fi Support -->
        <div class="info-section info-section-kofi">
          <div class="info-section-title">${t("info_kofi_section")}</div>
          <div class="info-text">
            ${t("info_kofi_text")}
          </div>
          <a class="info-kofi-btn" href="https://ko-fi.com/maxation"
             target="_blank" rel="noopener">
            ${t("info_kofi_btn")}
          </a>
        </div>

        <!-- Affiliate-Hinweis -->
        ${EcoTrace.hasAffiliateLinks?.() ? `
        <div class="info-section info-section-affiliate">
          <div class="info-section-title">* Affiliate-Links</div>
          <div class="info-text">
            ${t("info_affiliate_text")}
          </div>
        </div>` : ""}

        <!-- Version -->
        <div class="info-version">
          ${t('info_version')} ·
          <a class="info-link" href="https://github.com/Maxation/EcoTrace" target="_blank" rel="noopener">GitHub ↗</a>
        </div>

      </div>
    `;
  }

  // ────────────────────────────────────────────────────────
  //  LOKALE SHOPS
  // ────────────────────────────────────────────────────────
  function getCategoryRepairLabel(category) {
    return EcoTrace.I18n.localLabel(category);
  }

  async function loadLocalShops(shadow, analysis, category) {
    const placeholder = shadow.getElementById("et-local-placeholder");
    if (!placeholder) return;

    const label = getCategoryRepairLabel(category);
    const { shops, position, error } = await EcoTrace.LocationService.findNearbyAlternatives(category);

    // Fehler oder keine Shops gefunden
    if (error || !shops.length) {
      placeholder.innerHTML = `
        <div class="et-section-label">${label}</div>
        <div class="et-local-empty">
          ${esc(error || t("local_no_results"))}
          <div style="font-size:9.5px;margin-top:4px;opacity:0.7">
            ${t('local_tip')}
          </div>
        </div>`;
      return;
    }

    const enriched = position ? EcoTrace.LocationService.enrichWithDistance(shops, position) : shops;
    const localSav = enriched[0]
      ? EcoTrace.LocationService.calculateLocalSavings(analysis.product.co2_kg, enriched[0])
      : null;

    placeholder.innerHTML = `
      <div class="et-section-label">${label}</div>
      ${localSav ? `<div class="et-local-savings-banner">💡 ${esc(localSav.message)}</div>` : ""}
      <div class="et-local-list">
        ${enriched.map(s => `
          <a class="local-shop" href="${s.navUrl}" target="_blank" rel="noopener">
            <span class="local-icon">${s.emoji||"📍"}</span>
            <div class="local-info">
              <span class="local-name">${esc(s.name)}</span>
              <span class="local-meta">${s.distanceLabel||""} · ${esc(s.label)}</span>
              ${s.address ? `<span class="local-addr">${esc(s.address)}</span>` : ""}
            </div>
            <span class="local-arrow">→</span>
          </a>`).join("")}
      </div>`;
  }

  // ────────────────────────────────────────────────────────
  //  EVENT-LISTENER
  // ────────────────────────────────────────────────────────
  function attachBaseListeners(shadow) {
    shadow.getElementById("et-minimize")?.addEventListener("click", () => {
      shadow.getElementById("et-widget")?.style && (shadow.getElementById("et-widget").style.display = "none");
      shadow.getElementById("et-pill")?.style    && (shadow.getElementById("et-pill").style.display = "flex");
    });
    shadow.getElementById("et-close")?.addEventListener("click", () => {
      document.getElementById("ecotrace-host")?.remove();
    });
    shadow.getElementById("et-pill")?.addEventListener("click", () => {
      shadow.getElementById("et-widget")?.style && (shadow.getElementById("et-widget").style.display = "block");
      shadow.getElementById("et-pill")?.style    && (shadow.getElementById("et-pill").style.display = "none");
    });
  }

  function attachFullListeners(shadow, { productData, analysis, platforms, savings, totalCO2adjusted }) {
    attachBaseListeners(shadow);

    shadow.getElementById("et-btn-repair")?.addEventListener("click", () => {
      const q = EcoTrace._cleanSearchQuery(productData.title);
      openLink(`https://de.ifixit.com/Search#query=${encodeURIComponent(q)}`);
      chrome.storage.local.get(["achStats"], d => {
        const s = d.achStats || {};
        s.repairClicks = (s.repairClicks || 0) + 1;
        chrome.storage.local.set({ achStats: s });
      });
    });

shadow.getElementById("et-save-savings")?.addEventListener("click", e => {
      if (savings > 0) {
        EcoTrace.saveSavings(savings, productData.title);
        chrome.storage.local.get(["achStats"], d => {
          const s = d.achStats || {};
          s.totalSaves    = (s.totalSaves || 0) + 1;
          s.totalSavings  = (s.totalSavings || 0) + savings;
          chrome.storage.local.set({ achStats: s }, async () => {
            const newAch = await EcoTrace.AchievementService.checkAndUnlock(s);
            if (newAch.length > 0) showAchievementToast(shadow, newAch[0]);
          });
        });
        const btn = e.currentTarget;
        btn.textContent = t("save_btn_done");
        btn.classList.add("saved");
        setTimeout(() => {
          btn.textContent = t("save_btn");
          btn.classList.remove("saved");
        }, 2500);
      }
    });

    // ── Preis-CO₂-Index: Manueller Preis-Input ──────────────
    const priceInput = shadow.getElementById("pci-price-input");
    if (priceInput) {
      priceInput.addEventListener("input", () => {
        const price     = parseFloat(priceInput.value);
        const totalCO2  = parseFloat(priceInput.dataset.totalco2) || 0;
        const isTextile = priceInput.dataset.category === "textile";
        const result    = shadow.getElementById("pci-manual-result");
        if (!result) return;

        if (!price || price <= 0) { result.style.display = "none"; return; }

        const priceCO2 = (totalCO2 / price).toFixed(3);

        if (isTextile) {
          const country      = EcoTrace._userCountry || "de";
          const shPlats      = country === "at" ? "Willhaben, Vinted" :
                               country === "ch" ? "Vinted, Ricardo" : "Kleinanzeigen, Vinted";
          const usedPrice    = Math.round(price * 0.10);
          const usedPriceLow = Math.round(price * 0.05);
          const usedCO2      = Math.round(totalCO2 * 0.05 * 10) / 10;
          const usedPriceCO2 = (usedCO2 / usedPrice).toFixed(3);
          const ratio        = Math.round((1 - parseFloat(usedPriceCO2) / parseFloat(priceCO2)) * 100);
          const barPct       = Math.min(100, Math.round((parseFloat(usedPriceCO2) / parseFloat(priceCO2)) * 100));
          result.style.display = "block";
          result.innerHTML = `
            <div class="price-co2-grid" style="margin-top:6px">
              <div class="price-co2-item">
                <div class="pci-label">🆕 Neu ${price}€</div>
                <div class="pci-bar-wrap"><div class="pci-bar pci-bar-new" style="width:100%"></div></div>
                <div class="pci-val pci-bad">${priceCO2} kg/€</div>
              </div>
              <div class="price-co2-item">
                <div class="pci-label">👗 Gebraucht ~${usedPriceLow}–${usedPrice}€ <span class="pci-est">${shPlats}</span></div>
                <div class="pci-bar-wrap"><div class="pci-bar pci-bar-ref" style="width:${barPct}%"></div></div>
                <div class="pci-val pci-good">${usedPriceCO2} kg/€</div>
              </div>
            </div>
            <div class="pci-conclusion">✅ Gebraucht: <strong>${ratio}% CO₂-effizienter</strong> pro Euro</div>
            <div class="pci-footnote">~5–10% Neupreis auf ${shPlats}</div>`;
        } else {
          const refPrice    = Math.round(price * 0.68);
          const refCO2      = Math.round((totalCO2 * 0.30 + 1.2) * 10) / 10;
          const refPriceCO2 = (refCO2 / refPrice).toFixed(3);
          const ratio       = Math.round((1 - refPriceCO2 / priceCO2) * 100);
          const refBarPct   = Math.min(100, Math.round((refPriceCO2 / priceCO2) * 100));
          result.style.display = "block";
          result.innerHTML = `
            <div class="price-co2-grid" style="margin-top:6px">
              <div class="price-co2-item">
                <div class="pci-label">🆕 Neukauf ${price}€</div>
                <div class="pci-bar-wrap"><div class="pci-bar pci-bar-new" style="width:100%"></div></div>
                <div class="pci-val pci-bad">${priceCO2} kg/€</div>
              </div>
              <div class="price-co2-item">
                <div class="pci-label">♻️ Refurbished ~${refPrice}€ <span class="pci-est">Schätzung</span></div>
                <div class="pci-bar-wrap"><div class="pci-bar pci-bar-ref" style="width:${refBarPct}%"></div></div>
                <div class="pci-val pci-good">${refPriceCO2} kg/€</div>
              </div>
            </div>
            <div class="pci-conclusion">✅ Refurbished: <strong>${ratio}% CO₂-effizienter</strong> pro Euro</div>`;
        }
      });
    }

    // ── Gebraucht kaufen Buttons (plat-item mit data-platform) ──
    shadow.querySelectorAll(".used-plat-item").forEach(btn => {
      btn.addEventListener("click", async (e) => {
        // Wenn es ein echter <a> mit href ist, normal folgen lassen
        // Nur Intent speichern + Banner zeigen
        const platform = btn.dataset.platform;
        const co2      = parseFloat(btn.dataset.co2) || 0;

        if (platform && co2 > 0) {
          EcoTrace.CircularSwap.saveIntent(platform, productData.title, co2).catch(() => {});
        }

        // Bestätigungs-Banner
        const confirm = shadow.getElementById("circular-confirm");
        if (confirm) {
          confirm.style.display = "block";
          confirm.classList.add("circular-confirm-show");
          setTimeout(() => {
            confirm.classList.remove("circular-confirm-show");
            setTimeout(() => { confirm.style.display = "none"; }, 400);
          }, 2800);
        }
      });
    });

    // ℹ Info-Panel Toggle
    shadow.getElementById("et-open-info")?.addEventListener("click", e => {
      e.preventDefault();
      const panel = shadow.getElementById("et-info-panel");
      if (!panel) return;
      const isOpen = panel.style.display !== "none";
      panel.style.display = isOpen ? "none" : "block";
      if (!isOpen) panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    // ✕ Info-Panel schließen (Close-Button im Panel)
    shadow.addEventListener("click", e => {
      if (e.target?.id === "info-close") {
        const panel = shadow.getElementById("et-info-panel");
        if (panel) panel.style.display = "none";
      }
    });

    shadow.getElementById("et-open-options")?.addEventListener("click", e => {
      e.preventDefault();
      const panel = shadow.getElementById("et-settings-panel");
      if (!panel) return;

      // Info-Panel schließen wenn offen
      const infoPanel = shadow.getElementById("et-info-panel");
      if (infoPanel) infoPanel.style.display = "none";

      const isOpen = panel.style.display !== "none";
      if (isOpen) {
        panel.style.display = "none";
        return;
      }

      // Aktuelle Einstellungen laden und Panel aufbauen
      chrome.storage.local.get([
        "climatiqApiKey", "sourceModeCO2", "sourceModeRepair",
        "prefLocal", "prefPredecessor", "prefPriceIndex",
        "monthlyCO2Budget", "searchRadius",
        "userCountry", "userLang"
      ], d => {
        panel.innerHTML = buildSettingsPanel({
          climatiqKey:     d.climatiqApiKey   || "",
          modeCO2:         d.sourceModeCO2    || "db",
          modeRepair:      d.sourceModeRepair || "db",
          budgetOn:        !!d.monthlyCO2Budget,
          budgetVal:       d.monthlyCO2Budget || "",
          radiusVal:       d.searchRadius     || 5,
          prefPredecessor: d.prefPredecessor  !== false,
          prefPriceIndex:  d.prefPriceIndex   !== false,
          prefLocal:       d.prefLocal        !== false,
          userCountry:     d.userCountry      || "de",
          userLang:        d.userLang         || "de",
        });
        panel.style.display = "block";
        panel.style.animation = "et-in 0.22s ease";
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });

        bindSettingsPanelListeners(shadow);
      });
    });

    // ── Settings Panel: Event-Listener binden ─────────────
    function bindSettingsPanelListeners(shadow) {
      const panel = shadow.getElementById("et-settings-panel");
      if (!panel) return;

      // ✕ Schließen
      shadow.addEventListener("click", function closeHandler(e) {
        if (e.target?.id === "sp-close") {
          panel.style.display = "none";
          shadow.removeEventListener("click", closeHandler);
        }
      });

      // Land → Auto-Sprache: nur wenn noch keine manuelle Auswahl getroffen wurde
      // Regel: International/NL → EN vorschlagen; DACH → DE vorschlagen
      // Aber: überschreibe NICHT wenn User bereits eine Sprache manuell gewählt hat
      let _langManuallySet = false;
      shadow.getElementById("sp-lang")?.addEventListener("change", function() {
        _langManuallySet = true;  // User hat Sprache explizit gewählt → nicht mehr auto-switchen
      });
      shadow.getElementById("sp-country")?.addEventListener("change", function() {
        if (_langManuallySet) return;  // Respektiere manuelle Auswahl
        const langSel = shadow.getElementById("sp-lang");
        if (!langSel) return;
        if (this.value === "all" || this.value === "nl") {
          langSel.value = "en";
        } else {
          langSel.value = "de";
        }
      });

      // Radius-Slider live update
      shadow.getElementById("sp-search-radius")?.addEventListener("input", function() {
        const lbl = shadow.getElementById("sp-radius-label");
        if (lbl) lbl.textContent = this.value + " km";
      });

      // Budget-Toggle
      shadow.getElementById("sp-pref-budget")?.addEventListener("change", function() {
        const field = shadow.getElementById("sp-budget-field");
        if (field) field.style.display = this.checked ? "flex" : "none";
      });

      // 👁 API-Key sichtbar/unsichtbar
      shadow.getElementById("sp-toggle-key")?.addEventListener("click", () => {
        const inp = shadow.getElementById("sp-climatiq-key");
        if (!inp) return;
        inp.type = inp.type === "password" ? "text" : "password";
        const btn = shadow.getElementById("sp-toggle-key");
        if (btn) btn.textContent = inp.type === "password" ? "👁" : "🙈";
      });

      // Mode-Buttons (📋 DB / 🌐 API)
      panel.querySelectorAll(".sp-mode-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const settingId = btn.dataset.setting;
          const val       = btn.dataset.value;
          // Aktiven Button markieren
          panel.querySelectorAll(`.sp-mode-btn[data-setting="${settingId}"]`).forEach(b => {
            b.classList.remove("active-green", "active-blue");
          });
          btn.classList.add(val === "db" ? "active-green" : "active-blue");
          // API-Block ein/ausblenden (nur bei CO₂)
          if (settingId === "modeCO2") {
            const apiBlock = shadow.getElementById("sp-co2-api-block");
            if (apiBlock) apiBlock.style.display = val === "api" ? "block" : "none";
          }
        });
      });

      // 💾 Speichern
      shadow.getElementById("sp-apply")?.addEventListener("click", () => {
        const getChecked = id => !!shadow.getElementById(id)?.checked;
        const getVal     = id => shadow.getElementById(id)?.value || "";
        const activeMode = (group) => {
          const active = panel.querySelector(`.sp-mode-btn[data-setting="${group}"].active-green, .sp-mode-btn[data-setting="${group}"].active-blue`);
          return active?.dataset.value || "db";
        };

        const budgetOn  = getChecked("sp-pref-budget");
        const budgetVal = budgetOn ? parseFloat(getVal("sp-budget-val")) || null : null;

        const newCountry = getVal("sp-country") || "de";
        // sp-lang: direkt das Element lesen statt getVal() um leere Strings zu vermeiden
        const langEl  = shadow.getElementById("sp-lang");
        const newLang = (langEl?.value && langEl.value !== "") ? langEl.value : (EcoTrace._userLang || "de");
        // EcoTrace live aktualisieren ohne Neustart
        EcoTrace._userCountry = newCountry;
        EcoTrace.I18n.setLang(newLang);

        chrome.storage.local.set({
          climatiqApiKey:   getVal("sp-climatiq-key"),
          sourceModeCO2:    activeMode("modeCO2"),
          sourceModeRepair: activeMode("modeRepair"),
          prefLocal:        getChecked("sp-pref-local"),
          prefPredecessor:  getChecked("sp-pref-predecessor"),
          prefPriceIndex:   getChecked("sp-pref-price-index"),
          monthlyCO2Budget: budgetVal,
          searchRadius:     parseInt(getVal("sp-search-radius")) || 5,
          userCountry:      newCountry,
          userLang:         newLang,
        }, () => {
          // Kurze Bestätigung zeigen, dann Widget neu laden
          const msg = shadow.getElementById("sp-saved-msg");
          if (msg) { msg.style.display = "block"; }
          setTimeout(() => {
            // Widget-Host entfernen und boot() neu starten
            document.getElementById("ecotrace-host")?.remove();
            boot();
          }, 600);
        });
      });
    }
  }

  // ── Achievement-Toast ──────────────────────────────────
  function showAchievementToast(shadow, ach) {
    const existing = shadow.getElementById("et-ach-toast");
    if (existing) existing.remove();
    const toast = document.createElement("div");
    toast.id = "et-ach-toast";
    toast.className = "et-ach-toast";
    toast.innerHTML = `
      <div class="ach-icon">${ach.icon}</div>
      <div>
        <div class="ach-title">Achievement freigeschaltet!</div>
        <div class="ach-name">${esc(ach.title)}</div>
      </div>
      <div class="ach-xp">+${ach.xp} XP</div>`;
    shadow.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("show"));
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // ────────────────────────────────────────────────────────
  //  CSS
  // ────────────────────────────────────────────────────────
  function getCSS() { return `
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    :host {
      --cream:#F5F5DC; --green:#228B22; --green2:#1B5E20;
      --amber:#FFBF00; --text:#2C2C1E; --muted:#6B6B50;
      --border:#D4D4AA; --glass:rgba(255,255,255,0.62);
      --shadow:rgba(34,139,34,0.18);
      font-family:'Segoe UI',system-ui,-apple-system,sans-serif;
    }
    .et-widget {
      width:310px; max-height:88vh; overflow-y:auto; overflow-x:hidden;
      background:rgba(245,245,220,0.97); border:1.5px solid var(--border);
      border-radius:16px; box-shadow:0 12px 44px var(--shadow),0 2px 8px rgba(0,0,0,0.06);
      backdrop-filter:blur(14px);
      animation:et-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
      scrollbar-width:thin; scrollbar-color:var(--border) transparent;
    }
    .et-widget::-webkit-scrollbar{width:4px}
    .et-widget::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px}
    @keyframes et-in{from{opacity:0;transform:translateX(28px) scale(0.94)}to{opacity:1;transform:translateX(0) scale(1)}}
    .et-header{display:flex;align-items:center;justify-content:space-between;padding:10px 14px 9px;background:linear-gradient(135deg,#228B22,#1B5E20);border-radius:14px 14px 0 0;position:sticky;top:0;z-index:10}
    .et-logo{display:flex;align-items:center;gap:7px}
    .et-brand{color:#fff;font-size:13px;font-weight:700;letter-spacing:0.3px}
    .et-controls{display:flex;gap:5px}
    .et-btn-icon{background:rgba(255,255,255,0.18);border:none;color:#fff;width:22px;height:22px;border-radius:50%;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:center;transition:background 0.2s}
    .et-btn-icon:hover{background:rgba(255,255,255,0.32)}
    .et-body{padding:12px 14px 14px;display:flex;flex-direction:column;gap:10px}
    @keyframes sk-shimmer{0%{background-position:-300px 0}100%{background-position:300px 0}}
    .sk-line{display:inline-block;height:10px;border-radius:5px;background:linear-gradient(90deg,#E8E8CC 25%,#D4D4A8 50%,#E8E8CC 75%);background-size:600px 100%;animation:sk-shimmer 1.4s infinite linear}
    .sk-leaf{width:16px;height:16px;border-radius:50%;background:linear-gradient(90deg,#C8C8B0 25%,#B8B898 50%,#C8C8B0 75%);background-size:600px 100%;animation:sk-shimmer 1.4s infinite linear}
    .et-product-row{display:flex;align-items:flex-start;gap:6px}
    .et-product-name{font-size:11px;color:var(--muted);line-height:1.45;font-style:italic;flex:1}
    .et-live-tag{font-size:9px;font-weight:700;color:#fff;background:var(--green);padding:2px 5px;border-radius:4px;white-space:nowrap;flex-shrink:0}
    .et-live-tag.specific{background:#1565C0}
    .et-mock-tag{font-size:9px;font-weight:700;color:#795548;background:#FFF8E1;border:1px solid #FFCC02;padding:2px 5px;border-radius:4px;white-space:nowrap;flex-shrink:0}
    .et-leaves{display:flex;gap:3px}
    .leaf{transition:transform 0.15s}.leaf.on{filter:drop-shadow(0 1px 3px rgba(34,139,34,0.45))}.leaf:hover{transform:scale(1.25)}
    .et-co2-section{background:var(--glass);border:1px solid var(--border);border-radius:10px;padding:8px 10px}
    .et-co2-row{display:flex;justify-content:space-between;align-items:center;padding:2.5px 0;font-size:12px}
    .et-co2-total{border-top:1px dashed var(--border);margin-top:3px;padding-top:5px;font-weight:700;font-size:13px}
    .et-label{color:var(--muted)}
    .et-value{font-weight:600;font-variant-numeric:tabular-nums}
    .et-confidence-badge{font-size:8.5px;font-weight:700;padding:1px 5px;border-radius:4px;margin-left:4px}
    .et-confidence-badge.high{background:#E8F5E9;color:#2E7D32}
    .et-confidence-badge.low{background:#FFF8E1;color:#F57F17}
    .et-source-hint{font-size:9.5px;color:var(--muted);margin-top:5px;padding-top:5px;border-top:1px dashed var(--border);font-style:italic;line-height:1.4}
    .et-badge{border:2px solid var(--green);border-radius:11px;padding:9px 12px;background:var(--glass);text-align:center}
    .et-badge-label{font-size:9.5px;text-transform:uppercase;letter-spacing:0.8px;color:var(--muted);margin-bottom:3px}
    .et-badge-value{font-size:24px;font-weight:800;line-height:1.05;letter-spacing:-0.5px}
    .comparison{font-size:11px;color:var(--muted);margin-top:5px}
    /* ── Reparaturkosten ── */
    .repair-cost-section{margin:8px 0 5px;padding:8px 10px;background:rgba(0,0,0,0.04);border-radius:8px;border:1px solid rgba(0,0,0,0.07)}
    .repair-cost-header{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--muted);margin-bottom:7px}
    .repair-cost-row{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;gap:6px}
    .repair-cost-part{font-size:11.5px;font-weight:600;color:var(--text);white-space:nowrap}
    .repair-cost-prices{display:flex;flex-wrap:wrap;gap:4px;justify-content:flex-end}
    .repair-cost-shop{font-size:10.5px;background:#E3F2FD;color:#1565C0;padding:2px 6px;border-radius:5px;font-weight:600}
    .repair-cost-diy{font-size:10.5px;background:#E8F5E9;color:#2E7D32;padding:2px 6px;border-radius:5px;font-weight:600}
    .repair-cost-life{font-size:10px;color:var(--muted);padding:2px 5px}
    .repair-cost-source{font-size:9px;color:var(--muted);margin-top:5px;font-style:italic}
    /* ── Preis-CO₂-Index ── */
    .et-price-co2{background:rgba(255,255,255,0.5);border:1px solid var(--border);border-radius:10px;padding:10px 11px}
    .pci-explain{font-size:10px;color:var(--muted);margin-bottom:8px;line-height:1.5}
    .price-co2-grid{display:flex;flex-direction:column;gap:7px}
    .price-co2-item{}
    .pci-label{font-size:10.5px;color:var(--muted);margin-bottom:3px;display:flex;align-items:center;gap:5px}
    .pci-est{font-size:8.5px;background:#FFF8E1;color:#F57F17;padding:1px 5px;border-radius:4px;font-weight:600}
    .pci-bar-wrap{background:#E8E8CC;border-radius:5px;height:14px;overflow:hidden;margin-bottom:2px}
    .pci-bar{height:100%;border-radius:5px;transition:width 0.5s ease}
    .pci-bar-new{background:linear-gradient(90deg,#CC4444,#E57373)}
    .pci-bar-ref{background:linear-gradient(90deg,#228B22,#4CAF50)}
    .pci-val{font-size:12px;font-weight:800}
    .pci-bad{color:#C62828}.pci-good{color:#228B22}
    .pci-conclusion{font-size:11px;color:#228B22;font-weight:600;margin-top:8px;padding-top:7px;border-top:1px dashed var(--border)}
    .pci-footnote{font-size:9.5px;color:var(--muted);margin-top:4px;font-style:italic;line-height:1.4}
    .pci-manual-row{display:flex;align-items:center;gap:7px;margin-top:4px}
    .pci-manual-input{width:90px;padding:6px 9px;border:1.5px solid var(--border);border-radius:7px;font-size:12px;font-family:inherit;background:var(--cream);color:var(--text);outline:none;transition:border-color 0.2s}
    .pci-manual-input:focus{border-color:var(--green)}
    .pci-manual-unit{font-size:13px;font-weight:700;color:var(--muted)}
    .pci-manual-result{animation:et-in 0.25s ease}
    /* ── Reparierbarkeit ── */
    .et-repair-card{border:1px solid var(--border);border-radius:10px;padding:10px 11px}
    .repair-header-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:5px}
    .repair-device-name{font-size:11.5px;font-weight:700;color:var(--text);margin-bottom:5px;line-height:1.3}
    .repair-row{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
    .repair-wrenches{display:flex;gap:2px}
    .wrench{transition:transform 0.15s}.wrench:hover{transform:scale(1.2)}
    .repair-score{font-size:18px;font-weight:800}
    .repair-label{font-size:11px;font-weight:700;margin-bottom:5px}
    .repair-meta-row{display:flex;gap:5px;flex-wrap:wrap;margin-bottom:6px}
    .repair-parts-pill,.repair-guides-pill{font-size:9.5px;font-weight:600;padding:2px 7px;border-radius:10px;background:rgba(255,255,255,0.6);border:1px solid var(--border)}
    .repair-link-row{display:flex;gap:10px;padding-top:6px;border-top:1px dashed var(--border)}
    .repair-guide-link,.repair-parts-link{font-size:11px;font-weight:600;color:var(--green);text-decoration:none;flex:1}
    .repair-guide-link:hover,.repair-parts-link:hover{text-decoration:underline}
    .repair-age{font-size:9px;color:var(--muted);margin-top:4px;font-style:italic}
    .repair-source-badge{font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px}
    .repair-source-badge.live{background:#E8F5E9;color:#1B5E20}
    .repair-source-badge.cache{background:#E3F2FD;color:#1565C0}
    .repair-source-badge.static{background:#FFF8E1;color:#F57F17}
    .repair-source-badge.fallback{background:#F5F5F5;color:var(--muted)}
    /* ── Budget-Balken ── */
    .et-budget-bar{border:1px solid var(--border);border-radius:10px;padding:10px 11px}
    .budget-numbers{display:flex;justify-content:space-between;font-size:11px;color:var(--muted);margin-bottom:5px}
    .budget-track{background:#D4D4AA;border-radius:6px;height:18px;overflow:hidden}
    .budget-fill{height:100%;border-radius:6px;display:flex;align-items:center;padding-left:7px;transition:width 0.5s;min-width:2px}
    .budget-fill span{font-size:10.5px;font-weight:700;color:#fff}
    .budget-over{font-size:10.5px;color:#C62828;font-weight:600;margin-top:5px}
    /* ── Textil Secondhand-Card ── */
    .et-textile-sh{border-radius:11px;overflow:hidden;border:1.5px solid #E91E63;margin-bottom:0}
    .textile-sh-header{background:linear-gradient(135deg,#E91E63,#AD1457);padding:6px 11px;font-size:11px;font-weight:700;color:#fff}
    .textile-sh-body{padding:10px 11px;display:flex;flex-direction:column;gap:8px;background:linear-gradient(180deg,#FFF9FB,var(--white))}
    .textile-sh-title{font-size:13px;font-weight:700;color:var(--text)}
    .textile-sh-subtitle{font-size:10.5px;color:var(--muted);line-height:1.45}
    .textile-gmaps-btn{display:flex;align-items:center;gap:8px;padding:9px 12px;background:linear-gradient(135deg,#1565C0,#1976D2);color:#fff;border-radius:9px;text-decoration:none;font-size:12px;font-weight:700;transition:opacity 0.2s}
    .textile-gmaps-btn:hover{opacity:0.88}
    .textile-gmaps-icon{font-size:15px;flex-shrink:0}
    .textile-gmaps-arrow{margin-left:auto;font-size:13px}
    .textile-sh-platforms{display:flex;gap:5px;flex-wrap:wrap}
    .textile-plat-btn{padding:5px 10px;border-radius:8px;border:1.5px solid;font-size:11px;font-weight:600;text-decoration:none;background:transparent;transition:opacity 0.15s;white-space:nowrap}
    .textile-plat-btn:hover{opacity:0.75}
    /* ── Vorgänger ── */
    .et-predecessor{background:linear-gradient(135deg,#FFFDE7,#FFF9C4);border:1.5px solid #FFCC02;border-radius:11px;overflow:hidden}
    .pred-gen1-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#2E7D32;margin-bottom:4px}
    .pred-gen2{margin-top:10px;padding-top:10px;border-top:1.5px dashed #FFD54F;background:linear-gradient(180deg,#FFFDE7,transparent);border-radius:0 0 9px 9px;margin:-0px -10px -10px;padding:10px}
    .pred-gen2-label{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#E65100;margin-bottom:5px}
    .pred-name-sm{font-size:12px;}
    .pred-header{background:#FFCC02;padding:5px 10px;font-size:11px;font-weight:700;color:#5D4037}
    .pred-body{padding:9px 10px;display:flex;flex-direction:column;gap:6px}
    .pred-name{font-size:13px;font-weight:700;color:var(--text)}
    .pred-perf{display:flex;align-items:flex-start;gap:8px;flex-wrap:wrap}
    .pred-pill{font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;white-space:nowrap;flex-shrink:0}
    .pred-note{font-size:10.5px;color:var(--muted);line-height:1.4}
    .pred-links{display:flex;gap:5px;flex-wrap:wrap}
    .pred-link{font-size:10.5px;font-weight:600;padding:3px 8px;border:1.5px solid;border-radius:6px;text-decoration:none;transition:all 0.18s;white-space:nowrap}
    .pred-link:hover{opacity:0.8;transform:translateY(-1px)}
    /* ── Plattformen ── */
    .et-section-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.7px;color:var(--muted);margin-bottom:6px}
    .plat-list{display:flex;flex-direction:column;gap:5px}
    .plat-item{display:flex;align-items:center;gap:9px;background:var(--glass);border:1.5px solid var(--border);border-left:3px solid var(--pc,var(--green));border-radius:9px;padding:7px 10px;text-decoration:none;transition:all 0.18s}
    .plat-item:hover{background:rgba(255,255,255,0.9);transform:translateX(2px)}
    .plat-emoji{font-size:16px;flex-shrink:0}
    .plat-info{flex:1;min-width:0}
    .plat-name{display:block;font-size:12px;font-weight:700;color:var(--text)}
    .plat-badge{display:block;font-size:10px;color:var(--muted);margin-top:1px}
    .plat-saving{text-align:right;font-size:13px;font-weight:800;color:var(--green);line-height:1.1;flex-shrink:0}
    .plat-saving small{font-size:9px;font-weight:400;color:var(--muted)}
    /* ── Lokale Shops ── */
    .et-local-savings-banner{background:linear-gradient(135deg,#E8F5E9,#C8E6C9);border:1px solid #A5D6A7;border-radius:9px;padding:8px 10px;font-size:11.5px;color:#1B5E20;font-weight:600;line-height:1.4;margin-bottom:6px}
    .et-local-list{display:flex;flex-direction:column;gap:5px}
    .local-shop{display:flex;align-items:center;gap:8px;background:linear-gradient(135deg,#E8F5E9,#F1F8E9);border:1px solid #A5D6A7;border-radius:9px;padding:8px 10px;text-decoration:none;transition:all 0.18s}
    .local-shop:hover{transform:translateX(2px)}
    .local-icon{font-size:16px;flex-shrink:0}.local-info{flex:1;min-width:0}
    .local-name{display:block;font-size:12px;font-weight:700;color:var(--text)}
    .local-meta{display:block;font-size:10px;color:var(--muted);margin-top:1px}
    .local-addr{display:block;font-size:9.5px;color:var(--muted);font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .local-arrow{font-size:14px;color:var(--green);font-weight:700;flex-shrink:0}
    .et-local-empty{font-size:11px;color:var(--muted);padding:6px 0;font-style:italic}
    .et-local-loading{display:flex;align-items:center;gap:8px;font-size:11px;color:var(--muted);padding:6px 0}
    /* ── Actions ── */
    .et-actions{display:flex;flex-direction:column;gap:6px}
    .et-btn-action{width:100%;padding:10px 14px;border:none;border-radius:9px;font-size:12.5px;font-weight:700;cursor:pointer;transition:all 0.2s;font-family:inherit}
    .et-btn-repair{background:linear-gradient(135deg,#795548,#5D4037);color:#fff;box-shadow:0 2px 8px rgba(93,64,55,0.3)}
    .et-btn-repair:hover{background:linear-gradient(135deg,#6D4C41,#4E342E);transform:translateY(-1px)}
    .et-btn-save{width:100%;padding:8px 14px;background:transparent;color:var(--green);border:1.5px solid var(--green);border-radius:9px;font-size:12px;font-weight:600;cursor:pointer;transition:all 0.2s;font-family:inherit}
    .et-btn-save:hover{background:rgba(34,139,34,0.07);transform:translateY(-1px)}
    .et-btn-save.saved{background:var(--green);color:#fff;border-color:var(--green)}
    /* ── Loading ── */
    .et-loading-status{display:flex;align-items:center;gap:8px;font-size:11.5px;color:var(--muted);padding:4px 0}
    .et-spinner{width:14px;height:14px;border-radius:50%;border:2px solid var(--border);border-top-color:var(--green);display:inline-block;animation:spin 0.7s linear infinite;flex-shrink:0}
    @keyframes spin{to{transform:rotate(360deg)}}
    /* ── Footer ── */
    .et-footer{font-size:10px;color:var(--muted);text-align:center;padding-top:6px;border-top:1px dashed var(--border)}
    .et-footer code{font-family:monospace;font-size:9px;background:rgba(0,0,0,0.06);padding:0 3px;border-radius:3px}
    .et-options-link{color:var(--green);text-decoration:none;cursor:pointer;font-weight:600}
    .et-options-link:hover{text-decoration:underline}
    /* ── Pill ── */
    .et-pill{display:flex;align-items:center;gap:7px;background:linear-gradient(135deg,#228B22,#1B5E20);color:#fff;padding:9px 15px;border-radius:22px;cursor:pointer;font-size:12px;font-weight:700;box-shadow:0 4px 18px rgba(34,139,34,0.45);animation:et-in 0.3s ease;transition:transform 0.2s,box-shadow 0.2s}
    .et-pill:hover{transform:scale(1.06);box-shadow:0 6px 22px rgba(34,139,34,0.55)}
    /* ── Achievement-Toast ── */
    .et-ach-toast{position:fixed;bottom:16px;left:50%;transform:translateX(-50%) translateY(60px);background:linear-gradient(135deg,#1B5E20,#228B22);color:#fff;padding:10px 16px;border-radius:14px;display:flex;align-items:center;gap:10px;box-shadow:0 6px 24px rgba(34,139,34,0.45);opacity:0;transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);pointer-events:none;z-index:100;min-width:220px}
    .et-ach-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
    .ach-icon{font-size:24px;flex-shrink:0}
    .ach-title{font-size:10px;text-transform:uppercase;letter-spacing:0.8px;opacity:0.8}
    .ach-name{font-size:13px;font-weight:700}
    .ach-xp{font-size:13px;font-weight:800;color:#FFBF00;flex-shrink:0;margin-left:auto}
    /* ── Plattform-Picker ── */
    .et-platform-picker{
      background:var(--cream); border:1.5px solid var(--green);
      border-radius:11px; overflow:hidden; margin-top:6px;
      box-shadow:0 6px 20px rgba(34,139,34,0.2);
      animation:et-in 0.2s ease both;
    }
    .picker-header{padding:7px 11px;font-size:10px;font-weight:700;
      text-transform:uppercase;letter-spacing:0.7px;color:#fff;
      background:linear-gradient(135deg,#228B22,#1B5E20)}
    .picker-item{display:flex;align-items:center;gap:9px;padding:9px 11px;
      cursor:pointer;border-bottom:1px solid var(--border);transition:background 0.15s}
    .picker-item:last-child{border-bottom:none}
    .picker-item:hover{background:rgba(34,139,34,0.07)}
    .picker-emoji{font-size:18px;flex-shrink:0}
    .picker-info{flex:1;min-width:0}
    .picker-name{display:block;font-size:12.5px;font-weight:700;color:var(--text)}
    .picker-co2{display:block;font-size:10px;color:var(--muted);margin-top:1px}
    .picker-arrow{font-size:14px;color:var(--green);font-weight:700;flex-shrink:0}
    /* ── Gebraucht kaufen (vereinte Sektion) ── */
    .et-used-section{border:1.5px solid #81C784;border-radius:12px;overflow:hidden;background:linear-gradient(135deg,#F1F8E9,#E8F5E9)}
    .used-header{display:flex;align-items:center;gap:7px;padding:8px 12px 7px;background:linear-gradient(135deg,#2E7D32,#388E3C)}
    .used-icon{font-size:15px}
    .used-title{font-size:12px;font-weight:800;color:#fff;letter-spacing:0.3px}
    .used-motto{font-size:10.5px;font-weight:700;color:#2E7D32;padding:6px 12px 5px;background:rgba(255,255,255,0.5);border-bottom:1px dashed #A5D6A7}
    .used-co2-row{display:flex;align-items:center;gap:4px;padding:7px 12px 5px}
    .used-co2-block{flex:1;text-align:center;padding:4px 5px;border-radius:7px}
    .used-co2-block.new-block{background:rgba(198,40,40,0.08)}
    .used-co2-block.save-block{background:rgba(34,139,34,0.10)}
    .used-co2-block.local-block{background:rgba(21,101,192,0.08)}
    .used-co2-val{display:block;font-size:13px;font-weight:800;line-height:1.1}
    .new-block .used-co2-val{color:#C62828}
    .save-block .used-co2-val{color:#228B22}
    .local-block .used-co2-val{color:#1565C0}
    .used-co2-lbl{display:block;font-size:9px;color:var(--muted);margin-top:1px;text-transform:uppercase;letter-spacing:0.3px}
    .used-arrow{font-size:14px;color:var(--muted);flex-shrink:0}
    .used-compare{font-size:10.5px;color:#2E7D32;font-weight:600;padding:3px 12px 5px}
    /* Plattform-Liste (erbt plat-list Basis-Styles, Override für used) */
    .used-plat-list{padding:5px 8px 8px;display:flex;flex-direction:column;gap:5px}
    .used-plat-item{display:flex;align-items:center;gap:9px;background:rgba(255,255,255,0.75);border:1.5px solid var(--border);border-left:3px solid var(--pc,var(--green));border-radius:9px;padding:7px 10px;text-decoration:none;transition:all 0.18s;cursor:pointer}
    .used-plat-item:hover{background:rgba(255,255,255,0.95);transform:translateX(2px);box-shadow:0 2px 8px rgba(34,139,34,0.12)}
    .plat-saving-block{text-align:right;flex-shrink:0;min-width:40px}
    .plat-saving-kg{display:block;font-size:12px;font-weight:800;color:var(--green);line-height:1.1}
    .plat-saving-pct{display:block;font-size:9.5px;color:var(--muted)}
    .circular-confirm{background:linear-gradient(135deg,#1B5E20,#2E7D32);color:#fff;padding:9px 12px;font-size:12px;font-weight:700;text-align:center;line-height:1.4}
    .circular-confirm-show{animation:et-in 0.35s cubic-bezier(0.34,1.56,0.64,1)}
    /* ── Einstellungs-Panel (Overlay) ── */
    .et-settings-panel{border-top:2px solid #1565C0;background:var(--white);animation:et-in 0.22s ease both}
    .sp-header{display:flex;align-items:center;justify-content:space-between;padding:9px 13px 7px;background:linear-gradient(135deg,#1565C0,#1976D2)}
    .sp-title{font-size:12px;font-weight:700;color:#fff}
    .sp-close{background:rgba(255,255,255,0.2);border:none;color:#fff;width:20px;height:20px;border-radius:50%;cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center}
    .sp-close:hover{background:rgba(255,255,255,0.35)}
    .sp-body{padding:10px 12px 12px;display:flex;flex-direction:column;gap:10px;max-height:65vh;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--border) transparent}
    .sp-section{display:flex;flex-direction:column;gap:6px}
    .sp-section-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.7px;color:#1565C0}
    .sp-mode-row{display:flex;gap:0;background:#F0F0E0;border:1.5px solid var(--border);border-radius:9px;overflow:hidden}
    .sp-mode-btn{flex:1;padding:7px 8px;text-align:center;cursor:pointer;border:none;background:transparent;font-family:inherit;font-size:11px;font-weight:600;color:var(--muted);transition:all 0.18s;line-height:1.3}
    .sp-mode-btn small{font-weight:400;opacity:0.85}
    .sp-mode-btn.active-green{background:var(--green);color:#fff;border-radius:7px}
    .sp-mode-btn.active-blue{background:#1565C0;color:#fff;border-radius:7px}
    .sp-api-block{padding:8px 0 0;display:flex;flex-direction:column;gap:5px}
    .sp-label{font-size:10.5px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:0.4px}
    .sp-key-row{display:flex;gap:6px}
    .sp-input{flex:1;padding:7px 10px;background:var(--cream);border:1.5px solid var(--border);border-radius:7px;font-size:12px;font-family:inherit;color:var(--text);outline:none;transition:border-color 0.2s}
    .sp-input:focus{border-color:#1565C0;box-shadow:0 0 0 3px rgba(21,101,192,0.1)}
    .sp-eye{padding:0 10px;background:transparent;border:1.5px solid var(--border);border-radius:7px;cursor:pointer;font-size:13px;transition:border-color 0.2s}
    .sp-eye:hover{border-color:#1565C0}
    .sp-hint{font-size:10px;color:var(--muted)}
    .sp-link{color:#1565C0;font-weight:600;text-decoration:none}
    .sp-pref-row{display:flex;align-items:center;justify-content:space-between;padding:5px 0;border-bottom:1px dashed var(--border)}
    .sp-pref-row:last-child{border-bottom:none}
    .sp-pref-lbl{font-size:12px;font-weight:600}
    .sp-pref-sub{font-size:10px;color:var(--muted);margin-top:1px}
    .sp-budget-field{display:flex;align-items:center;gap:7px;padding-top:4px}
    .sp-budget-input{max-width:80px!important;flex:none!important}
    .sp-toggle{position:relative;width:38px;height:20px;flex-shrink:0}
    .sp-toggle input{opacity:0;width:0;height:0}
    .sp-slider{position:absolute;inset:0;background:#D4D4AA;border-radius:20px;cursor:pointer;transition:0.25s}
    .sp-slider::before{content:"";position:absolute;width:14px;height:14px;border-radius:50%;background:#fff;top:3px;left:3px;transition:0.25s;box-shadow:0 1px 3px rgba(0,0,0,0.12)}
    .sp-toggle input:checked+.sp-slider{background:var(--green)}
    .sp-toggle input:checked+.sp-slider::before{transform:translateX(18px)}
    .sp-save-btn{padding:10px;background:var(--green);color:#fff;border:none;border-radius:9px;font-size:12.5px;font-weight:700;font-family:inherit;cursor:pointer;transition:all 0.2s;margin-top:2px}
    .sp-save-btn:hover{background:var(--green2);transform:translateY(-1px)}
    .sp-saved-msg{text-align:center;font-size:12px;font-weight:700;color:var(--green);padding:5px;animation:et-in 0.3s ease}
    .sp-select{padding:6px 9px;background:var(--cream);border:1.5px solid var(--border);border-radius:7px;font-size:12px;font-family:inherit;color:var(--text);outline:none;cursor:pointer;transition:border-color 0.2s;min-width:140px}
    .sp-select:focus{border-color:var(--green)}
    /* ── Info-Panel ── */
    .et-info-panel{border-top:2px solid var(--green);background:var(--white);animation:et-in 0.25s ease both}
    .info-header{display:flex;align-items:center;justify-content:space-between;padding:9px 12px 7px;background:linear-gradient(135deg,#1565C0,#1976D2)}
    .info-title{font-size:12px;font-weight:700;color:#fff;letter-spacing:0.2px}
    .info-close{background:rgba(255,255,255,0.2);border:none;color:#fff;width:20px;height:20px;border-radius:50%;cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center;transition:background 0.2s}
    .info-close:hover{background:rgba(255,255,255,0.35)}
    .info-body{padding:10px 12px 12px;display:flex;flex-direction:column;gap:10px;max-height:60vh;overflow-y:auto;scrollbar-width:thin;scrollbar-color:var(--border) transparent}
    .info-section{display:flex;flex-direction:column;gap:5px}
    .info-section-title{font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:0.7px;color:#1565C0}
    .info-source-pill{font-size:10px;font-weight:700;padding:3px 8px;border-radius:6px;display:inline-block}
    .info-source-pill.specific{background:#E3F2FD;color:#1565C0}
    .info-source-pill.live{background:#E8F5E9;color:#1B5E20}
    .info-source-pill.mock{background:#FFF8E1;color:#F57F17}
    .info-tier{display:flex;gap:8px;padding:6px 8px;background:rgba(21,101,192,0.04);border-radius:8px;border-left:3px solid #1565C0;font-size:10.5px;line-height:1.5;color:var(--text)}
    .info-tier-num{flex-shrink:0;width:18px;height:18px;border-radius:50%;background:#1565C0;color:#fff;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-top:1px}
    .info-text{font-size:10.5px;color:var(--muted);line-height:1.55}
    .info-section-privacy{background:rgba(34,139,34,0.05);border:1px solid rgba(34,139,34,0.15);border-radius:8px;padding:8px 10px}
    .info-section-privacy .info-section-title{color:var(--green2)}
    .info-section-philosophy{background:linear-gradient(135deg,rgba(34,139,34,0.06),rgba(34,139,34,0.03));border:1px solid rgba(34,139,34,0.2);border-radius:8px;padding:8px 10px}
    .info-philosophy-row{display:flex;gap:8px;padding:5px 0;border-bottom:1px dashed rgba(34,139,34,0.15);font-size:10.5px;color:var(--text);line-height:1.5}
    .info-philosophy-row:last-of-type{border-bottom:none}
    .info-phil-icon{font-size:14px;flex-shrink:0;margin-top:1px}
    .info-list{padding-left:14px;font-size:10.5px;color:var(--muted);line-height:1.7}
    .info-link{color:#1565C0;text-decoration:none;font-weight:600;font-size:10px}
    .info-link:hover{text-decoration:underline}
    .info-version{font-size:10px;color:var(--muted);text-align:center;padding-top:6px;border-top:1px dashed var(--border)}
    /* Ko-fi */
    .et-kofi-link{color:#FF5E5B!important;font-weight:700!important}
    .et-kofi-link:hover{opacity:0.8}
    .et-affiliate-note{font-size:10px;color:var(--muted);font-weight:700;cursor:default}
    .info-section-kofi{background:linear-gradient(135deg,#FFF8E1,#FFFDE7);border:1px solid #FFCC02;border-radius:8px;padding:9px 11px}
    .info-section-kofi .info-section-title{color:#E65100}
    .info-kofi-btn{display:block;margin-top:8px;padding:9px 14px;background:#FF5E5B;color:#fff;border-radius:9px;text-decoration:none;font-size:12px;font-weight:700;text-align:center;transition:opacity 0.2s}
    .info-kofi-btn:hover{opacity:0.85}
    .info-section-affiliate{background:rgba(0,0,0,0.03);border:1px dashed var(--border);border-radius:8px;padding:8px 11px}
    .info-section-affiliate .info-section-title{color:var(--muted)}
    .info-body code{font-family:monospace;font-size:9px;background:rgba(0,0,0,0.07);padding:1px 4px;border-radius:3px}
  `; }

  // ── Manueller Preis-CO₂ Rechner (wenn Preis nicht erkannt) ──
  // Wird direkt im Shadow DOM aufgerufen via oninput
  window._ecoUpdatePriceCO2 = function(priceVal, totalCO2) {
    const price = parseFloat(priceVal);
    if (!price || price <= 0) return;
    const priceCO2     = (totalCO2 / price).toFixed(3);
    const refPrice     = Math.round(price * 0.68);
    const refCO2       = Math.round((totalCO2 * 0.30 + 1.2) * 10) / 10;
    const refPriceCO2  = (refCO2 / refPrice).toFixed(3);
    const ratio        = Math.round((1 - refPriceCO2 / priceCO2) * 100);
    const refBarPct    = Math.min(100, Math.round((refPriceCO2 / priceCO2) * 100));

    // Finde das result-div im Shadow DOM
    const host = document.getElementById("ecotrace-host");
    if (!host?.shadowRoot) return;
    const result = host.shadowRoot.getElementById("pci-manual-result");
    if (!result) return;
    result.style.display = "block";
    result.innerHTML = `
      <div class="price-co2-grid" style="margin-top:6px">
        <div class="price-co2-item">
          <div class="pci-label">🆕 Neukauf ${price}€</div>
          <div class="pci-bar-wrap"><div class="pci-bar pci-bar-new" style="width:100%"></div></div>
          <div class="pci-val pci-bad">${priceCO2} kg/€</div>
        </div>
        <div class="price-co2-item">
          <div class="pci-label">♻️ Refurbished ~${refPrice}€ <span class="pci-est">Schätzung</span></div>
          <div class="pci-bar-wrap"><div class="pci-bar pci-bar-ref" style="width:${refBarPct}%"></div></div>
          <div class="pci-val pci-good">${refPriceCO2} kg/€</div>
        </div>
      </div>
      <div class="pci-conclusion">✅ Refurbished: <strong>${ratio}% CO₂-effizienter</strong> pro Euro</div>
    `;
  };

  const truncate = (s, n) => s.length > n ? s.slice(0, n) + "…" : s;
  const esc = s => (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const categoryLabel = c => ({electronics:"Elektronik",textile:"Textil",furniture:"Möbel",food:"Lebensmittel",generic:"Allgemein"}[c]||"Allgemein");

  // ── Link öffnen (umgeht Popup-Blocker im Content Script) ──
  function openLink(url) {
    const a = document.createElement("a");
    a.href   = url;
    a.target = "_blank";
    a.rel    = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  // ── Plattform-Picker Dropdown ─────────────────────────────
  function togglePlatformPicker(shadow, platforms, productTitle, anchorBtn) {
    // Bereits offen? → schließen
    const existing = shadow.getElementById("et-platform-picker");
    if (existing) { existing.remove(); return; }

    const picker = document.createElement("div");
    picker.id = "et-platform-picker";
    picker.className = "et-platform-picker";

    picker.innerHTML = `
      <div class="picker-header">Auf welcher Plattform suchen?</div>
      ${platforms.map(p => {
        const url = EcoTrace.searchAlternative(productTitle, p.id);
        return `<div class="picker-item" data-url="${esc(url)}">
          <span class="picker-emoji">${p.emoji}</span>
          <div class="picker-info">
            <span class="picker-name">${esc(p.name)}</span>
            <span class="picker-co2">−${p.co2Saving}% CO₂ · ${esc(EcoTrace.getBadge?.(p) || "")}</span>
          </div>
          <span class="picker-arrow">→</span>
        </div>`;
      }).join("")}
    `;

    // Klick auf Plattform → Link öffnen + Picker schließen
    picker.querySelectorAll(".picker-item").forEach(item => {
      item.addEventListener("click", () => {
        openLink(item.dataset.url);
        picker.remove();
      });
    });

    // Klick außerhalb → schließen
    setTimeout(() => {
      document.addEventListener("click", function close(evt) {
        const host = document.getElementById("ecotrace-host");
        if (!host?.shadowRoot?.contains(evt.target)) {
          picker.remove();
          document.removeEventListener("click", close);
        }
      });
    }, 50);

    // Picker nach Button einfügen
    anchorBtn.insertAdjacentElement("afterend", picker);
  }

})();
