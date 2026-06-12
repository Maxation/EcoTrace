// ============================================================
//  EcoTrace – popup.js  v2.2.7
//  Dashboard mit Achievements, Budget-Anzeige, Report-Export
// ============================================================

"use strict";

// ── Popup i18n ────────────────────────────────────────────
const POPUP_I18N = {
  de: {
    dashboard: "CO₂-Dashboard", total_savings: "Gesamtersparnis",
    co2_saved: "kg CO₂ gespart", monthly_budget: "Monatsbudget",
    scans: "Scans", achievements: "Achievements",
    tab_log: "📋 Aktivitäten", tab_badges: "🏅 Badges", tab_actions: "⚡ Aktionen",
    recent: "Letzte Aktivitäten", all_badges: "Alle Badges",
    report_mgmt: "Report & Verwaltung",
    btn_report: "Monatsbericht", btn_settings: "Einstellungen",
    btn_csv: "CO₂-Daten als CSV", btn_nearby: "Second-Hand in der Nähe",
    btn_reset: "Daten zurücksetzen",
    footer_settings: "Einstellungen", footer_sources: "Datenquellen", footer_support: "Support",
    log_empty: "Besuche eine Produktseite auf Amazon.de und speichere deine erste CO₂-Ersparnis!",
    more_items: "weitere",
    equiv_start: "🌱 Starte auf Amazon.de!",
    confirm_reset: "Alle CO₂-Daten und Achievements zurücksetzen?\n(API-Key bleibt erhalten)",
    report_err: "Report konnte nicht generiert werden: ",
    level_max: "Maximales Level!", level_next: "→", level_at: "bei", level_xp: "XP",
    panel_settings: "⚙️ Einstellungen", panel_sources: "🔍 Datenquellen & Transparenz",
    panel_support: "☕ EcoTrace unterstützen", close: "✕",
    save_btn: "💾 Einstellungen speichern", saved_msg: "✅ Gespeichert!",
    co2_mode: "📦 CO₂-Berechnung", repair_mode: "🔧 Reparierbarkeit",
    shops_label: "🗺️ Lokale Shops", shops_enable: "Shop-Suche aktivieren",
    radius_label: "Suchradius", predecessor: "Vorgänger-Hinweis",
    price_index: "Preis-CO₂-Index", budget_label: "CO₂-Monatsbudget",
    country_label: "Land", lang_label: "Sprache",
    db_label: "📋 Offline-DB", db_sub: "Sofort · 0W",
    api_label: "🌐 API", api_sub: "Live · eigener Key",
    ifixit_sub: "Live · kostenlos",
    key_label: "Climatiq API-Key", key_hint: "Kostenlos auf climatiq.io · 100 Anfragen/Monat",
    budget_off: "Deaktiviert", budget_unit: "kg CO₂ / Monat",
    country_de: "🇩🇪 Deutschland", country_at: "🇦🇹 Österreich",
    country_ch: "🇨🇭 Schweiz", country_nl: "🇳🇱 Niederlande", country_all: "🌍 International",
    country_hint: "Beeinflusst welche Secondhand-Plattformen angezeigt werden.",
    kofi_text: "EcoTrace ist kostenlos, werbefrei und Open Source. Wenn das Plugin dir geholfen hat, freuen wir uns über einen Kaffee.",
    kofi_btn: "☕ Auf Ko-fi unterstützen",
    tab_wishlist: "⭐ Wunschliste",
    wishlist_title: "Meine Wunschliste",
    wishlist_empty: "Noch keine Produkte auf der Wunschliste.",
    wishlist_add_ph: "Produktname eingeben…",
    wishlist_added: "Gemerkt",
    wishlist_reminder: "⏰ Erinnerung in",
    wishlist_days: "Tagen",
    wishlist_overdue: "🔔 Jetzt nach Gebrauchtkauf suchen!",
    wishlist_search: "Gebraucht suchen",
  },
  en: {
    dashboard: "CO₂ Dashboard", total_savings: "Total savings",
    co2_saved: "kg CO₂ saved", monthly_budget: "Monthly budget",
    scans: "Scans", achievements: "Achievements",
    tab_log: "📋 Activity", tab_badges: "🏅 Badges", tab_actions: "⚡ Actions",
    recent: "Recent activity", all_badges: "All badges",
    report_mgmt: "Report & Management",
    btn_report: "Monthly report", btn_settings: "Settings",
    btn_csv: "Export CO₂ data as CSV", btn_nearby: "Second-hand nearby",
    btn_reset: "Reset data",
    footer_settings: "Settings", footer_sources: "Data sources", footer_support: "Support",
    log_empty: "Visit a product page on Amazon and save your first CO₂ saving!",
    more_items: "more",
    equiv_start: "🌱 Start on Amazon!",
    confirm_reset: "Reset all CO₂ data and achievements?\n(API key will be kept)",
    report_err: "Report could not be generated: ",
    level_max: "Maximum level!", level_next: "→", level_at: "at", level_xp: "XP",
    panel_settings: "⚙️ Settings", panel_sources: "🔍 Data sources & Transparency",
    panel_support: "☕ Support EcoTrace", close: "✕",
    save_btn: "💾 Save settings", saved_msg: "✅ Saved!",
    co2_mode: "📦 CO₂ Calculation", repair_mode: "🔧 Repairability",
    shops_label: "🗺️ Local Shops", shops_enable: "Enable shop search",
    radius_label: "Search radius", predecessor: "Predecessor hint",
    price_index: "Price-CO₂ Index", budget_label: "CO₂ monthly budget",
    country_label: "Country", lang_label: "Language",
    db_label: "📋 Offline DB", db_sub: "Instant · 0W",
    api_label: "🌐 API", api_sub: "Live · own key",
    ifixit_sub: "Live · free",
    key_label: "Climatiq API Key", key_hint: "Free at climatiq.io · 100 requests/month",
    budget_off: "Disabled", budget_unit: "kg CO₂ / month",
    country_de: "🇩🇪 Germany", country_at: "🇦🇹 Austria",
    country_ch: "🇨🇭 Switzerland", country_nl: "🇳🇱 Netherlands", country_all: "🌍 International",
    country_hint: "Affects which second-hand platforms are shown.",
    kofi_text: "EcoTrace is free, ad-free and open source. If this plugin helped you, we'd love a coffee.",
    kofi_btn: "☕ Support on Ko-fi",
    tab_wishlist: "⭐ Wishlist",
    wishlist_title: "My Wishlist",
    wishlist_empty: "No products on the wishlist yet.",
    wishlist_add_ph: "Enter product name…",
    wishlist_added: "Added",
    wishlist_reminder: "⏰ Reminder in",
    wishlist_days: "days",
    wishlist_overdue: "🔔 Check now for used deals!",
    wishlist_search: "Search used",
  }
};

