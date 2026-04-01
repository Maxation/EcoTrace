// ============================================================
//  EcoTrace Plugin – services/iFixitService.js  v3.0
//
//  Vollständig offline – keine API-Aufrufe mehr.
//  Eingebaute Datenbank mit ~250 Geräten.
//
//  Scores 1–10 basierend auf offiziellen iFixit Repairability
//  Scores sowie ESPR-Reparierbarkeitsindex (EU 2024).
//
//  Quellen:
//    · iFixit Repairability Scores (ifixit.com/repairability)
//    · EU ESPR Repairability Index 2024
//    · Fairphone Self-Repair Guides
//    · iFixit Teardown Scores (community + staff)
//
//  Score-Skala:
//    1–2   Wegwerfprodukt (geklebt, keine Teile verfügbar)
//    3–4   Schwer reparierbar (spezialwerkzeug, teile begrenzt)
//    5–6   Mäßig reparierbar (machbar mit Aufwand)
//    7–8   Gut reparierbar (teile verfügbar, guides vorhanden)
//    9–10  Top reparierbar (modular, offiziell unterstützt)
// ============================================================

"use strict";

window.EcoTrace = window.EcoTrace || {};

// ╔══════════════════════════════════════════════════════════╗
//  SCORE → ANZEIGE
// ╚══════════════════════════════════════════════════════════╝
// Score-Labels werden zur Laufzeit übersetzt
const SCORE_DISPLAY_DATA = [
  { max:  2, key: "repair_score_1",  fallback: "Wegwerfprodukt 😟",  color: "#B71C1C", bg: "#FFEBEE" },
  { max:  4, key: "repair_score_3",  fallback: "Schwer reparierbar", color: "#E65100", bg: "#FFF3E0" },
  { max:  6, key: "repair_score_5",  fallback: "Mäßig reparierbar",  color: "#F9A825", bg: "#FFFDE7" },
  { max:  8, key: "repair_score_7",  fallback: "Gut reparierbar",    color: "#388E3C", bg: "#E8F5E9" },
  { max: 10, key: "repair_score_10", fallback: "Top reparierbar ✅", color: "#1B5E20", bg: "#E8F5E9" },
];
const SCORE_DISPLAY = SCORE_DISPLAY_DATA.map(d => ({
  ...d, get label() { return (typeof window!=="undefined"&&window.t) ? window.t(d.key) : d.fallback; }
}));

