// ============================================================
//  EcoTrace Plugin – services/circularSwap.js
//  Circular Swap Modul:
//    · generateCircularLinks(productName) → Deep-Links
//    · CO₂-Vergleichswerte (greifbare Analogien)
//    · "Intent to Save" Tracking in chrome.storage
// ============================================================

"use strict";

window.EcoTrace = window.EcoTrace || {};

// ╔══════════════════════════════════════════════════════════╗
//  PLATTFORM-DEFINITIONEN
// ╚══════════════════════════════════════════════════════════╝
const CIRCULAR_PLATFORMS = [
  {
    id:       "kleinanzeigen",
    name:     "Kleinanzeigen",
    emoji:    "📍",
    color:    "#37474F",
    co2Zero:  true,  // Lokal = 0 kg Versand
    tagline:  "Lokal & kostenlos",
    urlFn:    (q) => `https://www.kleinanzeigen.de/s-${encodeURIComponent(q)}/k0`
  },
  {
    id:       "vinted",
    name:     "Vinted",
    emoji:    "👗",
    color:    "#09B1BA",
    co2Zero:  true,
    tagline:  "−90% CO₂",
    urlFn:    (q) => `https://www.vinted.de/catalog?search_text=${encodeURIComponent(q)}`
  },
  {
    id:       "rebuy",
    name:     "Rebuy",
    emoji:    "🔄",
    color:    "#1565C0",
    co2Zero:  true,
    tagline:  "Garantiert & geprüft",
    urlFn:    (q) => `https://www.rebuy.de/kaufen/suche?q=${encodeURIComponent(q)}`
  }
];

// ╔══════════════════════════════════════════════════════════╗
//  CO₂-VERGLEICHSWERTE
//  Greifbare Analogien für das Dashboard
// ╚══════════════════════════════════════════════════════════╝
const CO2_COMPARISONS = [
  {
    threshold: 0.2,
    icon: "🚶",
    text: (kg) => `${Math.round(kg * 5)} Minuten Spaziergang`
  },
  {
    threshold: 1,
    icon: "🚲",
    text: (kg) => `${Math.round(kg * 8)} km Fahrradfahrt`
  },
  {
    threshold: 5,
    icon: "🚗",
    // 1 kg CO₂ = 5 km Autofahrt
    text: (kg) => (typeof window!=="undefined"&&window.t) ? window.t("cmp_car_km")(kg) : `${Math.round(kg * 5)} km Autofahrt`
  },
  {
    threshold: 10,
    icon: "🌳",
    // 10 kg CO₂ = 1 Jahr Lebensleistung eines Baums (Ø ~10 kg/Jahr)
    text: (kg) => `${(kg / 10).toFixed(1)} Jahre Lebensleistung eines Baums`
  },
  {
    threshold: 50,
    icon: "🏡",
    text: (kg) => (typeof window!=="undefined"&&window.t) ? window.t("cmp_heating")(kg) : `${Math.round(kg / 30 * 30)} Tage Haushalts-Heizung`
  },
  {
    threshold: 100,
    icon: "✈️",
    // 100 kg CO₂ = Flug Berlin–London (ca. 95 kg CO₂e Economy)
    text: (kg) => `${(kg / 100).toFixed(1)}× Flug Berlin–London`
  },
  {
    threshold: 500,
    icon: "🌍",
    text: (kg) => `${(kg / 1000).toFixed(2)} Tonnen CO₂ – ${Math.round(kg / 200)} Monate EU-Pro-Kopf-Anteil`
  },
  {
    threshold: Infinity,
    icon: "🏭",
    text: (kg) => `${(kg / 1000).toFixed(1)} Tonnen CO₂ vermieden!`
  }
];