let _popupLang = "de";
const pt = key => POPUP_I18N[_popupLang]?.[key] ?? POPUP_I18N.de[key] ?? key;
const $ = id => document.getElementById(id);
// ── Wishlist ────────────────────────────────────────────────
const WISHLIST_REMIND_DAYS = 7;

function loadWishlist() {
  chrome.storage.local.get(["wishlist"], d => {
    renderWishlist(d.wishlist || []);
  });
}

function renderWishlist(items) {
  const list    = $("wishlist-list");
  const empty   = $("wishlist-empty");
  if (!list) return;

  if (!items || items.length === 0) {
    list.innerHTML = "";
    if (empty) empty.style.display = "block";
    return;
  }
  if (empty) empty.style.display = "none";

  const now = Date.now();
  list.innerHTML = items.map((item, idx) => {
    const age      = Math.floor((now - item.addedAt) / (1000 * 60 * 60 * 24));
    const daysLeft = WISHLIST_REMIND_DAYS - age;
    const overdue  = daysLeft <= 0;

    // Platform search buttons (top 3)
    const platforms = [
      { id: "backmarket", color: "#2D7D46", emoji: "♻️", name: "Back Market" },
      { id: "vinted",     color: "#09B1BA", emoji: "👗", name: "Vinted" },
      { id: "kleinanzeigen", color: "#37474F", emoji: "📍", name: "Kleinanzeigen" },
    ];
    const q = encodeURIComponent(item.title);
    const searchBtns = platforms.map(p => {
      const urls = {
        backmarket:    `https://www.backmarket.de/de-de/search?q=${q}`,
        vinted:        `https://www.vinted.de/catalog?search_text=${q}`,
        kleinanzeigen: `https://www.kleinanzeigen.de/s/${encodeURIComponent(item.title.toLowerCase().replace(/\s+/g,"-"))}/k0`,
      };
      return `<button class="wishlist-search-btn" style="border-color:${p.color};color:${p.color}"
                onclick="window.open('${urls[p.id]}','_blank')">${p.emoji} ${p.name}</button>`;
    }).join("");

    const reminderHTML = overdue
      ? `<div class="wishlist-item-reminder">${pt("wishlist_overdue")}</div>`
      : `<div class="wishlist-item-meta">${pt("wishlist_reminder")} ${daysLeft} ${pt("wishlist_days")}</div>`;

    const co2Badge = item.co2
      ? `<span class="wishlist-co2-badge">~${item.co2} kg CO₂</span>`
      : "";

    return `
      <div class="wishlist-item${overdue?" overdue":""}">
        <button class="wishlist-delete-btn" data-idx="${idx}" title="Entfernen">✕</button>
        <div class="wishlist-item-title">${esc(item.title)}</div>
        ${co2Badge}
        <div class="wishlist-item-meta">${pt("wishlist_added")}: ${new Date(item.addedAt).toLocaleDateString(_popupLang)}</div>
        ${reminderHTML}
        <div class="wishlist-item-actions">${searchBtns}</div>
      </div>`;
  }).join("");

  // Delete handlers
  list.querySelectorAll(".wishlist-delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      chrome.storage.local.get(["wishlist"], d => {
        const wl = (d.wishlist || []);
        wl.splice(parseInt(btn.dataset.idx), 1);
        chrome.storage.local.set({ wishlist: wl }, () => renderWishlist(wl));
      });
    });
  });
}