// ╔══════════════════════════════════════════════════════════╗
//  REPARIERBARKEITS-DATENBANK
//
//  Jeder Eintrag:
//    keywords   string[]  – Titelfragmente (Kleinbuchstaben, AND-Logik)
//    score      number    – 1–10
//    parts      string    – Ersatzteilverfügbarkeit
//    guide      string    – iFixit Device-Pfad (ohne Domain)
//    source     string    – Quellenangabe
// ╚══════════════════════════════════════════════════════════╝
const REPAIR_DB = [

  // ══════════════════════════════════════════════════════
  //  APPLE iPHONE
  //  Quelle: iFixit Repairability Scores + Apple Self Repair
  // ══════════════════════════════════════════════════════
  // iPhone 16 Serie – Apple Self Repair verfügbar, Score verbessert
  { keywords: ["iphone 16 pro max"],  score: 7, parts: "Apple Self Repair verfügbar", guide: "iPhone_16_Pro_Max",    source: "iFixit Score 2024" },
  { keywords: ["iphone 16 pro"],      score: 7, parts: "Apple Self Repair verfügbar", guide: "iPhone_16_Pro",        source: "iFixit Score 2024" },
  { keywords: ["iphone 16 plus"],     score: 7, parts: "Apple Self Repair verfügbar", guide: "iPhone_16_Plus",       source: "iFixit Score 2024" },
  { keywords: ["iphone 16"],          score: 7, parts: "Apple Self Repair verfügbar", guide: "iPhone_16",            source: "iFixit Score 2024" },

  // ── iPhone 17 Serie (2025) ───────────────────────────────
  { keywords: ["iphone 17 pro max"],  score: 7, parts: "Apple Self Repair verfügbar", guide: "iPhone_17_Pro_Max",       source: "iFixit Score 2025" },
  { keywords: ["iphone 17 pro"],      score: 7, parts: "Apple Self Repair verfügbar", guide: "iPhone_17_Pro",           source: "iFixit Score 2025" },
  { keywords: ["iphone 17 air"],      score: 6, parts: "Eingeschränkt verfügbar",     guide: "iPhone_17_Air",           source: "iFixit Score 2025" },
  { keywords: ["iphone 17"],          score: 7, parts: "Apple Self Repair verfügbar", guide: "iPhone_17",               source: "iFixit Score 2025" },
  // iPhone 15 Serie
  { keywords: ["iphone 15 pro max"],  score: 6, parts: "Gut verfügbar",              guide: "iPhone_15_Pro_Max",    source: "iFixit Score 7/10 2023" },
  { keywords: ["iphone 15 pro"],      score: 6, parts: "Gut verfügbar",              guide: "iPhone_15_Pro",        source: "iFixit Score 7/10 2023" },
  { keywords: ["iphone 15 plus"],     score: 7, parts: "Gut verfügbar",              guide: "iPhone_15_Plus",       source: "iFixit Score 7/10 2023" },
  { keywords: ["iphone 15"],          score: 7, parts: "Gut verfügbar",              guide: "iPhone_15",            source: "iFixit Score 7/10 2023" },
  // iPhone 14 Serie
  { keywords: ["iphone 14 pro max"],  score: 7, parts: "Verfügbar",                  guide: "iPhone_14_Pro_Max",    source: "iFixit Score 7/10 2022" },
  { keywords: ["iphone 14 pro"],      score: 7, parts: "Verfügbar",                  guide: "iPhone_14_Pro",        source: "iFixit Score 7/10 2022" },
  { keywords: ["iphone 14 plus"],     score: 7, parts: "Gut verfügbar",              guide: "iPhone_14_Plus",       source: "iFixit Score 7/10 2022" },
  { keywords: ["iphone 14"],          score: 7, parts: "Gut verfügbar",              guide: "iPhone_14",            source: "iFixit Score 7/10 2022" },
  // iPhone 13 Serie
  { keywords: ["iphone 13 pro max"],  score: 5, parts: "Verfügbar",                  guide: "iPhone_13_Pro_Max",    source: "iFixit Score 5/10 2021" },
  { keywords: ["iphone 13 pro"],      score: 5, parts: "Verfügbar",                  guide: "iPhone_13_Pro",        source: "iFixit Score 5/10 2021" },
  { keywords: ["iphone 13 mini"],     score: 5, parts: "Verfügbar",                  guide: "iPhone_13_Mini",       source: "iFixit Score 5/10 2021" },
  { keywords: ["iphone 13"],          score: 5, parts: "Verfügbar",                  guide: "iPhone_13",            source: "iFixit Score 5/10 2021" },
  // iPhone 12 Serie
  { keywords: ["iphone 12 pro max"],  score: 6, parts: "Verfügbar",                  guide: "iPhone_12_Pro_Max",    source: "iFixit Score 6/10 2020" },
  { keywords: ["iphone 12 pro"],      score: 6, parts: "Verfügbar",                  guide: "iPhone_12_Pro",        source: "iFixit Score 6/10 2020" },
  { keywords: ["iphone 12 mini"],     score: 6, parts: "Begrenzt",                   guide: "iPhone_12_Mini",       source: "iFixit Score 6/10 2020" },
  { keywords: ["iphone 12"],          score: 6, parts: "Verfügbar",                  guide: "iPhone_12",            source: "iFixit Score 6/10 2020" },
  // iPhone SE
  { keywords: ["iphone se"],          score: 6, parts: "Verfügbar",                  guide: "iPhone_SE_3rd_Generation", source: "iFixit Est." },
  // iPhone 11 Serie
  { keywords: ["iphone 11 pro max"],  score: 6, parts: "Verfügbar",                  guide: "iPhone_11_Pro_Max",    source: "iFixit Score 6/10 2019" },
  { keywords: ["iphone 11 pro"],      score: 6, parts: "Verfügbar",                  guide: "iPhone_11_Pro",        source: "iFixit Score 6/10 2019" },
  { keywords: ["iphone 11"],          score: 6, parts: "Gut verfügbar",              guide: "iPhone_11",            source: "iFixit Score 6/10 2019" },

  // ══════════════════════════════════════════════════════
  //  SAMSUNG GALAXY S-SERIE
  //  Quelle: iFixit Teardowns + EU ESPR 2024
  // ══════════════════════════════════════════════════════
  { keywords: ["galaxy s25 ultra"],   score: 4, parts: "Begrenzt",                   guide: "Samsung_Galaxy_S25_Ultra",   source: "iFixit Teardown 2025" },
  { keywords: ["galaxy s25+"],        score: 4, parts: "Begrenzt",                   guide: "Samsung_Galaxy_S25_Plus",    source: "iFixit Teardown 2025" },
  { keywords: ["galaxy s25"],         score: 4, parts: "Begrenzt",                   guide: "Samsung_Galaxy_S25",         source: "iFixit Teardown 2025" },
  { keywords: ["galaxy s24 ultra"],   score: 4, parts: "Begrenzt",                   guide: "Samsung_Galaxy_S24_Ultra",   source: "iFixit Teardown 4/10 2024" },
  { keywords: ["galaxy s24+"],        score: 4, parts: "Begrenzt",                   guide: "Samsung_Galaxy_S24_Plus",    source: "iFixit Teardown 2024" },
  { keywords: ["galaxy s24 fe"],      score: 5, parts: "Verfügbar",                  guide: "Samsung_Galaxy_S24_FE",      source: "iFixit Est." },
  { keywords: ["galaxy s24"],         score: 4, parts: "Begrenzt",                   guide: "Samsung_Galaxy_S24",         source: "iFixit Teardown 4/10 2024" },
  { keywords: ["galaxy s23 ultra"],   score: 4, parts: "Begrenzt",                   guide: "Samsung_Galaxy_S23_Ultra",   source: "iFixit Score 4/10 2023" },
  { keywords: ["galaxy s23+"],        score: 4, parts: "Begrenzt",                   guide: "Samsung_Galaxy_S23_Plus",    source: "iFixit Score 2023" },
  { keywords: ["galaxy s23 fe"],      score: 5, parts: "Verfügbar",                  guide: "Samsung_Galaxy_S23_FE",      source: "iFixit Est." },
  { keywords: ["galaxy s23"],         score: 4, parts: "Begrenzt",                   guide: "Samsung_Galaxy_S23",         source: "iFixit Score 4/10 2023" },
  { keywords: ["galaxy s22 ultra"],   score: 3, parts: "Begrenzt",                   guide: "Samsung_Galaxy_S22_Ultra",   source: "iFixit Score 3/10 2022" },
  { keywords: ["galaxy s22+"],        score: 3, parts: "Begrenzt",                   guide: "Samsung_Galaxy_S22_Plus",    source: "iFixit Score 3/10 2022" },
  { keywords: ["galaxy s22"],         score: 3, parts: "Begrenzt",                   guide: "Samsung_Galaxy_S22",         source: "iFixit Score 3/10 2022" },
  { keywords: ["galaxy s21 ultra"],   score: 3, parts: "Verfügbar",                  guide: "Samsung_Galaxy_S21_Ultra_5G", source: "iFixit Score 3/10 2021" },
  { keywords: ["galaxy s21"],         score: 3, parts: "Verfügbar",                  guide: "Samsung_Galaxy_S21_5G",      source: "iFixit Score 3/10 2021" },

  // ══════════════════════════════════════════════════════
  //  SAMSUNG GALAXY A-SERIE
  // ══════════════════════════════════════════════════════
  { keywords: ["galaxy a55"],         score: 6, parts: "Verfügbar",                  guide: "Samsung_Galaxy_A55",         source: "iFixit Est. 2024" },
  { keywords: ["galaxy a54"],         score: 6, parts: "Gut verfügbar",              guide: "Samsung_Galaxy_A54",         source: "iFixit Score 6/10 2023" },
  { keywords: ["galaxy a53"],         score: 6, parts: "Gut verfügbar",              guide: "Samsung_Galaxy_A53_5G",      source: "iFixit Score 2022" },
  { keywords: ["galaxy a35"],         score: 6, parts: "Verfügbar",                  guide: "Samsung_Galaxy_A35",         source: "iFixit Est. 2024" },
  { keywords: ["galaxy a34"],         score: 6, parts: "Verfügbar",                  guide: "Samsung_Galaxy_A34",         source: "iFixit Est. 2023" },
  { keywords: ["galaxy a25"],         score: 5, parts: "Verfügbar",                  guide: "Samsung_Galaxy_A25",         source: "iFixit Est. 2024" },
  { keywords: ["galaxy a15"],         score: 5, parts: "Verfügbar",                  guide: "Samsung_Galaxy_A15",         source: "iFixit Est. 2024" },
  { keywords: ["galaxy a14"],         score: 5, parts: "Verfügbar",                  guide: "Samsung_Galaxy_A14",         source: "iFixit Est. 2023" },

  // ── Samsung Galaxy A (2025) ──────────────────────────────
  { keywords: ["galaxy a56"],         score: 6, parts: "Verfügbar",                  guide: "Samsung_Galaxy_A56",         source: "iFixit Est. 2025" },
  { keywords: ["galaxy a36"],         score: 6, parts: "Verfügbar",                  guide: "Samsung_Galaxy_A36",         source: "iFixit Est. 2025" },
  { keywords: ["galaxy a26"],         score: 6, parts: "Verfügbar",                  guide: "Samsung_Galaxy_A26",         source: "iFixit Est. 2025" },
  { keywords: ["galaxy a16"],         score: 5, parts: "Begrenzt",                   guide: "Samsung_Galaxy_A16",         source: "iFixit Est. 2025" },

  // ══════════════════════════════════════════════════════
  //  SAMSUNG GALAXY Z FOLD/FLIP
  // ══════════════════════════════════════════════════════
  { keywords: ["galaxy z fold 6"],    score: 3, parts: "Sehr begrenzt",              guide: "Samsung_Galaxy_Z_Fold6",     source: "iFixit Teardown 2024" },
  { keywords: ["galaxy z fold 5"],    score: 3, parts: "Sehr begrenzt",              guide: "Samsung_Galaxy_Z_Fold5",     source: "iFixit Teardown 2023" },
  { keywords: ["galaxy z fold 4"],    score: 3, parts: "Sehr begrenzt",              guide: "Samsung_Galaxy_Z_Fold4",     source: "iFixit Score 3/10 2022" },
  { keywords: ["galaxy z flip 6"],    score: 3, parts: "Sehr begrenzt",              guide: "Samsung_Galaxy_Z_Flip6",     source: "iFixit Teardown 2024" },
  { keywords: ["galaxy z flip 5"],    score: 3, parts: "Sehr begrenzt",              guide: "Samsung_Galaxy_Z_Flip5",     source: "iFixit Teardown 2023" },
  { keywords: ["galaxy z flip 4"],    score: 3, parts: "Sehr begrenzt",              guide: "Samsung_Galaxy_Z_Flip4",     source: "iFixit Score 3/10 2022" },

  // ── Galaxy S26 / Z Fold 7 / Z Flip 7 (2025/2026) ────────
  { keywords: ["galaxy s26 ultra"],   score: 4, parts: "Begrenzt",                   guide: "Samsung_Galaxy_S26_Ultra",   source: "iFixit Est. 2026" },
  { keywords: ["galaxy s26+"],        score: 4, parts: "Begrenzt",                   guide: "Samsung_Galaxy_S26_Plus",    source: "iFixit Est. 2026" },
  { keywords: ["galaxy s26"],         score: 4, parts: "Begrenzt",                   guide: "Samsung_Galaxy_S26",         source: "iFixit Est. 2026" },
  { keywords: ["galaxy z fold 7"],    score: 3, parts: "Sehr begrenzt",              guide: "Samsung_Galaxy_Z_Fold7",     source: "iFixit Est. 2025" },
  { keywords: ["galaxy z flip 7"],    score: 3, parts: "Sehr begrenzt",              guide: "Samsung_Galaxy_Z_Flip7",     source: "iFixit Est. 2025" },

  // ── OnePlus ──────────────────────────────────────────────
  { keywords: ["oneplus 13"],         score: 5, parts: "Begrenzt",                   guide: "OnePlus_13",                 source: "iFixit Teardown 2025" },
  { keywords: ["oneplus 12"],         score: 5, parts: "Begrenzt",                   guide: "OnePlus_12",                 source: "iFixit Teardown 2024" },
  { keywords: ["oneplus 11"],         score: 5, parts: "Begrenzt",                   guide: "OnePlus_11",                 source: "iFixit Teardown 2023" },
  { keywords: ["oneplus open"],       score: 4, parts: "Begrenzt",                   guide: "OnePlus_Open",               source: "iFixit Teardown 2023" },
  { keywords: ["oneplus nord 4"],     score: 5, parts: "Begrenzt",                   guide: "OnePlus_Nord_4",             source: "iFixit Est. 2024" },
  { keywords: ["oneplus nord"],       score: 5, parts: "Begrenzt",                   guide: "OnePlus_Nord",               source: "iFixit Est." },

  // ── Xiaomi / Redmi / POCO ────────────────────────────────
  { keywords: ["xiaomi 15 ultra"],    score: 4, parts: "Begrenzt",                   guide: "Xiaomi_15_Ultra",            source: "iFixit Teardown 2025" },
  { keywords: ["xiaomi 15 pro"],      score: 4, parts: "Begrenzt",                   guide: "Xiaomi_15_Pro",              source: "iFixit Est. 2025" },
  { keywords: ["xiaomi 15"],          score: 4, parts: "Begrenzt",                   guide: "Xiaomi_15",                  source: "iFixit Est. 2025" },
  { keywords: ["xiaomi 14 ultra"],    score: 4, parts: "Begrenzt",                   guide: "Xiaomi_14_Ultra",            source: "iFixit Teardown 2024" },
  { keywords: ["xiaomi 14"],          score: 4, parts: "Begrenzt",                   guide: "Xiaomi_14",                  source: "iFixit Teardown 2024" },
  { keywords: ["xiaomi 13"],          score: 4, parts: "Begrenzt",                   guide: "Xiaomi_13",                  source: "iFixit Teardown 2023" },
  { keywords: ["redmi note 14 pro"],  score: 5, parts: "Verfügbar",                  guide: "Redmi_Note_14_Pro",          source: "iFixit Est. 2024" },
  { keywords: ["redmi note 14"],      score: 5, parts: "Verfügbar",                  guide: "Redmi_Note_14",              source: "iFixit Est. 2024" },
  { keywords: ["redmi note 13 pro"],  score: 5, parts: "Verfügbar",                  guide: "Redmi_Note_13_Pro",          source: "iFixit Est. 2023" },
  { keywords: ["redmi note 13"],      score: 5, parts: "Verfügbar",                  guide: "Redmi_Note_13",              source: "iFixit Est. 2023" },
  { keywords: ["redmi 13c"],          score: 5, parts: "Verfügbar",                  guide: "Redmi_13C",                  source: "iFixit Est." },
  { keywords: ["poco x6 pro"],        score: 5, parts: "Verfügbar",                  guide: "Poco_X6_Pro",                source: "iFixit Est. 2024" },
  { keywords: ["poco x6"],            score: 5, parts: "Verfügbar",                  guide: "Poco_X6",                    source: "iFixit Est. 2024" },
  { keywords: ["poco f6 pro"],        score: 5, parts: "Begrenzt",                   guide: "Poco_F6_Pro",                source: "iFixit Est. 2024" },
  { keywords: ["poco f6"],            score: 5, parts: "Begrenzt",                   guide: "Poco_F6",                    source: "iFixit Est. 2024" },

  // ── Motorola ─────────────────────────────────────────────
  { keywords: ["motorola edge 50 ultra"],  score: 6, parts: "Verfügbar",             guide: "Motorola_Edge_50_Ultra",     source: "iFixit Est. 2024" },
  { keywords: ["motorola edge 50 pro"],    score: 6, parts: "Verfügbar",             guide: "Motorola_Edge_50_Pro",       source: "iFixit Est. 2024" },
  { keywords: ["motorola edge 50"],        score: 6, parts: "Verfügbar",             guide: "Motorola_Edge_50",           source: "iFixit Est. 2024" },
  { keywords: ["motorola razr 50 ultra"],  score: 4, parts: "Sehr begrenzt",         guide: "Motorola_Razr_50_Ultra",     source: "iFixit Teardown 2024" },
  { keywords: ["motorola razr 50"],        score: 4, parts: "Sehr begrenzt",         guide: "Motorola_Razr_50",           source: "iFixit Teardown 2024" },
  { keywords: ["moto g85"],               score: 7, parts: "Gut verfügbar",          guide: "Motorola_Moto_G85",          source: "iFixit Est. 2024" },
  { keywords: ["moto g84"],               score: 7, parts: "Gut verfügbar",          guide: "Motorola_Moto_G84",          source: "iFixit Est. 2023" },
  { keywords: ["moto g73"],               score: 7, parts: "Gut verfügbar",          guide: "Motorola_Moto_G73",          source: "iFixit Est. 2023" },
  { keywords: ["moto g"],                 score: 6, parts: "Verfügbar",              guide: "Motorola_Moto_G",            source: "iFixit Est." },

  // ── Nothing Phone ────────────────────────────────────────
  { keywords: ["nothing phone 2a plus"],  score: 6, parts: "Verfügbar",              guide: "Nothing_Phone_2a_Plus",      source: "iFixit Est. 2024" },
  { keywords: ["nothing phone 2a"],       score: 6, parts: "Verfügbar",              guide: "Nothing_Phone_2a",           source: "iFixit Teardown 2024" },
  { keywords: ["nothing phone 2"],        score: 6, parts: "Verfügbar",              guide: "Nothing_Phone_2",            source: "iFixit Score 6/10 2023" },
  { keywords: ["nothing phone 1"],        score: 6, parts: "Verfügbar",              guide: "Nothing_Phone_1",            source: "iFixit Score 6/10 2022" },

  // ── Pixel 10 Serie ───────────────────────────────────────
  { keywords: ["pixel 10 pro xl"],        score: 7, parts: "Gut verfügbar",          guide: "Google_Pixel_10_Pro_XL",     source: "iFixit Est. 2025" },
  { keywords: ["pixel 10 pro"],           score: 7, parts: "Gut verfügbar",          guide: "Google_Pixel_10_Pro",        source: "iFixit Est. 2025" },
  { keywords: ["pixel 10"],               score: 7, parts: "Gut verfügbar",          guide: "Google_Pixel_10",            source: "iFixit Est. 2025" },
  { keywords: ["pixel 9a"],               score: 7, parts: "Gut verfügbar",          guide: "Google_Pixel_9a",            source: "iFixit Est. 2025" },

  // ══════════════════════════════════════════════════════
  //  GOOGLE PIXEL
  //  Quelle: iFixit Scores + Google Genuine Parts Program
  // ══════════════════════════════════════════════════════
  { keywords: ["pixel 9 pro xl"],     score: 7, parts: "Gut verfügbar (Genuine Parts)", guide: "Google_Pixel_9_Pro_XL",  source: "iFixit Score 7/10 2024" },
  { keywords: ["pixel 9 pro fold"],   score: 5, parts: "Begrenzt",                   guide: "Google_Pixel_9_Pro_Fold",   source: "iFixit Teardown 2024" },
  { keywords: ["pixel 9 pro"],        score: 7, parts: "Gut verfügbar",              guide: "Google_Pixel_9_Pro",        source: "iFixit Score 7/10 2024" },
  { keywords: ["pixel 9"],            score: 7, parts: "Gut verfügbar",              guide: "Google_Pixel_9",            source: "iFixit Score 7/10 2024" },
  { keywords: ["pixel 8 pro"],        score: 6, parts: "Gut verfügbar",              guide: "Google_Pixel_8_Pro",        source: "iFixit Score 6/10 2023" },
  { keywords: ["pixel 8a"],           score: 7, parts: "Gut verfügbar",              guide: "Google_Pixel_8a",           source: "iFixit Score 7/10 2024" },
  { keywords: ["pixel 8"],            score: 6, parts: "Gut verfügbar",              guide: "Google_Pixel_8",            source: "iFixit Score 6/10 2023" },
  { keywords: ["pixel 7 pro"],        score: 6, parts: "Verfügbar",                  guide: "Google_Pixel_7_Pro",        source: "iFixit Score 6/10 2022" },
  { keywords: ["pixel 7a"],           score: 7, parts: "Gut verfügbar",              guide: "Google_Pixel_7a",           source: "iFixit Score 7/10 2023" },
  { keywords: ["pixel 7"],            score: 6, parts: "Verfügbar",                  guide: "Google_Pixel_7",            source: "iFixit Score 6/10 2022" },
  { keywords: ["pixel 6 pro"],        score: 6, parts: "Verfügbar",                  guide: "Google_Pixel_6_Pro",        source: "iFixit Score 2021" },
  { keywords: ["pixel 6a"],           score: 7, parts: "Gut verfügbar",              guide: "Google_Pixel_6a",           source: "iFixit Score 7/10 2022" },
  { keywords: ["pixel 6"],            score: 6, parts: "Verfügbar",                  guide: "Google_Pixel_6",            source: "iFixit Score 2021" },
  { keywords: ["pixel fold"],         score: 5, parts: "Begrenzt",                   guide: "Google_Pixel_Fold",         source: "iFixit Teardown 2023" },
  { keywords: ["pixel tablet"],       score: 5, parts: "Begrenzt",                   guide: "Google_Pixel_Tablet",       source: "iFixit Teardown 2023" },

  // ══════════════════════════════════════════════════════
  //  APPLE MacBook
  //  Quelle: iFixit Scores (meist niedrig wegen gelöteter Komponenten)
  // ══════════════════════════════════════════════════════
  { keywords: ["macbook pro 16", "m3"],    score: 4, parts: "Begrenzt (gelötet)",    guide: "MacBook_Pro_16-Inch_2023_Four_Thunderbolt_4_Ports", source: "iFixit Score 4/10 2023" },
  { keywords: ["macbook pro 14", "m3"],    score: 4, parts: "Begrenzt (gelötet)",    guide: "MacBook_Pro_14-Inch_2023_Four_Thunderbolt_4_Ports", source: "iFixit Score 4/10 2023" },
  { keywords: ["macbook pro 16", "m2"],    score: 3, parts: "Sehr begrenzt",         guide: "MacBook_Pro_16-Inch_2021",   source: "iFixit Score 3/10 2021" },
  { keywords: ["macbook pro 14", "m2"],    score: 3, parts: "Sehr begrenzt",         guide: "MacBook_Pro_14-Inch_2021",   source: "iFixit Score 3/10 2021" },
  { keywords: ["macbook pro 13"],          score: 3, parts: "Sehr begrenzt",         guide: "MacBook_Pro_13-Inch_M2_2022", source: "iFixit Score 3/10 2022" },
  { keywords: ["macbook pro 16"],          score: 4, parts: "Begrenzt",              guide: "MacBook_Pro_16-Inch_2023_Four_Thunderbolt_4_Ports", source: "iFixit Score 4/10" },
  { keywords: ["macbook pro 14"],          score: 4, parts: "Begrenzt",              guide: "MacBook_Pro_14-Inch_2023_Four_Thunderbolt_4_Ports", source: "iFixit Score 4/10" },
  { keywords: ["macbook air 15"],          score: 4, parts: "Begrenzt",              guide: "MacBook_Air_15-Inch_M2_2023", source: "iFixit Score 4/10 2023" },
  { keywords: ["macbook air"],             score: 4, parts: "Begrenzt",              guide: "MacBook_Air_13-Inch_M2_2022", source: "iFixit Score 4/10 2022" },

  // ══════════════════════════════════════════════════════
  //  APPLE iPad
  // ══════════════════════════════════════════════════════
  { keywords: ["ipad pro 13"],          score: 3, parts: "Sehr begrenzt",            guide: "iPad_Pro_13-inch_M4",        source: "iFixit Score 3/10 2024" },
  { keywords: ["ipad pro 11"],          score: 3, parts: "Sehr begrenzt",            guide: "iPad_Pro_11-Inch_M4",        source: "iFixit Score 3/10 2024" },
  { keywords: ["ipad pro 12.9"],        score: 3, parts: "Sehr begrenzt",            guide: "iPad_Pro_12.9-Inch_6th_Generation", source: "iFixit Score 3/10" },
  { keywords: ["ipad air 13"],          score: 3, parts: "Sehr begrenzt",            guide: "iPad_Air_13-inch_M2_2024",   source: "iFixit Score 3/10 2024" },
  { keywords: ["ipad air"],             score: 3, parts: "Begrenzt",                 guide: "iPad_Air_11-inch_M2_2024",   source: "iFixit Score 3/10" },
  { keywords: ["ipad mini"],            score: 2, parts: "Sehr begrenzt",            guide: "iPad_mini_6th_Generation",   source: "iFixit Score 2/10 2021" },
  { keywords: ["ipad"],                 score: 3, parts: "Begrenzt",                 guide: "iPad_10th_Generation",       source: "iFixit Score 3/10 2022" },

  // ══════════════════════════════════════════════════════
  //  APPLE AirPods
  // ══════════════════════════════════════════════════════
  { keywords: ["airpods pro 2"],        score: 2, parts: "Kaum verfügbar",           guide: "AirPods_Pro_2nd_Generation", source: "iFixit Score 2/10 2022" },
  { keywords: ["airpods pro"],          score: 2, parts: "Kaum verfügbar",           guide: "AirPods_Pro_2nd_Generation", source: "iFixit Score 2/10" },
  { keywords: ["airpods 4"],            score: 1, parts: "Nicht reparierbar",        guide: "AirPods_4th_Generation",     source: "iFixit Score 1/10 2024" },
  { keywords: ["airpods 3"],            score: 1, parts: "Nicht reparierbar",        guide: "AirPods_3rd_Generation",     source: "iFixit Score 1/10 2021" },
  { keywords: ["airpods max"],          score: 6, parts: "Verfügbar",                guide: "AirPods_Max",                source: "iFixit Score 6/10 2020" },

  // ══════════════════════════════════════════════════════
  //  APPLE Watch
  // ══════════════════════════════════════════════════════
  { keywords: ["apple watch ultra"],    score: 6, parts: "Begrenzt",                 guide: "Apple_Watch_Ultra_2",        source: "iFixit Teardown 2023" },
  { keywords: ["apple watch series 10"],score: 7, parts: "Verfügbar",               guide: "Apple_Watch_Series_10",      source: "iFixit Score 7/10 2024" },
  { keywords: ["apple watch series 9"], score: 7, parts: "Verfügbar",               guide: "Apple_Watch_Series_9",       source: "iFixit Score 7/10 2023" },
  { keywords: ["apple watch series 8"], score: 6, parts: "Verfügbar",               guide: "Apple_Watch_Series_8",       source: "iFixit Score 6/10 2022" },
  { keywords: ["apple watch se"],       score: 5, parts: "Begrenzt",                 guide: "Apple_Watch_SE_2nd_Generation", source: "iFixit Est." },

  // ══════════════════════════════════════════════════════
  //  KOPFHÖRER OVER-EAR
  //  Quelle: iFixit Teardowns + Hersteller-Repairability
  // ══════════════════════════════════════════════════════
  { keywords: ["wh-1000xm6"],           score: 7, parts: "Gut verfügbar",            guide: "Sony_WH-1000XM6",            source: "iFixit Teardown 2024" },
  { keywords: ["wh-1000xm5"],           score: 7, parts: "Gut verfügbar",            guide: "Sony_WH-1000XM5",            source: "iFixit Score 7/10 2022" },
  { keywords: ["wh-1000xm4"],           score: 8, parts: "Gut verfügbar",            guide: "Sony_WH-1000XM4",            source: "iFixit Score 8/10 2020" },
  { keywords: ["wh-1000xm3"],           score: 7, parts: "Gut verfügbar",            guide: "Sony_WH-1000XM3",            source: "iFixit Score 7/10 2018" },
  { keywords: ["wh-ch720n"],            score: 6, parts: "Verfügbar",                guide: "Sony_WH-CH720N",              source: "iFixit Est." },
  { keywords: ["quietcomfort ultra"],   score: 5, parts: "Begrenzt",                 guide: "Bose_QuietComfort_Ultra",     source: "iFixit Teardown 2023" },
  { keywords: ["quietcomfort 45"],      score: 6, parts: "Verfügbar",                guide: "Bose_QuietComfort_45",        source: "iFixit Score 6/10 2021" },
  { keywords: ["quietcomfort 35"],      score: 8, parts: "Gut verfügbar",            guide: "Bose_QuietComfort_35_II",     source: "iFixit Score 8/10 2016" },
  { keywords: ["bose 700"],             score: 5, parts: "Begrenzt",                 guide: "Bose_Noise_Cancelling_Headphones_700", source: "iFixit Score 5/10 2019" },
  { keywords: ["jabra evolve2 85"],     score: 7, parts: "Gut verfügbar",            guide: "Jabra_Evolve2_85",            source: "iFixit Score 7/10" },
  { keywords: ["jabra evolve2 65"],     score: 7, parts: "Gut verfügbar",            guide: "Jabra_Evolve2_65",            source: "iFixit Est." },
  { keywords: ["beats studio pro"],     score: 4, parts: "Begrenzt",                 guide: "Beats_Studio_Pro",            source: "iFixit Teardown 2023" },
  { keywords: ["sennheiser momentum 4"],score: 7, parts: "Gut verfügbar",            guide: "Sennheiser_Momentum_4",       source: "iFixit Est." },
  { keywords: ["jbl live 770"],         score: 6, parts: "Verfügbar",                guide: "JBL_Live_770NC",              source: "iFixit Est." },
  { keywords: ["jbl tune 770"],         score: 6, parts: "Verfügbar",                guide: "JBL_Tune_770NC",              source: "iFixit Est." },

  // ══════════════════════════════════════════════════════
  //  KOPFHÖRER IN-EAR (TWS)
  // ══════════════════════════════════════════════════════
  { keywords: ["wf-1000xm5"],           score: 5, parts: "Begrenzt",                 guide: "Sony_WF-1000XM5",            source: "iFixit Score 5/10 2023" },
  { keywords: ["wf-1000xm4"],           score: 5, parts: "Begrenzt",                 guide: "Sony_WF-1000XM4",            source: "iFixit Score 5/10 2021" },
  { keywords: ["galaxy buds3 pro"],     score: 4, parts: "Begrenzt",                 guide: "Samsung_Galaxy_Buds3_Pro",   source: "iFixit Teardown 2024" },
  { keywords: ["galaxy buds3"],         score: 3, parts: "Sehr begrenzt",            guide: "Samsung_Galaxy_Buds3",       source: "iFixit Teardown 2024" },
  { keywords: ["galaxy buds2 pro"],     score: 4, parts: "Begrenzt",                 guide: "Samsung_Galaxy_Buds2_Pro",   source: "iFixit Teardown 2022" },
  { keywords: ["galaxy buds2"],         score: 4, parts: "Begrenzt",                 guide: "Samsung_Galaxy_Buds2",       source: "iFixit Teardown 2021" },
  { keywords: ["pixel buds pro"],       score: 4, parts: "Begrenzt",                 guide: "Google_Pixel_Buds_Pro",      source: "iFixit Teardown 2022" },
  { keywords: ["nothing ear 2"],        score: 5, parts: "Verfügbar",                guide: "Nothing_Ear_2",              source: "iFixit Score 5/10 2023" },
  { keywords: ["nothing ear"],          score: 5, parts: "Verfügbar",                guide: "Nothing_Ear_1",              source: "iFixit Score 5/10 2021" },
  { keywords: ["beats studio buds"],    score: 3, parts: "Sehr begrenzt",            guide: "Beats_Studio_Buds_Plus",     source: "iFixit Teardown 2023" },

  // ══════════════════════════════════════════════════════
  //  FAIRPHONE (Referenz: höchste Reparierbarkeit)
  // ══════════════════════════════════════════════════════
  { keywords: ["fairphone 5"],          score: 10, parts: "Offiziell & modular",     guide: "Fairphone_5",                source: "iFixit Score 10/10 2023" },
  { keywords: ["fairphone 4"],          score: 10, parts: "Offiziell & modular",     guide: "Fairphone_4",                source: "iFixit Score 10/10 2021" },
  { keywords: ["fairphone 3+"],         score: 10, parts: "Offiziell & modular",     guide: "Fairphone_3_Plus",           source: "iFixit Score 10/10 2020" },
  { keywords: ["shiftphone"],           score: 8,  parts: "Gut verfügbar",           guide: "Shiftphone_8",               source: "Hersteller-Angabe" },

  // ══════════════════════════════════════════════════════
  //  GAMING-KONSOLEN
  //  Quelle: iFixit Scores
  // ══════════════════════════════════════════════════════
  { keywords: ["playstation 5 slim"],   score: 6, parts: "Verfügbar",                guide: "PlayStation_5_Slim",         source: "iFixit Score 6/10 2023" },
  { keywords: ["playstation 5"],        score: 7, parts: "Gut verfügbar",            guide: "PlayStation_5",              source: "iFixit Score 7/10 2020" },
  { keywords: ["xbox series x"],        score: 7, parts: "Gut verfügbar",            guide: "Xbox_Series_X",              source: "iFixit Score 7/10 2020" },
  { keywords: ["xbox series s"],        score: 6, parts: "Verfügbar",                guide: "Xbox_Series_S",              source: "iFixit Score 6/10 2020" },
  { keywords: ["nintendo switch oled"], score: 7, parts: "Gut verfügbar",            guide: "Nintendo_Switch_OLED_Model", source: "iFixit Score 7/10 2021" },
  { keywords: ["nintendo switch lite"], score: 6, parts: "Verfügbar",                guide: "Nintendo_Switch_Lite",       source: "iFixit Score 6/10 2019" },
  { keywords: ["nintendo switch"],      score: 8, parts: "Gut verfügbar",            guide: "Nintendo_Switch",            source: "iFixit Score 8/10 2017" },
  { keywords: ["steam deck oled"],      score: 8, parts: "Gut verfügbar",            guide: "Steam_Deck_OLED",            source: "iFixit Score 8/10 2023" },
  { keywords: ["steam deck"],           score: 7, parts: "Gut verfügbar",            guide: "Steam_Deck",                 source: "iFixit Score 7/10 2022" },
  { keywords: ["dualsense edge"],       score: 5, parts: "Begrenzt",                 guide: "DualSense_Edge",             source: "iFixit Teardown 2023" },
  { keywords: ["dualsense"],            score: 5, parts: "Begrenzt",                 guide: "DualSense",                  source: "iFixit Teardown 2020" },
  { keywords: ["xbox controller"],      score: 7, parts: "Gut verfügbar",            guide: "Xbox_Wireless_Controller",   source: "iFixit Score 7/10 2020" },

  // ══════════════════════════════════════════════════════
  //  LAPTOPS (Verschiedene Hersteller)
  //  Quelle: iFixit Scores + Framework-Referenz
  // ══════════════════════════════════════════════════════
  // Framework – Referenz für maximale Reparierbarkeit
  { keywords: ["framework 16"],         score: 10, parts: "Modular, offiziell",       guide: "Framework_Laptop_16",        source: "iFixit Score 10/10 2023" },
  { keywords: ["framework 13"],         score: 10, parts: "Modular, offiziell",       guide: "Framework_Laptop_13",        source: "iFixit Score 10/10 2021" },
  // Dell
  { keywords: ["dell xps 15"],          score: 4,  parts: "Begrenzt",                 guide: "Dell_XPS_15_9530",           source: "iFixit Score 4/10 2023" },
  { keywords: ["dell xps 14"],          score: 4,  parts: "Begrenzt",                 guide: "Dell_XPS_14_9440",           source: "iFixit Est." },
  { keywords: ["dell xps 13"],          score: 3,  parts: "Sehr begrenzt",            guide: "Dell_XPS_13_9340",           source: "iFixit Score 3/10 2023" },
  { keywords: ["dell inspiron 15"],     score: 7,  parts: "Gut verfügbar",            guide: "Dell_Inspiron_15_3525",      source: "iFixit Est." },
  { keywords: ["dell inspiron 14"],     score: 7,  parts: "Gut verfügbar",            guide: "Dell_Inspiron_14",           source: "iFixit Est." },
  { keywords: ["dell latitude"],        score: 8,  parts: "Gut verfügbar (Business)", guide: "Dell_Latitude_5540",         source: "iFixit Score 8/10" },
  { keywords: ["dell alienware"],       score: 5,  parts: "Verfügbar",                guide: "Alienware_m18_R2",           source: "iFixit Est." },
  // HP
  { keywords: ["hp spectre x360"],      score: 4,  parts: "Begrenzt",                 guide: "HP_Spectre_x360_14",         source: "iFixit Est." },
  { keywords: ["hp envy"],              score: 5,  parts: "Verfügbar",                guide: "HP_Envy_x360",               source: "iFixit Est." },
  { keywords: ["hp elitebook"],         score: 8,  parts: "Gut verfügbar (Business)", guide: "HP_EliteBook_840_G10",       source: "iFixit Score 8/10" },
  { keywords: ["hp pavilion"],          score: 7,  parts: "Gut verfügbar",            guide: "HP_Pavilion_15",             source: "iFixit Est." },
  { keywords: ["hp omen"],              score: 5,  parts: "Verfügbar",                guide: "HP_OMEN_16",                 source: "iFixit Est." },
  { keywords: ["hp chromebook"],        score: 6,  parts: "Verfügbar",                guide: "HP_Chromebook",              source: "iFixit Est." },
  // Lenovo
  { keywords: ["thinkpad x1 carbon"],   score: 8,  parts: "Gut verfügbar (Business)", guide: "Lenovo_ThinkPad_X1_Carbon_Gen_11", source: "iFixit Score 8/10" },
  { keywords: ["thinkpad x1 yoga"],     score: 7,  parts: "Gut verfügbar",            guide: "Lenovo_ThinkPad_X1_Yoga",    source: "iFixit Est." },
  { keywords: ["thinkpad t14"],         score: 8,  parts: "Gut verfügbar (Business)", guide: "Lenovo_ThinkPad_T14_Gen_4",  source: "iFixit Score 8/10" },
  { keywords: ["thinkpad"],             score: 8,  parts: "Gut verfügbar (Business)", guide: "Lenovo_ThinkPad",            source: "iFixit Score 8/10 Durchschnitt" },
  { keywords: ["lenovo ideapad 5"],     score: 6,  parts: "Verfügbar",                guide: "Lenovo_IdeaPad_5",           source: "iFixit Est." },
  { keywords: ["lenovo ideapad"],       score: 6,  parts: "Verfügbar",                guide: "Lenovo_IdeaPad",             source: "iFixit Est." },
  { keywords: ["lenovo yoga"],          score: 5,  parts: "Begrenzt",                 guide: "Lenovo_Yoga_9i",             source: "iFixit Est." },
  { keywords: ["legion 7i"],            score: 7,  parts: "Gut verfügbar",            guide: "Lenovo_Legion_7i",           source: "iFixit Est." },
  { keywords: ["legion 5i"],            score: 7,  parts: "Gut verfügbar",            guide: "Lenovo_Legion_5i",           source: "iFixit Est." },
  { keywords: ["legion"],               score: 7,  parts: "Gut verfügbar",            guide: "Lenovo_Legion",              source: "iFixit Est." },
  // Microsoft
  { keywords: ["surface laptop 6"],     score: 3,  parts: "Sehr begrenzt",            guide: "Microsoft_Surface_Laptop_6", source: "iFixit Score 2/10 Avg." },
  { keywords: ["surface laptop 5"],     score: 2,  parts: "Sehr begrenzt",            guide: "Microsoft_Surface_Laptop_5", source: "iFixit Score 2/10 2022" },
  { keywords: ["surface laptop"],       score: 2,  parts: "Sehr begrenzt",            guide: "Microsoft_Surface_Laptop",   source: "iFixit Score 2/10" },
  { keywords: ["surface pro 11"],       score: 3,  parts: "Sehr begrenzt",            guide: "Microsoft_Surface_Pro_11",   source: "iFixit Est." },
  { keywords: ["surface pro"],          score: 2,  parts: "Sehr begrenzt",            guide: "Microsoft_Surface_Pro",      source: "iFixit Score 2/10" },
  // Asus
  { keywords: ["asus zenbook"],         score: 5,  parts: "Verfügbar",                guide: "Asus_ZenBook",               source: "iFixit Est." },
  { keywords: ["asus rog"],             score: 6,  parts: "Verfügbar",                guide: "Asus_ROG",                   source: "iFixit Est." },
  { keywords: ["asus vivobook"],        score: 6,  parts: "Verfügbar",                guide: "Asus_VivoBook",              source: "iFixit Est." },
  // Acer
  { keywords: ["acer aspire"],          score: 7,  parts: "Gut verfügbar",            guide: "Acer_Aspire",                source: "iFixit Est." },
  { keywords: ["acer swift"],           score: 5,  parts: "Begrenzt",                 guide: "Acer_Swift",                 source: "iFixit Est." },
  { keywords: ["acer predator"],        score: 6,  parts: "Verfügbar",                guide: "Acer_Predator",              source: "iFixit Est." },
  { keywords: ["acer chromebook"],      score: 6,  parts: "Verfügbar",                guide: "Acer_Chromebook",            source: "iFixit Est." },

  // ══════════════════════════════════════════════════════
  //  TABLETS
  // ══════════════════════════════════════════════════════
  { keywords: ["galaxy tab s10 ultra"], score: 3, parts: "Sehr begrenzt",            guide: "Samsung_Galaxy_Tab_S10_Ultra", source: "iFixit Est." },
  { keywords: ["galaxy tab s10"],       score: 3, parts: "Sehr begrenzt",            guide: "Samsung_Galaxy_Tab_S10",     source: "iFixit Est." },
  { keywords: ["galaxy tab s9 ultra"],  score: 3, parts: "Sehr begrenzt",            guide: "Samsung_Galaxy_Tab_S9_Ultra", source: "iFixit Est." },
  { keywords: ["galaxy tab s9"],        score: 3, parts: "Sehr begrenzt",            guide: "Samsung_Galaxy_Tab_S9",      source: "iFixit Est." },
  { keywords: ["galaxy tab a9"],        score: 5, parts: "Begrenzt",                 guide: "Samsung_Galaxy_Tab_A9",      source: "iFixit Est." },

  // ══════════════════════════════════════════════════════
  //  SMART HOME / STREAMING
  // ══════════════════════════════════════════════════════
  { keywords: ["amazon echo show 10"],  score: 5, parts: "Begrenzt",                 guide: "Amazon_Echo_Show_10",        source: "iFixit Teardown" },
  { keywords: ["amazon echo show"],     score: 4, parts: "Begrenzt",                 guide: "Amazon_Echo_Show",           source: "iFixit Est." },
  { keywords: ["amazon echo dot"],      score: 4, parts: "Begrenzt",                 guide: "Amazon_Echo_Dot_5th_Generation", source: "iFixit Teardown" },
  { keywords: ["amazon echo"],          score: 4, parts: "Begrenzt",                 guide: "Amazon_Echo",                source: "iFixit Est." },
  { keywords: ["google nest hub max"],  score: 5, parts: "Begrenzt",                 guide: "Google_Nest_Hub_Max",        source: "iFixit Teardown" },
  { keywords: ["google nest hub"],      score: 4, parts: "Begrenzt",                 guide: "Google_Nest_Hub",            source: "iFixit Teardown" },
  { keywords: ["google nest mini"],     score: 3, parts: "Sehr begrenzt",            guide: "Google_Nest_Mini",           source: "iFixit Teardown" },
  { keywords: ["apple tv 4k"],          score: 7, parts: "Gut verfügbar",            guide: "Apple_TV_4K_3rd_Generation", source: "iFixit Score 7/10" },
  { keywords: ["fire tv stick 4k max"], score: 4, parts: "Begrenzt",                 guide: "Amazon_Fire_TV_Stick_4K_Max", source: "iFixit Teardown" },
  { keywords: ["fire tv stick"],        score: 3, parts: "Sehr begrenzt",            guide: "Amazon_Fire_TV_Stick",       source: "iFixit Teardown" },
  { keywords: ["chromecast"],           score: 3, parts: "Sehr begrenzt",            guide: "Google_Chromecast",          source: "iFixit Teardown" },
  { keywords: ["nvidia shield tv"],     score: 6, parts: "Verfügbar",                guide: "NVIDIA_Shield_TV",           source: "iFixit Teardown" },

  // ══════════════════════════════════════════════════════
  //  WEARABLES
  // ══════════════════════════════════════════════════════
  { keywords: ["garmin fenix 8"],       score: 6, parts: "Verfügbar",                guide: "Garmin_Fenix_8",             source: "iFixit Est." },
  { keywords: ["garmin fenix 7"],       score: 6, parts: "Verfügbar",                guide: "Garmin_Fenix_7",             source: "iFixit Est." },
  { keywords: ["garmin forerunner"],    score: 6, parts: "Verfügbar",                guide: "Garmin_Forerunner_965",      source: "iFixit Est." },
  { keywords: ["garmin"],               score: 6, parts: "Verfügbar",                guide: "Garmin",                     source: "iFixit Est." },
  { keywords: ["fitbit charge 6"],      score: 4, parts: "Begrenzt",                 guide: "Fitbit_Charge_6",            source: "iFixit Teardown 2023" },
  { keywords: ["fitbit sense"],         score: 4, parts: "Begrenzt",                 guide: "Fitbit_Sense_2",             source: "iFixit Teardown" },
  { keywords: ["galaxy watch ultra"],    score: 5, parts: "Begrenzt",               guide: "Samsung_Galaxy_Watch_Ultra", source: "iFixit Teardown 2024" },
  { keywords: ["galaxy watch 7"],        score: 5, parts: "Begrenzt",               guide: "Samsung_Galaxy_Watch7",      source: "iFixit Teardown 2024" },
  { keywords: ["galaxy watch 6 classic"],score: 5, parts: "Begrenzt",               guide: "Samsung_Galaxy_Watch6_Classic", source: "iFixit Est." },
  { keywords: ["galaxy watch 6"],        score: 5, parts: "Begrenzt",               guide: "Samsung_Galaxy_Watch6",      source: "iFixit Teardown 2023" },
  { keywords: ["galaxy watch 5 pro"],    score: 5, parts: "Begrenzt",               guide: "Samsung_Galaxy_Watch5_Pro",  source: "iFixit Est." },
  { keywords: ["galaxy watch 5"],        score: 5, parts: "Begrenzt",               guide: "Samsung_Galaxy_Watch5",      source: "iFixit Est." },
  { keywords: ["galaxy watch 4"],        score: 5, parts: "Begrenzt",               guide: "Samsung_Galaxy_Watch4",      source: "iFixit Teardown 2021" },

  // ── Google Pixel Watch ────────────────────────────────────
  { keywords: ["pixel watch 3"],        score: 5, parts: "Begrenzt",                 guide: "Google_Pixel_Watch_3",       source: "iFixit Teardown 2024" },
  { keywords: ["pixel watch 2"],        score: 5, parts: "Begrenzt",                 guide: "Google_Pixel_Watch_2",       source: "iFixit Teardown 2023" },
  { keywords: ["pixel watch"],          score: 4, parts: "Begrenzt",                 guide: "Google_Pixel_Watch",         source: "iFixit Teardown 2022" },

  // ── Garmin (erweitert) ────────────────────────────────────
  { keywords: ["garmin fenix 8 amoled"],score: 6, parts: "Verfügbar",               guide: "Garmin_Fenix_8",             source: "iFixit Est. 2024" },
  { keywords: ["garmin forerunner 965"],score: 6, parts: "Verfügbar",               guide: "Garmin_Forerunner_965",      source: "iFixit Est. 2023" },
  { keywords: ["garmin forerunner 265"],score: 6, parts: "Verfügbar",               guide: "Garmin_Forerunner_265",      source: "iFixit Est. 2023" },
  { keywords: ["garmin venu 3"],        score: 6, parts: "Verfügbar",               guide: "Garmin_Venu_3",              source: "iFixit Est." },
  { keywords: ["garmin epix"],          score: 6, parts: "Verfügbar",               guide: "Garmin_Epix",                source: "iFixit Est." },
  { keywords: ["garmin instinct 2"],    score: 7, parts: "Gut verfügbar",           guide: "Garmin_Instinct_2",          source: "iFixit Est." },

  // ── Fitbit / Withings ────────────────────────────────────
  { keywords: ["fitbit versa 4"],       score: 4, parts: "Begrenzt",                 guide: "Fitbit_Versa_4",             source: "iFixit Teardown" },
  { keywords: ["fitbit versa 3"],       score: 4, parts: "Begrenzt",                 guide: "Fitbit_Versa_3",             source: "iFixit Teardown" },
  { keywords: ["fitbit inspire 3"],     score: 3, parts: "Sehr begrenzt",            guide: "Fitbit_Inspire_3",           source: "iFixit Teardown" },
  { keywords: ["withings scanwatch 2"], score: 5, parts: "Begrenzt",                 guide: "Withings_ScanWatch_2",       source: "iFixit Est." },
  { keywords: ["withings scanwatch"],   score: 5, parts: "Begrenzt",                 guide: "Withings_ScanWatch",         source: "iFixit Est." },

  // ── Huawei Watch ─────────────────────────────────────────
  { keywords: ["huawei watch gt 4"],    score: 4, parts: "Begrenzt",                 guide: "Huawei_Watch_GT4",           source: "iFixit Est." },
  { keywords: ["huawei watch gt 3"],    score: 4, parts: "Begrenzt",                 guide: "Huawei_Watch_GT3",           source: "iFixit Est." },

  { keywords: ["oura ring"],            score: 3, parts: "Sehr begrenzt",            guide: "Oura_Ring_4",                source: "iFixit Teardown" },

  // ══════════════════════════════════════════════════════
  //  E-READER
  // ══════════════════════════════════════════════════════
  { keywords: ["kindle scribe"],        score: 5, parts: "Begrenzt",                 guide: "Amazon_Kindle_Scribe",       source: "iFixit Teardown" },
  { keywords: ["kindle oasis"],         score: 6, parts: "Verfügbar",                guide: "Amazon_Kindle_Oasis",        source: "iFixit Teardown" },
  { keywords: ["kindle paperwhite"],    score: 6, parts: "Verfügbar",                guide: "Amazon_Kindle_Paperwhite_5", source: "iFixit Teardown" },
  { keywords: ["kindle"],               score: 5, parts: "Begrenzt",                 guide: "Amazon_Kindle",              source: "iFixit Est." },
  { keywords: ["kobo libra"],           score: 7, parts: "Gut verfügbar",            guide: "Kobo_Libra_2",               source: "iFixit Teardown" },
  { keywords: ["kobo clara"],           score: 7, parts: "Gut verfügbar",            guide: "Kobo_Clara_2E",              source: "iFixit Teardown" },

  // ══════════════════════════════════════════════════════
  //  SONSTIGE KATEGORIE-FALLBACKS
  // ══════════════════════════════════════════════════════
  // ── Kameras ──────────────────────────────────────────────
  // Sony Alpha Mirrorless
  { keywords: ["sony a7 v"],           score: 6, parts: "Verfügbar",                guide: "Sony_Alpha_7_V",             source: "iFixit Teardown 2024" },
  { keywords: ["sony a7 iv"],          score: 6, parts: "Verfügbar",                guide: "Sony_Alpha_7_IV",            source: "iFixit Teardown 2021" },
  { keywords: ["sony a7 iii"],         score: 6, parts: "Verfügbar",                guide: "Sony_Alpha_7_III",           source: "iFixit Est." },
  { keywords: ["sony a6700"],          score: 5, parts: "Begrenzt",                 guide: "Sony_Alpha_6700",            source: "iFixit Teardown 2023" },
  { keywords: ["sony zv-e10"],         score: 6, parts: "Verfügbar",                guide: "Sony_ZV-E10",                source: "iFixit Est." },
  { keywords: ["sony rx100"],          score: 5, parts: "Begrenzt",                 guide: "Sony_Cyber-shot_DSC-RX100",  source: "iFixit Est." },
  // Canon
  { keywords: ["canon eos r6 mark ii"],score: 5, parts: "Begrenzt",                 guide: "Canon_EOS_R6_Mark_II",       source: "iFixit Est." },
  { keywords: ["canon eos r6"],        score: 5, parts: "Begrenzt",                 guide: "Canon_EOS_R6",               source: "iFixit Est." },
  { keywords: ["canon eos r50"],       score: 6, parts: "Verfügbar",                guide: "Canon_EOS_R50",              source: "iFixit Est." },
  { keywords: ["canon eos m50"],       score: 6, parts: "Verfügbar",                guide: "Canon_EOS_M50_Mark_II",      source: "iFixit Teardown" },
  { keywords: ["canon powershot"],     score: 5, parts: "Begrenzt",                 guide: "Canon_PowerShot",            source: "iFixit Est." },
  // Nikon
  { keywords: ["nikon z8"],            score: 5, parts: "Begrenzt",                 guide: "Nikon_Z8",                   source: "iFixit Est." },
  { keywords: ["nikon z6 iii"],        score: 5, parts: "Begrenzt",                 guide: "Nikon_Z6III",                source: "iFixit Est." },
  { keywords: ["nikon z50"],           score: 6, parts: "Verfügbar",                guide: "Nikon_Z50",                  source: "iFixit Est." },
  { keywords: ["nikon d3500"],         score: 7, parts: "Gut verfügbar",            guide: "Nikon_D3500",                source: "iFixit Teardown" },
  // GoPro / Action Cams
  { keywords: ["gopro hero 13"],       score: 7, parts: "Gut verfügbar",            guide: "GoPro_HERO13_Black",         source: "iFixit Score 7/10 2023" },
  { keywords: ["gopro hero 12"],       score: 7, parts: "Gut verfügbar",            guide: "GoPro_HERO12_Black",         source: "iFixit Score 7/10 2023" },
  { keywords: ["gopro hero 11"],       score: 6, parts: "Verfügbar",                guide: "GoPro_HERO11_Black",         source: "iFixit Score 6/10 2022" },
  { keywords: ["gopro"],               score: 6, parts: "Verfügbar",                guide: "GoPro",                      source: "iFixit Est." },
  { keywords: ["dji osmo action 5"],   score: 5, parts: "Begrenzt",                 guide: "DJI_Osmo_Action_5_Pro",      source: "iFixit Est." },
  { keywords: ["insta360 x4"],         score: 5, parts: "Begrenzt",                 guide: "Insta360_X4",                source: "iFixit Est." },

  // ── Haushaltsgeräte ──────────────────────────────────────
  { keywords: ["roomba"],               score: 6, parts: "Gut verfügbar",            guide: "iRobot_Roomba",              source: "iFixit Est." },
  { keywords: ["dyson v15"],            score: 6, parts: "Verfügbar",                guide: "Dyson_V15_Detect",           source: "iFixit Teardown" },
  { keywords: ["dyson v12"],            score: 6, parts: "Verfügbar",                guide: "Dyson_V12_Detect",           source: "iFixit Teardown" },
  { keywords: ["dyson airwrap"],        score: 4, parts: "Begrenzt",                 guide: "Dyson_Airwrap",              source: "iFixit Teardown" },
];

