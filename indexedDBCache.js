// ============================================================
//  EcoTrace Plugin – services/i18n.js
//  Internationalisierung (Deutsch / Englisch)
//  Erweiterbar: weitere Sprachen als neues Objekt einfügen.
// ============================================================

"use strict";

window.EcoTrace = window.EcoTrace || {};

const TRANSLATIONS = {

  // ── DEUTSCH (Standard) ────────────────────────────────────
  de: {
    // Skeleton / Loading
    loading_co2:        "Analysiere CO₂-Fußabdruck…",
    loading_calculating:"Berechne…",
    loading_repair:     "Lade iFixit-Score…",
    loading_shops:      "Suche in der Nähe…",
    error_reload:       "Fehler beim Laden. Bitte F5 drücken.",

    // CO₂-Section
    production:         "📦 Produktion",
    shipping:           "Versand",
    shipping_detected:  "erkannt",
    shipping_estimated: "geschätzt",
    total_new:          "Gesamt (Neukauf)",
    savings_vs_used:    "Ersparnis vs. Second-Hand",
    comparison_prefix:  "🌱",

    // Badges
    badge_specific:     "📋 Produktspezifisch",
    badge_live:         "● Climatiq Live",
    badge_estimate:     "~ Schätzung",
    source_label:       "📖",

    // Preis-CO₂-Index
    pci_title:          "💶 Preis-CO₂-Index (kg CO₂ / €)",
    pci_explain:        "Wie viel CO₂ steckt in jedem ausgegebenen Euro? <strong>Niedriger = besser.</strong>",
    pci_new:            "🆕 Neukauf",
    pci_ref:            "♻️ Refurbished",
    pci_estimate:       "Schätzung",
    pci_better:         "CO₂-effizienter",
    pci_per_euro:       "pro ausgegebenem Euro",
    pci_footnote:       "Refurbished-Preis: Ø 68% des Neupreises (Back Market DE 2024) · CO₂ = 30% Produktion + 1.2 kg EU-Versand",
    pci_no_price:       "Preis nicht erkannt. Trage ihn manuell ein:",
    pci_currency:       "€",

    // Repair Card
    repair_title:       "🔧 Reparierbarkeit",
    repair_loading:     "Lade iFixit-Score…",
    repair_loading_api: "Wird von iFixit geladen…",
    repair_guides:      "Anleitungen verfügbar",
    repair_guides_link: "Anleitungen auf iFixit →",
    repair_parts_link:  "Ersatzteile →",
    repair_badge_live:  "● Live",
    repair_badge_cache: "⚡ Cache",
    repair_badge_local: "📋 Lokal",
    repair_badge_est:   "~ Schätzung",

    // Budget
    budget_label:       "CO₂-Budget",
    budget_remaining:   "verbleibend",
    budget_exceeded:    "überschritten!",
    budget_month:       "Monatsbudget",

    // Predecessor
    pred_savings:       "Performance-Unterschied",
    pred_search:        "Jetzt suchen",

    // Used Section
    used_title:         "🛒 Gebraucht kaufen & sparen",
    used_motto:         "Erst gebraucht suchen, dann neu kaufen!",
    used_new:           "Neukauf",
    used_ref:           "Refurbished",
    used_local:         "Lokal",
    used_arrow:         "→",
    used_confirm:       "Großartig! Du förderst die Kreislaufwirtschaft. 💚",

    // Local shops
    local_loading:      "Suche in der Nähe…",
    local_no_results:   "Keine Shops im Umkreis gefunden.",
    local_tip:          "Tipp: Suchradius in ⚙ Einstellungen erhöhen",
    local_labels: {
      electronics: "🔧 Reparatur & Second-Hand Elektronik",
      textile:     "👗 Second-Hand Mode & Schneiderei",
      furniture:   "🛋️ Second-Hand Möbel, Deko & Schreiner",
      food:        "🗺️ Lokale Läden in der Nähe",
      generic:     "♻️ Reparatur & Second-Hand in der Nähe",
    },

    // Actions
    save_btn:           "✅ Ersparnis speichern",
    save_btn_done:      "💾 Gespeichert!",

    // Footer
    footer_settings:    "⚙ Einstellungen",
    footer_info:        "ℹ Datenquellen",
    footer_support:     "☕ Support",

    // Settings Panel
    sp_title:           "⚙️ Einstellungen",
    sp_co2_title:       "📦 CO₂-Berechnung",
    sp_repair_title:    "🔧 Reparierbarkeit",
    sp_shops_title:     "🗺️ Lokale Shops",
    sp_overlay_title:   "🎨 Overlay",
    sp_region_title:    "🌍 Sprache & Region",
    sp_db_label:        "📋 Offline-DB",
    sp_db_sub:          "Sofort · 0W",
    sp_api_label:       "🌐 API",
    sp_api_sub:         "Live · eigener Key",
    sp_ifixit_api_sub:  "Live · kostenlos",
    sp_key_label:       "Climatiq API-Key",
    sp_key_hint:        "Kostenlos auf climatiq.io · 100 Anfragen/Monat",
    sp_shops_enable:    "Shop-Suche aktivieren",
    sp_radius_label:    "Suchradius",
    sp_predecessor:     "Vorgänger-Hinweis",
    sp_price_index:     "Preis-CO₂-Index",
    sp_budget_label:    "CO₂-Monatsbudget",
    sp_budget_off:      "Deaktiviert",
    sp_budget_unit:     "kg CO₂ / Monat",
    sp_country_label:   "Land",
    sp_lang_label:      "Sprache",
    sp_save_btn:        "💾 Einstellungen speichern",
    sp_saved_msg:       "✅ Gespeichert!",
    sp_ifix_api_note:   "Die iFixit API ist öffentlich & kostenlos – kein Key nötig. Aktivieren lädt Scores live (~2–5s).",

    // Predecessor card
    pred_header:        "💡 Vorgänger-Modell verfügbar",
    pred_perf:          "% Leistung",
    // Textile secondhand card
    textile_sh_header:  "🧺 Statt neu kaufen – gebraucht finden",
    textile_sh_sub:     "Dasselbe Stück gibt es oft gebraucht – spart bis zu 98% CO₂.",
    textile_gmaps:      "Second-Hand Shops in deiner Nähe",
    // Info Panel
    info_title:         "🔍 Datenquellen & Transparenz",
    info_why_offline:   "🌱 Warum Offline-Datenbanken?",
    info_energy:        "Energieeffizienz",
    info_instant:       "Sofortanzeige",
    info_privacy_why:   "Mehr Privatsphäre",
    info_co2_title:     "📦 CO₂-Berechnung",
    info_shipping_title:"🚢 Versand-CO₂",
    info_repair_title:  "🔧 Reparierbarkeit",
    info_shops_title:   "🗺️ Lokale Shops",
    info_privacy_title: "🔒 Was deinen Browser verlässt",
    info_kofi_title:    "☕ EcoTrace unterstützen",
    info_kofi_text:     "EcoTrace ist kostenlos, werbefrei und Open Source. Wenn das Plugin dir geholfen hat, freuen wir uns über einen Kaffee.",
    info_kofi_btn:      "☕ Auf Ko-fi unterstützen",
    info_affiliate_title:"* Affiliate-Links",
    info_version:       "EcoTrace Plugin v2.3.0 · Offline-First · Open Source",
    // Info panel: philosophy section
    info_why_title:     "🌱 Warum Offline-Datenbanken?",
    info_energy_title:  "Energieeffizienz:",
    info_energy_body:   "Jeder Server-Request verbraucht Strom – für Netzwerk, Rechenzentrum und Kühlung. Eine lokale DB-Abfrage läuft vollständig im RAM deines Geräts (~0 Watt).",
    info_instant_title: "Sofortanzeige:",
    info_instant_body:  "Keine Wartezeiten. Das Widget erscheint mit vollständigen Daten in <300 ms.",
    info_priv_title:    "Mehr Privatsphäre:",
    info_priv_body:     "Weniger Netzwerkverkehr bedeutet weniger Daten die deinen Browser verlassen.",
    info_live_cta:      "Live-APIs sind optional und können in den <strong>⚙ Einstellungen</strong> zugeschaltet werden.",
    // CO₂ section
    info_co2_db:        "Produkt-Datenbank (441 Geräte, offline)",
    info_co2_db_body:   "Produktspezifische Werte aus offiziellen Hersteller-Lifecycle-Reports: Apple PER, Samsung PCF Datasheets, Google Environmental Reports, Dell/HP/Lenovo PCF, Fairphone Impact Reports.",
    info_co2_api_body:  "Wissenschaftlich validierte Emissionsfaktoren. Quellen: EcoInvent v3.8, IPCC AR6, EU-JRC, HIGG MSI, Ecobilan. Aktivierbar unter ⚙ Einstellungen.",
    info_co2_mock:      "Kategorie-Durchschnitte (Fallback)",
    info_co2_mock_body: "HIGG MSI 2022, Textile Exchange 2023, Poore & Nemecek (2018), EcoInvent v3.8, EU Farm to Fork, World Steel Association.",
    // Shipping section
    info_shipping_detect: "Offline DOM-Analyse – kein Netzwerkaufruf.",
    // Repair section
    info_repair_db:       "Offline-Datenbank (210+ Geräte)",
    info_repair_db_body:  "iFixit Repairability Scores, EU ESPR Index 2024, Fairphone/Framework Hersteller-Angaben. Wird regelmäßig aktualisiert.",
    info_repair_links:    "Links zu iFixit-Anleitungen und Ersatzteil-Shop.",
    // Shops section
    info_shops_body:      "Sucht shop=second_hand, craft=electronics_repair u.a. im 5-km-Radius. GPS-Koordinaten werden nur für diese Anfrage genutzt.",
    // Privacy section
    info_priv_overpass:   "Overpass API: GPS-Koordinaten (nur bei Shop-Suche, optional)",
    info_priv_climatiq:   "Climatiq API: Produktkategorie (nur wenn Key aktiviert)",
    info_priv_links:      "Plattform-Links: Produktname als Suchbegriff (nur bei Klick)",
    info_privacy_title2:  "🔒 Was deinen Browser verlässt",
    // Info Panel body texts
    info_shipping_body: "Erkennt \"Versand aus China\" (→ 2,5 kg), \"Amazon.de Lager\" (→ 0,3 kg), \"Prime Versand\" (→ 0,3 kg DE-Lager), \"Versand aus EU\" (→ 1,2 kg) u.a. Fallback: globaler Durchschnitt 2,0 kg CO\u2082 (IEA Freight 2022).",
    info_privacy_gps:   "GPS-Koordinaten werden nur für diese Anfrage genutzt – nicht gespeichert oder weitergegeben.",
    info_privacy_footer:"Alle anderen Daten – CO₂-Werte, Reparierbarkeit, Versand – werden vollständig offline berechnet. Deine Ersparnis, Achievements und Einstellungen bleiben in chrome.storage.local auf deinem Gerät.",
    info_affiliate_text:"Einige der Gebraucht-Plattform-Links sind Affiliate-Links. Das bedeutet: wenn du über einen solchen Link kaufst, erhalten wir eine kleine Provision – für dich entstehen keine Mehrkosten. Die Sortierung basiert ausschließlich auf dem CO₂-Einsparpotenzial.",

    // Repair labels (iFixitService)
    repair_score_1:     "Wegwerfprodukt 😟",
    repair_score_3:     "Schwer reparierbar",
    repair_score_5:     "Mäßig reparierbar",
    repair_score_7:     "Gut reparierbar",
    repair_score_10:    "Top reparierbar ✅",
    repair_parts_none:  "Nicht reparierbar",
    repair_parts_scarce:"Kaum verfügbar",
    repair_parts_limited:"Begrenzt",
    repair_parts_avail: "Verfügbar",
    repair_parts_good:  "Gut verfügbar",
    repair_parts_mod:   "Offiziell & modular",
    repair_parts_biz:   "Gut verfügbar (Business)",
    repair_btn:         "🔧 Altes Gerät reparieren lassen",
    repair_db_label:    "Eingebaute Datenbank",
    repair_live_label:  "Live von iFixit",
    repair_fallback:    "DB (API nicht erreichbar)",

    // CO₂ Comparisons (circularSwap)
    cmp_car_km:         (kg) => `${Math.round(kg * 5)} km Autofahrt`,
    cmp_heating:        (kg) => `${Math.round(kg / 30 * 30)} Tage Haushalts-Heizung`,
    cmp_flight:         (kg) => `${Math.round(kg / 100)} Flug Berlin–London`,
    cmp_tree:           (kg) => `${Math.round(kg / 10)} Monate Baumspeicherung`,

    // Platform badges
    badge_shipping_de:  "+0.8 kg Versand",
    badge_local_0:      "0 kg lokal",
    badge_pickup:       "Lokal abholbar",

    // Settings panel extra
    sp_db_sub_devices:   "441 Geräte · sofort",
    sp_country_hint:     "Beeinflusst welche Secondhand-Plattformen angezeigt werden.",
    sp_budget_off:       "Deaktiviert",

    // Info panel section titles (hardcoded in buildInfoPanel)
    info_co2_section:    "📦 CO₂-Berechnung",
    info_shipping_section:"🚢 Versand-CO₂",
    info_repair_section: "🔧 Reparierbarkeit",
    info_shops_section:  "🗺️ Lokale Shops",
    info_kofi_section:   "☕ EcoTrace unterstützen",
    info_co2_tier2:      "Climatiq API (optional, eigener API-Key in Einstellungen)",
    info_repair_old_body:"Scores 1–10 aus: iFixit Repairability Scores, EU ESPR Repairability Index 2024, Fairphone/Framework Hersteller-Angaben.",
    info_repair_updated: "Wird regelmäßig aktualisiert.",
    info_shops_old_body: "OpenStreetMap via Overpass API (einziger Live-Aufruf). Sucht shop=second_hand, shop=charity, craft=electronics_repair u.a. im 5-km-Radius. GPS-Koordinaten werden nur für diese Anfrage genutzt – nicht gespeichert oder weitergegeben.",
  },

  // ── ENGLISCH ──────────────────────────────────────────────
  en: {
    // Skeleton / Loading
    loading_co2:        "Analysing CO₂ footprint…",
    loading_calculating:"Calculating…",
    loading_repair:     "Loading iFixit score…",
    loading_shops:      "Searching nearby…",
    error_reload:       "Loading error. Please press F5.",

    // CO₂-Section
    production:         "📦 Production",
    shipping:           "Shipping",
    shipping_detected:  "detected",
    shipping_estimated: "estimated",
    total_new:          "Total (new purchase)",
    savings_vs_used:    "Savings vs. second-hand",
    comparison_prefix:  "🌱",

    // Badges
    badge_specific:     "📋 Product-specific",
    badge_live:         "● Climatiq Live",
    badge_estimate:     "~ Estimate",
    source_label:       "📖",

    // Preis-CO₂-Index
    pci_title:          "💶 Price-CO₂ Index (kg CO₂ / €)",
    pci_explain:        "How much CO₂ is in every euro you spend? <strong>Lower = better.</strong>",
    pci_new:            "🆕 New",
    pci_ref:            "♻️ Refurbished",
    pci_estimate:       "Estimate",
    pci_better:         "more CO₂-efficient",
    pci_per_euro:       "per euro spent",
    pci_footnote:       "Refurbished price: avg. 68% of new (Back Market DE 2024) · CO₂ = 30% production + 1.2 kg EU shipping",
    pci_no_price:       "Price not detected. Enter it manually:",
    pci_currency:       "€",

    // Repair Card
    repair_title:       "🔧 Repairability",
    repair_loading:     "Loading iFixit score…",
    repair_loading_api: "Loading from iFixit…",
    repair_guides:      "guides available",
    repair_guides_link: "Guides on iFixit →",
    repair_parts_link:  "Spare parts →",
    repair_badge_live:  "● Live",
    repair_badge_cache: "⚡ Cache",
    repair_badge_local: "📋 Local",
    repair_badge_est:   "~ Estimate",

    // Budget
    budget_label:       "CO₂ Budget",
    budget_remaining:   "remaining",
    budget_exceeded:    "exceeded!",
    budget_month:       "Monthly budget",

    // Predecessor
    pred_savings:       "Performance difference",
    pred_search:        "Search now",

    // Used Section
    used_title:         "🛒 Buy second-hand & save",
    used_motto:         "Search used first, buy new last!",
    used_new:           "New",
    used_ref:           "Refurbished",
    used_local:         "Local",
    used_arrow:         "→",
    used_confirm:       "Great! You're supporting the circular economy. 💚",

    // Local shops
    local_loading:      "Searching nearby…",
    local_no_results:   "No shops found in your area.",
    local_tip:          "Tip: Increase search radius in ⚙ Settings",
    local_labels: {
      electronics: "🔧 Repair & Second-Hand Electronics",
      textile:     "👗 Second-Hand Fashion & Tailors",
      furniture:   "🛋️ Second-Hand Furniture, Decor & Carpenters",
      food:        "🗺️ Local shops nearby",
      generic:     "♻️ Repair & Second-Hand nearby",
    },

    // Actions
    save_btn:           "✅ Save savings",
    save_btn_done:      "💾 Saved!",

    // Footer
    footer_settings:    "⚙ Settings",
    footer_info:        "ℹ Data sources",
    footer_support:     "☕ Support",

    // Settings Panel
    sp_title:           "⚙️ Settings",
    sp_co2_title:       "📦 CO₂ Calculation",
    sp_repair_title:    "🔧 Repairability",
    sp_shops_title:     "🗺️ Local Shops",
    sp_overlay_title:   "🎨 Overlay",
    sp_region_title:    "🌍 Language & Region",
    sp_db_label:        "📋 Offline DB",
    sp_db_sub:          "Instant · 0W",
    sp_api_label:       "🌐 API",
    sp_api_sub:         "Live · own key",
    sp_ifixit_api_sub:  "Live · free",
    sp_key_label:       "Climatiq API Key",
    sp_key_hint:        "Free at climatiq.io · 100 requests/month",
    sp_shops_enable:    "Enable shop search",
    sp_radius_label:    "Search radius",
    sp_predecessor:     "Predecessor hint",
    sp_price_index:     "Price-CO₂ Index",
    sp_budget_label:    "CO₂ monthly budget",
    sp_budget_off:      "Disabled",
    sp_budget_unit:     "kg CO₂ / month",
    sp_country_label:   "Country",
    sp_lang_label:      "Language",
    sp_save_btn:        "💾 Save settings",
    sp_saved_msg:       "✅ Saved!",
    sp_ifix_api_note:   "The iFixit API is public & free – no key needed. Enables live scores (~2–5s).",

    // Predecessor card
    pred_header:        "💡 Previous model available",
    pred_perf:          "% performance",
    // Textile secondhand card
    textile_sh_header:  "🧺 Buy second-hand instead",
    textile_sh_sub:     "The same item is often available used – saves up to 98% CO₂.",
    textile_gmaps:      "Second-Hand shops near you",
    // Info Panel
    info_title:         "🔍 Data sources & Transparency",
    info_why_offline:   "🌱 Why offline databases?",
    info_energy:        "Energy efficiency",
    info_instant:       "Instant display",
    info_privacy_why:   "More privacy",
    info_co2_title:     "📦 CO₂ calculation",
    info_shipping_title:"🚢 Shipping CO₂",
    info_repair_title:  "🔧 Repairability",
    info_shops_title:   "🗺️ Local shops",
    info_privacy_title: "🔒 What leaves your browser",
    info_kofi_title:    "☕ Support EcoTrace",
    info_kofi_text:     "EcoTrace is free, ad-free and open source. If this plugin helped you, we'd love a coffee.",
    info_kofi_btn:      "☕ Support on Ko-fi",
    info_affiliate_title:"* Affiliate links",
    info_version:       "EcoTrace Plugin v2.3.0 · Offline-First · Open Source",
    // Info panel: philosophy section
    info_why_title:     "🌱 Why offline databases?",
    info_energy_title:  "Energy efficiency:",
    info_energy_body:   "Every server request uses electricity – for network, data centre and cooling. A local DB query runs entirely in your device's RAM (~0 Watt).",
    info_instant_title: "Instant display:",
    info_instant_body:  "No waiting. The widget appears with complete data in <300 ms.",
    info_priv_title:    "More privacy:",
    info_priv_body:     "Less network traffic means less data leaving your browser.",
    info_live_cta:      "Live APIs are optional and can be enabled in <strong>⚙ Settings</strong>.",
    // CO₂ section
    info_co2_db:        "Product database (441 devices, offline)",
    info_co2_db_body:   "Product-specific values from official manufacturer lifecycle reports: Apple PER, Samsung PCF Datasheets, Google Environmental Reports, Dell/HP/Lenovo PCF, Fairphone Impact Reports.",
    info_co2_api_body:  "Scientifically validated emission factors. Sources: EcoInvent v3.8, IPCC AR6, EU-JRC, HIGG MSI, Ecobilan. Activatable under ⚙ Settings.",
    info_co2_mock:      "Category averages (fallback)",
    info_co2_mock_body: "HIGG MSI 2022, Textile Exchange 2023, Poore & Nemecek (2018), EcoInvent v3.8, EU Farm to Fork, World Steel Association.",
    // Shipping section
    info_shipping_detect: "Offline DOM analysis – no network call.",
    // Repair section
    info_repair_db:       "Offline database (210+ devices)",
    info_repair_db_body:  "iFixit Repairability Scores, EU ESPR Index 2024, Fairphone/Framework manufacturer data. Updated regularly.",
    info_repair_links:    "Links to iFixit guides and spare parts shop.",
    // Shops section
    info_shops_body:      "Searches for shop=second_hand, craft=electronics_repair etc. within 5 km. GPS coordinates are only used for this request.",
    // Privacy section
    info_priv_overpass:   "Overpass API: GPS coordinates (shop search only, optional)",
    info_priv_climatiq:   "Climatiq API: product category (only if key is active)",
    info_priv_links:      "Platform links: product name as search term (on click only)",
    info_privacy_title2:  "🔒 What leaves your browser",

    // Repair labels
    repair_score_1:     "Disposable product 😟",
    repair_score_3:     "Hard to repair",
    repair_score_5:     "Moderately repairable",
    repair_score_7:     "Good repairability",
    repair_score_10:    "Top repairability ✅",
    repair_parts_none:  "Not repairable",
    repair_parts_scarce:"Barely available",
    repair_parts_limited:"Limited",
    repair_parts_avail: "Available",
    repair_parts_good:  "Well available",
    repair_parts_mod:   "Official & modular",
    repair_parts_biz:   "Well available (business)",
    repair_btn:         "🔧 Repair old device",
    repair_db_label:    "Built-in database",
    repair_live_label:  "Live from iFixit",
    repair_fallback:    "DB (API unavailable)",
    // CO₂ Comparisons
    cmp_heating:        (kg) => `${Math.round(kg / 30 * 30)} days home heating`,
    cmp_car_km:         (kg) => `${Math.round(kg * 5)} km car trip`,
    // Settings panel extra
    sp_db_sub_devices:  "441 devices · instant",
    sp_country_hint:    "Affects which second-hand platforms are shown.",
    sp_budget_off:      "Disabled",
    // Info panel section titles
    info_co2_section:    "📦 CO₂ Calculation",
    info_shipping_section:"🚢 Shipping CO₂",
    info_repair_section: "🔧 Repairability",
    info_shops_section:  "🗺️ Local Shops",
    info_kofi_section:   "☕ Support EcoTrace",
    info_co2_tier2:      "Climatiq API (optional, own API key in settings)",
    info_repair_old_body:"Scores 1–10 from: iFixit Repairability Scores, EU ESPR Index 2024, Fairphone/Framework manufacturer data.",
    info_repair_updated: "Updated regularly.",
    info_shops_old_body: "OpenStreetMap via Overpass API (only live call). Searches shop=second_hand, shop=charity etc. within 5 km. GPS coordinates are only used for this request.",
  },
};

// ── i18n Service ──────────────────────────────────────────────
const I18n = {
  _lang: "de",

  setLang(lang) {
    this._lang = TRANSLATIONS[lang] ? lang : "de";
    window.EcoTrace._userLang = this._lang;
  },

  /** Übersetzung holen. Fallback: Deutsch → Key */
  t(key) {
    return (TRANSLATIONS[this._lang]?.[key])
        ?? (TRANSLATIONS["de"]?.[key])
        ?? key;
  },

  /** Lokale Shop-Label nach Kategorie */
  localLabel(category) {
    const labels = TRANSLATIONS[this._lang]?.local_labels
                ?? TRANSLATIONS["de"].local_labels;
    return labels[category] || labels.generic;
  },

  get lang() { return this._lang; }
};

window.EcoTrace.I18n = I18n;
// Shortcut
window.t = (key) => I18n.t(key);
