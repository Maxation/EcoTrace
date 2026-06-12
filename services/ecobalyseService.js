// ============================================================
//  EcoTrace – services/ecobalyseService.js
//
//  Drei Verantwortlichkeiten:
//    1. ASIN aus Amazon-URL/DOM extrahieren
//    2. Versandweg aus DOM ermitteln (DE/EU/Global)
//    3. Ecobalyse API (beta.gouv.fr) für Textil-CO₂
// ============================================================

"use strict";

window.EcoTrace = window.EcoTrace || {};

const ECOBALYSE_BASE = "https://ecobalyse.beta.gouv.fr/api/v2";

// Versandursprung → CO₂-Gewicht
const ORIGIN_CO2 = {
  china:      2.5,
  asia:       2.2,
  global:     2.0,
  usa:        1.8,
  eu:         1.2,
  germany:    0.3,   // amazon.de Lager
  austria:    0.4,   // amazon.at Lager (etwas mehr wegen AT↔DE Grenzverkehr)
  swiss:      0.5,   // amazon.ch (Zolllager DE/CH)
  local:      0.3,
  pickup:     0.0
};

// DOM-Patterns für Versandursprung-Erkennung
// Reihenfolge: spezifischste zuerst (erster Match gewinnt)
const ORIGIN_PATTERNS = [

  // ── Explizite Herkunftsangaben DE ───────────────────────
  { rx: /versand\s+aus\s+china|gesendet\s+aus\s+china/i,                     key: "china"   },
  { rx: /versand\s+aus\s+(japan|südkorea|south korea|taiwan|hong\s*kong)/i,   key: "asia"    },
  { rx: /versand\s+aus\s+usa|versand\s+aus\s+den\s+usa/i,                   key: "usa"     },
  { rx: /versand\s+aus\s+österreich/i,                                         key: "austria" },
  { rx: /versand\s+aus\s+der\s+schweiz|versand\s+aus\s+schweiz/i,           key: "swiss"   },
  { rx: /versand\s+aus\s+deutschland/i,                                        key: "germany" },
  { rx: /versand\s+aus\s+(frankreich|italien|spanien|polen|niederlande|belgien|tschechien)/i, key: "eu" },
  { rx: /versand\s+aus\s+(großbritannien|vereinigtes\s+königreich)/i,         key: "eu"      },

  // ── Amazon Fulfillment / Warehouse DE (→ DE-Lager) ──────
  { rx: /amazon\.de\s+lager/i,                                                  key: "germany" },
  { rx: /fulfil(?:l)?ment\s+by\s+amazon/i,                                     key: "germany" }, // FBA = DE-Lager
  { rx: /dispatches?\s+from\s+amazon/i,                                        key: "germany" }, // "Dispatches from Amazon"
  { rx: /versand\s+durch\s+amazon/i,                                           key: "germany" }, // "Versand durch Amazon"
  { rx: /amazon\s+warehouse/i,                                                  key: "germany" }, // Amazon Warehouse Deals
  { rx: /verkauf\s+und\s+versand\s+durch\s+amazon/i,                         key: "germany" }, // "Verkauf und Versand durch Amazon"
  { rx: /\bfba\b/i,                                                            key: "germany" },

  // ── Drittanbieter mit Amazon-Versand (→ DE-Lager) ───────
  { rx: /verkauf\s+durch\s+[\w\s]+[,;]\s*versand\s+durch\s+amazon/i,      key: "germany" }, // "Verkauf durch X, Versand durch Amazon"
  { rx: /sold\s+by\s+[\w\s]+[,;]\s*dispatches?\s+from\s+amazon/i,         key: "germany" }, // EN
  { rx: /ships?\s+from\s+amazon/i,                                             key: "germany" },

  // ── Prime (→ impliziert DE-Lager) ───────────────────────
  { rx: /prime\s+versand|prime\s+delivery|prime\s+lieferung/i,                key: "germany" },

  // ── Marktplatz-Händler ohne Amazon-Versand (→ EU) ───────
  { rx: /verkauf\s+durch\s+[^,\n]{3,}/i,                                      key: "eu"      }, // Drittanbieter ohne Versand-Info
  { rx: /sold\s+by\s+[^,\n]{3,}/i,                                            key: "eu"      },

  // ── Englische Muster (für .com / internationale Kataloge) ──
  { rx: /ships?\s+from\s+china/i,    key: "china"   },
  { rx: /ships?\s+from\s+germany/i,  key: "germany" },
  { rx: /ships?\s+from\s+japan/i,    key: "asia"    },
  { rx: /ships?\s+from\s+usa/i,      key: "usa"     },

  // ── Amazon Österreich / Schweiz spezifisch ───────────────
  { rx: /amazon\.at\s+lager/i,                                       key: "austria" },
  { rx: /amazon\.ch\s+lager/i,                                       key: "swiss"   },

  // ── Amazon Global Store (DE-Bestellung, internationale Ware) ──
  { rx: /amazon\s+global\s+store/i,  key: "global"  },
  { rx: /importartikel/i,              key: "global"  },
];