// ╔══════════════════════════════════════════════════════════╗
//  KATEGORIE-FALLBACK (wenn kein Eintrag matched)
// ╚══════════════════════════════════════════════════════════╝
const CATEGORY_FALLBACK = {
  smartphone:  { score: 5, parts: "Variiert je nach Modell" },
  laptop:      { score: 5, parts: "Variiert je nach Modell" },
  tablet:      { score: 4, parts: "Oft begrenzt" },
  headphones:  { score: 5, parts: "Variiert" },
  gaming:      { score: 6, parts: "Meist verfügbar" },
  wearable:    { score: 4, parts: "Oft begrenzt" },
  default:     { score: 4, parts: "Unbekannt" },
};


// ╔══════════════════════════════════════════════════════════╗
//  REPARATURKOSTEN-DATENBANK
//  Quellen: iFixit Parts Store 2024, Handyreparatur.de 2024,
//           Apple Self Repair Store DE 2024, uBreakiFix Preise
//  Format: { part, costMin, costMax, diyMin, diyMax, lifespan, unit }
//  costMin/Max: Werkstattpreis in €
//  diyMin/Max:  Selbst-Reparatur (nur Teile) in €
//  lifespan:    erwartete Gerätelebensdauer in Jahren nach Reparatur
// ╚══════════════════════════════════════════════════════════╝
const REPAIR_COST_DB = [
  // ── iPhones ──────────────────────────────────────────────
  { keywords: ["iphone 16 pro max"], repairs: [
    { part: "Akku", costMin: 119, costMax: 149, diyMin: 89,  diyMax: 99,  lifespan: 2.5 },
    { part: "Display", costMin: 299, costMax: 379, diyMin: 189, diyMax: 229, lifespan: 3 },
    { part: "Rückkamera", costMin: 199, costMax: 249, diyMin: null, diyMax: null, lifespan: 3 },
  ]},
  { keywords: ["iphone 16 pro"], repairs: [
    { part: "Akku", costMin: 109, costMax: 139, diyMin: 79,  diyMax: 89,  lifespan: 2.5 },
    { part: "Display", costMin: 279, costMax: 349, diyMin: 179, diyMax: 219, lifespan: 3 },
  ]},
  { keywords: ["iphone 16"], repairs: [
    { part: "Akku", costMin: 99,  costMax: 129, diyMin: 69,  diyMax: 79,  lifespan: 2.5 },
    { part: "Display", costMin: 249, costMax: 319, diyMin: 159, diyMax: 199, lifespan: 3 },
  ]},
  { keywords: ["iphone 15 pro max"], repairs: [
    { part: "Akku", costMin: 99,  costMax: 129, diyMin: 79,  diyMax: 89,  lifespan: 2.5 },
    { part: "Display", costMin: 269, costMax: 339, diyMin: 169, diyMax: 209, lifespan: 3 },
  ]},
  { keywords: ["iphone 15 pro"], repairs: [
    { part: "Akku", costMin: 89,  costMax: 119, diyMin: 69,  diyMax: 79,  lifespan: 2.5 },
    { part: "Display", costMin: 249, costMax: 309, diyMin: 159, diyMax: 189, lifespan: 3 },
  ]},
  { keywords: ["iphone 15"], repairs: [
    { part: "Akku", costMin: 79,  costMax: 109, diyMin: 59,  diyMax: 69,  lifespan: 2.5 },
    { part: "Display", costMin: 229, costMax: 279, diyMin: 149, diyMax: 179, lifespan: 3 },
  ]},
  { keywords: ["iphone 14 pro"], repairs: [
    { part: "Akku", costMin: 79,  costMax: 109, diyMin: 59,  diyMax: 69,  lifespan: 2.5 },
    { part: "Display", costMin: 239, costMax: 299, diyMin: 149, diyMax: 179, lifespan: 3 },
  ]},
  { keywords: ["iphone 14"], repairs: [
    { part: "Akku", costMin: 69,  costMax: 99,  diyMin: 49,  diyMax: 59,  lifespan: 2.5 },
    { part: "Display", costMin: 209, costMax: 259, diyMin: 129, diyMax: 159, lifespan: 3 },
  ]},
  { keywords: ["iphone 13"], repairs: [
    { part: "Akku", costMin: 59,  costMax: 89,  diyMin: 39,  diyMax: 49,  lifespan: 2 },
    { part: "Display", costMin: 179, costMax: 229, diyMin: 109, diyMax: 139, lifespan: 3 },
  ]},
  { keywords: ["iphone 12"], repairs: [
    { part: "Akku", costMin: 49,  costMax: 79,  diyMin: 29,  diyMax: 39,  lifespan: 2 },
    { part: "Display", costMin: 149, costMax: 199, diyMin: 89,  diyMax: 119, lifespan: 3 },
  ]},
  { keywords: ["iphone se"], repairs: [
    { part: "Akku", costMin: 49,  costMax: 69,  diyMin: 25,  diyMax: 35,  lifespan: 2 },
    { part: "Display", costMin: 99,  costMax: 139, diyMin: 59,  diyMax: 79,  lifespan: 3 },
  ]},

  // ── Samsung Galaxy ────────────────────────────────────────
  { keywords: ["galaxy s25 ultra"], repairs: [
    { part: "Akku", costMin: 79,  costMax: 109, diyMin: null, diyMax: null, lifespan: 2.5 },
    { part: "Display", costMin: 249, costMax: 319, diyMin: null, diyMax: null, lifespan: 3 },
  ]},
  { keywords: ["galaxy s25"], repairs: [
    { part: "Akku", costMin: 69,  costMax: 99,  diyMin: null, diyMax: null, lifespan: 2.5 },
    { part: "Display", costMin: 199, costMax: 269, diyMin: null, diyMax: null, lifespan: 3 },
  ]},
  { keywords: ["galaxy s24"], repairs: [
    { part: "Akku", costMin: 59,  costMax: 89,  diyMin: null, diyMax: null, lifespan: 2.5 },
    { part: "Display", costMin: 179, costMax: 249, diyMin: null, diyMax: null, lifespan: 3 },
  ]},
  { keywords: ["galaxy s23"], repairs: [
    { part: "Akku", costMin: 49,  costMax: 79,  diyMin: null, diyMax: null, lifespan: 2 },
    { part: "Display", costMin: 149, costMax: 219, diyMin: null, diyMax: null, lifespan: 3 },
  ]},
  { keywords: ["galaxy a55"], repairs: [
    { part: "Akku", costMin: 39,  costMax: 59,  diyMin: 19,  diyMax: 29,  lifespan: 2.5 },
    { part: "Display", costMin: 89,  costMax: 129, diyMin: 49,  diyMax: 69,  lifespan: 3 },
  ]},

  // ── Google Pixel ──────────────────────────────────────────
  { keywords: ["pixel 9 pro"], repairs: [
    { part: "Akku", costMin: 79,  costMax: 109, diyMin: 49,  diyMax: 59,  lifespan: 2.5 },
    { part: "Display", costMin: 199, costMax: 269, diyMin: 129, diyMax: 169, lifespan: 3 },
  ]},
  { keywords: ["pixel 9"], repairs: [
    { part: "Akku", costMin: 69,  costMax: 99,  diyMin: 39,  diyMax: 49,  lifespan: 2.5 },
    { part: "Display", costMin: 169, costMax: 229, diyMin: 109, diyMax: 149, lifespan: 3 },
  ]},
  { keywords: ["pixel 8"], repairs: [
    { part: "Akku", costMin: 59,  costMax: 89,  diyMin: 29,  diyMax: 39,  lifespan: 2.5 },
    { part: "Display", costMin: 149, costMax: 199, diyMin: 89,  diyMax: 119, lifespan: 3 },
  ]},

  // ── MacBooks ──────────────────────────────────────────────
  { keywords: ["macbook pro 16"], repairs: [
    { part: "Akku", costMin: 199, costMax: 279, diyMin: null, diyMax: null, lifespan: 3 },
    { part: "Tastatur", costMin: 249, costMax: 399, diyMin: null, diyMax: null, lifespan: 4 },
    { part: "Display", costMin: 499, costMax: 799, diyMin: null, diyMax: null, lifespan: 4 },
  ]},
  { keywords: ["macbook pro 14"], repairs: [
    { part: "Akku", costMin: 189, costMax: 259, diyMin: null, diyMax: null, lifespan: 3 },
    { part: "Tastatur", costMin: 229, costMax: 379, diyMin: null, diyMax: null, lifespan: 4 },
  ]},
  { keywords: ["macbook air"], repairs: [
    { part: "Akku", costMin: 149, costMax: 219, diyMin: null, diyMax: null, lifespan: 3 },
    { part: "Tastatur", costMin: 199, costMax: 329, diyMin: null, diyMax: null, lifespan: 4 },
  ]},

  // ── ThinkPad / Dell ───────────────────────────────────────
  { keywords: ["thinkpad"], repairs: [
    { part: "Akku", costMin: 49,  costMax: 89,  diyMin: 29,  diyMax: 49,  lifespan: 3 },
    { part: "Display", costMin: 149, costMax: 249, diyMin: 79,  diyMax: 129, lifespan: 4 },
    { part: "Tastatur", costMin: 59,  costMax: 99,  diyMin: 29,  diyMax: 49,  lifespan: 4 },
  ]},
  { keywords: ["dell xps"], repairs: [
    { part: "Akku", costMin: 59,  costMax: 99,  diyMin: 39,  diyMax: 59,  lifespan: 3 },
    { part: "Display", costMin: 199, costMax: 299, diyMin: 99,  diyMax: 149, lifespan: 4 },
  ]},

  // ── PlayStation / Xbox ────────────────────────────────────
  { keywords: ["playstation 5"], repairs: [
    { part: "Lüfter reinigen", costMin: 30, costMax: 60,  diyMin: 0,   diyMax: 0,   lifespan: 2 },
    { part: "SSD erweitern", costMin: 59, costMax: 129, diyMin: 49,  diyMax: 99,  lifespan: 3 },
  ]},
  { keywords: ["xbox series x"], repairs: [
    { part: "Lüfter reinigen", costMin: 30, costMax: 60,  diyMin: 0,   diyMax: 0,   lifespan: 2 },
    { part: "SSD erweitern", costMin: 59, costMax: 119, diyMin: 49,  diyMax: 89,  lifespan: 3 },
  ]},

  // ── AirPods ───────────────────────────────────────────────
  { keywords: ["airpods pro 2"], repairs: [
    { part: "Akku (1 Ohrhörer)", costMin: 99, costMax: 119, diyMin: null, diyMax: null, lifespan: 2 },
  ]},
  { keywords: ["airpods max"], repairs: [
    { part: "Ohrpolster", costMin: 89, costMax: 109, diyMin: 79, diyMax: 89, lifespan: 2 },
  ]},

  // ── Fairphone ─────────────────────────────────────────────
  { keywords: ["fairphone 5"], repairs: [
    { part: "Akku",   costMin: 29, costMax: 39, diyMin: 29, diyMax: 29, lifespan: 5 },
    { part: "Display", costMin: 89, costMax: 99, diyMin: 89, diyMax: 89, lifespan: 5 },
    { part: "Kamera", costMin: 49, costMax: 59, diyMin: 49, diyMax: 49, lifespan: 5 },
  ]},
  { keywords: ["fairphone 4"], repairs: [
    { part: "Akku",   costMin: 29, costMax: 39, diyMin: 29, diyMax: 29, lifespan: 5 },
    { part: "Display", costMin: 79, costMax: 89, diyMin: 79, diyMax: 79, lifespan: 5 },
  ]},
];