// ╔══════════════════════════════════════════════════════════╗
//  CircularSwap Service
// ╚══════════════════════════════════════════════════════════╝
const CircularSwap = {

  // ────────────────────────────────────────────────────────
  //  1. DEEP-LINK GENERATOR
  // ────────────────────────────────────────────────────────

  /**
   * Bereinigt den Produktnamen und erzeugt Such-URLs für
   * alle Circular-Plattformen.
   *
   * @param {string} productName  Roher Amazon-Produkttitel
   * @returns {Array<{id, name, emoji, color, tagline, url, query}>}
   */
  generateCircularLinks(productName) {
    const query = this._cleanQuery(productName);
    return CIRCULAR_PLATFORMS.map(p => ({
      ...p,
      url:   p.urlFn(query),
      query  // für Debug/Display
    }));
  },

  /**
   * Bereinigt den Produkttitel für optimale Suchergebnisse.
   * Entfernt Marketingsprache, Farben, Speichergrößen usw.
   *
   * @param {string} title
   * @returns {string}  Bereinigter Such-String
   */
  _cleanQuery(title) {
    // Delegiert an die zentrale Smart-Clean-Funktion in carbonLogic.js
    if (typeof EcoTrace !== "undefined" && EcoTrace._cleanSearchQuery) {
      return EcoTrace._cleanSearchQuery(title);
    }
    // Minimaler Fallback
    return title.replace(/[\(\[].*?[\)\]]/g, " ")
                .replace(/\b\d+\s*(?:gb|tb|mb)\b/gi, " ")
                .replace(/\s+/g, " ").trim().substring(0, 40).trim();
  },


  // ────────────────────────────────────────────────────────
  //  2. CO₂-VERGLEICHSWERT
  // ────────────────────────────────────────────────────────

  /**
   * Gibt den greifbarsten Vergleichswert für eine CO₂-Menge zurück.
   * @param {number} kg
   * @returns {{ icon: string, text: string } | null}
   */
  getComparison(kg) {
    if (!kg || kg <= 0) return null;
    const match = CO2_COMPARISONS.find(c => kg < c.threshold);
    if (!match) return null;
    return {
      icon: match.icon,
      text: match.text(kg)
    };
  },

  /**
   * Gibt mehrere Vergleichswerte zurück (für das Dashboard).
   * @param {number} kg
   * @returns {Array<{ icon: string, text: string }>}
   */
  getMultipleComparisons(kg) {
    if (!kg || kg <= 0) return [];
    return CO2_COMPARISONS
      .filter(c => kg >= c.threshold * 0.1) // Sinnvolle Schwelle
      .slice(0, 3)
      .map(c => ({ icon: c.icon, text: c.text(kg) }));
  },


  // ────────────────────────────────────────────────────────
  //  3. "INTENT TO SAVE" TRACKING
  // ────────────────────────────────────────────────────────

  /**
   * Speichert einen "Intent to Save" wenn User auf Circular-Link klickt.
   * Wird für Dashboard-Statistiken und Achievements genutzt.
   *
   * @param {string} platformId   "kleinanzeigen" | "vinted" | "rebuy"
   * @param {string} productTitle Produkttitel
   * @param {number} co2Saved     Potenzielle CO₂-Ersparnis in kg
   */
  async saveIntent(platformId, productTitle, co2Saved) {
    return new Promise(resolve => {
      chrome.storage.local.get(["circularIntents", "achStats"], data => {
        const intents = data.circularIntents || [];
        const stats   = data.achStats || {};

        // Intent loggen
        intents.unshift({
          platform:    platformId,
          product:     productTitle.substring(0, 60),
          co2Potential: Math.round(co2Saved * 10) / 10,
          date:        new Date().toLocaleDateString("de-DE"),
          timestamp:   Date.now()
        });

        // Max 100 Intents aufbewahren
        if (intents.length > 100) intents.pop();

        // Stats für Achievements updaten
        stats.circularIntents   = (stats.circularIntents || 0) + 1;
        stats.circularCO2Saved  = (stats.circularCO2Saved || 0) + co2Saved;
        stats.refurbishedClicks = (stats.refurbishedClicks || 0) + 1;

        chrome.storage.local.set({ circularIntents: intents, achStats: stats }, () => {
          // Achievement-Check auslösen
          if (typeof EcoTrace?.AchievementService !== "undefined") {
            EcoTrace.AchievementService.checkAndUnlock(stats);
          }
          resolve({ intents, stats });
        });
      });
    });
  },

  /**
   * Lädt Intent-Statistiken.
   */
  async getIntentStats() {
    return new Promise(resolve => {
      chrome.storage.local.get(["circularIntents"], data => {
        const intents = data.circularIntents || [];
        const totalCO2 = intents.reduce((sum, i) => sum + (i.co2Potential || 0), 0);
        resolve({
          count:   intents.length,
          totalCO2: Math.round(totalCO2 * 10) / 10,
          recent:  intents.slice(0, 5)
        });
      });
    });
  },


  // ────────────────────────────────────────────────────────
  //  4. CARBON IMPACT BEI GEBRAUCHTKAUF = 0 kg
  // ────────────────────────────────────────────────────────

  /**
   * Berechnet den CO₂-Impact wenn gebraucht gekauft wird.
   * Setzt Produktions-CO₂ auf 0, nur minimaler Versand verbleibt.
   *
   * @param {number} newCO2    CO₂ bei Neukauf (kg)
   * @param {string} platform  "kleinanzeigen" (lokal) | "vinted" | "rebuy"
   * @returns {{
   *   usedCO2:      number,
   *   saved:        number,
   *   savedPercent: number,
   *   isLocalPickup: boolean
   * }}
   */
  calculateUsedImpact(newCO2, platform = "vinted") {
    // ── Realistisches CO₂-Modell für Gebrauchtkauf ──────────────
    //
    // FALSCH war:  usedCO2 = 0 kg (ignoriert Versand des Gebrauchthändlers)
    //
    // RICHTIG:
    //   Produktion = 0 kg     (keine Neuproduktion – Hauptersparnis)
    //   Versand    = plattformspezifisch (Händler versendet EU oder lokal)
    //
    // Plattform-Versand-CO₂ (Quellen: IEA Freight 2022, DHL GoGreen 2023):
    //   Kleinanzeigen  → 0.0 kg  (Selbstabholung, kein Versand)
    //   Vinted C2C     → 0.5 kg  (Privatpaket DE, ~0.5 kg CO₂)
    //   Rebuy          → 0.8 kg  (Händler-Paket DE, ~0.8 kg CO₂)
    //   Back Market    → 1.2 kg  (EU-Händler, ~1.2 kg CO₂)
    //   Default        → 1.0 kg  (EU-Durchschnitt)

    const PLATFORM_SHIPPING = {
      kleinanzeigen: 0.0,
      willhaben:     0.0,  // Österreich/Deutschland – meist lokal/Selbstabholung
      vinted:        0.5,
      rebuy:         0.8,
      backmarket:    1.2,
      asgoodasnew:   1.2,
      afb:           0.9,
      revendo:       1.0,
      sellpy:        0.6,
      maedchenflohmarkt: 0.7,
      vestiaire:     1.5,  // Internationaler Versand
      momoxfashion:  0.8,
      whoppah:       2.0,  // Möbel = schwerer Versand
      etsy:          1.5,
      default:       1.0
    };

    const isLocalPickup     = platform === "kleinanzeigen";
    const shippingRemainder = PLATFORM_SHIPPING[platform] ?? PLATFORM_SHIPPING.default;

    // Gebrauchtkauf-CO₂ = nur Versand (keine Neuproduktion)
    const usedCO2      = shippingRemainder;
    const saved        = Math.round((newCO2 - usedCO2) * 10) / 10;
    // Mindest-Ersparnis 0 (falls newCO2 ungewöhnlich niedrig)
    const savedClamped = Math.max(0, saved);
    const savedPercent = newCO2 > 0 ? Math.round((savedClamped / newCO2) * 100) : 0;

    return {
      usedCO2:      Math.round(usedCO2 * 10) / 10,
      saved:        savedClamped,
      savedPercent,
      isLocalPickup,
      shippingLabel: isLocalPickup ? "Selbstabholung" : `~${shippingRemainder} kg Versand`
    };
  }
};

// ── Konstanten exportieren für Verwendung in anderen Modulen ──
CircularSwap.PLATFORMS   = CIRCULAR_PLATFORMS;
CircularSwap.COMPARISONS = CO2_COMPARISONS;

window.EcoTrace.CircularSwap = CircularSwap;