function bindWishlist() {
  const btn = $("wishlist-add-btn");
  const inp = $("wishlist-input");
  if (!btn || !inp) return;

  const doAdd = () => {
    const title = inp.value.trim();
    if (!title) return;

    // CO₂-Schätzung wenn möglich
    const dbResult = typeof EcoTrace !== "undefined" && EcoTrace.ProductCarbonDB
      ? EcoTrace.ProductCarbonDB.lookup(title)
      : null;
    const co2 = dbResult ? dbResult.co2 : null;

    const newItem = { title, addedAt: Date.now(), co2 };
    chrome.storage.local.get(["wishlist"], d => {
      const wl = d.wishlist || [];
      // Duplikat-Check
      if (!wl.some(w => w.title.toLowerCase() === title.toLowerCase())) {
        wl.unshift(newItem);
        chrome.storage.local.set({ wishlist: wl }, () => {
          inp.value = "";
          renderWishlist(wl);
          // Alarm in 7 Tagen setzen
          if (typeof chrome !== "undefined" && chrome.alarms) {
            chrome.alarms.create(`wishlist_${Date.now()}`, { delayInMinutes: WISHLIST_REMIND_DAYS * 24 * 60 });
          }
        });
      }
    });
  };

  btn.addEventListener("click", doAdd);
  inp.addEventListener("keydown", e => { if (e.key === "Enter") doAdd(); });
}


const esc = s => (s||"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

// ── Init ─────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(["userLang"], d => {
    _popupLang = d.userLang || "de";
    applyPopupLang();
    loadAll();
    bindTabs();
    bindActions();
    buildPanels();
    loadWishlist();
    bindWishlist();
  });
});

// ── Lang apply ────────────────────────────────────────────
function applyPopupLang() {
  const set = (id, key) => { const el = $(id); if (el) el.textContent = pt(key); };
  set("lbl-dashboard",       "dashboard");
  set("lbl-total-savings",   "total_savings");
  set("lbl-co2-saved",       "co2_saved");
  set("lbl-monthly-budget",  "monthly_budget");
  set("lbl-scans",           "scans");
  set("lbl-achievements",    "achievements");
  set("tab-lbl-log",         "tab_log");
  set("tab-lbl-badges",      "tab_badges");
  set("tab-lbl-actions",     "tab_actions");
  set("lbl-recent",          "recent");
  set("lbl-all-badges",      "all_badges");
  set("lbl-report-mgmt",     "report_mgmt");
  set("lbl-report",          "btn_report");
  set("lbl-settings-act",    "btn_settings");
  set("lbl-csv",             "btn_csv");
  set("lbl-nearby",          "btn_nearby");
  set("lbl-reset",           "btn_reset");
  set("lbl-footer-settings", "footer_settings");
  set("lbl-footer-sources",  "footer_sources");
  set("lbl-footer-support",   "footer_support");
  set("tab-lbl-wishlist",     "tab_wishlist");
  set("lbl-wishlist-title",   "wishlist_title");
  set("lbl-wishlist-empty",   "wishlist_empty");
  const inp = $("wishlist-input");
  if (inp) inp.placeholder = pt("wishlist_add_ph");
  document.documentElement.lang = _popupLang;
}

