// ============================================================
//  EcoTrace – carbonLogic.js  v2.0
//  CO₂-Logik · Vorgänger-DB · Plattform-DB · Overpass API
// ============================================================

"use strict";

const EcoTrace = window.EcoTrace || {};

// ╔══════════════════════════════════════════════════════════╗
//  1 · EMISSIONSFAKTOREN
// ╚══════════════════════════════════════════════════════════╝
EcoTrace.carbonRates = {
  textile: {
    polyester:     12.5,
    cotton:         5.5,
    organicCotton:  2.5,
    wool:           8.0,
    nylon:         10.0,
    default:        8.0
  },
  electronics: {
    smartphone:    80.0,
    laptop:       350.0,
    tablet:       100.0,
    headphones:    30.0,
    default:       80.0
  },
  furniture: { wood: 15.0, plastic: 20.0, metal: 25.0, default: 18.0 },
  food:      { beef: 27.0, chicken:  6.9, vegetables: 2.0, default: 5.0 },
  shipping:  { global: 2.0, eu: 1.2, local: 0.3, pickup: 0.0 }
};


// ╔══════════════════════════════════════════════════════════╗
//  2 · VORGÄNGER-DATENBANK
// ╚══════════════════════════════════════════════════════════╝
EcoTrace.predecessorDB = [

  // ── Apple iPhone ────────────────────────────────────────
  { keywords: ["iphone 16 pro max"],
    name: "iPhone 16 Pro Max",
    predecessor: { name: "iPhone 15 Pro Max", perfDelta: -8,
      notes: "A17→A18 Pro: ~8% CPU-Unterschied, im Alltag kaum spürbar",
      searchHint: "iPhone 15 Pro Max" }
  },
  { keywords: ["iphone 16 pro"],
    name: "iPhone 16 Pro",
    predecessor: { name: "iPhone 15 Pro", perfDelta: -7,
      notes: "Kamera-Upgrade minimal – A17 Pro für alle Aufgaben ausreichend",
      searchHint: "iPhone 15 Pro" }
  },
  { keywords: ["iphone 16 plus", "iphone 16plus"],
    name: "iPhone 16 Plus",
    predecessor: { name: "iPhone 15 Plus", perfDelta: -6,
      notes: "Gleiches Display, ähnliche Akkulaufzeit – meist 200-300€ günstiger",
      searchHint: "iPhone 15 Plus" }
  },
  { keywords: ["iphone 16"],
    name: "iPhone 16",
    predecessor: { name: "iPhone 15", perfDelta: -6,
      notes: "Dynamic Island & USB-C bereits im 15 vorhanden",
      searchHint: "iPhone 15" }
  },

  // ── iPhone 17 Serie (erwartet Sept. 2025) ───────────────
  { keywords: ["iphone 17 pro max"],
    name: "iPhone 17 Pro Max",
    predecessor: { name: "iPhone 16 Pro Max", perfDelta: -7,
      notes: "A19 Pro vs A18 Pro: im Alltag kaum spürbar – 16 Pro Max noch top", notesEN: "A19 Pro vs A18 Pro: barely noticeable in daily use – 16 Pro Max still excellent",
      predecessor2: { name: "iPhone 15 Pro Max", perfDelta: -14, priceSave: 40, notes: "2 Generationen zurück – spart ~40%", searchHint: "iPhone 15 Pro Max" },
      searchHint: "iPhone 16 Pro Max" }
  },
  { keywords: ["iphone 17 pro"],
    name: "iPhone 17 Pro",
    predecessor: { name: "iPhone 16 Pro", perfDelta: -7,
      notes: "Kamera-Upgrade minimal – 16 Pro für alle Aufgaben ausreichend", notesEN: "Camera upgrade minimal – 16 Pro sufficient for all tasks",
      predecessor2: { name: "iPhone 15 Pro", perfDelta: -12, priceSave: 38, notes: "2 Generationen zurück – spart ~38%", searchHint: "iPhone 15 Pro" },
      searchHint: "iPhone 16 Pro" }
  },
  { keywords: ["iphone 17 plus", "iphone 17plus"],
    name: "iPhone 17 Plus",
    predecessor: { name: "iPhone 16 Plus", perfDelta: -6,
      notes: "Gleiches Display & Akku – 16 Plus meist 200–300€ günstiger", notesEN: "Same display & battery – 16 Plus usually 200–300€ cheaper",
      searchHint: "iPhone 16 Plus" }
  },
  { keywords: ["iphone 17 air"],
    name: "iPhone 17 Air",
    predecessor: { name: "iPhone 16", perfDelta: -5,
      notes: "iPhone 16 bietet ähnliche Performance bei deutlich niedrigerem Preis", notesEN: "iPhone 16 offers similar performance at a much lower price",
      predecessor2: { name: "iPhone 15", perfDelta: -14, priceSave: 40, notes: "2 Generationen zurück – bis zu 40% günstiger", searchHint: "iPhone 15" },
      searchHint: "iPhone 16" }
  },
  { keywords: ["iphone 17"],
    name: "iPhone 17",
    predecessor: { name: "iPhone 16", perfDelta: -6,
      notes: "A19 vs A18: im Alltag identisch – iPhone 16 noch voll aktuell", notesEN: "A19 vs A18: identical in daily use – iPhone 16 still fully current",
      searchHint: "iPhone 16" }
  },
  { keywords: ["iphone 15 pro max"],
    name: "iPhone 15 Pro Max",
    predecessor: { name: "iPhone 14 Pro Max", perfDelta: -10,
      notes: "Titanium-Rahmen & USB 3 neu – 14 Pro Max noch sehr stark",
      searchHint: "iPhone 14 Pro Max" }
  },
  { keywords: ["iphone 15 pro"],
    name: "iPhone 15 Pro",
    predecessor: { name: "iPhone 14 Pro", perfDelta: -9,
      notes: "A16 vs A17: im Alltag kaum Unterschied bei normaler Nutzung",
      searchHint: "iPhone 14 Pro" }
  },
  { keywords: ["iphone 15"],
    name: "iPhone 15",
    predecessor: { name: "iPhone 14", perfDelta: -8,
      notes: "USB-C ist das Haupt-Upgrade – iPhone 14 bietet top Performance",
      searchHint: "iPhone 14" }
  },
  { keywords: ["iphone 14 pro max"],
    name: "iPhone 14 Pro Max",
    predecessor: { name: "iPhone 13 Pro Max", perfDelta: -11,
      notes: "Dynamic Island neu, Kamera-Upgrade – 13 Pro Max immer noch sehr gut",
      searchHint: "iPhone 13 Pro Max" }
  },

  // ── Samsung Galaxy S ────────────────────────────────────
  { keywords: ["galaxy s25 ultra", "s25 ultra"],
    name: "Samsung Galaxy S25 Ultra",
    predecessor: { name: "Galaxy S24 Ultra", perfDelta: -7,
      notes: "Snapdragon 8 Elite vs 8 Gen 3: Unterschied nur in KI-lastigen Tasks",
      searchHint: "Samsung Galaxy S24 Ultra" }
  },
  { keywords: ["galaxy s25+", "galaxy s25 plus", "s25+"],
    name: "Samsung Galaxy S25+",
    predecessor: { name: "Galaxy S24+", perfDelta: -6,
      notes: "Identisches AMOLED-Display – Refurbished S24+ oft 350€ günstiger",
      searchHint: "Samsung Galaxy S24+" }
  },
  { keywords: ["galaxy s25"],
    name: "Samsung Galaxy S25",
    predecessor: { name: "Galaxy S24", perfDelta: -5,
      notes: "S24 bleibt 4 Jahre mit Updates versorgt – ideal als Refurbished",
      searchHint: "Samsung Galaxy S24" }
  },

  // ── Galaxy S26 Serie (erwartet Jan. 2026) ────────────────
  { keywords: ["galaxy s26 ultra"],
    name: "Samsung Galaxy S26 Ultra",
    predecessor: { name: "Galaxy S25 Ultra", perfDelta: -7,
      notes: "S25 Ultra ist noch brandneu – Performance identisch im Alltag", notesEN: "S25 Ultra is brand new – performance identical in daily use",
      predecessor2: { name: "Galaxy S24 Ultra", perfDelta: -10, priceSave: 35, notes: "2 Generationen zurück – spart ~35%", searchHint: "Samsung Galaxy S24 Ultra" },
      searchHint: "Samsung Galaxy S25 Ultra" }
  },
  { keywords: ["galaxy s26+"],
    name: "Samsung Galaxy S26+",
    predecessor: { name: "Galaxy S25+", perfDelta: -6,
      notes: "S25+ bietet dieselbe Top-Performance für weniger Geld", notesEN: "S25+ offers the same top performance for less money",
      searchHint: "Samsung Galaxy S25 Plus" }
  },
  { keywords: ["galaxy s26"],
    name: "Samsung Galaxy S26",
    predecessor: { name: "Galaxy S25", perfDelta: -6,
      notes: "Snapdragon 8 Elite 2 vs Gen1: kein spürbarer Unterschied im Alltag", notesEN: "Snapdragon 8 Elite 2 vs Gen1: no noticeable difference in daily use",
      predecessor2: { name: "Galaxy S24", perfDelta: -9, priceSave: 35, notes: "2 Generationen zurück – spart bis zu 35%", searchHint: "Samsung Galaxy S24" },
      searchHint: "Samsung Galaxy S25" }
  },
  { keywords: ["galaxy z fold 7"],
    name: "Samsung Galaxy Z Fold 7",
    predecessor: { name: "Galaxy Z Fold 6", perfDelta: -5,
      notes: "Foldables verbessern sich schrittweise – Fold 6 noch sehr gut",
      searchHint: "Samsung Galaxy Z Fold 6" }
  },
  { keywords: ["galaxy z flip 7"],
    name: "Samsung Galaxy Z Flip 7",
    predecessor: { name: "Galaxy Z Flip 6", perfDelta: -5,
      notes: "Flip 6 ist funktional identisch bei deutlich niedrigerem Preis",
      searchHint: "Samsung Galaxy Z Flip 6" }
  },
  { keywords: ["galaxy s24 ultra", "s24 ultra"],
    name: "Samsung Galaxy S24 Ultra",
    predecessor: { name: "Galaxy S23 Ultra", perfDelta: -10,
      notes: "Titanium & Snapdragon 8 Gen 3 neu – S23 Ultra aber noch kraftvoll",
      searchHint: "Samsung Galaxy S23 Ultra" }
  },
  { keywords: ["galaxy s24+", "galaxy s24 plus"],
    name: "Samsung Galaxy S24+",
    predecessor: { name: "Galaxy S23+", perfDelta: -9,
      notes: "Galaxy AI fehlt im S23+, aber alle Kernfunktionen identisch",
      searchHint: "Samsung Galaxy S23+" }
  },
  { keywords: ["galaxy s24"],
    name: "Samsung Galaxy S24",
    predecessor: { name: "Galaxy S23", perfDelta: -9,
      notes: "S23 mit Snapdragon 8 Gen 2 – exzellente Alltagsleistung",
      searchHint: "Samsung Galaxy S23" }
  },
  { keywords: ["galaxy a55"],
    name: "Samsung Galaxy A55",
    predecessor: { name: "Galaxy A54", perfDelta: -5,
      notes: "A54 hat nahezu identischen Chip und Kamera-Setup",
      searchHint: "Samsung Galaxy A54" }
  },

  // ── Google Pixel ────────────────────────────────────────
  { keywords: ["pixel 9 pro xl"],
    name: "Google Pixel 9 Pro XL",
    predecessor: { name: "Pixel 8 Pro", perfDelta: -9,
      notes: "Tensor G4 vs G3: KI-Features besser, Kamera-Qualität sehr ähnlich",
      searchHint: "Google Pixel 8 Pro" }
  },
  { keywords: ["pixel 9 pro"],
    name: "Google Pixel 9 Pro",
    predecessor: { name: "Pixel 8 Pro", perfDelta: -8,
      notes: "Pixel 8 Pro mit 7 Jahren Updates – ideal refurbished",
      searchHint: "Google Pixel 8 Pro" }
  },
  { keywords: ["pixel 9"],
    name: "Google Pixel 9",
    predecessor: { name: "Pixel 8", perfDelta: -7,
      notes: "Tensor G3 weiterhin sehr leistungsfähig für alle Alltagsaufgaben",
      searchHint: "Google Pixel 8" }
  },

  // ── Pixel 10 Serie (erwartet Aug. 2025) ──────────────────
  { keywords: ["pixel 10 pro xl"],
    name: "Google Pixel 10 Pro XL",
    predecessor: { name: "Pixel 9 Pro XL", perfDelta: -7,
      notes: "Tensor G5 vs G4: Alltag identisch – 9 Pro XL noch top",
      searchHint: "Google Pixel 9 Pro XL" }
  },
  { keywords: ["pixel 10 pro"],
    name: "Google Pixel 10 Pro",
    predecessor: { name: "Pixel 9 Pro", perfDelta: -7,
      notes: "Kamera-Verbesserungen minimal spürbar – Pixel 9 Pro noch sehr aktuell",
      searchHint: "Google Pixel 9 Pro" }
  },
  { keywords: ["pixel 10"],
    name: "Google Pixel 10",
    predecessor: { name: "Pixel 9", perfDelta: -6,
      notes: "Tensor G5 vs G4: im Alltag nicht spürbar",
      searchHint: "Google Pixel 9" }
  },

  // ── Apple MacBook ────────────────────────────────────────
  { keywords: ["macbook pro 16"],
    name: "MacBook Pro 16\"",
    predecessor: { name: "MacBook Pro 16\" M2 Pro/Max", perfDelta: -12,
      notes: "M3 bringt Ray-Tracing – M2 Pro für 95% aller Tasks ausreichend", notesEN: "M3 adds ray-tracing – M2 Pro sufficient for 95% of tasks",
      predecessor2: { name: "MacBook Pro 16\" M1 Pro", perfDelta: -18, priceSave: 45, notes: "2 Generationen – spart bis zu 45%", searchHint: "MacBook Pro 16 M1" },
      searchHint: "MacBook Pro 16 M2" }
  },
  { keywords: ["macbook pro 14"],
    name: "MacBook Pro 14\"",
    predecessor: { name: "MacBook Pro 14\" M2 Pro", perfDelta: -11,
      notes: "M2 Pro mit identischem MiniLED-Display – oft 400-600€ günstiger", notesEN: "M2 Pro with identical MiniLED display – often 400-600€ cheaper",
      searchHint: "MacBook Pro 14 M2" }
  },
  { keywords: ["macbook air 15"],
    name: "MacBook Air 15\"",
    predecessor: { name: "MacBook Air 13\" M2", perfDelta: -3,
      notes: "Kleineres Display, gleicher M2-Chip – performt identisch",
      searchHint: "MacBook Air M2" }
  },
  { keywords: ["macbook air"],
    name: "MacBook Air 13\"",
    predecessor: { name: "MacBook Air 13\" M2", perfDelta: -5,
      notes: "M2 Air nahezu gleichwertig – MagSafe & Notch schon im M2", notesEN: "M2 Air nearly equivalent – MagSafe & Notch already in M2",
      searchHint: "MacBook Air M2" }
  },

  // ── MacBook M4 → M3 ──────────────────────────────────────
  { keywords: ["macbook pro 16", "m4"],
    name: "MacBook Pro 16\" M4",
    predecessor: { name: "MacBook Pro 16\" M3 Pro", perfDelta: -8,
      notes: "M4 Pro bietet ~15% mehr GPU – M3 Pro für alle Aufgaben vollständig ausreichend",
      searchHint: "MacBook Pro 16 M3" }
  },
  { keywords: ["macbook pro 14", "m4"],
    name: "MacBook Pro 14\" M4",
    predecessor: { name: "MacBook Pro 14\" M3 Pro", perfDelta: -8,
      notes: "M3 Pro für Coding, Video, Design identisch schnell im Alltag",
      searchHint: "MacBook Pro 14 M3" }
  },
  { keywords: ["macbook air 13", "m3"],
    name: "MacBook Air 13\" M3",
    predecessor: { name: "MacBook Air 13\" M2", perfDelta: -6,
      notes: "M2 Air ist schnell genug für alle Alltags-Tasks – spart 200-300€",
      searchHint: "MacBook Air M2" }
  },

  // ── Dell XPS ─────────────────────────────────────────────
  { keywords: ["dell xps 15 9530"],
    name: "Dell XPS 15 9530",
    predecessor: { name: "Dell XPS 15 9520", perfDelta: -7,
      notes: "13. Gen Intel vs 12. Gen – im Alltag identisch schnell",
      searchHint: "Dell XPS 15 9520" }
  },
  { keywords: ["dell xps 15"],
    name: "Dell XPS 15",
    predecessor: { name: "Dell XPS 15 (Vorjahr)", perfDelta: -8,
      notes: "XPS 15 bleibt über Generationen ähnlich leistungsfähig – Gebrauchtkauf spart 300-500€",
      searchHint: "Dell XPS 15" }
  },
  { keywords: ["dell xps 14"],
    name: "Dell XPS 14",
    predecessor: { name: "Dell XPS 15 9520", perfDelta: -5,
      notes: "XPS 15 Vorgänger oft für ähnlichen Preis – mehr Screen, gleiche Power",
      searchHint: "Dell XPS 15" }
  },
  { keywords: ["dell xps 13"],
    name: "Dell XPS 13",
    predecessor: { name: "Dell XPS 13 (Vorjahr)", perfDelta: -7,
      notes: "XPS 13 Generationssprünge minimal – Vorjahresmodell fast identisch",
      searchHint: "Dell XPS 13" }
  },

  // ── Lenovo ThinkPad ──────────────────────────────────────
  { keywords: ["thinkpad x1 carbon gen 12"],
    name: "ThinkPad X1 Carbon Gen 12",
    predecessor: { name: "ThinkPad X1 Carbon Gen 11", perfDelta: -6,
      notes: "Gen 11 mit Intel Core Ultra – identische Tastatur, Display und Akkulaufzeit", notesEN: "Gen 11 with Intel Core Ultra – identical keyboard, display and battery life",
      predecessor2: { name: "ThinkPad X1 Carbon Gen 10", perfDelta: -10, priceSave: 45, notes: "2 Generationen zurück – bis zu 45% günstiger", searchHint: "ThinkPad X1 Carbon Gen 10" },
      searchHint: "ThinkPad X1 Carbon Gen 11" }
  },
  { keywords: ["thinkpad x1 carbon gen 11"],
    name: "ThinkPad X1 Carbon Gen 11",
    predecessor: { name: "ThinkPad X1 Carbon Gen 10", perfDelta: -5,
      notes: "Gen 10 für Business-Einsatz völlig ausreichend, oft 30-40% günstiger",
      searchHint: "ThinkPad X1 Carbon Gen 10" }
  },
  { keywords: ["thinkpad t14s gen 4"],
    name: "ThinkPad T14s Gen 4",
    predecessor: { name: "ThinkPad T14s Gen 3", perfDelta: -5,
      notes: "T14s Gen 3 mit AMD Ryzen 6000 – volle Business-Leistung, deutlich günstiger",
      searchHint: "ThinkPad T14s Gen 3" }
  },
  { keywords: ["thinkpad t14 gen 4"],
    name: "ThinkPad T14 Gen 4",
    predecessor: { name: "ThinkPad T14 Gen 3", perfDelta: -5,
      notes: "ThinkPad-Qualität über Generationen konstant – Gen 3 spart 200-350€",
      searchHint: "ThinkPad T14 Gen 3" }
  },

  // ── Framework ────────────────────────────────────────────
  { keywords: ["framework laptop 16"],
    name: "Framework Laptop 16",
    predecessor: { name: "Framework Laptop 13", perfDelta: -15,
      notes: "Framework 13 mit Ryzen 7840U – kompakter, aber top reparierbar (Score 10/10)",
      searchHint: "Framework Laptop 13" }
  },

  // ── Microsoft Surface ────────────────────────────────────
  { keywords: ["surface laptop 6"],
    name: "Surface Laptop 6",
    predecessor: { name: "Surface Laptop 5", perfDelta: -10,
      notes: "Surface Laptop 5 mit Intel 12. Gen – im Büroalltag kaum Unterschied spürbar",
      searchHint: "Microsoft Surface Laptop 5" }
  },
  { keywords: ["surface laptop 5"],
    name: "Surface Laptop 5",
    predecessor: { name: "Surface Laptop 4", perfDelta: -8,
      notes: "Surface Laptop 4 mit AMD Ryzen – solide Business-Performance, günstigerer Preis",
      searchHint: "Microsoft Surface Laptop 4" }
  },
  { keywords: ["surface pro 11"],
    name: "Surface Pro 11",
    predecessor: { name: "Surface Pro 9", perfDelta: -9,
      notes: "Surface Pro 9 Copilot+ Features fehlen – ansonsten identisch nutzbar",
      searchHint: "Microsoft Surface Pro 9" }
  },

  // ── HP ───────────────────────────────────────────────────
  { keywords: ["hp spectre x360 14"],
    name: "HP Spectre x360 14",
    predecessor: { name: "HP Spectre x360 13.5", perfDelta: -7,
      notes: "Vorjahresmodell mit identischer Verarbeitung – meist 250-400€ günstiger",
      searchHint: "HP Spectre x360 13" }
  },
  { keywords: ["hp elitebook 840 g11"],
    name: "HP EliteBook 840 G11",
    predecessor: { name: "HP EliteBook 840 G10", perfDelta: -5,
      notes: "G10 mit Intel Core Ultra identisch im Bürobetrieb – gut refurbished verfügbar",
      searchHint: "HP EliteBook 840 G10" }
  },
  { keywords: ["hp elitebook 840 g10"],
    name: "HP EliteBook 840 G10",
    predecessor: { name: "HP EliteBook 840 G9", perfDelta: -5,
      notes: "G9 für alle Office-Aufgaben vollständig geeignet – Business-Qualität hält lange",
      searchHint: "HP EliteBook 840 G9" }
  },

  // ── Asus ─────────────────────────────────────────────────
  { keywords: ["asus zenbook pro 14"],
    name: "Asus ZenBook Pro 14",
    predecessor: { name: "Asus ZenBook Pro 14 (Vorjahr)", perfDelta: -8,
      notes: "OLED-Display und AMD-Chip bereits im Vorjahr – spart 200-350€",
      searchHint: "Asus ZenBook Pro 14 OLED" }
  },
  { keywords: ["asus rog zephyrus g16"],
    name: "Asus ROG Zephyrus G16",
    predecessor: { name: "Asus ROG Zephyrus G15 (2023)", perfDelta: -10,
      notes: "G15 mit RTX 4090 – Gaming-Performance im Alltag kaum unterschiedlich",
      searchHint: "Asus ROG Zephyrus G15" }
  },

  // ── Acer ─────────────────────────────────────────────────
  { keywords: ["acer swift 14"],
    name: "Acer Swift 14",
    predecessor: { name: "Acer Swift 3 (Vorjahr)", perfDelta: -6,
      notes: "Swift 3 bietet gleiche alltägliche Performance zu deutlich niedrigerem Preis",
      searchHint: "Acer Swift 3" }
  },
  { keywords: ["acer predator helios 18"],
    name: "Acer Predator Helios 18",
    predecessor: { name: "Acer Predator Helios 300 (2023)", perfDelta: -12,
      notes: "Helios 300 mit RTX 4080 – für die meisten Spiele absolut ausreichend",
      searchHint: "Acer Predator Helios 300" }
  },

  // ── Apple iPad ───────────────────────────────────────────
  { keywords: ["ipad pro 13", "ipad pro m4"],
    name: "iPad Pro 13\" (M4)",
    predecessor: { name: "iPad Pro 12.9\" M2", perfDelta: -13,
      notes: "Tandem-OLED & M4 neu – M2 iPad Pro top für Kreativarbeit",
      searchHint: "iPad Pro M2" }
  },
  { keywords: ["ipad pro 11"],
    name: "iPad Pro 11\"",
    predecessor: { name: "iPad Pro 11\" M2", perfDelta: -10,
      notes: "M2 iPad Pro mit Apple Pencil Pro-Support – voll ausreichend",
      searchHint: "iPad Pro 11 M2" }
  },

  // ── Kopfhörer ────────────────────────────────────────────
  { keywords: ["airpods pro 2", "airpods pro (2", "airpods pro (zweite"],
    name: "AirPods Pro 2",
    predecessor: { name: "AirPods Pro 1. Gen", perfDelta: -15,
      notes: "ANC & Transparency etwas schwächer – im Alltag kaum bemerkbar",
      searchHint: "AirPods Pro 1 Generation" }
  },
  { keywords: ["airpods 4"],
    name: "AirPods 4",
    predecessor: { name: "AirPods 3", perfDelta: -10,
      notes: "AirPods 3 mit Spatial Audio – nahezu gleichwertig",
      searchHint: "AirPods 3" }
  },
  { keywords: ["wh-1000xm6", "wh1000xm6", "xm6"],
    name: "Sony WH-1000XM6",
    predecessor: { name: "Sony WH-1000XM5", perfDelta: -5,
      notes: "XM5 mit erstklassigem ANC – refurbished oft unter 150€",
      searchHint: "Sony WH-1000XM5" }
  },
  { keywords: ["wh-1000xm5", "wh1000xm5", "xm5"],
    name: "Sony WH-1000XM5",
    predecessor: { name: "Sony WH-1000XM4", perfDelta: -8,
      notes: "XM4 faltbar & gleichwertiger Klang – bewährter Klassiker",
      searchHint: "Sony WH-1000XM4" }
  },
  { keywords: ["quietcomfort 45", "qc45"],
    name: "Bose QuietComfort 45",
    predecessor: { name: "Bose QC35 II", perfDelta: -10,
      notes: "QC35 II Klassiker mit sehr gutem ANC – massenhaft refurbished",
      searchHint: "Bose QC35 II" }
  },
  { keywords: ["bose quietcomfort ultra", "qc ultra"],
    name: "Bose QuietComfort Ultra",
    predecessor: { name: "Bose QuietComfort 45", perfDelta: -12,
      notes: "QC45 mit solidem ANC – refurbished oft 50% günstiger",
      searchHint: "Bose QuietComfort 45" }
  },

  // ── Gaming ───────────────────────────────────────────────
  { keywords: ["ps5 slim", "playstation 5 slim"],
    name: "PlayStation 5 Slim",
    predecessor: { name: "PlayStation 5 (Original)", perfDelta: -2,
      notes: "Identische Hardware, nur kompakteres Gehäuse – Original günstiger",
      searchHint: "PlayStation 5" }
  },
  { keywords: ["samsung galaxy tab s10"],
    name: "Samsung Galaxy Tab S10",
    predecessor: { name: "Galaxy Tab S9", perfDelta: -6,
      notes: "Tab S9 mit identischem AMOLED & Snapdragon 8 Gen 2",
      searchHint: "Samsung Galaxy Tab S9" }
  },

  // ╔══════════════════════════════════════════════════════════╗
  //  TABLETS
  // ╚══════════════════════════════════════════════════════════╝

  // ── Apple iPad ───────────────────────────────────────────
  { keywords: ["ipad air 13", "m3"],
    name: "iPad Air 13in M3",
    predecessor: { name: "iPad Air 13in M2", perfDelta: -5,
      notes: "M2 iPad Air identisch – spart oft 150-200 Euro",
      searchHint: "iPad Air 13 M2" }
  },
  { keywords: ["ipad air 11", "m3"],
    name: "iPad Air 11in M3",
    predecessor: { name: "iPad Air 11in M2", perfDelta: -5,
      notes: "M2 Air nahezu gleichwertig – USB-C bereits vorhanden",
      searchHint: "iPad Air M2" }
  },
  { keywords: ["ipad air 13"],
    name: "iPad Air 13in",
    predecessor: { name: "iPad Air 13in M2", perfDelta: -5,
      notes: "M2 iPad Air ist völlig ausreichend für alle Alltags-Aufgaben",
      searchHint: "iPad Air 13 M2" }
  },
  { keywords: ["ipad air"],
    name: "iPad Air",
    predecessor: { name: "iPad Air M2", perfDelta: -5,
      notes: "iPad Air M2 bietet identische Performance im Alltag",
      searchHint: "iPad Air M2" }
  },
  { keywords: ["ipad mini 7"],
    name: "iPad mini 7",
    predecessor: { name: "iPad mini 6", perfDelta: -7,
      notes: "iPad mini 6 mit A15 Bionic – im Alltag kaum Unterschied spürbar",
      searchHint: "iPad mini 6" }
  },
  { keywords: ["ipad mini"],
    name: "iPad mini",
    predecessor: { name: "iPad mini 6", perfDelta: -7,
      notes: "iPad mini 6 für alle Alltags-Tasks vollständig ausreichend",
      searchHint: "iPad mini 6" }
  },
  { keywords: ["ipad 10"],
    name: "iPad (10. Gen)",
    predecessor: { name: "iPad (9. Gen)", perfDelta: -5,
      notes: "iPad 9 mit A13 Bionic – ausreichend für Schule, Streaming & Browse",
      searchHint: "iPad 9 Generation" }
  },
  { keywords: ["ipad 11"],
    name: "iPad (11. Gen)",
    predecessor: { name: "iPad (10. Gen)", perfDelta: -6,
      notes: "iPad 10 mit USB-C bereits vorhanden – spart 100-150€",
      searchHint: "iPad 10 Generation" }
  },

  // ── Samsung Galaxy Tab ───────────────────────────────────
  { keywords: ["galaxy tab s10 ultra"],
    name: "Samsung Galaxy Tab S10 Ultra",
    predecessor: { name: "Galaxy Tab S9 Ultra", perfDelta: -5,
      notes: "S9 Ultra mit identischem 14,6 Zoll AMOLED – Snapdragon 8 Gen 2 top",
      searchHint: "Samsung Galaxy Tab S9 Ultra" }
  },
  { keywords: ["galaxy tab s10+"],
    name: "Samsung Galaxy Tab S10+",
    predecessor: { name: "Galaxy Tab S9+", perfDelta: -5,
      notes: "Tab S9+ nahezu identisch – oft 200-300€ günstiger refurbished",
      searchHint: "Samsung Galaxy Tab S9+" }
  },
  { keywords: ["galaxy tab s10 fe"],
    name: "Samsung Galaxy Tab S10 FE",
    predecessor: { name: "Galaxy Tab S9 FE", perfDelta: -4,
      notes: "S9 FE mit identischen Specs – günstiger gebraucht verfügbar",
      searchHint: "Samsung Galaxy Tab S9 FE" }
  },
  { keywords: ["galaxy tab s9 ultra"],
    name: "Samsung Galaxy Tab S9 Ultra",
    predecessor: { name: "Galaxy Tab S8 Ultra", perfDelta: -7,
      notes: "Tab S8 Ultra mit Snapdragon 8 Gen 1 – für die meisten Aufgaben identisch",
      searchHint: "Samsung Galaxy Tab S8 Ultra" }
  },
  { keywords: ["galaxy tab s9"],
    name: "Samsung Galaxy Tab S9",
    predecessor: { name: "Galaxy Tab S8", perfDelta: -6,
      notes: "Tab S8 mit Snapdragon 8 Gen 1 – kaum Unterschied im Alltag",
      searchHint: "Samsung Galaxy Tab S8" }
  },
  { keywords: ["galaxy tab a9+"],
    name: "Samsung Galaxy Tab A9+",
    predecessor: { name: "Galaxy Tab A8", perfDelta: -5,
      notes: "Tab A8 für Medienkonsum und Schule vollkommen ausreichend",
      searchHint: "Samsung Galaxy Tab A8" }
  },

  // ── Microsoft Surface Tablets ────────────────────────────
  { keywords: ["surface go 4"],
    name: "Microsoft Surface Go 4",
    predecessor: { name: "Surface Go 3", perfDelta: -8,
      notes: "Surface Go 3 für Büroalltag identisch – deutlich günstigerer Preis",
      searchHint: "Microsoft Surface Go 3" }
  },
  { keywords: ["surface go 3"],
    name: "Microsoft Surface Go 3",
    predecessor: { name: "Surface Go 2", perfDelta: -6,
      notes: "Surface Go 2 für leichte Aufgaben völlig ausreichend",
      searchHint: "Microsoft Surface Go 2" }
  },

  // ── Lenovo Tab ───────────────────────────────────────────
  { keywords: ["lenovo tab p12 pro"],
    name: "Lenovo Tab P12 Pro",
    predecessor: { name: "Lenovo Tab P11 Pro Gen 2", perfDelta: -8,
      notes: "P11 Pro Gen 2 mit OLED-Display nahezu gleichwertig",
      searchHint: "Lenovo Tab P11 Pro" }
  },
  { keywords: ["lenovo tab p12"],
    name: "Lenovo Tab P12",
    predecessor: { name: "Lenovo Tab P11 Gen 2", perfDelta: -6,
      notes: "Tab P11 Gen 2 für Streaming und Schule identisch geeignet",
      searchHint: "Lenovo Tab P11 Gen 2" }
  },

  // ╔══════════════════════════════════════════════════════════╗
  //  SMARTWATCHES
  // ╚══════════════════════════════════════════════════════════╝

  // ── Apple Watch ──────────────────────────────────────────
  { keywords: ["apple watch ultra 2"],
    name: "Apple Watch Ultra 2",
    predecessor: { name: "Apple Watch Ultra 1", perfDelta: -3,
      notes: "Ultra 1 mit identischer Akkulaufzeit & Titan-Gehäuse – spart 200€+", notesEN: "Ultra 1 with identical battery life & titanium – saves 200€+",
      searchHint: "Apple Watch Ultra" }
  },
  { keywords: ["apple watch series 10"],
    name: "Apple Watch Series 10",
    predecessor: { name: "Apple Watch Series 9", perfDelta: -4,
      notes: "Series 9 mit S9-Chip identisch leistungsfähig – dünner das einzige Upgrade", notesEN: "Series 9 identical performance – thinner is the only upgrade",
      predecessor2: { name: "Apple Watch Series 8", perfDelta: -6, priceSave: 40, notes: "2 Generationen – alle Kern-Features identisch", searchHint: "Apple Watch Series 8" },
      searchHint: "Apple Watch Series 9" }
  },
  { keywords: ["apple watch series 9"],
    name: "Apple Watch Series 9",
    predecessor: { name: "Apple Watch Series 8", perfDelta: -3,
      notes: "Series 8 mit Sturzerkennung & Temperatursensor bereits dabei", notesEN: "Series 8 already includes fall detection & temperature sensor",
      searchHint: "Apple Watch Series 8" }
  },
  { keywords: ["apple watch se"],
    name: "Apple Watch SE",
    predecessor: { name: "Apple Watch SE (1. Gen)", perfDelta: -4,
      notes: "SE 1 für Fitness & Alltagsnutzung vollständig ausreichend", notesEN: "SE 1 fully sufficient for fitness & everyday use",
      searchHint: "Apple Watch SE" }
  },

  // ── Samsung Galaxy Watch ──────────────────────────────────
  { keywords: ["galaxy watch ultra"],
    name: "Samsung Galaxy Watch Ultra",
    predecessor: { name: "Galaxy Watch 7", perfDelta: -5,
      notes: "Watch 7 mit identischen Gesundheitsfunktionen – ohne Titan-Gehäuse",
      searchHint: "Samsung Galaxy Watch 7" }
  },
  { keywords: ["galaxy watch 7"],
    name: "Samsung Galaxy Watch 7",
    predecessor: { name: "Galaxy Watch 6", perfDelta: -5,
      notes: "Watch 6 mit identischem BioActive Sensor – oft 80-120€ günstiger", notesEN: "Watch 6 with identical BioActive sensor – often 80-120€ cheaper",
      searchHint: "Samsung Galaxy Watch 6" }
  },
  { keywords: ["galaxy watch 6 classic"],
    name: "Samsung Galaxy Watch 6 Classic",
    predecessor: { name: "Galaxy Watch 5 Pro", perfDelta: -4,
      notes: "Watch 5 Pro mit Saphirglas – für Fitness und Alltag identisch",
      searchHint: "Samsung Galaxy Watch 5 Pro" }
  },
  { keywords: ["galaxy watch 6"],
    name: "Samsung Galaxy Watch 6",
    predecessor: { name: "Galaxy Watch 5", perfDelta: -5,
      notes: "Watch 5 mit BioActive Sensor und Schlaftracking – spart 100€+",
      searchHint: "Samsung Galaxy Watch 5" }
  },

  // ── Google Pixel Watch ────────────────────────────────────
  { keywords: ["pixel watch 3"],
    name: "Google Pixel Watch 3",
    predecessor: { name: "Pixel Watch 2", perfDelta: -6,
      notes: "Pixel Watch 2 mit Wear OS 4 und Herzfrequenz-Variabilität identisch",
      searchHint: "Google Pixel Watch 2" }
  },
  { keywords: ["pixel watch 2"],
    name: "Google Pixel Watch 2",
    predecessor: { name: "Pixel Watch 1", perfDelta: -7,
      notes: "Pixel Watch 1 für Wear OS und Fitness-Tracking völlig ausreichend",
      searchHint: "Google Pixel Watch" }
  },

  // ── Garmin ────────────────────────────────────────────────
  { keywords: ["garmin fenix 8"],
    name: "Garmin Fenix 8",
    predecessor: { name: "Garmin Fenix 7", perfDelta: -8,
      notes: "Fenix 7 mit Multi-Band GPS identisch präzise – spart 200-400€", notesEN: "Fenix 7 with multi-band GPS equally precise – saves 200-400€",
      searchHint: "Garmin Fenix 7" }
  },
  { keywords: ["garmin fenix 7"],
    name: "Garmin Fenix 7",
    predecessor: { name: "Garmin Fenix 6 Pro", perfDelta: -8,
      notes: "Fenix 6 Pro für Sport und Navigation im Alltag kaum schlechter",
      searchHint: "Garmin Fenix 6 Pro" }
  },
  { keywords: ["garmin forerunner 965"],
    name: "Garmin Forerunner 965",
    predecessor: { name: "Garmin Forerunner 945", perfDelta: -7,
      notes: "Forerunner 945 mit AMOLED und HRV – refurbished viel günstiger",
      searchHint: "Garmin Forerunner 945" }
  },
  { keywords: ["garmin forerunner 265"],
    name: "Garmin Forerunner 265",
    predecessor: { name: "Garmin Forerunner 255", perfDelta: -6,
      notes: "Forerunner 255 für Laufen und Multisport vollständig ausreichend",
      searchHint: "Garmin Forerunner 255" }
  },

  // ── Fitbit (Google) ───────────────────────────────────────
  { keywords: ["fitbit charge 6"],
    name: "Fitbit Charge 6",
    predecessor: { name: "Fitbit Charge 5", perfDelta: -5,
      notes: "Charge 5 mit EDA-Sensor und GPS identisch – oft 50€ günstiger",
      searchHint: "Fitbit Charge 5" }
  },
  { keywords: ["withings scanwatch 2"],
    name: "Withings ScanWatch 2",
    predecessor: { name: "Withings ScanWatch", perfDelta: -3,
      notes: "ScanWatch mit EKG und Schlaftracking – nahezu identisch, spart 100€+",
      searchHint: "Withings ScanWatch" }
  },
  { keywords: ["withings scanwatch light"],
    name: "Withings ScanWatch Light",
    predecessor: { name: "Withings Move ECG", perfDelta: -2,
      notes: "Günstiger mit EKG – gebraucht perfekte Preis-Leistung",
      searchHint: "Withings Move ECG" }
  },
  { keywords: ["huawei watch gt 4"],
    name: "Huawei Watch GT 4",
    predecessor: { name: "Huawei Watch GT 3 Pro", perfDelta: -5,
      notes: "GT 3 Pro mit Keramik-/Titan-Gehäuse – refurbished oft 60% günstiger",
      searchHint: "Huawei Watch GT 3 Pro" }
  },
  { keywords: ["huawei watch gt 3 pro"],
    name: "Huawei Watch GT 3 Pro",
    predecessor: { name: "Huawei Watch GT 2 Pro", perfDelta: -4,
      notes: "GT 2 Pro für Fitness und Alltag voll ausreichend",
      searchHint: "Huawei Watch GT 2 Pro" }
  },
  { keywords: ["fitbit versa 4"],
    name: "Fitbit Versa 4",
    predecessor: { name: "Fitbit Versa 3", perfDelta: -4,
      notes: "Versa 3 mit Alexa & Google Assistant – für Fitness identisch",
      searchHint: "Fitbit Versa 3" }
  },

  // ╔══════════════════════════════════════════════════════════╗
  //  SAUGROBOTER / STAUBSAUGER
  // ╚══════════════════════════════════════════════════════════╝

  // ── iRobot Roomba ────────────────────────────────────────
  { keywords: ["roomba j9+"],
    name: "iRobot Roomba j9+",
    predecessor: { name: "Roomba j7+", perfDelta: -5,
      notes: "j7+ erkennt Hindernisse und entleert automatisch – kaum Unterschied im Alltag", notesEN: "j7+ detects obstacles and empties automatically – barely different in daily use",
      searchHint: "iRobot Roomba j7+" }
  },
  { keywords: ["roomba j9"],
    name: "iRobot Roomba j9",
    predecessor: { name: "Roomba j7", perfDelta: -5,
      notes: "j7 mit Kamerasystem identisch leistungsfähig – oft 150€ günstiger",
      searchHint: "iRobot Roomba j7" }
  },
  { keywords: ["roomba j7+"],
    name: "iRobot Roomba j7+",
    predecessor: { name: "Roomba i7+", perfDelta: -6,
      notes: "i7+ mit Auto-Entleerung – Reinigungsleistung auf gleichem Niveau",
      searchHint: "iRobot Roomba i7+" }
  },
  { keywords: ["roomba j7"],
    name: "iRobot Roomba j7",
    predecessor: { name: "Roomba i7", perfDelta: -5,
      notes: "i7 ohne Objekterkennung, aber gleiche Saugleistung – deutlich günstiger",
      searchHint: "iRobot Roomba i7" }
  },
  { keywords: ["roomba combo j9"],
    name: "iRobot Roomba Combo j9",
    predecessor: { name: "Roomba Combo j7", perfDelta: -4,
      notes: "Combo j7 wischt und saugt – Wischqualität identisch im Alltag",
      searchHint: "iRobot Roomba Combo j7" }
  },
  { keywords: ["roomba s9"],
    name: "iRobot Roomba s9",
    predecessor: { name: "Roomba i7+", perfDelta: -8,
      notes: "D-Form & stärkere Saugkraft – i7+ reinigt 95% genauso gut",
      searchHint: "iRobot Roomba i7+" }
  },
  { keywords: ["roomba i7+"],
    name: "iRobot Roomba i7+",
    predecessor: { name: "Roomba i5+", perfDelta: -5,
      notes: "i5+ mit Auto-Entleerung – Reinigungsleistung nahezu identisch",
      searchHint: "iRobot Roomba i5+" }
  },
  { keywords: ["roomba i5"],
    name: "iRobot Roomba i5",
    predecessor: { name: "Roomba e5", perfDelta: -4,
      notes: "Roomba e5 reinigt Hartböden und Teppiche gleich gut",
      searchHint: "iRobot Roomba e5" }
  },

  // ── Roborock ─────────────────────────────────────────────
  { keywords: ["roborock s8 maxv ultra"],
    name: "Roborock S8 MaxV Ultra",
    predecessor: { name: "Roborock S8 Pro Ultra", perfDelta: -6,
      notes: "S8 Pro Ultra mit Laser-Navigation identisch – Ultra-Station bereits vorhanden", notesEN: "S8 Pro Ultra with laser navigation identical – ultra station already included",
      searchHint: "Roborock S8 Pro Ultra" }
  },
  { keywords: ["roborock s8 pro ultra"],
    name: "Roborock S8 Pro Ultra",
    predecessor: { name: "Roborock S7 MaxV Ultra", perfDelta: -7,
      notes: "S7 MaxV Ultra saugt und wischt – Dual-Bürstensystem bereits im S8 Pro einziger echte Vorteil",
      searchHint: "Roborock S7 MaxV Ultra" }
  },
  { keywords: ["roborock s8+"],
    name: "Roborock S8+",
    predecessor: { name: "Roborock S7+", perfDelta: -6,
      notes: "S7+ mit Sonic-Mop identisch leistungsfähig – oft 100-150€ günstiger",
      searchHint: "Roborock S7+" }
  },
  { keywords: ["roborock s8"],
    name: "Roborock S8",
    predecessor: { name: "Roborock S7", perfDelta: -6,
      notes: "S7 mit reaktivem Wischlift – im Alltag kaum Unterschied",
      searchHint: "Roborock S7" }
  },
  { keywords: ["roborock q revo maxv"],
    name: "Roborock Q Revo MaxV",
    predecessor: { name: "Roborock Q Revo", perfDelta: -5,
      notes: "Q Revo ohne Kamera-Hinderniserkennung – im normalen Haushalt ausreichend",
      searchHint: "Roborock Q Revo" }
  },
  { keywords: ["roborock q revo"],
    name: "Roborock Q Revo",
    predecessor: { name: "Roborock S7 MaxV Ultra", perfDelta: -4,
      notes: "S7 MaxV Ultra mit ähnlichem Feature-Set oft deutlich günstiger als Neuware",
      searchHint: "Roborock S7 MaxV Ultra" }
  },
  { keywords: ["roborock s7 maxv ultra"],
    name: "Roborock S7 MaxV Ultra",
    predecessor: { name: "Roborock S7+", perfDelta: -8,
      notes: "S7+ ohne Auto-Leerung – manuelle Entleerung spart 200€ Kaufpreis",
      searchHint: "Roborock S7+" }
  },
  { keywords: ["roborock e5"],
    name: "Roborock E5",
    predecessor: { name: "Roborock E4", perfDelta: -3,
      notes: "E4 mit identischer Saugleistung – günstigster Einstieg ins Roborock-Ökosystem",
      searchHint: "Roborock E4" }
  },

  // ── Ecovacs Deebot ────────────────────────────────────────
  { keywords: ["deebot t30s pro"],
    name: "Ecovacs Deebot T30S Pro",
    predecessor: { name: "Deebot T20 Pro", perfDelta: -7,
      notes: "T20 Pro mit Wischfunktion identisch – Hot-Water-Mop-Unterschied marginal",
      searchHint: "Ecovacs Deebot T20 Pro" }
  },
  { keywords: ["deebot t30s"],
    name: "Ecovacs Deebot T30S",
    predecessor: { name: "Deebot T20", perfDelta: -6,
      notes: "T20 reinigt Hartböden und Teppiche genauso zuverlässig",
      searchHint: "Ecovacs Deebot T20" }
  },
  { keywords: ["deebot t20 pro"],
    name: "Ecovacs Deebot T20 Pro",
    predecessor: { name: "Deebot T10 Pro", perfDelta: -6,
      notes: "T10 Pro mit Laser und Wischfunktion – 3D-Hindernisvermeidung einziger Unterschied",
      searchHint: "Ecovacs Deebot T10 Pro" }
  },
  { keywords: ["deebot t20"],
    name: "Ecovacs Deebot T20",
    predecessor: { name: "Deebot T10", perfDelta: -5,
      notes: "T10 mit OZMO-Wischsystem – günstiger und oft gut refurbished verfügbar",
      searchHint: "Ecovacs Deebot T10" }
  },
  { keywords: ["deebot n10 plus"],
    name: "Ecovacs Deebot N10 Plus",
    predecessor: { name: "Deebot N8 Pro+", perfDelta: -6,
      notes: "N8 Pro+ mit Laser-Navigation und Auto-Entleerung – kaum schlechter",
      searchHint: "Ecovacs Deebot N8 Pro+" }
  },
  { keywords: ["deebot n10"],
    name: "Ecovacs Deebot N10",
    predecessor: { name: "Deebot N8 Pro", perfDelta: -5,
      notes: "N8 Pro mit 2600 Pa Saugleistung – für die meisten Böden vollständig ausreichend",
      searchHint: "Ecovacs Deebot N8 Pro" }
  },
  { keywords: ["deebot x2"],
    name: "Ecovacs Deebot X2",
    predecessor: { name: "Deebot X1 Turbo", perfDelta: -7,
      notes: "X1 Turbo mit eckiger Form bereits – Saugleistung nahezu gleich",
      searchHint: "Ecovacs Deebot X1 Turbo" }
  },

  // ── Dreame ───────────────────────────────────────────────
  { keywords: ["dreame x40 ultra"],
    name: "Dreame X40 Ultra",
    predecessor: { name: "Dreame L20 Ultra", perfDelta: -6,
      notes: "L20 Ultra mit ausfahrbarem Mop identisch im Alltag – spart 200€",
      searchHint: "Dreame L20 Ultra" }
  },
  { keywords: ["dreame l20 ultra"],
    name: "Dreame L20 Ultra",
    predecessor: { name: "Dreame L10s Ultra", perfDelta: -5,
      notes: "L10s Ultra mit hervorragender Navigationskarte – Wischunterschied minimal",
      searchHint: "Dreame L10s Ultra" }
  },
  { keywords: ["dreame l10s ultra"],
    name: "Dreame L10s Ultra",
    predecessor: { name: "Dreame L10 Pro", perfDelta: -7,
      notes: "L10 Pro ohne Auto-Leerstation – manuelle Entleerung, dafür 150€ günstiger",
      searchHint: "Dreame L10 Pro" }
  },
  { keywords: ["dreame d10 plus"],
    name: "Dreame D10 Plus",
    predecessor: { name: "Dreame D9", perfDelta: -5,
      notes: "D9 ohne Auto-Entleerung – Saugleistung mit 3000 Pa identisch",
      searchHint: "Dreame D9" }
  },
  { keywords: ["dreame bot w10 pro"],
    name: "Dreame Bot W10 Pro",
    predecessor: { name: "Dreame Bot W10", perfDelta: -4,
      notes: "W10 mit Selbstreinigungsfunktion identisch im Wischergebnis",
      searchHint: "Dreame Bot W10" }
  },

  // ── Narwal ───────────────────────────────────────────────
  { keywords: ["narwal freo x ultra"],
    name: "Narwal Freo X Ultra",
    predecessor: { name: "Narwal Freo", perfDelta: -8,
      notes: "Narwal Freo mit self-cleaning Mops – 300€ günstiger gebraucht verfügbar",
      searchHint: "Narwal Freo" }
  },
  { keywords: ["narwal freo z ultra"],
    name: "Narwal Freo Z Ultra",
    predecessor: { name: "Narwal Freo X Ultra", perfDelta: -5,
      notes: "Freo X Ultra ohne Kamera-Erkennung – im normalen Haushalt ausreichend",
      searchHint: "Narwal Freo X Ultra" }
  },
  { keywords: ["narwal t10"],
    name: "Narwal T10",
    predecessor: { name: "Narwal T10 (Vorjahr)", perfDelta: -4,
      notes: "Narwal T10 gebraucht oft für die Hälfte – identische Wischperformance",
      searchHint: "Narwal T10" }
  },

  // ── Xiaomi / Mi Robot ─────────────────────────────────────
  { keywords: ["xiaomi robot vacuum x20 pro"],
    name: "Xiaomi Robot Vacuum X20 Pro",
    predecessor: { name: "Xiaomi X10+", perfDelta: -6,
      notes: "X10+ mit Laser-Navigation identisch – ohne Mop-Hebe-Funktion, dafür günstiger",
      searchHint: "Xiaomi X10+" }
  },
  { keywords: ["xiaomi robot vacuum x10+"],
    name: "Xiaomi Robot Vacuum X10+",
    predecessor: { name: "Xiaomi G10 Plus", perfDelta: -5,
      notes: "G10 Plus mit Auto-Entleerung – Saugleistung auf gleichem Niveau",
      searchHint: "Xiaomi G10 Plus" }
  },
  { keywords: ["xiaomi robot vacuum s20+"],
    name: "Xiaomi Robot Vacuum S20+",
    predecessor: { name: "Xiaomi S10+", perfDelta: -5,
      notes: "S10+ mit identischer Mapping-Qualität – günstiger gebraucht verfügbar",
      searchHint: "Xiaomi S10+" }
  },
  { keywords: ["mi robot vacuum mop 2 pro"],
    name: "Mi Robot Vacuum-Mop 2 Pro",
    predecessor: { name: "Mi Robot Vacuum-Mop Pro", perfDelta: -5,
      notes: "Vorgänger mit LDS-Laser identisch in der Navigation",
      searchHint: "Mi Robot Vacuum Mop Pro" }
  },

  // ── Miele ─────────────────────────────────────────────────
  { keywords: ["miele scout rx3"],
    name: "Miele Scout RX3",
    predecessor: { name: "Miele Scout RX2", perfDelta: -4,
      notes: "RX2 mit AllFloor-Bürste reinigt Hartböden gleich effektiv",
      searchHint: "Miele Scout RX2" }
  },
  { keywords: ["miele scout rx2"],
    name: "Miele Scout RX2",
    predecessor: { name: "Miele Scout RX1", perfDelta: -3,
      notes: "RX1 für einfache Böden völlig ausreichend – Miele-Qualität hält lang",
      searchHint: "Miele Scout RX1" }
  },

  // ── Shark ─────────────────────────────────────────────────
  { keywords: ["shark matrix plus"],
    name: "Shark Matrix Plus",
    predecessor: { name: "Shark AI Ultra", perfDelta: -5,
      notes: "Shark AI Ultra mit Matrix-Reinigung bereits vorhanden – günstiger gebraucht",
      searchHint: "Shark AI Ultra" }
  },
  { keywords: ["shark ai ultra"],
    name: "Shark AI Ultra",
    predecessor: { name: "Shark IQ Robot XL", perfDelta: -6,
      notes: "IQ Robot XL mit Auto-Entleerung identisch im Alltag",
      searchHint: "Shark IQ Robot XL" }
  },

  // ── Neato ─────────────────────────────────────────────────
  { keywords: ["neato d10"],
    name: "Neato D10",
    predecessor: { name: "Neato D8", perfDelta: -5,
      notes: "D8 mit D-Form-Design identisch für Ecken – deutlich günstiger",
      searchHint: "Neato D8" }
  },
  { keywords: ["neato d9"],
    name: "Neato D9",
    predecessor: { name: "Neato D7", perfDelta: -6,
      notes: "D7 mit LaserSmart-Navigation – 2023 eingestellt, aber gebraucht top Preis",
      searchHint: "Neato D7" }
  },

  // ── eufy (Anker) ──────────────────────────────────────────
  { keywords: ["eufy clean x10 pro omni"],
    name: "eufy Clean X10 Pro Omni",
    predecessor: { name: "eufy RoboVac X8 Hybrid", perfDelta: -7,
      notes: "X8 Hybrid mit Twin-Turbine identisch in der Saugleistung – ohne Omni-Station",
      searchHint: "eufy RoboVac X8 Hybrid" }
  },
  { keywords: ["eufy robovac l70 hybrid"],
    name: "eufy RoboVac L70 Hybrid",
    predecessor: { name: "eufy RoboVac G30 Hybrid", perfDelta: -5,
      notes: "G30 Hybrid mit Wischfunktion und iPath-Laser – günstiger und zuverlässig",
      searchHint: "eufy RoboVac G30 Hybrid" }
  },
  { keywords: ["eufy robovac g40+"],
    name: "eufy RoboVac G40+",
    predecessor: { name: "eufy RoboVac G30+", perfDelta: -4,
      notes: "G30+ mit Auto-Entleerung identisch – guter Einstieg gebraucht",
      searchHint: "eufy RoboVac G30+" }
  },

  // ── Vorwerk Kobold ───────────────────────────────────────
  { keywords: ["kobold vr7000"],
    name: "Vorwerk Kobold VR7000",
    predecessor: { name: "Vorwerk Kobold VR300", perfDelta: -6,
      notes: "VR300 mit Laser-Navigation bereits Top-Qualität – gebraucht selten aber verfügbar",
      searchHint: "Vorwerk Kobold VR300" }
  }
];


