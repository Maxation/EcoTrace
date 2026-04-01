// ============================================================
//  EcoTrace – services/carbonService.js
//  Verantwortlich für:
//    · Climatiq API v3 (CO₂-Berechnung via Emissionsfaktoren)
//    · Open Product Facts API (Eco-Score via Barcode)
//    · Mock-Fallback (wenn kein API-Key vorhanden)
//    · Lokales Caching (IndexedDB, 24h TTL) zur Quota-Schonung
// ============================================================

"use strict";

// Kompatibles Timeout-Signal (funktioniert in Chrome 88+, nicht nur Chrome 103+)
function _abortAfter(ms) {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}

window.EcoTrace = window.EcoTrace || {};

// ╔══════════════════════════════════════════════════════════╗
//  KONSTANTEN
// ╚══════════════════════════════════════════════════════════╝

const CLIMATIQ_BASE_URL   = "https://api.climatiq.io/estimate/v3/";
const OPEN_PRODUCTS_URL   = "https://world.openfoodfacts.org/api/v2/product/";
const CACHE_TTL_MS        = 30 * 60 * 1000; // 30 min Session-Cache

// Climatiq Activity-IDs pro Kategorie (Mapping auf reale Emissionsfaktoren)
// Quelle: https://www.climatiq.io/docs/api-reference/emission-factor
const CLIMATIQ_ACTIVITY_MAP = {
  // Textil
  textile_polyester:       { id: "textile-type_fiber-fiber_type_synthetic_polyester", unit: "kg",  label: "Polyester-Textil" },
  textile_cotton:          { id: "textile-type_fiber-fiber_type_natural_cotton",      unit: "kg",  label: "Baumwolle-Textil" },
  textile_organic_cotton:  { id: "textile-type_fiber-fiber_type_natural_cotton",      unit: "kg",  label: "Bio-Baumwolle"     }, // gleiche ID, Faktor wird manuell reduziert
  textile_default:         { id: "textile-type_fiber-fiber_type_synthetic_polyester", unit: "kg",  label: "Textil (Standard)" },

  // Elektronik (Manufacturing)
  electronics_smartphone:  { id: "consumer_goods-type_mobile_phone",                 unit: "unit", label: "Smartphone" },
  electronics_laptop:      { id: "consumer_goods-type_laptop",                       unit: "unit", label: "Laptop/Notebook" },
  electronics_tablet:      { id: "consumer_goods-type_tablet",                       unit: "unit", label: "Tablet" },
  electronics_headphones:  { id: "consumer_goods-type_small_appliance",              unit: "unit", label: "Kopfhörer" },
  electronics_default:     { id: "consumer_goods-type_mobile_phone",                 unit: "unit", label: "Elektronik" },

  // Versand
  shipping_global:         { id: "freight_vehicle-vehicle_type_hgv_rigid-fuel_source_diesel-vehicle_weight_na-percentage_laden_na",
                             unit: "tonne_km", label: "Globaler Versand" },
  shipping_eu:             { id: "freight_vehicle-vehicle_type_hgv_rigid-fuel_source_diesel-vehicle_weight_na-percentage_laden_na",
                             unit: "tonne_km", label: "EU-Versand" },

  // Packaging (Fallback)
  packaging_plastic:       { id: "material-type_plastic_packaging",                  unit: "kg",  label: "Plastikverpackung" },
  packaging_cardboard:     { id: "material-type_paper_and_cardboard",                unit: "kg",  label: "Karton-Verpackung" },
};