// ── Load all data ─────────────────────────────────────────
function loadAll() {
  chrome.storage.local.get([
    "totalSavings","savingsLog","unlockedAchievements",
    "totalXP","achStats","monthlyCO2Budget"
  ], data => {
    renderHero(data.totalSavings||0, data.totalXP||0);
    renderStats(data.savingsLog||[], data.unlockedAchievements||[]);
    renderBudget(data.monthlyCO2Budget||null, data.savingsLog||[]);
    renderLog(data.savingsLog||[]);
    renderAchievements(data.unlockedAchievements||[], data.totalXP||0);
  });
}

// ── Hero ──────────────────────────────────────────────────
function renderHero(total, xp) {
  $("total-savings").textContent = total.toFixed(1);
  $("xp-badge").textContent = `${xp} XP`;
  const equiv = $("hero-equiv");
  if (total <= 0)      equiv.textContent = pt("equiv_start");
  else if (total < 1)  equiv.textContent = `≈ ${Math.round(total*10)} km ${_popupLang==="en"?"train ride saved":"Zugfahrt gespart"} 🚆`;
  else if (total < 10) equiv.textContent = `≈ ${Math.round(total*4)} km ${_popupLang==="en"?"car trip avoided":"Autofahrt vermieden"} 🚗`;
  else if (total < 50) equiv.textContent = `≈ ${(total/25*12).toFixed(1)} ${_popupLang==="en"?"months tree growth":"Monate Baum-Wachstum"} 🌳`;
  else                 equiv.textContent = `≈ ${(total/1000).toFixed(3)} ${_popupLang==="en"?"tonnes CO₂ avoided":"Tonnen CO₂ vermieden"} 🌍`;
}

// ── Stats ─────────────────────────────────────────────────
function renderStats(log, unlocked) {
  $("scan-count").textContent = log.length;
  $("ach-count").textContent  = unlocked.length;
}

// ── Budget ────────────────────────────────────────────────
function renderBudget(budget, log) {
  if (!budget) return;
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  let used = 0;
  for (const e of log) {
    const [d,m,y] = (e.date||"01.01.2000").split(".");
    if (`${y}-${m}`===thisMonth) used += e.savings||0;
  }
  used = Math.round(used*10)/10;
  const pct = Math.min(Math.round((used/budget)*100),100);
  const over = used > budget;
  $("budget-pill").style.display = "block";
  $("budget-label").textContent  = `${used} / ${budget} kg`;
  $("budget-fill").style.width   = pct+"%";
  $("budget-fill").style.background = over?"#C62828":pct>75?"#F57F17":"#4CAF50";
  $("budget-pct-label").textContent = pct>10?`${pct}%`:"";
}

// ── Log ───────────────────────────────────────────────────
function renderLog(log) {
  const container = $("log-list");
  if (log.length===0) {
    container.innerHTML = `<div class="log-empty"><div style="font-size:32px;margin-bottom:8px">🛍️</div>${pt("log_empty")}</div>`;
    return;
  }
  container.innerHTML = log.slice(0,10).map(e=>`
    <div class="log-item">
      <div><div class="log-title">${esc(e.title)}</div><div class="log-meta">${e.date}</div></div>
      <div class="log-savings">−${(e.savings||0).toFixed(1)} kg</div>
    </div>`).join("")
    +(log.length>10?`<div style="text-align:center;font-size:11px;color:var(--muted);padding:6px">+${log.length-10} ${pt("more_items")}</div>`:"");
}