// ╔══════════════════════════════════════════════════════════╗
//  3 · PLATTFORM-DATENBANK
// ╚══════════════════════════════════════════════════════════╝
EcoTrace.platformDB = {
  // co2Saving = Produktions-CO₂ gespart (Versand des Händlers kommt hinzu, im badge vermerkt)
  backmarket:      { id: "backmarket",      name: "Back Market",          emoji: "♻️",  co2Saving: 95, categories: ["electronics"],                    searchUrl: "https://www.backmarket.de/de-de/search?q={q}", countries: ["de","at","ch","all"],                             color: "#2D7D46", badge: "Garantie · +1.2 kg Versand", badgeEN: "Warranty · +1.2 kg shipping" },
  rebuy:           { id: "rebuy",           name: "Rebuy",                emoji: "🔄",  co2Saving: 97, categories: ["electronics", "generic"],           searchUrl: "https://www.rebuy.de/kaufen/suchen?q={q}", countries: ["de","at","ch"],                             color: "#1565C0", badge: "DE/AT · +0.8 kg shipping" },
  asgoodasnew:     { id: "asgoodasnew",     name: "asgoodasnew",          emoji: "⭐",  co2Saving: 95, categories: ["electronics"],                    searchUrl: "https://www.asgoodasnew.de/search?q={q}", countries: ["de","at","ch"],                                  color: "#6A1B9A", badge: "Mit Garantie · +1.2 kg Versand", badgeEN: "With warranty · +1.2 kg shipping" },
  afb:             { id: "afb",             name: "AfB green IT",         emoji: "🌱",  co2Saving: 96, categories: ["electronics"],                    searchUrl: "https://www.afbshop.de/search?search={q}", countries: ["de","at"],                                  color: "#2E7D32", badge: "Sozial-ökologisch · +0.9 kg", badgeEN: "Social-ecological · +0.9 kg" },
  revendo:         { id: "revendo",         name: "Revendo",              emoji: "🍎",  co2Saving: 96, categories: ["electronics"],                    searchUrl: "https://revendo.de/search?q={q}", countries: ["ch"],                                          color: "#BF360C", badge: "Apple-Spezialist · +1.0 kg", badgeEN: "Apple specialist · +1.0 kg" },
  vinted:          { id: "vinted",          name: "Vinted",               emoji: "👗",  co2Saving: 98, categories: ["textile"],                        searchUrl: "https://www.vinted.de/catalog?search_text={q}", countries: ["de","at","ch","all"],                           color: "#09B1BA", badge: "C2C · +0.5 kg shipping" },
  sellpy:          { id: "sellpy",          name: "Sellpy",               emoji: "👔",  co2Saving: 97, categories: ["textile"],                        searchUrl: "https://www.sellpy.de/search?q={q}", countries: ["de","at","ch"],                                       color: "#E91E63", badge: "Full-Service · +0.6 kg" },
  maedchenflohmarkt: { id: "maedchenflohmarkt", name: "Mädchenflohmarkt", emoji: "✨",  co2Saving: 97, categories: ["textile"],                        searchUrl: "https://www.maedchenflohmarkt.de/search?q={q}", countries: ["de"],                           color: "#AD1457", badge: "Designer-Mode · +0.7 kg", badgeEN: "Designer fashion · +0.7 kg" },
  vestiaire:       { id: "vestiaire",       name: "Vestiaire Collective", emoji: "💎",  co2Saving: 94, categories: ["textile"],                        searchUrl: "https://de.vestiairecollective.com/search/?q={q}", countries: ["de","at","ch","all"],                        color: "#795548", badge: "Luxus-geprüft · +1.5 kg intl.", badgeEN: "Luxury verified · +1.5 kg intl." },
  momoxfashion:    { id: "momoxfashion",    name: "Momox Fashion",        emoji: "🏷️", co2Saving: 97, categories: ["textile"],                        searchUrl: "https://www.momoxfashion.com/search?q={q}", countries: ["de","at"],                               color: "#F57C00", badge: "Riesige Auswahl · +0.8 kg", badgeEN: "Huge selection · +0.8 kg" },
  kleinanzeigen:   { id: "kleinanzeigen",   name: "Kleinanzeigen",        emoji: "📍",  co2Saving: 100,categories: ["furniture", "electronics", "generic"], searchUrl: "https://www.kleinanzeigen.de/s/{q}", countries: ["de"],                               color: "#37474F", badge: "Lokal abholbar · 0 kg Versand", badgeEN: "Local pickup · 0 kg shipping" },
  willhaben:       { id: "willhaben",       name: "Willhaben",             emoji: "🇦🇹", co2Saving: 100,categories: ["furniture", "electronics", "generic"], searchUrl: "https://www.willhaben.at/iad/kaufen-und-verkaufen/marktplatz?keyword={q}", countries: ["at"], color: "#E63C15", badge: "AT/DE · 0 kg local" },
  whoppah:         { id: "whoppah",         name: "Whoppah",              emoji: "🛋️", co2Saving: 89, categories: ["furniture"],                       searchUrl: "https://www.whoppah.com/de-de/search?q={q}", countries: ["de","at","ch","nl"],                              color: "#5C6BC0", badge: "Design-Möbel · +2.0 kg Versand", badgeEN: "Design furniture · +2.0 kg shipping" },
  etsy:            { id: "etsy",            name: "Etsy Vintage",         emoji: "🏺",  co2Saving: 93, categories: ["furniture", "generic"],             searchUrl: "https://www.etsy.com/de/search?q={q}&is_vintage=1", countries: ["de","at","ch","all"],                      color: "#F16521", badge: "Vintage & Unikate · +1.5 kg", badgeEN: "Vintage & unique · +1.5 kg" },
  avocadostore:    { id: "avocadostore",    name: "Avocadostore",         emoji: "🥑",  co2Saving: 40, categories: ["textile", "furniture", "generic"],  searchUrl: "https://www.avocadostore.de/search?q={q}", countries: ["de","at","ch"],                               color: "#558B2F", badge: "Eco-zertifiziert Neuware", badgeEN: "Eco-certified new" },
  memolife:        { id: "memolife",        name: "Memolife",             emoji: "🌿",  co2Saving: 35, categories: ["furniture", "generic"],             searchUrl: "https://www.memolife.de/search?query={q}", countries: ["de","at","ch"],                               color: "#00796B", badge: "Nachhaltiges Büro (Neu)", badgeEN: "Sustainable office (new)" }
};


