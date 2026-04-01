// ============================================================
//  EcoTrace – services/indexedDBCache.js
//  Persistenter IndexedDB-Cache mit konfigurierbarem TTL.
//  Persistenter IndexedDB-Cache (24h TTL) für carbonService.
//  Überlebt Page-Reloads, wird nach TTL automatisch geleert.
// ============================================================

"use strict";

window.EcoTrace = window.EcoTrace || {};

const DB_NAME    = "EcoTraceCache";
const DB_VERSION = 1;
const STORE_NAME = "cache";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24 Stunden

const IndexedDBCache = {
  _db: null,

  // ── DB öffnen / initialisieren ─────────────────────────
  async _open() {
    if (this._db) return this._db;

    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
          store.createIndex("expires", "expires", { unique: false });
        }
      };

      req.onsuccess = (e) => {
        this._db = e.target.result;
        resolve(this._db);
      };

      req.onerror = () => reject(req.error);
    });
  },

  // ── Wert schreiben ────────────────────────────────────
  async set(key, value, ttlMs = DEFAULT_TTL_MS) {
    try {
      const db = await this._open();
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put({
        key,
        value,
        expires: Date.now() + ttlMs,
        created: Date.now()
      });
      return new Promise((res, rej) => {
        tx.oncomplete = () => res(true);
        tx.onerror    = () => rej(tx.error);
      });
    } catch (e) {
      console.warn("[IDBCache] set() Fehler:", e.message);
      return false;
    }
  },

  // ── Wert lesen (null wenn abgelaufen / nicht vorhanden) ──
  async get(key) {
    try {
      const db    = await this._open();
      const tx    = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);

      return new Promise((resolve) => {
        const req = store.get(key);
        req.onsuccess = () => {
          const record = req.result;
          if (!record) return resolve(null);
          if (Date.now() > record.expires) {
            // Expired → async löschen, null zurückgeben
            this.delete(key);
            return resolve(null);
          }
          resolve(record.value);
        };
        req.onerror = () => resolve(null);
      });
    } catch (e) {
      console.warn("[IDBCache] get() Fehler:", e.message);
      return null;
    }
  },

  // ── Einzelnen Eintrag löschen ─────────────────────────
  async delete(key) {
    try {
      const db = await this._open();
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).delete(key);
    } catch (e) { /* Ignore */ }
  },

  // ── Abgelaufene Einträge purgen (sollte beim Start laufen) ──
  async purgeExpired() {
    try {
      const db    = await this._open();
      const tx    = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const index = store.index("expires");
      const range = IDBKeyRange.upperBound(Date.now());

      return new Promise((resolve) => {
        let count = 0;
        const req = index.openCursor(range);
        req.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) { cursor.delete(); count++; cursor.continue(); }
          else resolve(count);
        };
        req.onerror = () => resolve(0);
      });
    } catch (e) {
      return 0;
    }
  },

  // ── Kompletten Store leeren ──────────────────────────
  async clear() {
    try {
      const db = await this._open();
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).clear();
    } catch (e) { /* Ignore */ }
  },

  // ── Cache-Statistik ───────────────────────────────────
  async stats() {
    try {
      const db    = await this._open();
      const tx    = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      return new Promise((resolve) => {
        const req = store.count();
        req.onsuccess = () => resolve({ entries: req.result });
        req.onerror   = () => resolve({ entries: 0 });
      });
    } catch (e) {
      return { entries: 0 };
    }
  }
};

// Beim Laden direkt expired Einträge aufräumen
IndexedDBCache.purgeExpired().catch(() => {});

window.EcoTrace.IndexedDBCache = IndexedDBCache;
