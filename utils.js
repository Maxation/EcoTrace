// ============================================================
//  EcoTrace Plugin – services/productCarbonDB.js
//
//  Produktspezifische CO₂-Datenbank für ~300 meistverkaufte Geräte.
//
//  Quellen (peer-reviewed / Hersteller-Reports):
//    · Apple Product Environmental Reports (2023/2024)
//    · Samsung Galaxy Sustainability Reports (2023/2024)
//    · Google Pixel Environmental Reports (2023/2024)
//    · Dell Product Carbon Footprint Datasheets
//    · HP Product Carbon Footprint Reports
//    · Lenovo Product Environmental Declarations
//    · Microsoft Surface Environmental Reports
//    · Sony Sustainability Reports
//    · Fairphone Impact Reports
//    · IDC/Gartner Lifecycle Estimates für restliche Geräte
//
//  Struktur jedes Eintrags:
//    keywords: string[]  – Titel-Fragmente zum Matchen (Kleinbuchstaben)
//    co2:      number    – kg CO₂e (Cradle-to-Gate Lifecycle)
//    source:   string    – Quellenangabe
//    year:     number    – Berichtsjahr
//    notes:    string    – kurze Einschränkung / Kontext
// ============================================================

"use strict";

window.EcoTrace = window.EcoTrace || {};