// ╔══════════════════════════════════════════════════════════╗
//  4 · VORGÄNGER-SUCHE
// ╚══════════════════════════════════════════════════════════╝
EcoTrace.findPredecessor = function(title) {
  if (!title) return null;
  const t = title.toLowerCase();
  let best = null, bestLen = 0;
  for (const entry of EcoTrace.predecessorDB) {
    for (const kw of entry.keywords) {
      if (t.includes(kw) && kw.length > bestLen) {
        best = entry;
        bestLen = kw.length;
      }
    }
  }
  return best;
};


// ╔══════════════════════════════════════════════════════════╗
//  5 · PLATTFORM-EMPFEHLUNG
// ╚══════════════════════════════════════════════════════════╝

// Returns badge text in current language
EcoTrace.getBadge = function(platform) {
  if (!platform) return "";
  const lang = EcoTrace._userLang || "de";
  if (lang === "en" && platform.badgeEN) return platform.badgeEN;
  return platform.badge || "";
};

EcoTrace.getRecommendedPlatforms = function(category, title, userCountry) {
  const t       = (title || "").toLowerCase();
  const country = userCountry || EcoTrace._userCountry || "de";
  const isApple = ["iphone","macbook","ipad","airpods","apple"].some(k => t.includes(k));

  let matching = Object.values(EcoTrace.platformDB)
    .filter(p => {
      // Kategorie passt?
      if (!p.categories.includes(category)) return false;
      // Land passt? (kein countries-Feld = überall sichtbar)
      if (!p.countries) return true;
      return p.countries.includes(country) || p.countries.includes("all");
    });

  matching.sort((a, b) => {
    if (isApple && a.id === "revendo") return -1;
    if (isApple && b.id === "revendo") return  1;
    return b.co2Saving - a.co2Saving;
  });

  return matching.slice(0, 5);  // bis zu 5 um mehr lokale Optionen zu zeigen
};

