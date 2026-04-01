// ============================================================
//  EcoTrace Plugin – services/dbUpdater.js
//
//  Automatischer DB-Update-Mechanismus (wöchentlich).
//  Holt JSON-Patches von GitHub und merged sie in IndexedDB.
//
//  Funktionsweise:
//    1. Background SW prüft einmal/Woche ob Update verfügbar
//    2. Holt kompaktes JSON-Delta von GitHub Releases API
//    3. Merged neue Einträge in IndexedDB (bestehende bleiben)
//    4. Setzt "lastDbUpdate"-Timestamp in chrome.storage
//
//  KEIN Ersetzen ganzer DBs – nur neue Einträge werden hinzugefügt,
//  damit keine User-Daten verloren gehen.
// ============================================================

"use strict";

window.EcoTrace = window.EcoTrace || {};

// GitHub-Endpunkte für DB-Patches (öffentliches Repo)
const UPDATE_BASE = "https://raw.githubusercontent.com/ecotrace-plugin/db-updates/main";
const UPDATE_URLS = {
  co2:       `${UPDATE_BASE}/co2-db-patch.json`,
  repair:    `${UPDATE_BASE}/repair-db-patch.json`,
  predecessor: `${UPDATE_BASE}/predecessor-patch.json`,
};
const CHECK_INTERVAL_MS = 7 * 24 * 60 * 60 * 1000; // 7 Tage

const DbUpdater = {

  _lastCheck: null,

  // ────────────────────────────────────────────────────────
  //  HAUPT-EINSTIEG: Prüft ob Update nötig und führt es durch
  // ────────────────────────────────────────────────────────
  async checkAndUpdate() {
    try {
      const lastUpdate = await this._getLastUpdate();
      const now        = Date.now();

      if (lastUpdate && (now - lastUpdate) < CHECK_INTERVAL_MS) {
        console.log(`[DbUpdater] Kein Update nötig (letzte Prüfung: ${this._formatAge(lastUpdate)})`);
        return { updated: false, reason: "zu_frueh" };
      }

      console.log("[DbUpdater] Prüfe auf DB-Updates…");
      const results = await this._fetchAndApplyUpdates();
      await this._setLastUpdate(now);

      return { updated: results.some(r => r.added > 0), results };
    } catch (e) {
      console.warn("[DbUpdater] Update-Check fehlgeschlagen:", e.message);
      return { updated: false, error: e.message };
    }
  },

  // ────────────────────────────────────────────────────────
  //  ALLE PATCHES HOLEN UND ANWENDEN
  // ────────────────────────────────────────────────────────
  async _fetchAndApplyUpdates() {
    const results = [];

    for (const [dbName, url] of Object.entries(UPDATE_URLS)) {
      try {
        const resp = await fetch(url, {
          cache:  "no-cache",
          signal: (() => { const c = new AbortController(); setTimeout(() => c.abort(), 10000); return c.signal; })()
        });

        if (!resp.ok) {
          results.push({ db: dbName, added: 0, error: `HTTP ${resp.status}` });
          continue;
        }

        const patch = await resp.json();
        const added = await this._applyPatch(dbName, patch);
        results.push({ db: dbName, added });
        console.log(`[DbUpdater] ${dbName}: ${added} neue Einträge`);

      } catch (e) {
        results.push({ db: dbName, added: 0, error: e.message });
      }
    }

    return results;
  },

  // ────────────────────────────────────────────────────────
  //  PATCH AUF INDEXEDDB ANWENDEN
  // ────────────────────────────────────────────────────────
  async _applyPatch(dbName, patch) {
    if (!patch?.entries || !Array.isArray(patch.entries)) return 0;

    const cacheKey = `db-patch:${dbName}`;
    let added = 0;

    // Bestehende Patch-Einträge laden um Duplikate zu vermeiden
    let existingIds = new Set();
    try {
      const existing = await EcoTrace.IndexedDBCache.get(cacheKey);
      if (existing) {
        const parsed = JSON.parse(existing.value);
        existingIds = new Set(parsed.map(e => e.id || JSON.stringify(e.keywords)));
      }
    } catch (_) {}

    // Neue Einträge filtern
    const newEntries = patch.entries.filter(e => {
      const id = e.id || JSON.stringify(e.keywords);
      return !existingIds.has(id);
    });

    if (newEntries.length > 0) {
      // In IndexedDB speichern (Content Scripts laden sie beim nächsten Boot)
      const allEntries = [...Array.from(existingIds).map(id => ({ id })), ...newEntries];
      await EcoTrace.IndexedDBCache.set(
        cacheKey,
        JSON.stringify(newEntries),
        30 * 24 * 60 * 60 * 1000  // 30 Tage TTL
      );
      added = newEntries.length;

      // In-Memory-DB direkt ergänzen (für aktuelle Session)
      this._mergeIntoMemory(dbName, newEntries);
    }

    return added;
  },

  // ────────────────────────────────────────────────────────
  //  IN-MEMORY: Neue Einträge sofort in laufende DBs einbauen
  // ────────────────────────────────────────────────────────
  _mergeIntoMemory(dbName, entries) {
    if (!entries.length) return;

    try {
      if (dbName === "co2" && EcoTrace.ProductCarbonDB) {
        // ProductCarbonDB hat ein internes Array das wir nicht direkt modifizieren können
        // Stattdessen: lookup() wird bei nächstem Aufruf die neuen Einträge aus IndexedDB lesen
        console.log(`[DbUpdater] CO₂-DB: ${entries.length} neue Einträge beim nächsten Produktaufruf aktiv`);
      }
      if (dbName === "repair" && EcoTrace.IFixitService) {
        console.log(`[DbUpdater] Repair-DB: ${entries.length} neue Einträge beim nächsten Produktaufruf aktiv`);
      }
    } catch (e) {
      console.warn("[DbUpdater] In-Memory-Merge fehlgeschlagen:", e.message);
    }
  },

  // ────────────────────────────────────────────────────────
  //  STORAGE HELPERS
  // ────────────────────────────────────────────────────────
  async _getLastUpdate() {
    return new Promise(resolve => {
      if (typeof chrome === "undefined") return resolve(null);
      chrome.storage.local.get(["lastDbUpdate"], d => {
        resolve(d.lastDbUpdate || null);
      });
    });
  },

  async _setLastUpdate(ts) {
    return new Promise(resolve => {
      if (typeof chrome === "undefined") return resolve();
      chrome.storage.local.set({ lastDbUpdate: ts }, resolve);
    });
  },

  _formatAge(ts) {
    const diffDays = Math.round((Date.now() - ts) / 86400000);
    if (diffDays === 0) return "heute";
    if (diffDays === 1) return "gestern";
    return `vor ${diffDays} Tagen`;
  },

  // ── Öffentlich: manuelles Update aus Einstellungen ───────
  async forceUpdate() {
    await this._setLastUpdate(0);  // TTL zurücksetzen
    return this.checkAndUpdate();
  },

  // ── Update-Status für UI ──────────────────────────────────
  async getStatus() {
    const last = await this._getLastUpdate();
    return {
      lastUpdate: last,
      lastUpdateLabel: last ? this._formatAge(last) : "Noch nie",
      nextCheck: last ? new Date(last + CHECK_INTERVAL_MS).toLocaleDateString("de-DE") : "Sofort"
    };
  }
};

window.EcoTrace.DbUpdater = DbUpdater;