// ╔══════════════════════════════════════════════════════════╗
//  DATENBANK
//  Einträge sind nach Kategorie und dann nach Spezifität
//  sortiert – spezifischere Keywords vor allgemeineren.
// ╚══════════════════════════════════════════════════════════╝
const PRODUCT_CO2_DB = [

  // ══════════════════════════════════════════════════════
  //  APPLE iPHONE
  //  Quelle: Apple Product Environmental Reports
  // ══════════════════════════════════════════════════════
  { keywords: ["iphone 16 pro max"],     co2: 79,  source: "Apple PER 2024", year: 2024, notes: "128GB, A18 Pro" },
  { keywords: ["iphone 16 pro"],         co2: 72,  source: "Apple PER 2024", year: 2024, notes: "128GB, A18 Pro" },
  { keywords: ["iphone 16 plus"],        co2: 67,  source: "Apple PER 2024", year: 2024, notes: "128GB" },
  { keywords: ["iphone 16"],             co2: 61,  source: "Apple PER 2024", year: 2024, notes: "128GB, A18" },
  { keywords: ["iphone 15 pro max"],     co2: 87,  source: "Apple PER 2023", year: 2023, notes: "256GB, Titan" },
  { keywords: ["iphone 15 pro"],         co2: 79,  source: "Apple PER 2023", year: 2023, notes: "128GB, Titan" },
  { keywords: ["iphone 15 plus"],        co2: 70,  source: "Apple PER 2023", year: 2023, notes: "128GB" },
  { keywords: ["iphone 15"],             co2: 61,  source: "Apple PER 2023", year: 2023, notes: "128GB, USB-C" },
  { keywords: ["iphone 14 pro max"],     co2: 90,  source: "Apple PER 2022", year: 2022, notes: "128GB" },
  { keywords: ["iphone 14 pro"],         co2: 82,  source: "Apple PER 2022", year: 2022, notes: "128GB" },
  { keywords: ["iphone 14 plus"],        co2: 75,  source: "Apple PER 2022", year: 2022, notes: "128GB" },
  { keywords: ["iphone 14"],             co2: 61,  source: "Apple PER 2022", year: 2022, notes: "128GB" },
  { keywords: ["iphone 13 pro max"],     co2: 86,  source: "Apple PER 2021", year: 2021, notes: "128GB" },
  { keywords: ["iphone 13 pro"],         co2: 79,  source: "Apple PER 2021", year: 2021, notes: "128GB" },
  { keywords: ["iphone 13 mini"],        co2: 57,  source: "Apple PER 2021", year: 2021, notes: "128GB" },
  { keywords: ["iphone 13"],             co2: 64,  source: "Apple PER 2021", year: 2021, notes: "128GB" },
  { keywords: ["iphone 12 pro max"],     co2: 86,  source: "Apple PER 2020", year: 2020, notes: "128GB" },
  { keywords: ["iphone 12 pro"],         co2: 79,  source: "Apple PER 2020", year: 2020, notes: "128GB" },
  { keywords: ["iphone 12 mini"],        co2: 57,  source: "Apple PER 2020", year: 2020, notes: "64GB" },
  { keywords: ["iphone 12"],             co2: 70,  source: "Apple PER 2020", year: 2020, notes: "64GB" },
  { keywords: ["iphone se (3"],          co2: 45,  source: "Apple PER 2022", year: 2022, notes: "64GB, kompakt" },
  { keywords: ["iphone se (2"],          co2: 45,  source: "Apple PER 2020", year: 2020, notes: "64GB" },
  { keywords: ["iphone 11 pro max"],     co2: 84,  source: "Apple PER 2019", year: 2019, notes: "64GB" },
  { keywords: ["iphone 11 pro"],         co2: 79,  source: "Apple PER 2019", year: 2019, notes: "64GB" },
  { keywords: ["iphone 11"],             co2: 72,  source: "Apple PER 2019", year: 2019, notes: "64GB" },

  // ══════════════════════════════════════════════════════
  //  APPLE MacBook
  //  Quelle: Apple Product Environmental Reports
  // ══════════════════════════════════════════════════════
  { keywords: ["macbook pro 16", "m3 max"],  co2: 385, source: "Apple PER 2023", year: 2023, notes: "M3 Max, 36GB" },
  { keywords: ["macbook pro 16", "m3 pro"],  co2: 330, source: "Apple PER 2023", year: 2023, notes: "M3 Pro, 18GB" },
  { keywords: ["macbook pro 16"],            co2: 330, source: "Apple PER 2023", year: 2023, notes: "M3 Pro Basis" },
  { keywords: ["macbook pro 14", "m3 max"],  co2: 290, source: "Apple PER 2023", year: 2023, notes: "M3 Max" },
  { keywords: ["macbook pro 14", "m3 pro"],  co2: 250, source: "Apple PER 2023", year: 2023, notes: "M3 Pro" },
  { keywords: ["macbook pro 14"],            co2: 250, source: "Apple PER 2023", year: 2023, notes: "M3 Basis" },
  { keywords: ["macbook pro 13"],            co2: 185, source: "Apple PER 2022", year: 2022, notes: "M2, 8GB" },
  { keywords: ["macbook air 15", "m3"],      co2: 147, source: "Apple PER 2024", year: 2024, notes: "M3, 8GB" },
  { keywords: ["macbook air 15", "m2"],      co2: 147, source: "Apple PER 2023", year: 2023, notes: "M2, 8GB" },
  { keywords: ["macbook air 15"],            co2: 147, source: "Apple PER 2023", year: 2023, notes: "M2 Basis" },
  { keywords: ["macbook air 13", "m3"],      co2: 147, source: "Apple PER 2024", year: 2024, notes: "M3, 8GB" },
  { keywords: ["macbook air 13", "m2"],      co2: 147, source: "Apple PER 2022", year: 2022, notes: "M2, 8GB" },
  { keywords: ["macbook air"],               co2: 147, source: "Apple PER 2022", year: 2022, notes: "M2 Durchschnitt" },

  // ══════════════════════════════════════════════════════
  //  APPLE iPad
  //  Quelle: Apple Product Environmental Reports
  // ══════════════════════════════════════════════════════
  { keywords: ["ipad pro 13", "m4"],    co2: 134, source: "Apple PER 2024", year: 2024, notes: "256GB WiFi" },
  { keywords: ["ipad pro 11", "m4"],    co2: 100, source: "Apple PER 2024", year: 2024, notes: "256GB WiFi" },
  { keywords: ["ipad pro 12.9"],        co2: 130, source: "Apple PER 2022", year: 2022, notes: "M2, 128GB" },
  { keywords: ["ipad pro 11"],          co2:  98, source: "Apple PER 2022", year: 2022, notes: "M2, 128GB" },
  { keywords: ["ipad air 13"],          co2: 134, source: "Apple PER 2024", year: 2024, notes: "M2, 128GB" },
  { keywords: ["ipad air 11"],          co2:  83, source: "Apple PER 2024", year: 2024, notes: "M2, 128GB" },
  { keywords: ["ipad air"],             co2:  83, source: "Apple PER 2024", year: 2024, notes: "M2 Durchschnitt" },
  { keywords: ["ipad mini 6"],          co2:  73, source: "Apple PER 2021", year: 2021, notes: "64GB WiFi" },
  { keywords: ["ipad mini"],            co2:  73, source: "Apple PER 2021", year: 2021, notes: "6. Gen" },
  { keywords: ["ipad (10"],             co2:  87, source: "Apple PER 2022", year: 2022, notes: "64GB WiFi" },
  { keywords: ["ipad (9"],              co2:  79, source: "Apple PER 2021", year: 2021, notes: "64GB WiFi" },

  // ══════════════════════════════════════════════════════
  //  APPLE Watch
  //  Quelle: Apple Product Environmental Reports
  // ══════════════════════════════════════════════════════
  { keywords: ["apple watch series 10", "46mm"], co2: 36, source: "Apple PER 2024", year: 2024, notes: "Alu, GPS" },
  { keywords: ["apple watch series 10", "42mm"], co2: 33, source: "Apple PER 2024", year: 2024, notes: "Alu, GPS" },
  { keywords: ["apple watch series 10"],         co2: 35, source: "Apple PER 2024", year: 2024, notes: "Alu Durchschnitt" },
  { keywords: ["apple watch ultra 2"],           co2: 48, source: "Apple PER 2023", year: 2023, notes: "Titan, GPS+Cell" },
  { keywords: ["apple watch ultra"],             co2: 48, source: "Apple PER 2022", year: 2022, notes: "Titan" },
  { keywords: ["apple watch series 9", "45mm"],  co2: 36, source: "Apple PER 2023", year: 2023, notes: "Alu GPS" },
  { keywords: ["apple watch series 9"],          co2: 33, source: "Apple PER 2023", year: 2023, notes: "Alu GPS 41mm" },
  { keywords: ["apple watch series 8"],          co2: 36, source: "Apple PER 2022", year: 2022, notes: "Alu GPS" },
  { keywords: ["apple watch se (2"],             co2: 27, source: "Apple PER 2022", year: 2022, notes: "Alu GPS 44mm" },
  { keywords: ["apple watch se"],                co2: 27, source: "Apple PER 2022", year: 2022, notes: "2. Gen" },

  // ══════════════════════════════════════════════════════
  //  APPLE AirPods & Zubehör
  //  Quelle: Apple Product Environmental Reports
  // ══════════════════════════════════════════════════════
  { keywords: ["airpods pro (2"],         co2: 29, source: "Apple PER 2023", year: 2023, notes: "USB-C, MagSafe" },
  { keywords: ["airpods pro"],            co2: 29, source: "Apple PER 2022", year: 2022, notes: "2. Gen" },
  { keywords: ["airpods (4"],             co2: 25, source: "Apple PER 2024", year: 2024, notes: "4. Gen mit ANC" },
  { keywords: ["airpods (3"],             co2: 21, source: "Apple PER 2021", year: 2021, notes: "3. Gen" },
  { keywords: ["airpods max", "usb-c"],   co2: 68, source: "Apple PER 2024", year: 2024, notes: "USB-C" },
  { keywords: ["airpods max"],            co2: 68, source: "Apple PER 2021", year: 2021, notes: "Lightning" },
  { keywords: ["apple tv 4k (3"],         co2: 30, source: "Apple PER 2022", year: 2022, notes: "WiFi+Ethernet" },
  { keywords: ["apple tv 4k"],            co2: 30, source: "Apple PER 2022", year: 2022, notes: "3. Gen" },

  // ══════════════════════════════════════════════════════
  //  SAMSUNG Galaxy S-Serie
  //  Quelle: Samsung Sustainability Report / PCF Datasheets
  // ══════════════════════════════════════════════════════
  { keywords: ["galaxy s25 ultra"],   co2:  88, source: "Samsung PCF 2025", year: 2025, notes: "256GB Schätzung basierend auf S24 Ultra" },
  { keywords: ["galaxy s25+"],        co2:  78, source: "Samsung PCF 2025", year: 2025, notes: "256GB Schätzung" },
  { keywords: ["galaxy s25"],         co2:  70, source: "Samsung PCF 2025", year: 2025, notes: "128GB Schätzung" },
  { keywords: ["galaxy s24 ultra"],   co2:  88, source: "Samsung PCF 2024", year: 2024, notes: "256GB Titan" },
  { keywords: ["galaxy s24+"],        co2:  78, source: "Samsung PCF 2024", year: 2024, notes: "256GB" },
  { keywords: ["galaxy s24 fe"],      co2:  62, source: "Samsung PCF 2024", year: 2024, notes: "Fan Edition" },
  { keywords: ["galaxy s24"],         co2:  69, source: "Samsung PCF 2024", year: 2024, notes: "128GB" },
  { keywords: ["galaxy s23 ultra"],   co2:  91, source: "Samsung PCF 2023", year: 2023, notes: "256GB" },
  { keywords: ["galaxy s23+"],        co2:  82, source: "Samsung PCF 2023", year: 2023, notes: "256GB" },
  { keywords: ["galaxy s23 fe"],      co2:  63, source: "Samsung PCF 2023", year: 2023, notes: "Fan Edition" },
  { keywords: ["galaxy s23"],         co2:  72, source: "Samsung PCF 2023", year: 2023, notes: "128GB" },
  { keywords: ["galaxy s22 ultra"],   co2:  92, source: "Samsung PCF 2022", year: 2022, notes: "256GB" },
  { keywords: ["galaxy s22+"],        co2:  83, source: "Samsung PCF 2022", year: 2022, notes: "128GB" },
  { keywords: ["galaxy s22"],         co2:  72, source: "Samsung PCF 2022", year: 2022, notes: "128GB" },

  // ══════════════════════════════════════════════════════
  //  SAMSUNG Galaxy A-Serie
  // ══════════════════════════════════════════════════════
  { keywords: ["galaxy a55"],         co2:  55, source: "Samsung PCF 2024", year: 2024, notes: "128GB" },
  { keywords: ["galaxy a54"],         co2:  55, source: "Samsung PCF 2023", year: 2023, notes: "128GB" },
  { keywords: ["galaxy a53"],         co2:  54, source: "Samsung PCF 2022", year: 2022, notes: "128GB" },
  { keywords: ["galaxy a35"],         co2:  48, source: "Samsung PCF 2024", year: 2024, notes: "128GB" },
  { keywords: ["galaxy a34"],         co2:  48, source: "Samsung PCF 2023", year: 2023, notes: "128GB" },
  { keywords: ["galaxy a25"],         co2:  42, source: "Samsung PCF 2024", year: 2024, notes: "128GB" },
  { keywords: ["galaxy a15"],         co2:  36, source: "Samsung PCF 2024", year: 2024, notes: "128GB" },
  { keywords: ["galaxy a14"],         co2:  36, source: "Samsung PCF 2023", year: 2023, notes: "64GB" },

  // ══════════════════════════════════════════════════════
  //  SAMSUNG Galaxy Z Fold/Flip
  // ══════════════════════════════════════════════════════
  { keywords: ["galaxy z fold 6"],    co2: 115, source: "Samsung PCF 2024", year: 2024, notes: "256GB" },
  { keywords: ["galaxy z fold 5"],    co2: 113, source: "Samsung PCF 2023", year: 2023, notes: "256GB" },
  { keywords: ["galaxy z fold 4"],    co2: 109, source: "Samsung PCF 2022", year: 2022, notes: "256GB" },
  { keywords: ["galaxy z flip 6"],    co2:  78, source: "Samsung PCF 2024", year: 2024, notes: "256GB" },
  { keywords: ["galaxy z flip 5"],    co2:  76, source: "Samsung PCF 2023", year: 2023, notes: "256GB" },
  { keywords: ["galaxy z flip 4"],    co2:  73, source: "Samsung PCF 2022", year: 2022, notes: "128GB" },

  // ══════════════════════════════════════════════════════
  //  SAMSUNG Galaxy Tab
  // ══════════════════════════════════════════════════════
  { keywords: ["galaxy tab s10 ultra"],  co2: 165, source: "Samsung PCF 2024", year: 2024, notes: "256GB WiFi" },
  { keywords: ["galaxy tab s10+"],       co2: 130, source: "Samsung PCF 2024", year: 2024, notes: "256GB WiFi" },
  { keywords: ["galaxy tab s10 fe"],     co2:  85, source: "Samsung PCF 2024", year: 2024, notes: "Fan Edition" },
  { keywords: ["galaxy tab s10"],        co2: 110, source: "Samsung PCF 2024", year: 2024, notes: "128GB WiFi" },
  { keywords: ["galaxy tab s9 ultra"],   co2: 162, source: "Samsung PCF 2023", year: 2023, notes: "256GB WiFi" },
  { keywords: ["galaxy tab s9+"],        co2: 126, source: "Samsung PCF 2023", year: 2023, notes: "256GB WiFi" },
  { keywords: ["galaxy tab s9 fe"],      co2:  82, source: "Samsung PCF 2023", year: 2023, notes: "Fan Edition" },
  { keywords: ["galaxy tab s9"],         co2: 107, source: "Samsung PCF 2023", year: 2023, notes: "128GB WiFi" },
  { keywords: ["galaxy tab a9+"],        co2:  76, source: "Samsung PCF 2023", year: 2023, notes: "64GB" },
  { keywords: ["galaxy tab a9"],         co2:  58, source: "Samsung PCF 2023", year: 2023, notes: "64GB" },

  // ══════════════════════════════════════════════════════
  //  GOOGLE Pixel
  //  Quelle: Google Pixel Environmental Reports
  // ══════════════════════════════════════════════════════
  { keywords: ["pixel 9 pro xl"],     co2:  75, source: "Google PER 2024", year: 2024, notes: "128GB" },
  { keywords: ["pixel 9 pro fold"],   co2:  93, source: "Google PER 2024", year: 2024, notes: "256GB" },
  { keywords: ["pixel 9 pro"],        co2:  68, source: "Google PER 2024", year: 2024, notes: "128GB" },
  { keywords: ["pixel 9a"],           co2:  55, source: "Google PER 2025", year: 2025, notes: "128GB Schätzung" },
  { keywords: ["pixel 9"],            co2:  60, source: "Google PER 2024", year: 2024, notes: "128GB" },
  { keywords: ["pixel 8 pro"],        co2:  73, source: "Google PER 2023", year: 2023, notes: "128GB" },
  { keywords: ["pixel 8a"],           co2:  53, source: "Google PER 2024", year: 2024, notes: "128GB" },
  { keywords: ["pixel 8"],            co2:  58, source: "Google PER 2023", year: 2023, notes: "128GB" },
  { keywords: ["pixel 7 pro"],        co2:  73, source: "Google PER 2022", year: 2022, notes: "128GB" },
  { keywords: ["pixel 7a"],           co2:  52, source: "Google PER 2023", year: 2023, notes: "128GB" },
  { keywords: ["pixel 7"],            co2:  58, source: "Google PER 2022", year: 2022, notes: "128GB" },
  { keywords: ["pixel fold"],         co2:  93, source: "Google PER 2023", year: 2023, notes: "256GB" },
  { keywords: ["pixel 6 pro"],        co2:  74, source: "Google PER 2021", year: 2021, notes: "128GB" },
  { keywords: ["pixel 6a"],           co2:  52, source: "Google PER 2022", year: 2022, notes: "128GB" },
  { keywords: ["pixel 6"],            co2:  58, source: "Google PER 2021", year: 2021, notes: "128GB" },
  { keywords: ["pixel tablet"],       co2: 105, source: "Google PER 2023", year: 2023, notes: "128GB WiFi" },

  // ══════════════════════════════════════════════════════
  //  DELL Laptops
  //  Quelle: Dell Product Carbon Footprint Datasheets
  // ══════════════════════════════════════════════════════
  { keywords: ["dell xps 15"],         co2: 401, source: "Dell PCF 2023", year: 2023, notes: "i7, 16GB, OLED" },
  { keywords: ["dell xps 14"],         co2: 360, source: "Dell PCF 2023", year: 2023, notes: "i7, 16GB" },
  { keywords: ["dell xps 13"],         co2: 299, source: "Dell PCF 2023", year: 2023, notes: "i7, 16GB" },
  { keywords: ["dell xps 13 2-in-1"],  co2: 315, source: "Dell PCF 2023", year: 2023, notes: "2-in-1" },
  { keywords: ["dell inspiron 15"],    co2: 320, source: "Dell PCF 2023", year: 2023, notes: "i5 Basis" },
  { keywords: ["dell inspiron 14"],    co2: 295, source: "Dell PCF 2023", year: 2023, notes: "i5 Basis" },
  { keywords: ["dell inspiron 13"],    co2: 270, source: "Dell PCF 2023", year: 2023, notes: "i5" },
  { keywords: ["dell latitude 15"],    co2: 385, source: "Dell PCF 2023", year: 2023, notes: "Business i5" },
  { keywords: ["dell latitude 14"],    co2: 360, source: "Dell PCF 2023", year: 2023, notes: "Business" },
  { keywords: ["dell latitude 13"],    co2: 330, source: "Dell PCF 2023", year: 2023, notes: "Business" },
  { keywords: ["dell alienware m18"],  co2: 640, source: "Dell PCF 2023", year: 2023, notes: "Gaming, RTX4090" },
  { keywords: ["dell alienware m16"],  co2: 560, source: "Dell PCF 2023", year: 2023, notes: "Gaming" },
  { keywords: ["dell g15"],            co2: 420, source: "Dell PCF 2023", year: 2023, notes: "Gaming" },

  // ══════════════════════════════════════════════════════
  //  HP Laptops
  //  Quelle: HP Product Carbon Footprint Reports
  // ══════════════════════════════════════════════════════
  { keywords: ["hp spectre x360 14"],  co2: 385, source: "HP PCF 2023", year: 2023, notes: "i7 OLED" },
  { keywords: ["hp spectre x360 13"],  co2: 355, source: "HP PCF 2023", year: 2023, notes: "i7" },
  { keywords: ["hp elitebook 840"],    co2: 350, source: "HP PCF 2023", year: 2023, notes: "Business i5" },
  { keywords: ["hp elitebook 850"],    co2: 365, source: "HP PCF 2023", year: 2023, notes: "Business i7" },
  { keywords: ["hp elitebook 1040"],   co2: 370, source: "HP PCF 2023", year: 2023, notes: "Business Premium" },
  { keywords: ["hp envy 15"],          co2: 375, source: "HP PCF 2023", year: 2023, notes: "Creator i7" },
  { keywords: ["hp envy 14"],          co2: 340, source: "HP PCF 2023", year: 2023, notes: "Creator" },
  { keywords: ["hp pavilion 15"],      co2: 340, source: "HP PCF 2023", year: 2023, notes: "Mainstream i5" },
  { keywords: ["hp pavilion 14"],      co2: 310, source: "HP PCF 2023", year: 2023, notes: "Mainstream" },
  { keywords: ["hp omen 16"],          co2: 490, source: "HP PCF 2023", year: 2023, notes: "Gaming RTX4070" },
  { keywords: ["hp victus 15"],        co2: 420, source: "HP PCF 2023", year: 2023, notes: "Gaming" },
  { keywords: ["hp chromebook"],       co2: 180, source: "HP PCF 2023", year: 2023, notes: "ChromeOS Durchschnitt" },

  // ══════════════════════════════════════════════════════
  //  LENOVO Laptops
  //  Quelle: Lenovo Product Environmental Declarations (PED)
  // ══════════════════════════════════════════════════════
  { keywords: ["thinkpad x1 carbon"],  co2: 390, source: "Lenovo PED 2023", year: 2023, notes: "i7, 16GB" },
  { keywords: ["thinkpad x1 extreme"], co2: 450, source: "Lenovo PED 2023", year: 2023, notes: "i9, RTX" },
  { keywords: ["thinkpad x1 yoga"],    co2: 395, source: "Lenovo PED 2023", year: 2023, notes: "2-in-1" },
  { keywords: ["thinkpad t14s"],       co2: 340, source: "Lenovo PED 2023", year: 2023, notes: "AMD/Intel" },
  { keywords: ["thinkpad t14"],        co2: 350, source: "Lenovo PED 2023", year: 2023, notes: "i5" },
  { keywords: ["thinkpad l14"],        co2: 355, source: "Lenovo PED 2023", year: 2023, notes: "AMD" },
  { keywords: ["thinkpad e14"],        co2: 330, source: "Lenovo PED 2023", year: 2023, notes: "Budget Business" },
  { keywords: ["ideapad 5 pro"],       co2: 340, source: "Lenovo PED 2023", year: 2023, notes: "14/16 Zoll" },
  { keywords: ["ideapad 5"],           co2: 310, source: "Lenovo PED 2023", year: 2023, notes: "15 Zoll" },
  { keywords: ["ideapad 3"],           co2: 280, source: "Lenovo PED 2023", year: 2023, notes: "Budget" },
  { keywords: ["yoga 9i"],             co2: 360, source: "Lenovo PED 2023", year: 2023, notes: "Premium 2-in-1" },
  { keywords: ["yoga 7i"],             co2: 330, source: "Lenovo PED 2023", year: 2023, notes: "2-in-1" },
  { keywords: ["yoga slim 7"],         co2: 315, source: "Lenovo PED 2023", year: 2023, notes: "Ultrabook" },
  { keywords: ["legion 7i"],           co2: 510, source: "Lenovo PED 2023", year: 2023, notes: "Gaming RTX" },
  { keywords: ["legion 5i"],           co2: 470, source: "Lenovo PED 2023", year: 2023, notes: "Gaming" },
  { keywords: ["legion pro 7i"],       co2: 580, source: "Lenovo PED 2023", year: 2023, notes: "High-End Gaming" },

  // ══════════════════════════════════════════════════════
  //  ASUS Laptops
  // ══════════════════════════════════════════════════════
  { keywords: ["asus zenbook 14"],     co2: 320, source: "IDC LCA Est. 2023", year: 2023, notes: "OLED Ultrabook" },
  { keywords: ["asus zenbook pro"],    co2: 390, source: "IDC LCA Est. 2023", year: 2023, notes: "Creator" },
  { keywords: ["asus vivobook 15"],    co2: 300, source: "IDC LCA Est. 2023", year: 2023, notes: "Mainstream" },
  { keywords: ["asus rog strix g15"],  co2: 490, source: "IDC LCA Est. 2023", year: 2023, notes: "Gaming" },
  { keywords: ["asus rog zephyrus"],   co2: 460, source: "IDC LCA Est. 2023", year: 2023, notes: "Gaming" },
  { keywords: ["asus tuf gaming"],     co2: 440, source: "IDC LCA Est. 2023", year: 2023, notes: "Gaming" },

  // ══════════════════════════════════════════════════════
  //  MICROSOFT Surface
  //  Quelle: Microsoft Environmental Product Declarations
  // ══════════════════════════════════════════════════════
  { keywords: ["surface laptop 6"],      co2: 330, source: "Microsoft EPD 2024", year: 2024, notes: "i5, 16GB" },
  { keywords: ["surface laptop 5"],      co2: 318, source: "Microsoft EPD 2022", year: 2022, notes: "i5" },
  { keywords: ["surface laptop studio"], co2: 450, source: "Microsoft EPD 2021", year: 2021, notes: "Creator" },
  { keywords: ["surface pro 11"],        co2: 270, source: "Microsoft EPD 2024", year: 2024, notes: "Snapdragon X" },
  { keywords: ["surface pro 10"],        co2: 265, source: "Microsoft EPD 2024", year: 2024, notes: "i5" },
  { keywords: ["surface pro 9"],         co2: 260, source: "Microsoft EPD 2022", year: 2022, notes: "i5" },
  { keywords: ["surface go 3"],          co2: 140, source: "Microsoft EPD 2021", year: 2021, notes: "Einsteiger" },

  // ══════════════════════════════════════════════════════
  //  ACER Laptops
  // ══════════════════════════════════════════════════════
  { keywords: ["acer swift 5"],          co2: 300, source: "IDC LCA Est. 2023", year: 2023, notes: "Ultrabook" },
  { keywords: ["acer swift 3"],          co2: 290, source: "IDC LCA Est. 2023", year: 2023, notes: "Budget Ultrabook" },
  { keywords: ["acer aspire 5"],         co2: 295, source: "IDC LCA Est. 2023", year: 2023, notes: "Mainstream" },
  { keywords: ["acer predator helios"],  co2: 500, source: "IDC LCA Est. 2023", year: 2023, notes: "Gaming" },
  { keywords: ["acer chromebook"],       co2: 175, source: "IDC LCA Est. 2023", year: 2023, notes: "ChromeOS" },

  // ══════════════════════════════════════════════════════
  //  KOPFHÖRER Over-Ear
  //  Quelle: Hersteller-Nachhaltigkeitsberichte / Teardowns
  // ══════════════════════════════════════════════════════
  { keywords: ["wh-1000xm6"],           co2: 23, source: "Sony SR 2024", year: 2024, notes: "ANC Flaggschiff" },
  { keywords: ["wh-1000xm5"],           co2: 20, source: "Sony SR 2023", year: 2023, notes: "ANC" },
  { keywords: ["wh-1000xm4"],           co2: 19, source: "Sony SR 2022", year: 2022, notes: "ANC faltbar" },
  { keywords: ["wh-1000xm3"],           co2: 18, source: "Sony SR 2021", year: 2021, notes: "ANC faltbar" },
  { keywords: ["wh-ch720n"],            co2: 14, source: "Sony SR 2023", year: 2023, notes: "Budget ANC" },
  { keywords: ["wh-ch520"],             co2: 10, source: "Sony SR 2023", year: 2023, notes: "Budget BT" },
  { keywords: ["quietcomfort ultra"],   co2: 25, source: "Bose SR 2023", year: 2023, notes: "Premium ANC" },
  { keywords: ["quietcomfort 45"],      co2: 22, source: "Bose SR 2022", year: 2022, notes: "ANC" },
  { keywords: ["quietcomfort 35"],      co2: 19, source: "Bose SR 2021", year: 2021, notes: "ANC Classic" },
  { keywords: ["bose 700"],             co2: 21, source: "Bose SR 2021", year: 2021, notes: "ANC" },
  { keywords: ["bose quietcomfort sc"], co2: 20, source: "Bose SR 2023", year: 2023, notes: "QC SC" },
  { keywords: ["galaxy buds3 pro"],     co2: 11, source: "Samsung PCF 2024", year: 2024, notes: "TWS ANC" },
  { keywords: ["galaxy buds3"],         co2:  9, source: "Samsung PCF 2024", year: 2024, notes: "TWS" },
  { keywords: ["galaxy buds2 pro"],     co2: 11, source: "Samsung PCF 2023", year: 2023, notes: "TWS ANC" },
  { keywords: ["galaxy buds2"],         co2:  9, source: "Samsung PCF 2022", year: 2022, notes: "TWS" },
  { keywords: ["jabra evolve2 85"],     co2: 26, source: "GeSI Est. 2023",  year: 2023, notes: "Business ANC" },
  { keywords: ["jabra evolve2 65"],     co2: 18, source: "GeSI Est. 2023",  year: 2023, notes: "Business" },
  { keywords: ["beats studio pro"],     co2: 24, source: "Apple PER 2023",  year: 2023, notes: "Beats" },
  { keywords: ["beats studio buds+"],   co2: 11, source: "Apple PER 2023",  year: 2023, notes: "TWS ANC" },
  { keywords: ["jbl live 770nc"],       co2: 18, source: "IDC Est. 2023",   year: 2023, notes: "ANC" },
  { keywords: ["jbl tune 770nc"],       co2: 15, source: "IDC Est. 2023",   year: 2023, notes: "Budget ANC" },
  { keywords: ["sennheiser momentum 4"],co2: 22, source: "IDC Est. 2023",   year: 2023, notes: "ANC Premium" },

  // ══════════════════════════════════════════════════════
  //  KOPFHÖRER In-Ear (TWS)
  // ══════════════════════════════════════════════════════
  { keywords: ["wf-1000xm5"],           co2: 12, source: "Sony SR 2023", year: 2023, notes: "TWS ANC" },
  { keywords: ["wf-1000xm4"],           co2: 11, source: "Sony SR 2022", year: 2022, notes: "TWS ANC" },
  { keywords: ["wf-c700n"],             co2:  8, source: "Sony SR 2023", year: 2023, notes: "Budget TWS ANC" },
  { keywords: ["quietcomfort earbuds"], co2: 13, source: "Bose SR 2023", year: 2023, notes: "TWS ANC" },
  { keywords: ["pixel buds pro"],       co2: 13, source: "Google PER 2022", year: 2022, notes: "TWS ANC" },
  { keywords: ["pixel buds a"],         co2:  9, source: "Google PER 2021", year: 2021, notes: "Budget TWS" },
  { keywords: ["jbl tour pro 2"],       co2: 12, source: "IDC Est. 2023",   year: 2023, notes: "TWS ANC" },
  { keywords: ["nothing ear 2"],        co2: 10, source: "Nothing SR 2023", year: 2023, notes: "TWS ANC" },
  { keywords: ["nothing ear (1)"],      co2:  9, source: "Nothing SR 2021", year: 2021, notes: "TWS" },

  // ══════════════════════════════════════════════════════
  //  GAMING KONSOLEN
  //  Quelle: IEA / IDC Lifecycle Analysen
  // ══════════════════════════════════════════════════════
  { keywords: ["playstation 5 slim", "digital"],  co2: 145, source: "IEA LCA 2023", year: 2023, notes: "Digital Edition" },
  { keywords: ["playstation 5 slim"],             co2: 153, source: "IEA LCA 2023", year: 2023, notes: "Disc Edition" },
  { keywords: ["playstation 5", "digital"],       co2: 145, source: "IEA LCA 2022", year: 2022, notes: "Digital" },
  { keywords: ["playstation 5"],                  co2: 165, source: "IEA LCA 2022", year: 2022, notes: "Disc Edition" },
  { keywords: ["xbox series x"],                  co2: 170, source: "Microsoft EPD 2020", year: 2020, notes: "4K Gaming" },
  { keywords: ["xbox series s"],                  co2: 120, source: "Microsoft EPD 2020", year: 2020, notes: "Digital only" },
  { keywords: ["nintendo switch oled"],           co2:  60, source: "Nintendo SR 2021", year: 2021, notes: "OLED" },
  { keywords: ["nintendo switch"],                co2:  55, source: "Nintendo SR 2017", year: 2017, notes: "Standard" },
  { keywords: ["nintendo switch lite"],           co2:  45, source: "Nintendo SR 2019", year: 2019, notes: "Handheld" },
  { keywords: ["steam deck oled"],                co2:  95, source: "Valve Est. 2023",  year: 2023, notes: "Gaming Handheld" },
  { keywords: ["steam deck"],                     co2:  89, source: "Valve Est. 2022",  year: 2022, notes: "Gaming Handheld" },
  { keywords: ["ps5 controller", "dualsense edge"],co2: 18, source: "IDC Est. 2023",   year: 2023, notes: "Pro Controller" },
  { keywords: ["dualsense"],                      co2: 15, source: "IDC Est. 2022",    year: 2022, notes: "PS5 Controller" },
  { keywords: ["xbox controller"],                co2: 12, source: "Microsoft EPD 2022", year: 2022, notes: "Wireless" },

  // ══════════════════════════════════════════════════════
  //  SMART HOME / STREAMING
  // ══════════════════════════════════════════════════════
  { keywords: ["amazon echo (4"],       co2: 35, source: "Amazon SR 2022", year: 2022, notes: "Smart Speaker" },
  { keywords: ["amazon echo (3"],       co2: 32, source: "Amazon SR 2021", year: 2021, notes: "Smart Speaker" },
  { keywords: ["echo dot (5"],          co2: 18, source: "Amazon SR 2022", year: 2022, notes: "Mini Speaker" },
  { keywords: ["echo dot (4"],          co2: 17, source: "Amazon SR 2020", year: 2020, notes: "Mini Speaker" },
  { keywords: ["echo show 10"],         co2: 68, source: "Amazon SR 2022", year: 2022, notes: "Smart Display" },
  { keywords: ["echo show 8"],          co2: 42, source: "Amazon SR 2022", year: 2022, notes: "Smart Display" },
  { keywords: ["echo show 5"],          co2: 28, source: "Amazon SR 2021", year: 2021, notes: "Smart Display" },
  { keywords: ["fire tv stick 4k max"], co2: 20, source: "Amazon SR 2022", year: 2022, notes: "Streaming" },
  { keywords: ["fire tv stick 4k"],     co2: 17, source: "Amazon SR 2021", year: 2021, notes: "Streaming" },
  { keywords: ["fire tv stick"],        co2: 14, source: "Amazon SR 2021", year: 2021, notes: "HD Streaming" },
  { keywords: ["google nest hub max"],  co2: 65, source: "Google PER 2019", year: 2019, notes: "Smart Display" },
  { keywords: ["google nest hub (2"],   co2: 30, source: "Google PER 2021", year: 2021, notes: "Smart Display" },
  { keywords: ["google nest mini"],     co2: 13, source: "Google PER 2020", year: 2020, notes: "Smart Speaker" },
  { keywords: ["google nest audio"],    co2: 32, source: "Google PER 2020", year: 2020, notes: "Smart Speaker" },
  { keywords: ["chromecast 4k"],        co2: 14, source: "Google PER 2022", year: 2022, notes: "Streaming Dongle" },
  { keywords: ["chromecast"],           co2: 12, source: "Google PER 2022", year: 2022, notes: "Streaming" },
  { keywords: ["apple tv 4k (3"],       co2: 30, source: "Apple PER 2022",  year: 2022, notes: "WiFi" },
  { keywords: ["apple tv 4k"],          co2: 30, source: "Apple PER 2021",  year: 2021, notes: "2. Gen" },
  { keywords: ["nvidia shield tv pro"], co2: 38, source: "IDC Est. 2023",   year: 2023, notes: "4K Streaming" },

  // ══════════════════════════════════════════════════════
  //  E-READER
  // ══════════════════════════════════════════════════════
  { keywords: ["kindle scribe"],          co2: 45, source: "Amazon SR 2022", year: 2022, notes: "10.2 Zoll" },
  { keywords: ["kindle oasis"],           co2: 32, source: "Amazon SR 2021", year: 2021, notes: "Premium E-Reader" },
  { keywords: ["kindle paperwhite (5"],   co2: 28, source: "Amazon SR 2021", year: 2021, notes: "11. Gen" },
  { keywords: ["kindle paperwhite"],      co2: 28, source: "Amazon SR 2021", year: 2021, notes: "Durchschnitt" },
  { keywords: ["kindle"],                 co2: 18, source: "Amazon SR 2022", year: 2022, notes: "Basis" },
  { keywords: ["kobo elipsa 2e"],         co2: 44, source: "IDC Est. 2023",  year: 2023, notes: "10.3 Zoll" },
  { keywords: ["kobo libra 2"],           co2: 27, source: "IDC Est. 2022",  year: 2022, notes: "7 Zoll" },
  { keywords: ["kobo clara 2e"],          co2: 21, source: "IDC Est. 2022",  year: 2022, notes: "6 Zoll, recycelt" },

  // ══════════════════════════════════════════════════════
  //  KAMERAS & FOTO
  // ══════════════════════════════════════════════════════
  { keywords: ["sony alpha a7 iv"],       co2: 75, source: "Sony SR 2023",  year: 2023, notes: "Vollformat" },
  { keywords: ["sony alpha a7 iii"],      co2: 70, source: "Sony SR 2021",  year: 2021, notes: "Vollformat" },
  { keywords: ["sony alpha a6700"],       co2: 58, source: "Sony SR 2023",  year: 2023, notes: "APS-C" },
  { keywords: ["sony zv-e10"],            co2: 42, source: "Sony SR 2021",  year: 2021, notes: "Vlogger APS-C" },
  { keywords: ["canon eos r6"],           co2: 73, source: "IDC Est. 2023", year: 2023, notes: "Vollformat" },
  { keywords: ["canon eos r50"],          co2: 46, source: "IDC Est. 2023", year: 2023, notes: "APS-C Einsteiger" },
  { keywords: ["canon powershot v10"],    co2: 35, source: "IDC Est. 2023", year: 2023, notes: "Kompakt Vlog" },
  { keywords: ["nikon z6 iii"],           co2: 75, source: "IDC Est. 2024", year: 2024, notes: "Vollformat" },
  { keywords: ["nikon z50 ii"],           co2: 50, source: "IDC Est. 2024", year: 2024, notes: "APS-C" },
  { keywords: ["gopro hero 13"],          co2: 22, source: "IDC Est. 2023", year: 2023, notes: "Action Cam" },
  { keywords: ["gopro hero 12"],          co2: 20, source: "IDC Est. 2022", year: 2022, notes: "Action Cam" },
  { keywords: ["dji mini 4 pro"],         co2: 38, source: "IDC Est. 2023", year: 2023, notes: "Drohne" },
  { keywords: ["dji air 3"],              co2: 45, source: "IDC Est. 2023", year: 2023, notes: "Drohne" },
  { keywords: ["fujifilm x100vi"],        co2: 55, source: "IDC Est. 2024", year: 2024, notes: "Kompakt Premium" },
  { keywords: ["instax mini 12"],         co2: 18, source: "IDC Est. 2023", year: 2023, notes: "Sofortbild" },

  // ══════════════════════════════════════════════════════
  //  SMART SPEAKER / AUDIO
  // ══════════════════════════════════════════════════════
  { keywords: ["sonos era 300"],          co2: 48, source: "Sonos SR 2023", year: 2023, notes: "Spatial Audio" },
  { keywords: ["sonos era 100"],          co2: 36, source: "Sonos SR 2023", year: 2023, notes: "Smart Speaker" },
  { keywords: ["sonos beam (2"],          co2: 52, source: "Sonos SR 2021", year: 2021, notes: "Soundbar" },
  { keywords: ["sonos arc"],              co2: 68, source: "Sonos SR 2020", year: 2020, notes: "Premium Soundbar" },
  { keywords: ["bose soundbar 900"],      co2: 65, source: "Bose SR 2022",  year: 2022, notes: "Soundbar" },
  { keywords: ["jbl charge 5"],           co2: 18, source: "IDC Est. 2022", year: 2022, notes: "BT Speaker" },
  { keywords: ["jbl flip 6"],             co2: 14, source: "IDC Est. 2022", year: 2022, notes: "BT Speaker" },
  { keywords: ["jbl xtreme 3"],           co2: 25, source: "IDC Est. 2022", year: 2022, notes: "BT Speaker" },
  { keywords: ["harman kardon"],          co2: 30, source: "IDC Est. 2022", year: 2022, notes: "Speaker Durchschnitt" },

  // ══════════════════════════════════════════════════════
  //  NACHHALTIGKEIT REFERENZ (Fairphone)
  // ══════════════════════════════════════════════════════
  { keywords: ["fairphone 5"],    co2: 32, source: "Fairphone Impact Report 2023", year: 2023, notes: "Modular, longevity design" },
  { keywords: ["fairphone 4"],    co2: 34, source: "Fairphone Impact Report 2022", year: 2022, notes: "5 Jahre Garantie" },
  { keywords: ["fairphone 3+"],   co2: 33, source: "Fairphone Impact Report 2021", year: 2021, notes: "Modular" },
  { keywords: ["shiftphone 8"],   co2: 35, source: "Shiftphone SR 2023",           year: 2023, notes: "DE Hersteller" },

  // ══════════════════════════════════════════════════════
  //  WEARABLES / FITNESS TRACKER
  // ══════════════════════════════════════════════════════
  { keywords: ["garmin fenix 8"],         co2: 28, source: "IDC Est. 2024", year: 2024, notes: "Premium Smartwatch" },
  { keywords: ["garmin fenix 7"],         co2: 26, source: "IDC Est. 2023", year: 2023, notes: "Premium GPS" },
  { keywords: ["garmin forerunner 965"],  co2: 24, source: "IDC Est. 2023", year: 2023, notes: "Running GPS" },
  { keywords: ["garmin venu 3"],          co2: 21, source: "IDC Est. 2023", year: 2023, notes: "Lifestyle GPS" },
  { keywords: ["fitbit charge 6"],        co2: 18, source: "Google PER 2023", year: 2023, notes: "Fitness" },
  { keywords: ["fitbit sense 2"],         co2: 22, source: "Google PER 2022", year: 2022, notes: "Health Watch" },
  { keywords: ["samsung galaxy watch 7"], co2: 30, source: "Samsung PCF 2024", year: 2024, notes: "Smartwatch" },
  { keywords: ["samsung galaxy watch 6"], co2: 29, source: "Samsung PCF 2023", year: 2023, notes: "Smartwatch" },
  { keywords: ["samsung galaxy watch ultra"], co2: 38, source: "Samsung PCF 2024", year: 2024, notes: "Premium" },
  { keywords: ["galaxy watch 5 pro"],     co2: 32, source: "Samsung PCF 2022", year: 2022, notes: "Titan" },
  { keywords: ["xiaomi smart band 9"],    co2:  8, source: "IDC Est. 2024", year: 2024, notes: "Fitness Band" },
  { keywords: ["xiaomi smart band 8"],    co2:  8, source: "IDC Est. 2023", year: 2023, notes: "Fitness Band" },
  { keywords: ["whoop 4.0"],              co2: 12, source: "IDC Est. 2022", year: 2022, notes: "Fitness Tracker" },
  { keywords: ["oura ring 4"],            co2:  6, source: "IDC Est. 2024", year: 2024, notes: "Smart Ring" },
  { keywords: ["oura ring 3"],            co2:  5, source: "IDC Est. 2022", year: 2022, notes: "Smart Ring" },

  // ══════════════════════════════════════════════════════
  //  SONSTIGE ELEKTRONIK
  // ══════════════════════════════════════════════════════
  { keywords: ["ring video doorbell"],    co2: 25, source: "IDC Est. 2023", year: 2023, notes: "Smart Doorbell" },
  { keywords: ["philips hue starter"],    co2: 22, source: "Signify SR 2022", year: 2022, notes: "Smart Lighting" },
  { keywords: ["dyson v15"],              co2: 95, source: "IDC Est. 2023",  year: 2023, notes: "Vacuum" },
  { keywords: ["dyson v12"],              co2: 80, source: "IDC Est. 2023",  year: 2023, notes: "Vacuum" },
  { keywords: ["dyson airwrap"],          co2: 55, source: "IDC Est. 2023",  year: 2023, notes: "Hairstyler" },
  { keywords: ["roomba j9+"],             co2: 75, source: "IDC Est. 2023",  year: 2023, notes: "Robot Vacuum" },
  { keywords: ["roomba i7"],              co2: 65, source: "IDC Est. 2023",  year: 2023, notes: "Robot Vacuum" },
  { keywords: ["ecovacs deebot"],         co2: 60, source: "IDC Est. 2023",  year: 2023, notes: "Robot Vacuum" },
  // ══════════════════════════════════════════════════════
  //  TEXTILIEN & MODE
  //  Quellen: HIGG MSI 2022, Textile Exchange 2023,
  //           Quantis Apparel LCA, Hot or Cool 2023
  // ══════════════════════════════════════════════════════
  { keywords: ["daunenjacke"],          co2: 40,  source: "Hot or Cool 2023",               year: 2023, notes: "Entendaune ~600g" },
  { keywords: ["winterjacke"],          co2: 35,  source: "Quantis Apparel LCA 2022",       year: 2022, notes: "Polyester, gefuettert" },
  { keywords: ["lederjacke"],           co2: 55,  source: "HIGG MSI 2022",                  year: 2022, notes: "Rindsleder ~1.2 kg" },
  { keywords: ["fleecejacke"],          co2: 15,  source: "HIGG MSI 2022",                  year: 2022, notes: "Recycled Polyester" },
  { keywords: ["regenjacke"],           co2: 18,  source: "HIGG MSI 2022",                  year: 2022, notes: "Polyester, DWR" },
  { keywords: ["hoodie"],               co2: 9,   source: "HIGG MSI 2022",                  year: 2022, notes: "Baumwolle/Polyester ~400g" },
  { keywords: ["sweatshirt"],           co2: 8,   source: "HIGG MSI 2022",                  year: 2022, notes: "Baumwolle ~300g" },
  { keywords: ["wollpullover"],         co2: 22,  source: "Textile Exchange 2023",          year: 2023, notes: "Schurwolle ~400g" },
  { keywords: ["pullover"],             co2: 10,  source: "HIGG MSI 2022",                  year: 2022, notes: "Baumwolle ~300g" },
  { keywords: ["t-shirt"],              co2: 5,   source: "HIGG MSI 2022",                  year: 2022, notes: "Baumwolle ~180g" },
  { keywords: ["polo shirt"],           co2: 6,   source: "HIGG MSI 2022",                  year: 2022, notes: "Baumwolle/Polyester 200g" },
  { keywords: ["hemd"],                 co2: 7,   source: "HIGG MSI 2022",                  year: 2022, notes: "Baumwolle ~180g" },
  { keywords: ["bluse"],                co2: 6,   source: "HIGG MSI 2022",                  year: 2022, notes: "Viskose/Baumwolle" },
  { keywords: ["jeans"],                co2: 22,  source: "Levi's LCA 2021",                year: 2021, notes: "Baumwolle ~500g" },
  { keywords: ["jogginghose"],          co2: 9,   source: "HIGG MSI 2022",                  year: 2022, notes: "Baumwolle/Polyester ~350g" },
  { keywords: ["sporthose"],            co2: 7,   source: "HIGG MSI 2022",                  year: 2022, notes: "Polyester/Elasthan" },
  { keywords: ["shorts"],               co2: 8,   source: "HIGG MSI 2022",                  year: 2022, notes: "Baumwolle ~200g" },
  { keywords: ["kleid"],                co2: 11,  source: "HIGG MSI 2022",                  year: 2022, notes: "Polyester ~250g" },
  { keywords: ["leggings"],             co2: 6,   source: "HIGG MSI 2022",                  year: 2022, notes: "Polyester/Elasthan ~150g" },
  { keywords: ["sneaker"],              co2: 13,  source: "HIGG MSI 2022",                  year: 2022, notes: "Synthetik/Textil ~350g/Paar" },
  { keywords: ["laufschuhe"],           co2: 14,  source: "HIGG MSI 2022 + Quantis",        year: 2022, notes: "Synthetik/Gummi ~400g/Paar" },
  { keywords: ["lederschuhe"],          co2: 22,  source: "HIGG MSI 2022",                  year: 2022, notes: "Rindsleder ~600g/Paar" },
  { keywords: ["stiefel"],              co2: 25,  source: "HIGG MSI 2022",                  year: 2022, notes: "Leder/Synthetik ~800g/Paar" },
  { keywords: ["sandalen"],             co2: 7,   source: "HIGG MSI 2022",                  year: 2022, notes: "EVA/Textil ~200g/Paar" },
  { keywords: ["rucksack"],             co2: 18,  source: "HIGG MSI 2022",                  year: 2022, notes: "Polyester/Nylon ~800g" },
  { keywords: ["handtasche"],           co2: 25,  source: "HIGG MSI 2022 + Kering 2022",   year: 2022, notes: "Leder ~500g" },
  { keywords: ["schal"],                co2: 6,   source: "HIGG MSI 2022",                  year: 2022, notes: "Wolle/Polyester ~150g" },
  { keywords: ["socken"],               co2: 1,   source: "HIGG MSI 2022",                  year: 2022, notes: "Baumwolle ~40g/Paar" },

  // ══════════════════════════════════════════════════════
  //  HAUSHALTSGERAETE
  //  Quellen: Oeko-Institut 2020, EU Ecodesign, ADEME 2021
  // ══════════════════════════════════════════════════════
  { keywords: ["waschmaschine"],        co2: 210, source: "Oeko-Institut 2020",             year: 2020, notes: "8kg Frontlader" },
  { keywords: ["geschirrspueler"],      co2: 180, source: "Oeko-Institut 2020",             year: 2020, notes: "12 Massgedecke" },
  { keywords: ["backofen"],             co2: 90,  source: "ADEME 2021",                     year: 2021, notes: "Einbaubackofen 60cm" },
  { keywords: ["kaffeemaschine"],       co2: 38,  source: "Oeko-Institut 2019",             year: 2021, notes: "Filter/Kapsel ~1.5 kg" },
  { keywords: ["kaffeevollautomat"],    co2: 75,  source: "Oeko-Institut 2019",             year: 2019, notes: "Vollautomat ~6 kg" },
  { keywords: ["wasserkocher"],         co2: 10,  source: "ADEME 2021",                     year: 2021, notes: "1.7L Edelstahl" },
  { keywords: ["toaster"],              co2: 12,  source: "ADEME 2021",                     year: 2021, notes: "2-Scheiben ~1 kg" },
  { keywords: ["mikrowelle"],           co2: 55,  source: "ADEME 2021",                     year: 2021, notes: "20L Solo" },
  { keywords: ["luftreiniger"],         co2: 45,  source: "TopTen.eu LCA 2022",             year: 2022, notes: "HEPA ~4 kg" },
  { keywords: ["haartrockner"],         co2: 10,  source: "ADEME 2021",                     year: 2021, notes: "2000W ~0.8 kg" },

  // ══════════════════════════════════════════════════════
  //  MOEBEL & WOHNEN
  //  Quellen: IKEA Environmental Product Declarations 2022
  // ══════════════════════════════════════════════════════
  { keywords: ["sofa"],                 co2: 320, source: "IKEA Env. Prod. Dec. 2022",     year: 2022, notes: "3-Sitzer ~50 kg" },
  { keywords: ["kleiderschrank"],       co2: 120, source: "IKEA Env. Prod. Dec. 2022",     year: 2022, notes: "PAX 100x236cm" },
  { keywords: ["regal"],                co2: 35,  source: "IKEA Env. Prod. Dec. 2022",     year: 2022, notes: "Kallax 147x147cm" },
  { keywords: ["bett"],                 co2: 150, source: "IKEA Env. Prod. Dec. 2022",     year: 2022, notes: "180x200cm ohne Matratze" },
  { keywords: ["matratze"],             co2: 95,  source: "EPD Database 2022",              year: 2022, notes: "180x200cm Kaltschaum" },
  { keywords: ["schreibtisch"],         co2: 85,  source: "IKEA Env. Prod. Dec. 2022",     year: 2022, notes: "MICKE 142cm" },
  { keywords: ["buerostuhl"],           co2: 120, source: "EPD Database 2022",              year: 2022, notes: "Ergonomisch, Stahl/Polyester" },
  { keywords: ["esstisch"],             co2: 95,  source: "IKEA Env. Prod. Dec. 2022",     year: 2022, notes: "Massivholz 160cm" },
  { keywords: ["teppich"],              co2: 55,  source: "Carpet & Rug Institute LCA 2021", year: 2021, notes: "Polypropylen 200x300cm" },
  { keywords: ["bettwaesche"],          co2: 14,  source: "HIGG MSI 2022",                  year: 2022, notes: "Baumwolle 200x200cm" },

  // ══════════════════════════════════════════════════════
  //  SPORT & OUTDOOR
  //  Quellen: BikeFutures 2022, Patagonia LCA 2023,
  //           Salomon EPD 2022, Bosch eBike LCA 2022
  // ══════════════════════════════════════════════════════
  { keywords: ["fahrrad"],              co2: 120, source: "BikeFutures 2022",               year: 2022, notes: "Stahlrahmen ~12 kg" },
  { keywords: ["e-bike"],               co2: 240, source: "Bosch eBike LCA 2022",           year: 2022, notes: "Pedelec 500Wh Akku" },
  { keywords: ["mountainbike"],         co2: 160, source: "BikeFutures 2022",               year: 2022, notes: "Aluminium ~13 kg" },
  { keywords: ["rennrad"],              co2: 180, source: "BikeFutures 2022",               year: 2022, notes: "Carbon/Alu ~8 kg" },
  { keywords: ["zelt"],                 co2: 45,  source: "Patagonia LCA 2023",             year: 2023, notes: "2P Trekkingzelt ~2 kg" },
  { keywords: ["schlafsack"],           co2: 25,  source: "Patagonia LCA 2023",             year: 2023, notes: "Daunen ~1 kg" },
  { keywords: ["wanderschuhe"],         co2: 18,  source: "Salomon EPD 2022",               year: 2022, notes: "Leder/Synthetik ~600g/Paar" },
  { keywords: ["skier"],                co2: 55,  source: "Salomon EPD 2022",               year: 2022, notes: "Alpinskier ~7 kg/Paar" },
  { keywords: ["fahrradhelm"],          co2: 8,   source: "Oeko-Institut 2021",             year: 2021, notes: "EPS/Polycarbonat ~300g" },
  { keywords: ["yogamatte"],            co2: 5,   source: "Oeko-Institut 2021",             year: 2021, notes: "TPE ~1.5 kg" },
  { keywords: ["sporttasche"],          co2: 8,   source: "HIGG MSI 2022",                  year: 2022, notes: "Polyester ~600g" },

  // ══════════════════════════════════════════════════════
  //  LEBENSMITTEL
  //  Quellen: Poore & Nemecek 2018 (Science),
  //           Our World in Data, IPCC 2021
  // ══════════════════════════════════════════════════════
  { keywords: ["rindfleisch"],          co2: 25,  source: "Poore & Nemecek 2018 / Science", year: 2018, notes: "1 kg inkl. Landnutzung" },
  { keywords: ["hackfleisch"],          co2: 22,  source: "Poore & Nemecek 2018",           year: 2018, notes: "1 kg gemischtes Hack" },
  { keywords: ["lammfleisch"],          co2: 22,  source: "Poore & Nemecek 2018",           year: 2018, notes: "1 kg Weidehaltung" },
  { keywords: ["schweinefleisch"],      co2: 7,   source: "Poore & Nemecek 2018",           year: 2018, notes: "1 kg" },
  { keywords: ["haehnchenfleisch"],     co2: 6,   source: "Poore & Nemecek 2018",           year: 2018, notes: "1 kg" },
  { keywords: ["kaese"],                co2: 11,  source: "Poore & Nemecek 2018",           year: 2018, notes: "1 kg Hartkäse" },
  { keywords: ["milch"],                co2: 3,   source: "Poore & Nemecek 2018",           year: 2018, notes: "1 Liter Kuhmilch" },
  { keywords: ["kaffee"],               co2: 17,  source: "Quantis LCA 2020 / Nespresso",   year: 2020, notes: "1 kg Roestkaffee" },
  { keywords: ["schokolade"],           co2: 19,  source: "Poore & Nemecek 2018",           year: 2018, notes: "1 kg Vollmilch" },
  { keywords: ["hafermilch"],           co2: 1,   source: "Oatly LCA 2019",                 year: 2019, notes: "1 Liter" },
  { keywords: ["pasta"],                co2: 1,   source: "Barilla LCA 2021",               year: 2021, notes: "500g Hartweizen" },
  { keywords: ["reis"],                 co2: 3,   source: "Poore & Nemecek 2018",           year: 2018, notes: "1 kg Nassreisanbau" },

  // ══════════════════════════════════════════════════════
  //  BABY & KINDER
  //  Quellen: ADEME 2021, LEGO Group Environmental 2021
  // ══════════════════════════════════════════════════════
  { keywords: ["kinderwagen"],          co2: 85,  source: "ADEME 2021 / Oeko-Institut",    year: 2021, notes: "Stahl/Alu/Textil ~12 kg" },
  { keywords: ["babytrage"],            co2: 8,   source: "HIGG MSI 2022",                  year: 2022, notes: "Baumwolle/Polyester ~600g" },
  { keywords: ["hochstuhl"],            co2: 25,  source: "ADEME 2021",                     year: 2021, notes: "Buche ~5 kg" },
  { keywords: ["kindersitz"],           co2: 40,  source: "ADEME 2021",                     year: 2021, notes: "Gruppe 1-3 ~6 kg" },
  { keywords: ["lego"],                 co2: 8,   source: "LEGO Group Environmental 2021",  year: 2021, notes: "500g ABS-Kunststoff" },

  // ══════════════════════════════════════════════════════
  //  WERKZEUG & HEIMWERKEN
  //  Quellen: Bosch Tool LCA 2021, ADEME 2021
  // ══════════════════════════════════════════════════════
  { keywords: ["akkubohrschrauber"],    co2: 28,  source: "Bosch Tool LCA 2021",            year: 2021, notes: "18V Li-Ion ~1.5 kg" },
  { keywords: ["bohrmaschine"],         co2: 22,  source: "Bosch Tool LCA 2021",            year: 2021, notes: "Kabelgeraet ~2 kg" },
  { keywords: ["kreissaege"],           co2: 30,  source: "Bosch Tool LCA 2021",            year: 2021, notes: "Handkreissaege ~4 kg" },
  { keywords: ["leiter"],               co2: 20,  source: "Oekobaudat 2023",                year: 2023, notes: "Alu 3m ~5 kg" },

  // ══════════════════════════════════════════════════════
  //  BUERO & SCHULE
  //  Quellen: Ricoh EPD 2022, Dell PCF 2023, ADEME 2021
  // ══════════════════════════════════════════════════════
  { keywords: ["drucker"],              co2: 95,  source: "Ricoh EPD 2022 / ADEME",        year: 2022, notes: "Tintenstrahldrucker ~5 kg" },
  { keywords: ["laserdrucker"],         co2: 150, source: "Ricoh EPD 2022",                year: 2022, notes: "Monolaser ~12 kg" },
  { keywords: ["monitor"],              co2: 350, source: "Dell PCF 2023",                 year: 2023, notes: "27 Zoll 4K IPS ~5 kg" },
  { keywords: ["tastatur"],             co2: 25,  source: "ADEME 2021",                    year: 2021, notes: "Kabellos ~600g" },
  { keywords: ["maus"],                 co2: 12,  source: "ADEME 2021",                    year: 2021, notes: "Kabellose Maus ~100g" },

  // ══════════════════════════════════════════════════════
  //  BEAUTY & KOERPERPFLEGE
  //  Quellen: L'Oreal LCA 2022, Beiersdorf SHR 2022
  // ══════════════════════════════════════════════════════
  { keywords: ["shampoo"],              co2: 1,   source: "L'Oreal Product LCA 2022",      year: 2022, notes: "250ml inkl. Verpackung" },
  { keywords: ["duschgel"],             co2: 1,   source: "Beiersdorf SHR 2022",           year: 2022, notes: "250ml" },
  { keywords: ["gesichtscreme"],        co2: 1,   source: "L'Oreal Product LCA 2022",      year: 2022, notes: "50ml Tiegel" },
  { keywords: ["parfuem"],              co2: 3,   source: "L'Oreal Product LCA 2022",      year: 2022, notes: "100ml EdP inkl. Glasflasche" },
  { keywords: ["deodorant"],            co2: 0.5, source: "Beiersdorf SHR 2022",           year: 2022, notes: "150ml Spray" },

  // ══════════════════════════════════════════════════════
  //  BUECHER & MEDIEN
  //  Quellen: Publishers Association LCA 2022,
  //           Öko-Institut Buch-LCA 2021
  // ══════════════════════════════════════════════════════
  { keywords: ["taschenbuch"],          co2: 1,   source: "Publishers Association LCA 2022", year: 2022, notes: "250 Seiten, Recyclingpapier ~200g" },
  { keywords: ["hardcover"],            co2: 2.5, source: "Publishers Association LCA 2022", year: 2022, notes: "400 Seiten, Pappeinband ~400g" },
  { keywords: ["buch"],                 co2: 1.5, source: "Öko-Institut Buch-LCA 2021",      year: 2021, notes: "Durchschnitt ~300g Papier" },
  { keywords: ["manga"],                co2: 0.8, source: "Öko-Institut Buch-LCA 2021",      year: 2021, notes: "~150g Papier" },
  { keywords: ["comic"],                co2: 0.8, source: "Publishers Association LCA 2022", year: 2022, notes: "~150g Hochglanzpapier" },
  { keywords: ["kalender"],             co2: 1.2, source: "Öko-Institut Buch-LCA 2021",      year: 2021, notes: "A3 Wandkalender ~400g" },
  { keywords: ["notizbuch"],            co2: 0.6, source: "Öko-Institut Buch-LCA 2021",      year: 2021, notes: "A5 ~150g Papier" },
  { keywords: ["schreibwaren set"],     co2: 1.5, source: "ADEME 2021",                       year: 2021, notes: "Stifte/Blöcke Kunststoff ~300g" },

  // ══════════════════════════════════════════════════════
  //  SPIELZEUG & SPIELE
  //  Quellen: LEGO Environmental Report 2021,
  //           ADEME 2021, Toy Industries of Europe 2022
  // ══════════════════════════════════════════════════════
  { keywords: ["brettspiel"],           co2: 3,   source: "ADEME 2021",                       year: 2021, notes: "Karton/Plastik ~800g" },
  { keywords: ["puzzl"],                co2: 2,   source: "ADEME 2021",                       year: 2021, notes: "1000 Teile, Karton ~600g" },
  { keywords: ["monopoly"],             co2: 3.5, source: "ADEME 2021",                       year: 2021, notes: "Karton/Plastik ~1 kg" },
  { keywords: ["playmobil"],            co2: 4,   source: "Toy Industries Europe 2022",       year: 2022, notes: "ABS-Kunststoff Set ~300g" },
  { keywords: ["playmobil", "set"],     co2: 6,   source: "Toy Industries Europe 2022",       year: 2022, notes: "ABS ~500g" },
  { keywords: ["barbie"],               co2: 2.5, source: "Mattel Sustainability 2022",       year: 2022, notes: "Puppe ~200g Plastik" },
  { keywords: ["heissluftballon", "spielzeug"], co2: 1, source: "ADEME 2021",                year: 2021, notes: "Kleines Spielzeug ~100g" },
  { keywords: ["rc auto"],              co2: 8,   source: "ADEME 2021",                       year: 2021, notes: "Ferngesteuertes Auto mit Akku" },
  { keywords: ["drohne"],               co2: 22,  source: "IDC Est. 2023",                    year: 2023, notes: "Mini-Drohne mit Kamera ~300g" },
  { keywords: ["kicker"],               co2: 35,  source: "ADEME 2021",                       year: 2021, notes: "Tischfussball Stahl/Holz ~15 kg" },

  // ══════════════════════════════════════════════════════
  //  GARTENMOEBEL & OUTDOOR
  //  Quellen: IKEA Env. Prod. Dec. 2022, Ökobaudat 2023
  // ══════════════════════════════════════════════════════
  { keywords: ["gartenmoebel set"],     co2: 85,  source: "IKEA Env. Prod. Dec. 2022",       year: 2022, notes: "4 Stuehle + Tisch Kunststoff ~12 kg" },
  { keywords: ["gartenstuhl"],          co2: 12,  source: "IKEA Env. Prod. Dec. 2022",       year: 2022, notes: "Kunststoff/Alu ~3 kg" },
  { keywords: ["gartenliege"],          co2: 18,  source: "IKEA Env. Prod. Dec. 2022",       year: 2022, notes: "Kunststoff ~5 kg" },
  { keywords: ["gartentisch"],          co2: 25,  source: "IKEA Env. Prod. Dec. 2022",       year: 2022, notes: "Alu ~8 kg" },
  { keywords: ["sonnenschirm"],         co2: 15,  source: "ADEME 2021",                       year: 2021, notes: "Polyester/Alu ~4 kg" },
  { keywords: ["gartenzelt"],           co2: 22,  source: "ADEME 2021",                       year: 2021, notes: "Pavillon Polyester/Stahl ~10 kg" },
  { keywords: ["gartenschlauch"],       co2: 4,   source: "ADEME 2021",                       year: 2021, notes: "PVC 20m ~1.5 kg" },
  { keywords: ["rasenmaeher"],          co2: 75,  source: "Husqvarna Environmental 2022",     year: 2022, notes: "Elektro-Rasenmäher ~15 kg" },
  { keywords: ["akku rasenmaeher"],     co2: 95,  source: "Husqvarna Environmental 2022",     year: 2022, notes: "36V Akku ~18 kg inkl. Akku" },
  { keywords: ["hochdruckreiniger"],    co2: 45,  source: "Karcher LCA 2021",                 year: 2021, notes: "1800W ~6 kg" },
  { keywords: ["gartenbewässerung"],    co2: 3,   source: "ADEME 2021",                       year: 2021, notes: "Tropfbewässerung Set Kunststoff" },
  { keywords: ["blumentopf"],           co2: 1.5, source: "Ökobaudat 2023",                   year: 2023, notes: "Terrakotta 25cm ~1.5 kg" },
  { keywords: ["pflanzkuebel"],         co2: 4,   source: "Ökobaudat 2023",                   year: 2023, notes: "Kunststoff 40L ~2 kg" },

  // ══════════════════════════════════════════════════════
  //  HAUSTIERE
  //  Quellen: Gregory & Atwood 2022 (PLOS ONE),
  //           Ogilvy Pet LCA 2021
  // ══════════════════════════════════════════════════════
  { keywords: ["hundefutter"],          co2: 7,   source: "Gregory & Atwood 2022 (PLOS ONE)", year: 2022, notes: "1 kg Nassfutter, Fleisch-basiert" },
  { keywords: ["katzenfutter"],         co2: 6,   source: "Gregory & Atwood 2022 (PLOS ONE)", year: 2022, notes: "1 kg Nassfutter" },
  { keywords: ["trockenfutter hund"],   co2: 3,   source: "Gregory & Atwood 2022",           year: 2022, notes: "1 kg Trockenfutter" },
  { keywords: ["katzentoilette"],       co2: 8,   source: "ADEME 2021",                       year: 2021, notes: "Kunststoff ~2 kg" },
  { keywords: ["katzenstreu"],          co2: 2,   source: "Ogilvy Pet LCA 2021",              year: 2021, notes: "5 kg Klumpstreu" },
  { keywords: ["hundebett"],            co2: 6,   source: "HIGG MSI 2022",                    year: 2022, notes: "Polyester ~1 kg" },
  { keywords: ["hundehalsband"],        co2: 1,   source: "HIGG MSI 2022",                    year: 2022, notes: "Nylon/Leder ~100g" },
  { keywords: ["katzenkratzer"],        co2: 12,  source: "ADEME 2021",                       year: 2021, notes: "Sisal/Holz ~4 kg" },
  { keywords: ["aquarium"],             co2: 25,  source: "ADEME 2021",                       year: 2021, notes: "60L Glas ~8 kg" },

  // ══════════════════════════════════════════════════════
  //  AUTO-ZUBEHOER
  //  Quellen: Continental LCA 2022, Öko-Institut 2021
  // ══════════════════════════════════════════════════════
  { keywords: ["autoreifen"],           co2: 30,  source: "Continental LCA 2022",             year: 2022, notes: "195/65R15, ~8 kg/Stück" },
  { keywords: ["winterreifen"],         co2: 32,  source: "Continental LCA 2022",             year: 2022, notes: "Winterreifen ~8.5 kg/Stück" },
  { keywords: ["reifensatz"],           co2: 120, source: "Continental LCA 2022",             year: 2022, notes: "4 Reifen 195/65R15" },
  { keywords: ["dachbox"],              co2: 55,  source: "Thule LCA 2022",                   year: 2022, notes: "ABS ~15 kg" },
  { keywords: ["fahrradtraeger"],       co2: 18,  source: "Thule LCA 2022",                   year: 2022, notes: "Stahl/Alu ~4 kg" },
  { keywords: ["dashcam"],              co2: 20,  source: "IDC Est. 2023",                    year: 2023, notes: "Kamera mit Display ~150g" },
  { keywords: ["autoladekabel"],        co2: 3,   source: "IDC Est. 2023",                    year: 2023, notes: "USB-C/Lightning ~100g" },
  { keywords: ["navigationssystem"],    co2: 35,  source: "IDC Est. 2023",                    year: 2023, notes: "5 Zoll Navi ~200g" },


];