// Amazon-Domain → Standard-Ursprung (Fallback)
const DOMAIN_DEFAULT_ORIGIN = {
  "amazon.de":     "germany",   // DE-Lager
  "amazon.at":     "austria",   // AT/DE-Lager
  "amazon.ch":     "swiss",     // CH/DE-Lager
  "amazon.com":    "usa",
  "amazon.co.uk":  "eu",
  "amazon.fr":     "eu",
  "amazon.nl":     "eu",
  "amazon.es":     "eu",
  "amazon.it":     "eu",
};


const EcobalyseService = {

  // ────────────────────────────────────────────────────────
  //  1. ASIN-EXTRAKTION
  // ────────────────────────────────────────────────────────

  /**
   * Extrahiert die Amazon ASIN aus URL oder DOM.
   * @returns {string|null} 10-stellige ASIN oder null
   */
  extractASIN() {
    // Methode 1: URL-Pattern /dp/ASIN
    const urlMatch = window.location.pathname.match(/\/dp\/([A-Z0-9]{10})/i);
    if (urlMatch) return urlMatch[1].toUpperCase();

    // Methode 2: URL-Pattern /gp/product/ASIN
    const gpMatch = window.location.pathname.match(/\/gp\/product\/([A-Z0-9]{10})/i);
    if (gpMatch) return gpMatch[1].toUpperCase();

    // Methode 3: DOM – hidden input / data attributes
    const asinEl = (
      document.querySelector('#ASIN') ||
      document.querySelector('[name="ASIN"]') ||
      document.querySelector('[data-asin]')
    );
    if (asinEl) {
      const val = asinEl.value || asinEl.getAttribute("data-asin");
      if (val && /^[A-Z0-9]{10}$/i.test(val.trim())) return val.trim().toUpperCase();
    }

    // Methode 4: Body-Data-Attribute
    const body = document.querySelector("[data-page-type='Detail']");
    if (body) {
      const m = body.innerHTML.match(/"asin"\s*:\s*"([A-Z0-9]{10})"/i);
      if (m) return m[1].toUpperCase();
    }

    return null;
  },

  // ────────────────────────────────────────────────────────
  //  2. VERSANDWEG-ERKENNUNG
  // ────────────────────────────────────────────────────────

  /**
   * Ermittelt den Versandursprung durch DOM-Analyse.
   * @returns {{
   *   origin:    string,   // "china"|"germany"|"eu"|...
   *   co2_kg:    number,
   *   label:     string,
   *   confidence: "high"|"medium"|"low",
   *   source:    string
   * }}
   */
  detectShippingOrigin() {
    // Relevante DOM-Bereiche sammeln
    const zones = [
      "#merchant-info",
      "#tabular-buybox",
      "#buybox",
      "#deliveryBlockMessage",
      "#mir-layout-DELIVERY_BLOCK",
      "#fast-track-message",
      "#amazonGlobal_feature_div",
      "#exported_items_feature_div",
      "#shipsFromSoldBy_feature_div",
      ".a-section.a-spacing-none.a-padding-none",
      "#fulfillerInfoFeature_feature_div",
    ];

    let combinedText = "";
    for (const sel of zones) {
      const el = document.querySelector(sel);
      if (el) combinedText += " " + el.textContent;
    }
    combinedText = combinedText.toLowerCase();

    // Pattern-Matching
    for (const p of ORIGIN_PATTERNS) {
      if (p.rx.test(combinedText)) {
        const co2 = ORIGIN_CO2[p.key] ?? ORIGIN_CO2.global;
        return {
          origin:     p.key,
          co2_kg:     co2,
          label:      this._originLabel(p.key),
          confidence: "high",
          source:     "DOM-Analyse"
        };
      }
    }

    // Domain-Fallback
    const domain = window.location.hostname.replace("www.", "");
    const domainKey = DOMAIN_DEFAULT_ORIGIN[domain] || "global";
    return {
      origin:     domainKey,
      co2_kg:     ORIGIN_CO2[domainKey] ?? ORIGIN_CO2.global,
      label:      this._originLabel(domainKey),
      confidence: "low",
      source:     "Domain-Schätzung"
    };
  },

  _originLabel(key) {
    // "germany"-Key zeigt das korrekte Land je nach Amazon-Domain + User-Einstellung
    const userCountry = (typeof EcoTrace !== "undefined" && EcoTrace._userCountry) || "de";
    const domain      = window.location.hostname.replace("www.", "");

    // Amazon-Domain bestimmt das lokale Lager-Label
    const domainCountryLabel = {
      "amazon.at": "🇦🇹 Österreich/DE",
      "amazon.ch": "🇨🇭 Schweiz/DE",
      "amazon.nl": "🇳🇱 Niederlande",
    }[domain];

    // User-Länder-Einstellung als Fallback
    const userCountryLabel = {
      at:  "🇦🇹 Österreich/DE",
      ch:  "🇨🇭 Schweiz/DE",
      nl:  "🇳🇱 Niederlande/DE",
      de:  "🇩🇪 Deutschland",
      all: "🌍 EU-Lager",
    }[userCountry] || "🇩🇪 Deutschland";

    const labels = {
      china:   "🇨🇳 China",
      asia:    "🌏 Asien",
      usa:     "🇺🇸 USA",
      eu:      "🇪🇺 EU",
      germany: domainCountryLabel || userCountryLabel,
      austria: "🇦🇹 Österreich",
      swiss:   "🇨🇭 Schweiz",
      global:  "🌍 International",
      local:   "📍 Lokal",
      pickup:  "📍 Abholung"
    };
    return labels[key] || "🌍 International";
  },


  // ────────────────────────────────────────────────────────
  //  3. ECOBALYSE API
  //  Primär für Textilien. Für Elektronik nutzen wir andere Quellen.
  //  Docs: https://ecobalyse.beta.gouv.fr/#/api
  // ────────────────────────────────────────────────────────

  /**
   * Lädt CO₂-Daten für ein Textilprodukt von Ecobalyse.
   * @param {object} params
   *   .mass      kg (Gewicht des Produkts)
   *   .material  "coton"|"polyester"|"laine"|"nylon"
   *   .country   Produktionsland (ISO2), default "CN"
   * @returns {Promise<{co2_kg: number, source: string, live: boolean}|null>}
   */
  async fetchTextileCO2(params) {
    const { mass = 0.3, material = "coton", country = "CN" } = params;

    // Material-Mapping EcoTrace → Ecobalyse
    const matMap = {
      organicCotton: "coton-bio",
      cotton:        "coton",
      polyester:     "pet",
      wool:          "laine",
      nylon:         "nylon",
      default:       "coton"
    };
    const ecoMat = matMap[material] || matMap.default;

    // Ecobalyse Query-Parameter für Textil (vereinfacht: T-Shirt als Basismodell)
    const url = new URL(`${ECOBALYSE_BASE}/textile/simulator`);
    url.searchParams.set("mass",        mass.toString());
    url.searchParams.set("materials",   JSON.stringify([{ id: ecoMat, share: 1.0 }]));
    url.searchParams.set("countryFabric", country);
    url.searchParams.set("countryDyeing", country);
    url.searchParams.set("countryMaking", country);
    url.searchParams.set("product",     "tshirt");

    const cacheKey = `ecobalyse:${ecoMat}:${mass}:${country}`;
    const cached   = await EcoTrace.IndexedDBCache.get(cacheKey);
    if (cached) return cached;

    try {
      const resp = await fetch(url.toString(), {
        signal: AbortSignal.timeout(8_000)
      });

      if (!resp.ok) return null;
      const data = await resp.json();

      // Ecobalyse gibt kcf (klimawirkung) in kg CO₂e zurück
      const co2 = data?.impacts?.climate?.value;
      if (!co2) return null;

      const result = {
        co2_kg:  Math.round(co2 * 10) / 10,
        source:  `Ecobalyse API · ${ecoMat} ${country}`,
        live:    true
      };

      await EcoTrace.IndexedDBCache.set(cacheKey, result);
      return result;

    } catch (e) {
      console.warn("[EcobalyseService] Fetch-Fehler:", e.message);
      return null;
    }
  },

  /**
   * Versucht ASIN-basierte Suche in der Ecobalyse-Produktdatenbank.
   * Momentan experimentell – gibt null zurück wenn nicht gefunden.
   */
  async fetchByASIN(asin) {
    if (!asin) return null;
    // Ecobalyse hat noch keine öffentliche ASIN-Lookup-API.
    // Placeholder für zukünftige Integration.
    return null;
  }
};

window.EcoTrace.EcobalyseService = EcobalyseService;
