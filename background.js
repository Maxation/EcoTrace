// ============================================================
//  EcoTrace – background.js  (Service Worker, Manifest V3)
//
//  Fungiert als CORS-Proxy für API-Aufrufe die aus Content
//  Scripts nicht direkt möglich sind (iFixit, Climatiq).
//  Service Worker unterliegen keinen CORS-Einschränkungen.
// ============================================================

"use strict";

// ── Installation ────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(details => {
  if (details.reason === "install") {
    chrome.storage.local.set({
      totalSavings: 0, savingsLog: [], installDate: new Date().toISOString()
    });
    console.log("[EcoTrace] Installiert.");
  }
});

// ── Wöchentlicher DB-Update-Check via Alarm ──────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("weeklyDbUpdate", { periodInMinutes: 7 * 24 * 60 });
});

chrome.alarms.onAlarm.addListener(alarm => {
  if (alarm.name !== "weeklyDbUpdate") return;
  fetch("https://raw.githubusercontent.com/ecotrace-plugin/db-updates/main/version.json", {
    cache:  "no-cache",
    signal: (() => { const c = new AbortController(); setTimeout(() => c.abort(), 10000); return c.signal; })()
  })
  .then(r => r.ok ? r.json() : null)
  .then(data => {
    if (!data) return;
    chrome.storage.local.get(["lastDbVersion"], d => {
      if (d.lastDbVersion !== data.version) {
        chrome.action.setBadgeText({ text: "↑" });
        chrome.action.setBadgeBackgroundColor({ color: "#1565C0" });
        chrome.storage.local.set({ pendingDbUpdate: data.version });
        console.log("[EcoTrace] Neues DB-Update verfügbar:", data.version);
      }
    });
  })
  .catch(() => {});
});

// ── Badge ────────────────────────────────────────────────────
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes.totalSavings) {
    const val  = changes.totalSavings.newValue || 0;
    const text = val >= 1 ? `${Math.round(val)}` : "";
    chrome.action.setBadgeText({ text });
    chrome.action.setBadgeBackgroundColor({ color: "#228B22" });
  }
});

// ── CORS-Proxy: empfängt Fetch-Anfragen aus Content Scripts ─
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // ── FETCH_PROXY: CORS-freier Fetch aus Content Scripts ───
  if (msg.type === "FETCH_PROXY") {
    const { url, options = {} } = msg;

    // Timeout: 20s für Overpass (komplexe Queries), 8s für REST-APIs
    const isOverpass = url.includes("overpass-api");
    const ctrl       = new AbortController();
    setTimeout(() => ctrl.abort(), isOverpass ? 20000 : 8000);

    // Fetch-Optionen explizit aufbauen (nicht-serialisierbare Felder sicher übergeben)
    const fetchOpts = { signal: ctrl.signal };
    if (options.method)  fetchOpts.method  = options.method;
    if (options.headers) fetchOpts.headers = options.headers;
    if (options.body)    fetchOpts.body    = options.body;

    fetch(url, fetchOpts)
      .then(async resp => {
        const text = await resp.text();
        sendResponse({ ok: resp.ok, status: resp.status, body: text });
      })
      .catch(err => {
        console.warn("[EcoTrace Background] Fetch-Fehler:", err.message, url);
        sendResponse({ ok: false, status: 0, error: err.message });
      });

    return true; // async sendResponse
  }

  // ── OPEN_OPTIONS: Einstellungen öffnen ────────────────────
  if (msg.type === "OPEN_OPTIONS") {
    chrome.runtime.openOptionsPage();
    sendResponse({ ok: true });
    return false;
  }
});