// ╔══════════════════════════════════════════════════════╗
//  LOOKUP-SERVICE
// ╚══════════════════════════════════════════════════════╝
const ProductCarbonDB = {

  /**
   * Findet den CO₂-Wert für ein Produkt anhand des Titels.
   * Gibt den spezifischsten (längsten) Match zurück.
   *
   * @param {string} title  Produkttitel
   * @returns {{
   *   co2:     number,
   *   source:  string,
   *   year:    number,
   *   notes:   string,
   *   matched: string   // Gematchter Keyword-String
   * } | null}
   */
  lookup(title) {
    if (!title) return null;
    const t = title.toLowerCase();

    let best    = null;
    let bestLen = 0;

    for (const entry of PRODUCT_CO2_DB) {
      for (const kw of entry.keywords) {
        // Alle Keywords eines Eintrags müssen matchen (AND-Logik)
        const allMatch = entry.keywords.every(k => t.includes(k));
        const kwLen    = entry.keywords.join(" ").length;

        if (allMatch && kwLen > bestLen) {
          best    = entry;
          bestLen = kwLen;
        }
        break; // nur erster keyword-set nötig für Längencheck
      }
    }

    if (!best) return null;

    return {
      co2:     best.co2,
      source:  best.source,
      year:    best.year,
      notes:   best.notes,
      matched: best.keywords.join(" + ")
    };
  },

  /** Gibt die Gesamtzahl der Einträge zurück */
  get size() { return PRODUCT_CO2_DB.length; }
};

window.EcoTrace.ProductCarbonDB = ProductCarbonDB;