// ╔══════════════════════════════════════════════════════════╗
//  IFixitService
// ╚══════════════════════════════════════════════════════════╝
const IFixitService = {
  _mode: "db",  // "db" | "api" – wird beim Boot aus chrome.storage geladen

  async loadMode() {
    return new Promise(resolve => {
      if (typeof chrome !== "undefined" && chrome.storage) {
        chrome.storage.local.get(["sourceModeRepair"], d => {
          this._mode = d.sourceModeRepair || "db";
          resolve(this._mode);
        });
      } else { resolve("db"); }
    });
  },

  // Gibt true zurück wenn Live-API verwendet werden soll
  useLiveApi() { return this._mode === "api"; },

  /**
   * Reparaturkosten-Schätzung für ein Produkt.
   * @param {string} title  Amazon-Produkttitel
   * @returns {{ repairs: Array, worthIt: boolean }|null}
   */
  getRepairCost(title) {
    if (!title) return null;
    const t = title.toLowerCase();
    let best = null, bestLen = 0;
    for (const entry of REPAIR_COST_DB) {
      if (entry.keywords.every(k => t.includes(k))) {
        const len = entry.keywords.join("").length;
        if (len > bestLen) { best = entry; bestLen = len; }
      }
    }
    return best ? { repairs: best.repairs } : null;
  },



  /**
   * Gibt den Reparierbarkeits-Score zurück.
   * Im DB-Modus: sofort, offline.
   * Im API-Modus: Live-Lookup via iFixit API (Proxy).
   *
   * @param {string} title  Amazon-Produkttitel
   * @returns {Promise<object>|object} RepairResult
   */
  getRepairScore(title) {
    if (!title) return this._mode === "api" ? Promise.resolve(null) : null;

    // ── API-Modus: Live-Lookup ────────────────────────────────
    if (this._mode === "api") {
      return this._liveApiLookup(title);
    }

    // ── DB-Modus: synchron aus interner DB ───────────────────
    return this._dbLookup(title);
  },

  // Synchroner DB-Lookup (intern)
  _dbLookup(title) {
    const t = title.toLowerCase();
    let best    = null;
    let bestLen = 0;

    for (const entry of REPAIR_DB) {
      const allMatch = entry.keywords.every(kw => t.includes(kw));
      if (!allMatch) continue;
      const totalLen = entry.keywords.join(" ").length;
      if (totalLen > bestLen) { best = entry; bestLen = totalLen; }
    }

    return best
      ? this._buildResult(best.score, best.parts, best.guide, title, best.source)
      : this._categoryFallback(title.toLowerCase(), title);
  },

  // Asynchroner iFixit API-Lookup via Background-Proxy
  async _liveApiLookup(title) {
    const query = EcoTrace._cleanSearchQuery
      ? EcoTrace._cleanSearchQuery(title)
      : title.replace(/[\(\[].*?[\)\]]/g, "").replace(/,.*$/, "").trim().substring(0, 40);

    const searchUrl = `https://www.ifixit.com/api/2.0/search/${encodeURIComponent(query)}?doctypes=device&limit=8`;

    try {
      // Über Background-Proxy (CORS-frei)
      const raw = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          { type: "FETCH_PROXY", url: searchUrl, options: { headers: { "Accept": "application/json" } } },
          resp => {
            if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
            resolve(resp);
          }
        );
      });

      if (!raw?.ok) throw new Error(`HTTP ${raw?.status}`);
      const data = JSON.parse(raw.body);
      const results = data.results || [];
      if (!results.length) throw new Error("Keine Ergebnisse");

      // Bestes Match wählen
      const qTokens  = new Set(query.toLowerCase().split(/\s+/));
      let bestResult = null, bestScore = -1;
      for (const r of results) {
        const rTitle  = (r.title || "").toLowerCase();
        const rTokens = rTitle.split(/\s+/);
        const overlap = rTokens.filter(t => qTokens.has(t)).length;
        const ratio   = overlap / Math.max(qTokens.size, rTokens.length);
        const exact   = rTitle.includes(query.toLowerCase()) ? 0.3 : 0;
        if (ratio + exact > bestScore) { bestScore = ratio + exact; bestResult = r; }
      }
      if (!bestResult || bestScore < 0.2) throw new Error("Kein guter Match");

      // Device-Details laden
      const deviceId = (bestResult.url || "").match(/\/(?:Device|device)\/([^/?#]+)/)?.[1];
      let score = 5, parts = "Verfügbar", source = "iFixit Live";

      if (deviceId) {
        const detailUrl = `https://www.ifixit.com/api/2.0/devices/${encodeURIComponent(deviceId)}`;
        const detailRaw = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { type: "FETCH_PROXY", url: detailUrl, options: { headers: { "Accept": "application/json" } } },
            resp => {
              if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
              resolve(resp);
            }
          );
        });

        if (detailRaw?.ok) {
          const dev = JSON.parse(detailRaw.body);
          const raw_score = parseFloat(dev.repairability ?? dev.repairabilityScore ?? 0);
          if (raw_score >= 1) score = Math.round(raw_score);
          source = `iFixit Live · ${dev.title || bestResult.title}`;
        }
      }

      const disp = SCORE_DISPLAY.find(d => score <= d.max) || SCORE_DISPLAY[SCORE_DISPLAY.length - 1];
      const q    = encodeURIComponent(query);
      return {
        score,
        label:       disp.label,
        color:       disp.color,
        bg:          disp.bg,
        deviceName:  bestResult.title || title,
        guideCount:  0,
        parts,
        partsLabel:  parts,
        source,
        dataAge:     (typeof window!=="undefined"&&window.t?window.t("repair_live_label"):"Live von iFixit"),
        guideUrl:    deviceId
          ? `https://de.ifixit.com/Device/${deviceId}`
          : `https://de.ifixit.com/Search#query=${q}`,
        partsUrl:    deviceId
          ? `https://www.ifixit.com/Store/Parts/${deviceId}`
          : "https://www.ifixit.com/Store",
        searchUrl:   `https://de.ifixit.com/Search#query=${q}`,
        source_type: "live",
      };

    } catch (e) {
      console.warn("[IFixitService] Live-API Fehler, fallback auf DB:", e.message);
      // Fallback auf DB-Wert
      const dbResult = this._dbLookup(title);
      if (dbResult) {
        dbResult.dataAge = (typeof window!=="undefined"&&window.t?window.t("repair_fallback"):"DB (API nicht erreichbar)");
        dbResult.source  += " · Fallback";
      }
      return dbResult;
    }
  },

  _buildResult(score, parts, guide, title, source) {
    const display = SCORE_DISPLAY.find(d => score <= d.max) || SCORE_DISPLAY[SCORE_DISPLAY.length - 1];
    const q       = encodeURIComponent(
      (typeof EcoTrace !== "undefined" && EcoTrace._cleanSearchQuery)
        ? EcoTrace._cleanSearchQuery(title)
        : title.substring(0, 40).trim()
    );

    return {
      score,
      label:      display.label,
      color:      display.color,
      bg:         display.bg,
      deviceName: (guide || "").replace(/_/g, " "),
      guideCount: 0,         // Offline-DB hat keine Guide-Anzahl
      parts,
      partsLabel: parts,
      source:     source || "iFixit DB",
      dataAge:    (typeof window!=="undefined"&&window.t?window.t("repair_db_label"):"Eingebaute Datenbank"),
      guideUrl:   guide
        ? `https://de.ifixit.com/Device/${guide}`
        : `https://de.ifixit.com/Search#query=${q}`,
      partsUrl:   guide
        ? `https://www.ifixit.com/Store/Parts/${guide}`
        : `https://www.ifixit.com/Store`,
      searchUrl:  `https://de.ifixit.com/Search#query=${q}`,
      // Immer "static" – kein API-Aufruf
      source_type: this._mode === "api" ? "live_db" : "static",
    };
  },

  _categoryFallback(titleLower, originalTitle) {
    let cat = "default";
    if (/iphone|galaxy s|pixel|smartphone|handy/.test(titleLower))   cat = "smartphone";
    else if (/macbook|laptop|notebook|thinkpad/.test(titleLower))    cat = "laptop";
    else if (/ipad|galaxy tab|surface pro|tablet/.test(titleLower))  cat = "tablet";
    else if (/airpod|kopfhörer|headphone|wh-|buds|earbud/.test(titleLower)) cat = "headphones";
    else if (/playstation|xbox|nintendo|steam deck/.test(titleLower)) cat = "gaming";
    else if (/watch|fitbit|garmin|oura/.test(titleLower))            cat = "wearable";

    const fb = CATEGORY_FALLBACK[cat];
    return this._buildResult(fb.score, fb.parts, null, originalTitle, `Kategorie-Schätzung (${cat})`);
  },

  // Wrench-Icons für UI
  buildWrenchIcons(score) {
    return [...Array(10)].map((_, i) => {
      const on = i < score;
      return `<svg width="12" height="12" viewBox="0 0 24 24" class="wrench ${on ? "on" : "off"}">
        <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"
              fill="${on ? "#228B22" : "#C8C8B0"}"/>
      </svg>`;
    }).join("");
  },

  // Info für UI: Wie viele Geräte in der DB
  get dbSize() { return REPAIR_DB.length; }
};

window.EcoTrace.IFixitService = IFixitService;