// ── Achievements ──────────────────────────────────────────
function renderAchievements(unlocked, xp) {
  const level   = EcoTrace.AchievementService.getLevel(xp);
  const nextTxt = level.next ? `${pt("level_next")} ${level.next.title} ${pt("level_at")} ${level.next.min} ${pt("level_xp")}` : pt("level_max");
  $("level-bar").innerHTML = `
    <div class="level-top">
      <div class="level-title">${level.icon} ${level.title}</div>
      <div class="level-xp">${xp} XP · ${nextTxt}</div>
    </div>
    <div class="level-track"><div class="level-fill" style="width:${level.progress}%"></div></div>`;

  chrome.storage.local.get(["achStats"], d => {
    const stats = d.achStats||{};
    $("ach-grid").innerHTML = EcoTrace.ACHIEVEMENTS.map(a => {
      const on = new Set(unlocked).has(a.id);
      let pct=on?100:0, lbl="";
      if (!on&&a.threshold){const cur=stats[a.statKey||""]||0;pct=Math.min(100,Math.round(cur/a.threshold*100));lbl=`${cur} / ${a.threshold}`;}
      return `<div class="ach-card ${on?"unlocked":"locked"}">
        <div class="ach-icon-big">${a.icon}</div>
        <div class="ach-title-sm">${esc(a.title)}</div>
        <div class="ach-desc-sm">${esc(a.desc)}</div>
        ${!on&&lbl?`<div class="ach-progress-wrap"><div class="ach-progress-bar" style="width:${pct}%"></div></div><div class="ach-progress-lbl">${lbl}</div>`:""}
        <div class="ach-xp-sm">${on?`+${a.xp} XP ✅`:`${a.xp} XP 🔒`}</div>
      </div>`;
    }).join("");
  });
}

// ── Tabs ──────────────────────────────────────────────────
function bindTabs() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p=>p.classList.remove("active"));
      tab.classList.add("active");
      $("tab-"+tab.dataset.tab).classList.add("active");
    });
  });
}