// Aktives Land cachen (wird aus chrome.storage beim Boot geladen)
EcoTrace._userCountry = "de";
EcoTrace._userLang    = "de";

// Länder-konfigurierbare Platform-URL (Back Market hat länderspezifische Subdomains)
EcoTrace._getPlatformUrl = function(platformId, query, country) {
  const urlMap = {
    backmarket: {
      de: "https://www.backmarket.de/de-de/search?q={q}",
      at: "https://www.backmarket.de/de-at/search?q={q}",
      ch: "https://www.backmarket.ch/de-ch/search?q={q}",
    },
    vinted: {
      de: "https://www.vinted.de/catalog?search_text={q}",
      at: "https://www.vinted.at/catalog?search_text={q}",
      ch: "https://www.vinted.ch/catalog?search_text={q}",
    },
  };
  const urls = urlMap[platformId];
  if (urls) {
    const url = urls[country] || urls.de;
    return url.replace("{q}", encodeURIComponent(query));
  }
  return null;  // normaler searchAlternative-Pfad
};


// ╔══════════════════════════════════════════════════════════╗
//  6 · DEEP-LINK URL BUILDER
// ╚══════════════════════════════════════════════════════════╝
// ╔══════════════════════════════════════════════════════════╗
//  AFFILIATE-KONFIGURATION
//  Trage hier deine eigenen Affiliate-IDs ein.
//  Leer lassen = normaler Link ohne Tracking.
//
//  Back Market:  Registrierung → https://www.backmarket.de/de-de/affiliate
//  Rebuy:        Registrierung → https://www.rebuy.de/affiliate (via Awin)
//  Vinted:       Kein offizielles Affiliate-Programm (Stand 2025)
//  asgoodasnew:  Kontakt → partner@asgoodasnew.de
// ╚══════════════════════════════════════════════════════════╝
EcoTrace.affiliateConfig = {
  backmarket: {
    // Back Market: ref=DEIN_CODE an URL anhängen
    // Beispiel: "ECOTRACE2025"  →  ?ref=ECOTRACE2025
    refParam:  "ref",
    refValue:  "",          // ← Dein Back Market Affiliate-Code hier eintragen
    enabled:   false,
  },
  rebuy: {
    // Rebuy (via Awin): awc=DEIN_CODE als Query-Parameter
    refParam:  "awc",
    refValue:  "",          // ← Dein Rebuy/Awin-Code hier eintragen
    enabled:   false,
  },
  asgoodasnew: {
    refParam:  "ref",
    refValue:  "",          // ← Dein asgoodasnew-Code hier eintragen
    enabled:   false,
  },
};