// Mock-Datenbank: CO₂-Werte wenn kein Climatiq-Key vorhanden
// Basierend auf publizierten Lifecycle-Analysen
const MOCK_CARBON_DB = {
  textile_polyester:       { co2_kg: 12.5, unit: "kg",  source: "HIGG MSI 2022"          },
  textile_cotton:          { co2_kg:  5.5, unit: "kg",  source: "Textile Exchange 2023"  },
  textile_organic_cotton:  { co2_kg:  2.5, unit: "kg",  source: "OCA Report 2022"        },
  textile_wool:            { co2_kg:  8.0, unit: "kg",  source: "NZ Wool Federation"     },
  textile_nylon:           { co2_kg: 10.0, unit: "kg",  source: "EcoInvent v3.8"         },
  textile_default:         { co2_kg:  8.0, unit: "kg",  source: "EU Ecolabel Avg."       },
  electronics_smartphone:  { co2_kg: 80.0, unit: "unit",source: "Apple Env. Report 2023" },
  electronics_laptop:      { co2_kg:350.0, unit: "unit",source: "Dell LCA Study 2023"    },
  electronics_tablet:      { co2_kg:100.0, unit: "unit",source: "Fairphone LCA"          },
  electronics_headphones:  { co2_kg: 30.0, unit: "unit",source: "iFixit Teardown Est."   },
  electronics_default:     { co2_kg: 80.0, unit: "unit",source: "EcoInvent v3.8"         },
  furniture_wood:          { co2_kg: 15.0, unit: "kg",  source: "EPD Holz DE"            },
  furniture_plastic:       { co2_kg: 20.0, unit: "kg",  source: "EcoInvent v3.8"         },
  furniture_metal:         { co2_kg: 25.0, unit: "kg",  source: "World Steel Assoc."     },
  furniture_default:       { co2_kg: 18.0, unit: "kg",  source: "EU JRC 2022"            },
  food_beef:               { co2_kg: 27.0, unit: "kg",  source: "Poore & Nemecek 2018"   },
  food_chicken:            { co2_kg:  6.9, unit: "kg",  source: "Poore & Nemecek 2018"   },
  food_vegetables:         { co2_kg:  2.0, unit: "kg",  source: "Poore & Nemecek 2018"   },
  food_default:            { co2_kg:  5.0, unit: "kg",  source: "EU Farm to Fork Avg."   },
  generic:                 { co2_kg:  5.0, unit: "unit",source: "EcoTrace Schätzung"   },
};

// Eco-Score Buchstaben → numerischer Score + Farbe
const ECO_SCORE_MAP = {
  a: { score: 95, color: "#1B5E20", label: "Sehr gut"    },
  b: { score: 75, color: "#2E7D32", label: "Gut"         },
  c: { score: 55, color: "#F57F17", label: "Mittelmäßig" },
  d: { score: 35, color: "#E65100", label: "Schlecht"    },
  e: { score: 15, color: "#B71C1C", label: "Sehr schlecht"},
};


// Cache: uses EcoTrace.IndexedDBCache (persistent, 24h TTL)


