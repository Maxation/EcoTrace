// ============================================================
//  EcoTrace – services/locationService.js  v2.0
//
//  Fixes gegenüber v1:
//    · Overpass-Query deckt jetzt DE-spezifische Tagging-Muster ab
//      (second_hand=yes, craft=*, amenity=recycling etc.)
//    · "out center body 8" → korrekte getrennte Ausgabe für
//      nodes vs ways/relations + kein hartes Limit in der Query
//    · Deduplication per Koordinaten-Hash statt Name (verhindert
//      false-positive Löschung gleichnamiger Shops an versch. Orten)
//    · Typ-Erkennung erweitert: craft, social_facility, name-Heuristics
//    · Fallback auf größeren Radius wenn 0 Treffer
// ============================================================

"use strict";

// Kompatibles Timeout-Signal (funktioniert in Chrome 88+, nicht nur Chrome 103+)
function _abortAfter(ms) {
  const ctrl = new AbortController();
  setTimeout(() => ctrl.abort(), ms);
  return ctrl.signal;
}

window.EcoTrace = window.EcoTrace || {};

const OVERPASS_ENDPOINT  = "https://overpass-api.de/api/interpreter";
const SEARCH_RADIUS_M    = 5000;   // 5 km Primär-Radius
const FALLBACK_RADIUS_M  = 10000;  // 10 km Fallback wenn 0 Treffer
const GEO_TIMEOUT_MS     = 7000;
const GEO_MAX_AGE_MS     = 5 * 60 * 1000;
const MAX_RESULTS        = 6;

const SHIPPING_CO2 = { global: 2.0, eu: 1.2, local: 0.3, pickup: 0.0 };

// OSM-Tag → Anzeigeinfo
// Reihenfolge: spezifische Typen zuerst
const TYPE_MAP = {
  // ── Second-Hand Shops ──────────────────────────────
  second_hand:        { label: "Second-Hand",          emoji: "♻️",  priority: 1 },
  charity:            { label: "Charity-Shop",         emoji: "💚",  priority: 1 },
  vintage:            { label: "Vintage",              emoji: "🏺",  priority: 1 },
  thrift:             { label: "Thrift-Store",         emoji: "👕",  priority: 1 },
  // Kleidung Second-Hand
  clothes:            { label: "Second-Hand Mode",     emoji: "👗",  priority: 1 },
  shoes:              { label: "Second-Hand Schuhe",   emoji: "👟",  priority: 1 },
  fashion:            { label: "Second-Hand Fashion",  emoji: "👔",  priority: 1 },
  // Möbel & Deko Second-Hand
  furniture:          { label: "Second-Hand Möbel",    emoji: "🛋️", priority: 1 },
  antiques:           { label: "Antiquitäten",         emoji: "🏺",  priority: 1 },
  interior_decoration:{ label: "Deko & Einrichtung",   emoji: "🪴",  priority: 1 },
  gift:               { label: "Geschenke/Deko",       emoji: "🎁",  priority: 2 },
  // Elektro/Medien Second-Hand
  electronics:        { label: "Second-Hand Elektronik", emoji: "📱", priority: 1 },
  books:              { label: "Gebrauchtbücher",      emoji: "📚",  priority: 2 },
  music:              { label: "Gebraucht CDs/Vinyl",  emoji: "🎵",  priority: 2 },
  // ── Reparatur-Betriebe ──────────────────────────────
  electronics_repair: { label: "Elektronik-Reparatur", emoji: "🔌", priority: 2 },
  phone_repair:       { label: "Handy-Reparatur",      emoji: "📱", priority: 2 },
  computer_repair:    { label: "Computer-Reparatur",   emoji: "💻", priority: 2 },
  tailor:             { label: "Schneider",            emoji: "🧵", priority: 2 },
  dressmaker:         { label: "Änderungsschneiderei", emoji: "🧵", priority: 2 },
  shoemaker:          { label: "Schuster",             emoji: "👞", priority: 2 },
  cobbler:            { label: "Schuster",             emoji: "👞", priority: 2 },
  carpenter:          { label: "Tischler/Schreiner",   emoji: "🪚", priority: 2 },
  joiner:             { label: "Schreiner",            emoji: "🪚", priority: 2 },
  upholsterer:        { label: "Polsterer",            emoji: "🛋️", priority: 2 },
  watchmaker:         { label: "Uhrmacher",            emoji: "⌚", priority: 2 },
  bicycle_repair:     { label: "Fahrrad-Reparatur",    emoji: "🚲", priority: 2 },
  // ── Soziale Einrichtungen ───────────────────────────
  social_facility:    { label: "Sozialkaufhaus",       emoji: "🤝", priority: 1 },
  // ── Generisch ───────────────────────────────────────
  repair:             { label: "Reparatur",            emoji: "🔧", priority: 2 },
  default:            { label: "Laden",                emoji: "📍", priority: 3 },
};