// Gibt true zurück wenn mindestens ein Affiliate-Link aktiv ist
// (wird für das * Symbol in der UI genutzt)
EcoTrace.hasAffiliateLinks = function() {
  return Object.values(EcoTrace.affiliateConfig).some(c => c.enabled && c.refValue);
};

EcoTrace.searchAlternative = function(productName, platformKey) {
  const platform = EcoTrace.platformDB[platformKey];
  if (!platform) return "#";
  const clean = EcoTrace._cleanSearchQuery(productName);

  let url;

  // Kleinanzeigen: Slug-Format
  if (platformKey === "kleinanzeigen") {
    const slug = clean.toLowerCase()
      .replace(/[^a-z0-9äöüß\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
    url = `https://www.kleinanzeigen.de/s-${slug}/k0`;
  } else if (platformKey === "willhaben") {
    url = platform.searchUrl.replace("{q}", encodeURIComponent(clean.toLowerCase()));
  } else if (["rebuy","afb","backmarket","asgoodasnew","revendo"].includes(platformKey)) {
    url = platform.searchUrl.replace("{q}", encodeURIComponent(clean.toLowerCase()));
  } else {
    url = platform.searchUrl.replace("{q}", encodeURIComponent(clean));
  }

  // Affiliate-Parameter anhängen falls konfiguriert + aktiviert
  const aff = EcoTrace.affiliateConfig?.[platformKey];
  if (aff?.enabled && aff?.refValue) {
    const separator = url.includes("?") ? "&" : "?";
    url += `${separator}${aff.refParam}=${encodeURIComponent(aff.refValue)}`;
  }

  return url;
};

EcoTrace._cleanSearchQuery = function(title) {
  // Delegiert an utils.js (zentrales Modul) – falls noch nicht geladen: inline
  if (window.EcoTrace?.Utils?.cleanSearchQuery) {
    return window.EcoTrace.Utils.cleanSearchQuery(title);
  }
  // Minimal-Fallback
  if (!title) return "";
  return title.replace(/[\(\[].*?[\)\]]/g, " ")
              .replace(/\d+\s*(?:gb|tb|mb)/gi, " ")
              .replace(/\s+/g, " ").trim().substring(0, 40).trim();
};


// ╔══════════════════════════════════════════════════════════╗
//  7 · OVERPASS API – LOKALE SECOND-HAND-SHOPS
// ╚══════════════════════════════════════════════════════════╝
EcoTrace.findLocalShops = async function(lat, lng, radiusMeters = 3000) {
  const query = `
[out:json][timeout:10];
(
  node["shop"="second_hand"](around:${radiusMeters},${lat},${lng});
  node["shop"="charity"](around:${radiusMeters},${lat},${lng});
  node["shop"="vintage"](around:${radiusMeters},${lat},${lng});
  node["repair"="yes"](around:${radiusMeters},${lat},${lng});
  node["shop"="electronics"]["second_hand"="yes"](around:${radiusMeters},${lat},${lng});
);
out body 5;`.trim();

  try {
    const resp = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      body: "data=" + encodeURIComponent(query),
      headers: { "Content-Type": "application/x-www-form-urlencoded" }
    });
    if (!resp.ok) return [];
    const json = await resp.json();
    return (json.elements || []).slice(0, 3).map(el => ({
      name:    el.tags?.name || "Second-Hand Shop",
      type:    el.tags?.shop || "Laden",
      lat:     el.lat,
      lng:     el.lon,
      mapsUrl: `https://www.openstreetmap.org/?mlat=${el.lat}&mlon=${el.lon}&zoom=17`
    }));
  } catch (e) {
    console.warn("[EcoTrace] Overpass:", e.message);
    return [];
  }
};

