// ============================================================
//  EcoTrace Plugin – services/utils.js
//  Zentrale Hilfsfunktionen die von mehreren Services genutzt werden.
//  Wird als erstes Service geladen (vor carbonLogic.js falls möglich,
//  sonst danach – carbonLogic.js delegiert an diese Datei).
// ============================================================

"use strict";

window.EcoTrace = window.EcoTrace || {};

/**
 * Bereinigt einen Amazon-Produkttitel zu einem kurzen, sauberen Suchbegriff.
 * Entfernt: Farben, Speichergrößen, Specs, generische Adjektive, Stopwörter.
 * Behält: Marke, Modellname, kurze Modellnummern (1–4 Stellen).
 *
 * @param {string} title  Roher Amazon-Produkttitel
 * @returns {string}      Bereinigter Suchbegriff (max. 3–4 Tokens)
 */
EcoTrace._cleanSearchQuery = function(title) {
  if (!title) return "";
  let t = title;

  // 1. Klammerinhalt entfernen
  t = t.replace(/[\(\[].*?[\)\]]/g, " ");
  // 2. Alles nach erstem Komma
  t = t.replace(/\s*,\s.*$/, " ");

  // 3. Technische Specs mit Einheit (GB, TB, MP, mAh, Hz, Watt, Liter)
  t = t.replace(/\b\d+\s*(?:gb|tb|mb)\b/gi, " ");
  t = t.replace(/\b\d+\s*(?:mp|mah|hz|watt|liter|zoll)\b/gi, " ");
  t = t.replace(/\b\d+[.,]?\d*\s*(?:cm|mm|kg|g|oz|lb|l)\b/gi, " ");
  t = t.replace(/\b\d+\s*v\b/gi, " ");

  // 4. Lange Artikelcodes (2+ Buchstaben + 4+ Zahlen: HD9762, MQ123)
  t = t.replace(/\b[A-Za-z]{2,}\d{4,}\b/g, " ");
  // 5+ stellige Zahlen weg (Artikelnummern)
  t = t.replace(/\b\d{5,}\b/g, " ");

  // 5. Farben
  const farben = ["schwarz","weiß","weiss","silber","gold","blau","rot","grün",
    "grau","beige","braun","titan","titanium","natural","starlight","midnight",
    "spacegrau","rosegold","graphit","lila","pink","obsidian","phantom","sage",
    "sand","black","white","silver","blue","red","green","gray","grey","graphite",
    "cream","mint","navy","olive","teal","purple","yellow","ivory","coral"];
  t = t.replace(new RegExp(`\\b(?:${farben.join("|")})\\b`, "gi"), " ");

  // 6. Generische Adjektive & Stopwörter
  const stop = ["kabelloser","kabellos","wireless","bluetooth","elektrische",
    "elektrischer","elektrisches","smart","digital","automatisch","herren","damen",
    "kinder","unisex","größe","size","mit","und","für","von","der","die","das",
    "ein","eine","inkl","inklusive","set","pack","bundle","paket","neu","new",
    "original","offiziell","official","generation","modell","model","version",
    "edition","series","serie","detect","absolute"];
  t = t.replace(new RegExp(`\\b(?:${stop.join("|")})\\b`, "gi"), " ");

  // 7. Produktkategorie-Nomen nach dem Modellnamen
  const kat = ["sneaker","schuhe","laufschuhe","kopfhörer","headphone","zahnbürste",
    "staubsauger","airfryer","bohrschrauber","bohrmaschine","schlagbohrschrauber",
    "chip","prozessor","intel","amd","core","ram","ssd","hdd","oled","amoled",
    "noise","cancelling","ladecase","ladegerät","netzteil","systemkamera","kamera",
    "gehäuse","objektiv","saugroboter"];
  t = t.replace(new RegExp(`\\b(?:${kat.join("|")})\\b`, "gi"), " ");

  // 8. Sonderzeichen
  t = t.replace(/[™®©+]/g, " ");
  t = t.replace(/\s+/g, " ").trim();

  // 9. Tokens filtern: Buchstaben ODER kurze Zahlen 1–4 Stellen (Modellnummern)
  const VARIANT = new Set(["pro","ultra","plus","max","lite","mini","air","se",
    "fe","fold","flip","neo","edge","oled","xl","xxl","iii","ii","iv"]);
  const tokens = t.split(/\s+/).filter(tok => {
    if (tok.length < 2) return false;
    const hasLetter = /[a-zA-ZäöüÄÖÜß]/.test(tok);
    const isShortNum = /^\d{1,4}$/.test(tok);
    const isDecimal  = /^\d+[.,]\d+$/.test(tok);
    return (hasLetter || isShortNum) && !isDecimal;
  });

  // Max 3 Tokens, 4 wenn Token 4 eine bekannte Variante ist
  let result = tokens.slice(0, 3);
  if (tokens.length > 3 && VARIANT.has(tokens[3].toLowerCase())) {
    result = tokens.slice(0, 4);
  }
  return result.join(" ");
};

window.EcoTrace.Utils = { cleanSearchQuery: EcoTrace._cleanSearchQuery };