// ╔══════════════════════════════════════════════════════════╗
//  CarbonService
// ╚══════════════════════════════════════════════════════════╝
const CarbonService = {

  // ── API-Key (aus storage geladen) ────────────────────────
  _apiKey: null,

  /**
   * Lädt den Climatiq API-Key aus chrome.storage.local.
   * Sollte einmal beim Initialisieren aufgerufen werden.
   */
  async loadApiKey() {
    return new Promise((resolve) => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(["climatiqApiKey", "sourceModeCO2"], (data) => {
          this._apiKey   = data.climatiqApiKey || null;
          // Wenn User "db" gewählt hat → Climatiq-API deaktiviert
          this._modeForced = data.sourceModeCO2 === "db" ? "db" : null;
          resolve(this._apiKey);
        });
      } else {
        resolve(null);
      }
    });
  },

  /**
   * Gibt true zurück wenn ein API-Key vorhanden ist.
   */
  hasApiKey() {
    // Wenn User explizit "db" gewählt hat → API nie verwenden
    if (this._modeForced === "db") return false;
    return Boolean(this._apiKey && this._apiKey.trim().length > 10);
  },


  // ────────────────────────────────────────────────────────
  //  1. CLIMATIQ API v3
  // ────────────────────────────────────────────────────────

  /**
   * Baut den Climatiq Request-Body für ein Produkt.
   * @param {string} activityId  Climatiq Activity ID
   * @param {number} value       Menge (kg oder Stück)
   * @param {string} unit        "kg" | "unit" | "tonne_km"
   * @returns {object} Request-Body
   */
  _buildClimatiqBody(activityId, value, unit) {
    return {
      emission_factor: {
        activity_id: activityId,
        data_version: "^6"
      },
      parameters: {
        [unit === "unit" ? "number" : "weight"]: value,
        ...(unit === "kg" ? { weight_unit: "kg" } : {}),
        ...(unit === "tonne_km" ? { weight: value, weight_unit: "t", distance: 1, distance_unit: "km" } : {})
      }
    };
  },

  /**
   * Sendet einen POST-Request an die Climatiq API.
   * @param {string} activityId
   * @param {number} value
   * @param {string} unit
   * @returns {Promise<{co2_kg: number, source: string, live: true} | null>}
   */
  async _fetchClimatiq(activityId, value, unit) {
    if (!this.hasApiKey()) return null;

    const cacheKey = `climatiq:${activityId}:${value}:${unit}`;
    try {
      const cached = await EcoTrace.IndexedDBCache.get(cacheKey);
      if (cached) return JSON.parse(cached.value);
    } catch (_) {}

    try {
      // Über Background-Proxy – Content Scripts können kein CORS zu Climatiq
      const raw = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({
          type:    "FETCH_PROXY",
          url:     CLIMATIQ_BASE_URL,
          options: {
            method:  "POST",
            headers: {
              "Authorization": `Bearer ${this._apiKey}`,
              "Content-Type":  "application/json"
            },
            body: JSON.stringify(this._buildClimatiqBody(activityId, value, unit))
          }
        }, resp => {
          if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
          resolve(resp);
        });
      });

      if (!raw?.ok) {
        let errMsg = `HTTP ${raw?.status}`;
        try { errMsg = JSON.parse(raw?.body || "{}").message || errMsg; } catch (_) {}
        console.warn("[CarbonService] Climatiq Fehler:", errMsg);
        return null;
      }

      const data = JSON.parse(raw.body);
      const result = {
        co2_kg:      Math.round(data.co2e * 10) / 10,
        co2e_unit:   data.co2e_unit,
        source:      `Climatiq · ${activityId}`,
        live:        true,
        activity_id: activityId
      };

      try { await EcoTrace.IndexedDBCache.set(cacheKey, JSON.stringify(result), 30 * 60 * 1000); } catch (_) {}
      return result;

    } catch (err) {
      if (err.name === "TimeoutError") {
        console.warn("[CarbonService] Climatiq Timeout");
      } else {
        console.warn("[CarbonService] Fetch-Fehler:", err.message);
      }
      return null;
    }
  },


  // ────────────────────────────────────────────────────────
  //  2. MOCK-FALLBACK
  // ────────────────────────────────────────────────────────

  /**
   * Gibt Mock-Daten zurück wenn kein API-Key vorhanden.
   * @param {string} lookupKey  Key in MOCK_CARBON_DB
   * @param {number} value      Menge (weight_kg oder 1 für units)
   * @returns {{co2_kg: number, source: string, live: false}}
   */
  _getMockData(lookupKey, value = 1) {
    const entry = MOCK_CARBON_DB[lookupKey] || MOCK_CARBON_DB.generic;
    const co2 = entry.unit === "kg"
      ? Math.round(entry.co2_kg * value * 10) / 10
      : entry.co2_kg;

    return {
      co2_kg:   co2,
      source:   entry.source + " (Schätzung)",
      live:     false,
      mockKey:  lookupKey
    };
  },


  // ────────────────────────────────────────────────────────
  //  3. HAUPT-METHODE: CO₂ für Produktdaten berechnen
  //
  //  Prioritäts-Kaskade:
  //    ① ProductCarbonDB  – 304 Geräte, sofort, produktspezifisch
  //    ② Climatiq API     – live, wenn API-Key vorhanden
  //    ③ Mock-Datenbank   – Kategoriedurchschnitte als letzter Fallback
  // ────────────────────────────────────────────────────────

  async calculateProductCO2(productData) {
    const { category, material, weightKg, title } = productData;
    const weight   = weightKg || 0.5;
    const useApi   = this.hasApiKey();  // true wenn Key vorhanden UND mode !== "db"
    const lookupKey = this._buildLookupKey(category, material, title);
    const mapping   = CLIMATIQ_ACTIVITY_MAP[lookupKey];

    // ── Kaskade abhängig vom gewählten Modus ─────────────────
    //
    // DB-Modus  (sourceModeCO2="db" oder kein Key):
    //   ① ProductCarbonDB → ③ Mock-Fallback
    //
    // API-Modus (sourceModeCO2="api" UND Key vorhanden):
    //   ① Climatiq API → ② ProductCarbonDB (Fallback) → ③ Mock-Fallback

    // ── API-Modus: Climatiq zuerst ───────────────────────────
    if (useApi && mapping) {
      const val    = mapping.unit === "unit" ? 1 : weight;
      let   result = await this._fetchClimatiq(mapping.id, val, mapping.unit);

      if (result && lookupKey === "textile_organic_cotton") {
        result.co2_kg  = Math.round(result.co2_kg * 0.45 * 10) / 10;
        result.source += " (Bio-Adj.)";
      }

      if (result) {
        return {
          ...result,
          specific: false,
          lookupKey,
          breakdown: {
            category,
            material:   material || "unbekannt",
            weightKg:   weight,
            activityId: mapping.id,
            label:      mapping.label || lookupKey
          }
        };
      }
      // Climatiq fehlgeschlagen → weiter zu ProductCarbonDB
    }

    // ── ProductCarbonDB (DB-Modus: Priorität 1 / API-Modus: Fallback) ──
    if (title && EcoTrace.ProductCarbonDB) {
      const hit = EcoTrace.ProductCarbonDB.lookup(title);
      if (hit) {
        return {
          co2_kg:    hit.co2,
          source:    `${hit.source} (${hit.year})${useApi ? " · Climatiq Fallback" : ""}`,
          live:      false,
          specific:  true,
          notes:     hit.notes,
          matched:   hit.matched,
          lookupKey: "product_db",
          breakdown: {
            category,
            material:   material || "–",
            weightKg:   weight,
            activityId: "product_db",
            label:      `${hit.matched} · ${hit.notes}`
          }
        };
      }
    }

    // ── Mock-Fallback ─────────────────────────────────────────
    const mockResult = this._getMockData(lookupKey, weight);
    return {
      ...mockResult,
      specific: false,
      lookupKey,
      breakdown: {
        category,
        material:   material || "unbekannt",
        weightKg:   weight,
        activityId: "mock",
        label:      mockResult.source
      }
    };
  },

  /**
   * Bestimmt den Lookup-Key aus Kategorie + Material.
   * @private
   */
  _buildLookupKey(category, material, title) {
    const t = (title || "").toLowerCase();

    if (category === "electronics") {
      if (t.includes("iphone") || t.includes("galaxy") || t.includes("pixel") || t.includes("smartphone") || t.includes("handy"))
        return "electronics_smartphone";
      if (t.includes("macbook") || t.includes("laptop") || t.includes("notebook"))
        return "electronics_laptop";
      if (t.includes("ipad") || t.includes("tablet"))
        return "electronics_tablet";
      if (t.includes("kopfhörer") || t.includes("headphone") || t.includes("airpod") || t.includes("wh-1000"))
        return "electronics_headphones";
      return "electronics_default";
    }

    if (category === "textile") {
      if (material === "organicCotton") return "textile_organic_cotton";
      if (material === "cotton")        return "textile_cotton";
      if (material === "polyester")     return "textile_polyester";
      if (material === "wool")          return "textile_wool";
      if (material === "nylon")         return "textile_nylon";
      return "textile_default";
    }

    if (category === "furniture") {
      if (material === "wood")    return "furniture_wood";
      if (material === "plastic") return "furniture_plastic";
      if (material === "metal")   return "furniture_metal";
      return "furniture_default";
    }

    if (category === "food") {
      if (material === "beef")       return "food_beef";
      if (material === "chicken")    return "food_chicken";
      if (material === "vegetables") return "food_vegetables";
      return "food_default";
    }

    return "generic";
  },


  // ────────────────────────────────────────────────────────
  //  4. VERSAND-CO₂
  // ────────────────────────────────────────────────────────

  /**
   * Berechnet den Versand-CO₂ (optional via Climatiq).
   * Vereinfachung: Annahme 0.5 kg Paket, 10.000 km global.
   * @param {string} origin "global"|"eu"|"local"|"pickup"
   * @returns {Promise<{co2_kg: number, source: string, live: boolean}>}
   */
  async calculateShippingCO2(origin = "global") {
    const STATIC = { global: 2.0, eu: 1.2, local: 0.3, pickup: 0.0 };

    if (origin === "pickup") {
      return { co2_kg: 0, source: "Selbstabholung", live: false };
    }

    // Climatiq-Versand (tonne_km Modell, vereinfacht)
    const mapping = CLIMATIQ_ACTIVITY_MAP[`shipping_${origin}`];
    if (mapping && this.hasApiKey()) {
      // 0.5 kg Paket × 10.000 km global / 1.000.000 = tonne_km
      const tonneKm = origin === "global" ? 5 : 0.6;
      const result  = await this._fetchClimatiq(mapping.id, tonneKm, "tonne_km");
      if (result) return result;
    }

    return {
      co2_kg: STATIC[origin] ?? STATIC.global,
      source: "EcoTrace Schätzung (Versand)",
      live:   false
    };
  },


  // ────────────────────────────────────────────────────────
  //  5. OPEN PRODUCT FACTS – ECO-SCORE
  // ────────────────────────────────────────────────────────

  /**
   * Ruft den Eco-Score für einen Barcode von Open Product Facts ab.
   * Funktioniert ohne API-Key.
   *
   * @param {string} barcode  EAN/UPC Barcode
   * @returns {Promise<{
   *   grade:       string,   // "a"|"b"|"c"|"d"|"e"|"unknown"
   *   score:       number,   // 0–100
   *   color:       string,
   *   label:       string,
   *   productName: string,
   *   found:       boolean
   * } | null>}
   */
  async fetchEcoScore(barcode) {
    if (!barcode || barcode.length < 8) return null;

    const cacheKey = `ecoscore:${barcode}`;
    const cached = await EcoTrace.IndexedDBCache.get(cacheKey);
    if (cached) return cached;

    const url = `${OPEN_PRODUCTS_URL}${encodeURIComponent(barcode)}.json` +
                `?fields=product_name,eco_score_grade,eco_score_score,ecoscore_data`;

    try {
      const resp = await fetch(url, {
        signal: _abortAfter(6_000)
      });

      if (!resp.ok) return null;

      const data = await resp.json();

      if (data.status !== 1 || !data.product) {
        return { found: false, grade: "unknown", score: 0, label: "Nicht gefunden" };
      }

      const p     = data.product;
      const grade = (p.eco_score_grade || "unknown").toLowerCase();
      const info  = ECO_SCORE_MAP[grade] || { score: 0, color: "#9E9E9E", label: "Unbekannt" };

      const result = {
        grade,
        score:       p.eco_score_score || info.score,
        color:       info.color,
        label:       info.label,
        productName: p.product_name || "Unbekanntes Produkt",
        found:       grade !== "unknown"
      };

      await EcoTrace.IndexedDBCache.set(cacheKey, result);
      return result;

    } catch (err) {
      console.warn("[CarbonService] EcoScore Fehler:", err.message);
      return null;
    }
  },


  // ────────────────────────────────────────────────────────
  //  6. GESAMT-ANALYSE (kombinierter Einstiegspunkt)
  // ────────────────────────────────────────────────────────

  /**
   * Komplette CO₂-Analyse: Produkt + Versand + Vergleich Second-Hand.
   * Dies ist der primäre Einstiegspunkt für content.js.
   *
   * @param {object} productData
   * @returns {Promise<{
   *   product:      object,   // calculateProductCO2() Ergebnis
   *   shipping:     object,   // calculateShippingCO2() Ergebnis
   *   totalCO2:     number,
   *   secondHandCO2: number,  // ~30% der Produktion, kein Versand
   *   savings:      number,
   *   savingsPercent: number,
   *   usingLiveData: boolean
   * }>}
   */
  async analyzeProduct(productData) {
    // Parallel laden für Performance
    const [productResult, shippingResult] = await Promise.all([
      this.calculateProductCO2(productData),
      this.calculateShippingCO2("global")
    ]);

    const totalCO2      = Math.round((productResult.co2_kg + shippingResult.co2_kg) * 10) / 10;
    const secondHandCO2 = Math.round(productResult.co2_kg * 0.30 * 10) / 10;
    const savings       = Math.round((totalCO2 - secondHandCO2) * 10) / 10;
    const savingsPercent= Math.round((savings / totalCO2) * 100);

    return {
      product:        productResult,
      shipping:       shippingResult,
      totalCO2,
      secondHandCO2,
      savings,
      savingsPercent,
      usingLiveData:  productResult.live || shippingResult.live
    };
  }
};

// Export
window.EcoTrace.CarbonService = CarbonService;