EcoTrace.getUserLocation = function() {
  return new Promise(resolve => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      p  => resolve({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 300_000 }
    );
  });
};


// ╔══════════════════════════════════════════════════════════╗
//  8 · KERN-BERECHNUNGEN
// ╚══════════════════════════════════════════════════════════╝
EcoTrace.detectCategory = function(title, breadcrumb) {
  const t  = (title + " " + breadcrumb).toLowerCase();
  const bc = (breadcrumb || "").toLowerCase();

  // ── Breadcrumb-basiert (präziser) ───────────────────────
  if (/kleidung|mode|bekleidung|damen.*mode|herren.*mode|textilien|fashion|schuhe.*damen|schuhe.*herren/.test(bc)) return "textile";
  if (/möbel|wohnen.*möbel|einrichtung|küche.*möbel|büromöbel|gartenmöbel/.test(bc))  return "furniture";
  if (/lebensmittel|food|grocery|getränke|gourmet|feinkost|bio.*laden/.test(bc))       return "food";

  // ── Keyword-basiert (Fallback) ───────────────────────────
  const matchers = [
    { cat: "electronics", keywords: [
        "handy","smartphone","laptop","notebook","tablet","kopfhörer","headphone",
        "elektronik","computer","iphone","galaxy","pixel","airpods","macbook","ipad",
        "playstation","xbox","konsole","sony wh","bose","watch","smartwatch",
        "thinkpad","xps","ideapad","zenbook","vivobook","spectre","elitebook",
        "pavilion","chromebook","aspire","predator","surface","garmin","fenix",
        "forerunner","instinct","venu","epix","fitbit","roomba","roborock",
        "deebot","dreame","narwal","eufy","drucker","monitor","tastatur"
    ]},
    { cat: "textile", keywords: [
        "shirt","hose","kleid","jacke","pullover","socken","unterwäsche","jeans",
        "textil","mode","bekleidung","baumwolle","polyester","hoodie","sneaker",
        "stiefel","laufschuhe","sandalen","lederschuhe","rucksack","handtasche",
        "leggings","shorts","bluse","hemd","schal","lederjacke","daunenjacke"
    ]},
    { cat: "furniture", keywords: [
        "stuhl","tisch","regal","schrank","sofa","couch","möbel","bett","lampe",
        "küche","matratze","teppich","vorhang","bettwäsche","kleiderschrank",
        "schreibtisch","esstisch","gartenstuhl","gartenliege"
    ]},
    { cat: "food", keywords: [
        "lebensmittel","essen","fleisch","gemüse","obst","getränk","bio","kaffee",
        "tee","milch","käse","schokolade","pasta","reis","rindfleisch","chicken"
    ]}
  ];
  for (const m of matchers) {
    if (m.keywords.some(k => t.includes(k))) return m.cat;
  }
  return "generic";
};