// ── CSV ───────────────────────────────────────────────────
function exportCSV() {
  chrome.storage.local.get(["savingsLog","circularIntents"], d => {
    let csv = "\uFEFF";
    csv += "Typ,Datum,Produkt,CO2_gespart_kg,Plattform\n";
    (d.savingsLog||[]).forEach(e=>{ csv+=["Gespeicherte Ersparnis",esc_csv(e.date||""),esc_csv(e.title||""),(e.savings||0).toFixed(2),""].join(";")+"\n"; });
    (d.circularIntents||[]).forEach(e=>{ csv+=["Circular Intent",esc_csv(e.date||""),esc_csv(e.product||""),(e.co2Potential||0).toFixed(2),esc_csv(e.platform||"")].join(";")+"\n"; });
    const a = Object.assign(document.createElement("a"),{href:URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"})),download:`ecotrace-export-${new Date().toISOString().slice(0,10)}.csv`});
    a.click();
  });
}
function esc_csv(str){const s=String(str).replace(/"/g,'""');return /[;",\n]/.test(s)?`"${s}"`:s;}

// ── Actions ───────────────────────────────────────────────
function bindActions() {
  $("btn-report")?.addEventListener("click", async()=>{
    try{await EcoTrace.ReportService.openInNewTab();}
    catch(e){alert(pt("report_err")+e.message);}
  });
  $("btn-options")?.addEventListener("click",()=>openPanel("settings"));
  $("btn-csv-export")?.addEventListener("click",exportCSV);
  $("btn-osm")?.addEventListener("click",()=>{
    const q=encodeURIComponent(_popupLang==="en"?"Second Hand store OR repair shop":"Second Hand Laden OR Reparatur Werkstatt");
    window.open(`https://www.google.com/maps/search/${q}`,"_blank");
  });
  $("btn-reset")?.addEventListener("click",()=>{
    if(!confirm(pt("confirm_reset")))return;
    chrome.storage.local.remove(["totalSavings","savingsLog","unlockedAchievements","totalXP","achStats"],()=>loadAll());
  });

  // Footer buttons
  $("footer-settings")?.addEventListener("click",()=>openPanel("settings"));
  $("footer-sources")?.addEventListener("click",()=>openPanel("sources"));
  $("footer-support")?.addEventListener("click",()=>openPanel("support"));
}

// ── Inline Panels ─────────────────────────────────────────
function openPanel(which) {
  closeAllPanels();
  const panel = $("panel-"+which);
  if (!panel) return;
  // Rebuild content each time so lang is always current
  if (which==="settings") panel.innerHTML = buildSettingsPanelHTML();
  if (which==="sources")  panel.innerHTML = buildSourcesPanelHTML();
  if (which==="support")  panel.innerHTML = buildSupportPanelHTML();
  panel.style.display = "block";
  requestAnimationFrame(()=>{ panel.style.opacity="1"; panel.style.transform="translateY(0)"; });
  if (which==="settings") bindSettingsHandlers();
  // Close button
  panel.querySelector(".pp-close")?.addEventListener("click", closeAllPanels);
}

function closeAllPanels() {
  ["settings","sources","support"].forEach(id=>{
    const p = $("panel-"+id);
    if(p){p.style.opacity="0";p.style.transform="translateY(10px)";setTimeout(()=>{p.style.display="none";},200);}
  });
}

function buildPanels() {
  const wrap = document.getElementById("panels-wrap");
  if (!wrap) return;
  ["settings","sources","support"].forEach(id=>{
    const div = document.createElement("div");
    div.id = "panel-"+id;
    div.className = "popup-panel";
    div.style.display = "none";
    div.style.opacity = "0";
    div.style.transform = "translateY(10px)";
    wrap.appendChild(div);
  });
}

// ── Settings Panel HTML ───────────────────────────────────
function buildSettingsPanelHTML() {
  const lang = _popupLang;
  const cn = k => lang==="en"?{de:"🇩🇪 Germany",at:"🇦🇹 Austria",ch:"🇨🇭 Switzerland",nl:"🇳🇱 Netherlands",all:"🌍 International"}[k]:{"de":"🇩🇪 Deutschland","at":"🇦🇹 Österreich","ch":"🇨🇭 Schweiz","nl":"🇳🇱 Niederlande","all":"🌍 International"}[k];
  return `
  <div class="pp-header"><span>${pt("panel_settings")}</span><button class="pp-close">${pt("close")}</button></div>
  <div class="pp-body" id="sp-body-popup">
    <div class="pp-section">
      <div class="pp-section-title">${pt("co2_mode")}</div>
      <div class="pp-mode-row" id="pp-mode-co2">
        <button class="pp-mode-btn" data-group="modeCO2" data-val="db">${pt("db_label")}<span>${pt("db_sub")}</span></button>
        <button class="pp-mode-btn" data-group="modeCO2" data-val="api">${pt("api_label")}<span>${pt("api_sub")}</span></button>
      </div>
      <div class="pp-key-row">
        <label>${pt("key_label")}</label>
        <div style="display:flex;gap:6px;align-items:center">
          <input type="password" id="pp-climatiq-key" placeholder="•••••••••••••" style="flex:1;padding:5px 8px;border:1px solid #ccc;border-radius:7px;font-size:11px">
          <button id="pp-key-eye" style="background:none;border:none;cursor:pointer;font-size:14px">👁</button>
        </div>
        <div style="font-size:9.5px;color:#888;margin-top:3px">${pt("key_hint")}</div>
      </div>
    </div>
    <div class="pp-section">
      <div class="pp-section-title">${pt("repair_mode")}</div>
      <div class="pp-mode-row" id="pp-mode-repair">
        <button class="pp-mode-btn" data-group="modeRepair" data-val="db">${pt("db_label")}<span>${pt("db_sub")}</span></button>
        <button class="pp-mode-btn" data-group="modeRepair" data-val="api">${pt("api_label")}<span>${pt("ifixit_sub")}</span></button>
      </div>
    </div>
    <div class="pp-section">
      <div class="pp-section-title">${pt("shops_label")}</div>
      <label class="pp-toggle-row"><input type="checkbox" id="pp-pref-local"><span>${pt("shops_enable")}</span></label>
    </div>
    <div class="pp-section">
      <div class="pp-section-title">🎨 Overlay</div>
      <label class="pp-toggle-row"><input type="checkbox" id="pp-pref-predecessor"><span>${pt("predecessor")}</span></label>
      <label class="pp-toggle-row"><input type="checkbox" id="pp-pref-price-index"><span>${pt("price_index")}</span></label>
    </div>
    <div class="pp-section">
      <div class="pp-section-title">🌍 ${pt("lang_label")} & ${pt("country_label")}</div>
      <label class="pp-label">${pt("country_label")}</label>
      <select id="pp-country" class="pp-select">
        <option value="de">${cn("de")}</option>
        <option value="at">${cn("at")}</option>
        <option value="ch">${cn("ch")}</option>
        <option value="nl">${cn("nl")}</option>
        <option value="all">${cn("all")}</option>
      </select>
      <div style="font-size:9.5px;color:#888;margin-top:3px">${pt("country_hint")}</div>
      <label class="pp-label" style="margin-top:8px">${pt("lang_label")}</label>
      <select id="pp-lang" class="pp-select">
        <option value="de">🇩🇪 Deutsch</option>
        <option value="en">🇬🇧 English</option>
      </select>
    </div>
    <button class="pp-save-btn" id="pp-save">${pt("save_btn")}</button>
    <div id="pp-saved-msg" style="display:none;text-align:center;color:#228B22;font-size:12px;margin-top:6px">${pt("saved_msg")}</div>
  </div>`;
}

// ── Data Sources Panel HTML ───────────────────────────────
function buildSourcesPanelHTML() {
  const isEN = _popupLang==="en";
  return `
  <div class="pp-header"><span>${pt("panel_sources")}</span><button class="pp-close">${pt("close")}</button></div>
  <div class="pp-body">
    <div class="pp-section">
      <div class="pp-section-title">🌱 ${isEN?"Why offline databases?":"Warum Offline-Datenbanken?"}</div>
      <div class="pp-text">${isEN
        ?"EcoTrace uses locally embedded databases updated regularly – instead of making live API calls on every product page. This means: instant display (<300ms), less energy consumption and more privacy."
        :"EcoTrace setzt auf lokal eingebettete Datenbanken – statt bei jedem Produktaufruf live API-Anfragen zu stellen. Das bedeutet: Sofortanzeige (<300ms), weniger Energieverbrauch und mehr Privatsphäre."
      }</div>
    </div>
    <div class="pp-section">
      <div class="pp-section-title">📦 ${isEN?"CO₂ Calculation":"CO₂-Berechnung"}</div>
      <div class="pp-text"><strong>${isEN?"Product database (304 devices)":"Produkt-Datenbank (304 Geräte)"}</strong><br>${isEN
        ?"Official manufacturer lifecycle reports: Apple PER, Samsung PCF, Google Environmental Reports, Dell/HP/Lenovo PCF, Fairphone Impact Reports."
        :"Offizielle Hersteller-Lifecycle-Reports: Apple PER, Samsung PCF Datasheets, Google Environmental Reports, Dell/HP/Lenovo PCF, Fairphone Impact Reports."
      }</div>
      <div class="pp-text" style="margin-top:6px"><strong>${isEN?"Category averages (fallback)":"Kategorie-Durchschnitte (Fallback)"}</strong><br>HIGG MSI 2022, Textile Exchange 2023, Poore &amp; Nemecek (2018), EcoInvent v3.8</div>
    </div>
    <div class="pp-section">
      <div class="pp-section-title">🚢 ${isEN?"Shipping CO₂":"Versand-CO₂"}</div>
      <div class="pp-text">${isEN
        ?'Offline DOM analysis. Detects "Ships from China" (2.5 kg), "Amazon Warehouse" (0.3 kg), "Ships from EU" (1.2 kg) etc.'
        :'Offline DOM-Analyse. Erkennt "Versand aus China" (2,5 kg), "Amazon.de Lager" (0,3 kg), "Versand aus EU" (1,2 kg) u.a.'
      }</div>
    </div>
    <div class="pp-section">
      <div class="pp-section-title">🔧 ${isEN?"Repairability":"Reparierbarkeit"}</div>
      <div class="pp-text">${isEN
        ?"Offline database (210+ devices). iFixit Repairability Scores, EU ESPR Index 2024, Fairphone/Framework manufacturer data."
        :"Offline-Datenbank (210+ Geräte). iFixit Repairability Scores, EU ESPR Index 2024, Fairphone/Framework Hersteller-Angaben."
      }</div>
    </div>
    <div class="pp-section">
      <div class="pp-section-title">🔒 ${isEN?"Privacy":"Datenschutz"}</div>
      <div class="pp-text">${isEN
        ?"All CO₂, repairability and shipping data is calculated fully offline in your browser. Only optional: Overpass API (GPS for local shops), Climatiq API (if key activated), platform links (on click)."
        :"Alle CO₂-, Reparierbarkeits- und Versanddaten werden vollständig offline im Browser berechnet. Nur optional: Overpass API (GPS für lokale Shops), Climatiq API (wenn Key aktiviert), Plattform-Links (bei Klick)."
      }</div>
    </div>
  </div>`;
}

// ── Support Panel HTML ────────────────────────────────────
function buildSupportPanelHTML() {
  const isEN = _popupLang==="en";
  return `
  <div class="pp-header"><span>${pt("panel_support")}</span><button class="pp-close">${pt("close")}</button></div>
  <div class="pp-body" style="text-align:center">
    <div style="font-size:40px;margin:16px 0 10px">☕</div>
    <div style="font-size:13px;font-weight:700;margin-bottom:8px">${isEN?"Support EcoTrace":"EcoTrace unterstützen"}</div>
    <div class="pp-text" style="text-align:center;margin-bottom:16px">${pt("kofi_text")}</div>
    <a href="https://ko-fi.com/maxation" target="_blank" rel="noopener" class="pp-kofi-btn">${pt("kofi_btn")}</a>
    <div style="margin-top:16px;padding-top:12px;border-top:1px dashed #ccc">
      <div style="font-size:10px;color:#888">EcoTrace Plugin v2.2.7 · Offline-First · Open Source</div>
      <a href="https://github.com/ecotrace-plugin" target="_blank" rel="noopener" style="font-size:10px;color:#228B22">GitHub ↗</a>
    </div>
  </div>`;
}

// ── Settings Handlers ─────────────────────────────────────
function bindSettingsHandlers() {
  // Load current settings
  chrome.storage.local.get([
    "climatiqApiKey","sourceModeCO2","sourceModeRepair",
    "prefLocal","prefPredecessor","prefPriceIndex",
    "userCountry","userLang"
  ], d => {
    const setCheck = (id,v) => { const el=$(id); if(el) el.checked=v!==false; };
    const setVal   = (id,v) => { const el=$(id); if(el&&v) el.value=v; };
    setVal("pp-climatiq-key", d.climatiqApiKey||"");
    setVal("pp-country", d.userCountry||"de");
    setVal("pp-lang", d.userLang||"de");
    setCheck("pp-pref-local",       d.prefLocal);
    setCheck("pp-pref-predecessor", d.prefPredecessor);
    setCheck("pp-pref-price-index", d.prefPriceIndex);

    // Mode buttons
    const activateMode = (group, val) => {
      document.querySelectorAll(`.pp-mode-btn[data-group="${group}"]`).forEach(b=>{
        b.classList.toggle("active", b.dataset.val===val);
      });
    };
    activateMode("modeCO2",    d.sourceModeCO2   ||"db");
    activateMode("modeRepair", d.sourceModeRepair||"db");
  });

  // Mode buttons toggle
  document.querySelectorAll(".pp-mode-btn").forEach(btn=>{
    btn.addEventListener("click",()=>{
      document.querySelectorAll(`.pp-mode-btn[data-group="${btn.dataset.group}"]`).forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Eye toggle
  $("pp-key-eye")?.addEventListener("click",()=>{
    const inp = $("pp-climatiq-key");
    if(inp) inp.type = inp.type==="password"?"text":"password";
  });

  // Save
  $("pp-save")?.addEventListener("click",()=>{
    const activeMode = g => document.querySelector(`.pp-mode-btn[data-group="${g}"].active`)?.dataset.val||"db";
    const newLang    = $("pp-lang")?.value||"de";
    const newCountry = $("pp-country")?.value||"de";
    chrome.storage.local.set({
      climatiqApiKey:   $("pp-climatiq-key")?.value||"",
      sourceModeCO2:    activeMode("modeCO2"),
      sourceModeRepair: activeMode("modeRepair"),
      prefLocal:        !!$("pp-pref-local")?.checked,
      prefPredecessor:  !!$("pp-pref-predecessor")?.checked,
      prefPriceIndex:   !!$("pp-pref-price-index")?.checked,
      userCountry:      newCountry,
      userLang:         newLang,
    }, ()=>{
      const msg = $("pp-saved-msg");
      if(msg){msg.style.display="block";}
      // Update lang live
      _popupLang = newLang;
      applyPopupLang();
      setTimeout(closeAllPanels, 1200);
    });
  });
}