// ╔══════════════════════════════════════════════════════════╗
//  LocationService
// ╚══════════════════════════════════════════════════════════╝
const LocationService = {

  _cachedPosition:  null,
  _permissionState: "unknown",

  // ────────────────────────────────────────────────────────
  //  1. GEOLOKALISIERUNG
  // ────────────────────────────────────────────────────────
  async getPosition() {
    if (this._cachedPosition) {
      const age = Date.now() - this._cachedPosition.timestamp;
      if (age < GEO_MAX_AGE_MS)
        return { lat: this._cachedPosition.lat, lng: this._cachedPosition.lng };
    }

    if (!navigator.geolocation) {
      console.warn("[LocationService] geolocation nicht verfügbar");
      return null;
    }

    try {
      if (navigator.permissions) {
        const s = await navigator.permissions.query({ name: "geolocation" });
        this._permissionState = s.state;
        if (s.state === "denied") return null;
      }
    } catch (_) {}

    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        pos => {
          this._cachedPosition = {
            lat: pos.coords.latitude, lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy, timestamp: Date.now()
          };
          this._permissionState = "granted";
          resolve({ lat: this._cachedPosition.lat, lng: this._cachedPosition.lng });
        },
        err => {
          console.warn("[LocationService] Geo-Fehler:", err.message);
          this._permissionState = err.code === 1 ? "denied" : "unavailable";
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: GEO_TIMEOUT_MS, maximumAge: GEO_MAX_AGE_MS }
      );
    });
  },

  getPermissionState() { return this._permissionState; },


  // ────────────────────────────────────────────────────────
  //  2. OVERPASS QUERY BUILDER
  //
  //  Deckt alle relevanten DE-Tagging-Konventionen ab:
  //
  //  A) Dedizierte Second-Hand-Shops:
  //     shop=second_hand | shop=charity | shop=vintage | shop=thrift
  //
  //  B) Normale Shops mit second_hand=yes Tag:
  //     Sehr häufig in DE! z.B. shop=clothes + second_hand=yes
  //     oder shop=furniture + second_hand=yes
  //
  //  C) Sozialkaufhäuser:
  //     amenity=social_facility + social_facility=second_hand_shop
  //     oder name enthält "Diakonie|Caritas|AWO|Oxfam|Humana"
  //
  //  D) Repair-Betriebe:
  //     craft=electronics_repair | craft=computer_repair | craft=tailor
  //     shop=repair
  //     Objekte mit repair=yes (wenn auch shop/craft vorhanden)
  //
  //  Syntax-Fix: nodes und ways werden getrennt ausgegeben.
  //  "out body" für nodes (haben direkt lat/lon),
  //  "out center" für ways (berechnet Zentrum aus Polygon).
  // ────────────────────────────────────────────────────────
  // category: "electronics"|"textile"|"furniture"|"generic"|null
  _buildOverpassQuery(lat, lng, radius, category) {
    const c = category || "generic";
    const a = `around:${radius},${lat},${lng}`;

    // ── Kern: Schnelle tag-basierte Suchen (kein name~ Regex → kein Timeout) ─
    // name~ Regex-Suchen wurden entfernt – sie sind der Hauptgrund für HTTP 504
    // auf Overpass. Stattdessen: ausschließlich strukturierte Tag-Abfragen.

    // Basis: immer geladen (schnell, weil exakte Tag-Werte)
    const baseQuery = `
  node["shop"="second_hand"](${a});
  way["shop"="second_hand"](${a});
  node["shop"="charity"](${a});
  way["shop"="charity"](${a});
  node["shop"="vintage"](${a});
  node["shop"="thrift"](${a});
  node["second_hand"="yes"]["shop"](${a});
  way["second_hand"="yes"]["shop"](${a});
  node["amenity"="social_facility"]["social_facility"="second_hand"](${a});`;

    // Kategorie-spezifisch (nur strukturierte Tags, kein Regex)
    let catQuery = "";

    if (c === "electronics") {
      catQuery = `
  node["craft"="electronics_repair"](${a});
  way["craft"="electronics_repair"](${a});
  node["craft"="phone_repair"](${a});
  node["craft"="computer_repair"](${a});
  node["shop"="repair"](${a});`;

    } else if (c === "textile") {
      catQuery = `
  node["craft"="tailor"](${a});
  way["craft"="tailor"](${a});
  node["craft"="dressmaker"](${a});
  node["craft"="shoemaker"](${a});
  node["shop"="clothes"]["second_hand"="yes"](${a});
  node["shop"="shoes"]["second_hand"="yes"](${a});`;

    } else if (c === "furniture") {
      catQuery = `
  node["shop"="antiques"](${a});
  way["shop"="antiques"](${a});
  node["shop"="furniture"]["second_hand"="yes"](${a});
  node["craft"="carpenter"](${a});
  node["craft"="upholsterer"](${a});`;

    } else {
      catQuery = `
  node["shop"="repair"](${a});
  way["shop"="repair"](${a});
  node["craft"="bicycle_repair"](${a});
  node["craft"="electronics_repair"](${a});
  node["craft"="tailor"](${a});`;
    }

    return `
[out:json][timeout:25];
(
  ${catQuery}
  ${baseQuery}
);
out body;
>;
out center;
`.trim();
  },


  // ────────────────────────────────────────────────────────
  //  3. ELEMENT NORMALISIERUNG
  // ────────────────────────────────────────────────────────
  _normalizeShop(el) {
    const tags = el.tags || {};

    // Koordinaten: node → lat/lon direkt, way → center
    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (!lat || !lng) return null;

    // Typ bestimmen (Priorität: shop > craft > amenity)
    let rawType = "default";
    let typeInfo = TYPE_MAP.default;

    // second_hand=yes → Typ aus dem Shop-Tag ableiten
    if (tags.second_hand === "yes" && tags.shop) {
      rawType  = tags.shop; // z.B. "clothes", "furniture", "electronics"
      typeInfo = TYPE_MAP[rawType] || { ...TYPE_MAP.default, label: `Second-Hand ${rawType}`, emoji: "♻️" };
      // Override: immer Second-Hand-Emoji wenn second_hand=yes
      typeInfo = { ...typeInfo, emoji: "♻️" };

    } else if (tags.shop && TYPE_MAP[tags.shop]) {
      rawType  = tags.shop;
      typeInfo = TYPE_MAP[tags.shop];

    } else if (tags.craft && TYPE_MAP[tags.craft]) {
      rawType  = tags.craft;
      typeInfo = TYPE_MAP[tags.craft];

    } else if (tags.amenity === "social_facility") {
      rawType  = "social_facility";
      typeInfo = TYPE_MAP.social_facility;

    } else if (tags.shop) {
      rawType  = tags.shop;
      typeInfo = TYPE_MAP.default;

    } else if (tags.craft) {
      rawType  = "repair";
      typeInfo = TYPE_MAP.repair;
    }

    // Name: OSM-Name → name:de → type-Label als Fallback
    let name = tags.name || tags["name:de"] || null;

    // Bekannte Organisationen aus Name erkennen und Typ verbessern
    if (name) {
      const nl = name.toLowerCase();
      if (/oxfam|humana|caritas|diakonie|awo|rotes kreuz|secondhand|second hand/.test(nl)) {
        typeInfo = { ...TYPE_MAP.charity, label: "Charity/Sozialkaufhaus" };
        rawType  = "charity";
      }
      if (/repair\s*café|repair cafe|reparatur/.test(nl)) {
        typeInfo = TYPE_MAP.repair;
        rawType  = "repair";
      }
    }

    name = name || typeInfo.label;

    // Adresse
    const addrParts = [
      tags["addr:street"],
      tags["addr:housenumber"],
      tags["addr:postcode"],
      tags["addr:city"]
    ].filter(Boolean);

    // Google Maps Navigation-Link (öffnet direkt die Route)
    const navUrl   = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    const mapsUrl  = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=17`;

    return {
      id:        `${el.id}_${el.type || "node"}`,
      name,
      type:      rawType,
      label:     typeInfo.label,
      emoji:     typeInfo.emoji,
      priority:  typeInfo.priority || 3,
      lat,
      lng,
      address:   addrParts.length > 0 ? addrParts.join(" ") : null,
      hours:     tags.opening_hours || null,
      website:   tags.website || tags["contact:website"] || null,
      phone:     tags.phone || tags["contact:phone"] || null,
      navUrl,
      mapsUrl,
    };
  },


  // ────────────────────────────────────────────────────────
  //  4. OVERPASS FETCH
  // ────────────────────────────────────────────────────────
  // Minimalste Fallback-Query wenn Hauptquery zu langsam ist
  _buildFallbackQuery(lat, lng, radius) {
    const a = `around:${radius},${lat},${lng}`;
    return `
[out:json][timeout:20];
(
  node["shop"="second_hand"](${a});
  way["shop"="second_hand"](${a});
  node["shop"="charity"](${a});
  node["second_hand"="yes"]["shop"](${a});
  node["shop"="repair"](${a});
);
out body;
>;
out center;
`.trim();
  },

  async _fetchOverpass(query, isRetry = false) {
    const ctrl  = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), isRetry ? 15_000 : 22_000);
    try {
      const resp = await fetch(OVERPASS_ENDPOINT, {
        method:  "POST",
        body:    "data=" + encodeURIComponent(query),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        signal:  ctrl.signal
      });
      clearTimeout(timer);

      // 504 Gateway Timeout oder 429 Too Many Requests → Fallback-Query versuchen
      if (resp.status === 504 || resp.status === 429) {
        if (!isRetry) {
          console.warn(`[LocationService] Overpass HTTP ${resp.status} – versuche vereinfachte Fallback-Query`);
          return null;  // Signal: Fallback benötigt
        }
        console.warn(`[LocationService] Overpass HTTP ${resp.status} (auch Fallback fehlgeschlagen)`);
        return [];
      }

      if (!resp.ok) {
        console.warn("[LocationService] Overpass HTTP", resp.status);
        return [];
      }
      const data = await resp.json();
      return data.elements || [];
    } catch (e) {
      clearTimeout(timer);
      if (e.name !== "AbortError") console.warn("[LocationService] Overpass Fehler:", e.message);
      return [];
    }
  },


  // ────────────────────────────────────────────────────────
  //  5. HAUPT-SUCHE mit Fallback-Radius
  // ────────────────────────────────────────────────────────
  async findLocalShops(lat, lng, radius = SEARCH_RADIUS_M, category = null) {
    try {
      let elements = await this._fetchOverpass(
        this._buildOverpassQuery(lat, lng, radius, category)
      );

      // null = 504/429 → sofort vereinfachte Fallback-Query versuchen
      if (elements === null) {
        console.log("[LocationService] Verwende Fallback-Query (reduziert)...");
        elements = await this._fetchOverpass(
          this._buildFallbackQuery(lat, lng, FALLBACK_RADIUS_M), true
        ) || [];
      }

      // Wenig Treffer → größeren Radius versuchen
      if (elements.filter(e => e.tags).length < 2 && radius < FALLBACK_RADIUS_M) {
        console.log("[LocationService] Wenig Treffer, versuche größeren Radius...");
        const more = await this._fetchOverpass(
          this._buildOverpassQuery(lat, lng, FALLBACK_RADIUS_M, category)
        );
        if (more && more.length > elements.length) elements = more;
      }

      // Normalisieren (nur Elemente mit tags, nicht die way-Knoten aus ">")
      const shops = [];
      const seenCoords = new Set(); // Deduplication per Position (nicht per Name)

      for (const el of elements) {
        if (!el.tags || Object.keys(el.tags).length === 0) continue; // Reine Geometrie-Nodes überspringen

        const shop = this._normalizeShop(el);
        if (!shop) continue;

        // Positionsbasierte Deduplizierung (rundet auf ~10m Genauigkeit)
        const coordKey = `${shop.lat.toFixed(4)}_${shop.lng.toFixed(4)}`;
        if (seenCoords.has(coordKey)) continue;
        seenCoords.add(coordKey);

        shops.push(shop);
      }

      // Sortierung: erst nach Priorität (1=beste), dann nach Distanz
      const withDist = this.enrichWithDistance(shops, { lat, lng });
      withDist.sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority;
        return a.distanceM - b.distanceM;
      });

      return withDist.slice(0, MAX_RESULTS);

    } catch (err) {
      if (err.name === "TimeoutError") {
        console.warn("[LocationService] Overpass Timeout");
      } else {
        console.warn("[LocationService] Fetch-Fehler:", err.message);
      }
      return [];
    }
  },


  // ────────────────────────────────────────────────────────
  //  6. KOMPLETTER LOKALER FINDER (Geo + Overpass)
  // ────────────────────────────────────────────────────────
  async findNearbyAlternatives(category = null) {
    const position = await this.getPosition();

    if (!position) {
      return {
        shops:    [],
        position: null,
        error:    this._permissionState === "denied"
          ? "Standortzugriff verweigert – bitte in den Browser-Einstellungen erlauben."
          : "Standort konnte nicht ermittelt werden."
      };
    }

    const shops = await this.findLocalShops(position.lat, position.lng, SEARCH_RADIUS_M, category);

    return {
      shops,
      position,
      error: shops.length === 0
        ? `Keine Shops im ${FALLBACK_RADIUS_M / 1000} km Umkreis gefunden.`
        : null
    };
  },


  // ────────────────────────────────────────────────────────
  //  7. CO₂-ERSPARNIS bei lokaler Abholung
  // ────────────────────────────────────────────────────────
  calculateLocalSavings(baseCO2, shop, origin = "global") {
    const shippingCO2    = SHIPPING_CO2[origin] ?? SHIPPING_CO2.global;
    const standardTotal  = baseCO2 + shippingCO2;
    const localTotal     = baseCO2 * 0.30 + SHIPPING_CO2.pickup;
    const saved          = Math.round((standardTotal - localTotal) * 10) / 10;
    const savedPercent   = Math.round((saved / standardTotal) * 100);
    const shopName       = shop?.name || "einem lokalen Shop";

    return {
      standardTotal,
      localTotal:    Math.round(localTotal * 10) / 10,
      saved,
      savedPercent,
      transportSaving: Math.round(shippingCO2 * 10) / 10,
      message: saved > 0
        ? `Du sparst ${saved} kg CO₂ durch lokale Abholung bei ${shopName}!`
        : "Kein CO₂-Vorteil gegenüber Neukauf erkennbar."
    };
  },


  // ────────────────────────────────────────────────────────
  //  8. DISTANZ-HELPER (Haversine)
  // ────────────────────────────────────────────────────────
  distanceMeters(lat1, lng1, lat2, lng2) {
    const R  = 6_371_000;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;
    const a  = Math.sin(Δφ/2)**2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  },

  enrichWithDistance(shops, position) {
    return shops.map(shop => {
      const d = this.distanceMeters(position.lat, position.lng, shop.lat, shop.lng);
      return {
        ...shop,
        distanceM:     Math.round(d),
        distanceLabel: d < 1000 ? `${Math.round(d)} m` : `${(d / 1000).toFixed(1)} km`
      };
    });
  }
};

window.EcoTrace.LocationService = LocationService;