EcoTrace.detectMaterial = function(text) {
  const t = text.toLowerCase();
  if (t.includes("bio-baumwolle") || t.includes("organic cotton")) return "organicCotton";
  if (t.includes("baumwolle") || t.includes("cotton"))             return "cotton";
  if (t.includes("polyester"))                                     return "polyester";
  if (t.includes("wolle") || t.includes("wool"))                   return "wool";
  if (t.includes("nylon"))                                         return "nylon";
  return null;
};

EcoTrace.parseWeight = function(text) {
  const kg = text.match(/(\d+[.,]\d+|\d+)\s*kg/i);
  const g  = text.match(/(\d+[.,]\d+|\d+)\s*g\b/i);
  if (kg) return parseFloat(kg[1].replace(",", "."));
  if (g)  return parseFloat(g[1].replace(",", ".")) / 1000;
  return null;
};

EcoTrace.calculateCO2 = function({ category, material, weightKg }) {
  const r = EcoTrace.carbonRates;
  const w = weightKg || 0.5;
  switch (category) {
    case "electronics": return r.electronics[material || "default"] ?? r.electronics.default;
    case "textile":     return Math.round(((r.textile[material || "default"] ?? r.textile.default) * w) * 10) / 10;
    case "furniture":   return Math.round(((r.furniture[material || "default"] ?? r.furniture.default) * w) * 10) / 10;
    case "food":        return Math.round(((r.food[material || "default"] ?? r.food.default) * w) * 10) / 10;
    default:            return 5.0;
  }
};

EcoTrace.calculateAlternativeCO2 = co2 => Math.round(co2 * 0.30 * 10) / 10;
EcoTrace.calculateSavings = (std, alt) => Math.round((std - alt) * 10) / 10;
EcoTrace.getShippingCO2 = origin => EcoTrace.carbonRates.shipping[origin] ?? 2.0;

EcoTrace.getComparison = function(kg) {
  if (kg <= 0) return null;
  // Delegiert an CircularSwap wenn verfügbar (enthält aktuellere Werte)
  if (typeof EcoTrace.CircularSwap !== "undefined") {
    return EcoTrace.CircularSwap.getComparison(kg);
  }
  // Fallback inline (1 kg = 5 km Auto, 10 kg = 1 Baum-Jahr, 100 kg = Flug BER-LHR)
  if (kg < 1)   return { text: `≈ ${Math.round(kg * 5)} km Autofahrt` };
  if (kg < 10)  return { text: `≈ ${Math.round(kg * 5)} km Autofahrt vermieden` };
  if (kg < 100) return { text: `≈ ${(kg / 10).toFixed(1)} Jahre Lebensleistung eines Baums` };
  return { text: `≈ ${(kg / 100).toFixed(1)}× Flug Berlin–London` };
};

EcoTrace.getLeafRating = kg => kg <= 0 ? 0 : kg < 1 ? 1 : kg < 3 ? 2 : kg < 7 ? 3 : kg < 15 ? 4 : 5;

EcoTrace.saveSavings = function(savingsKg, productTitle) {
  chrome.storage.local.get(["totalSavings", "savingsLog"], data => {
    const log = data.savingsLog || [];
    log.unshift({ title: productTitle.substring(0, 60), savings: savingsKg, date: new Date().toLocaleDateString("de-DE") });
    if (log.length > 50) log.pop();
    chrome.storage.local.set({ totalSavings: (data.totalSavings || 0) + savingsKg, savingsLog: log });
  });
};

window.EcoTrace = EcoTrace;
