/**
 * LexiBridge Smart Query Cache (Offline-First Storage)
 * Uses IndexedDB for rich persistent offline caching with transparent localStorage fallback.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.LexiCache = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const DB_NAME = 'lexibridge_db';
  const DB_VERSION = 1;
  const STORE_NAME = 'query_cache';
  const LS_PREFIX = 'lexi_qcache_';
  const MAX_LS_ENTRIES = 120;

  let dbPromise = null;

  function isIndexedDBSupported() {
    return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
  }

  function openDatabase() {
    if (!isIndexedDBSupported()) return Promise.resolve(null);
    if (dbPromise) return dbPromise;

    dbPromise = new Promise((resolve) => {
      try {
        const req = window.indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
            store.createIndex('timestamp', 'timestamp', { unique: false });
            store.createIndex('query', 'query', { unique: false });
          }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = () => {
          console.warn('IndexedDB open error; falling back to localStorage');
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB unavailable; falling back to localStorage', err);
        resolve(null);
      }
    });

    return dbPromise;
  }

  function normalizeKey(sourceLang, targetLang, query) {
    const s = (sourceLang || 'nl').toLowerCase().trim();
    const t = (targetLang || 'tr').toLowerCase().trim();
    const q = (query || '').toLowerCase().trim();
    return `${s}_${t}::${q}`;
  }

  /**
   * Retrieve cached translation entry
   * @param {string} sourceLang 
   * @param {string} targetLang 
   * @param {string} query 
   * @returns {Promise<{key, query, sourceLang, targetLang, data, timestamp, isQuickMode}|null>}
   */
  async function get(sourceLang, targetLang, query) {
    if (!query || !query.trim()) return null;
    const key = normalizeKey(sourceLang, targetLang, query);

    // 1. Try IndexedDB
    const db = await openDatabase();
    if (db) {
      try {
        const result = await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(key);
          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => reject(req.error);
        });
        if (result) return result;
      } catch (err) {
        console.warn('IndexedDB get failed; trying localStorage', err);
      }
    }

    // 2. Fallback to localStorage
    try {
      const raw = localStorage.getItem(LS_PREFIX + key);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // storage unavailable
    }

    return null;
  }

  /**
   * Save a verified dictionary result to offline cache
   */
  async function set(sourceLang, targetLang, query, data, isQuickMode = false) {
    if (!query || !query.trim() || !data) return;
    const key = normalizeKey(sourceLang, targetLang, query);

    const record = {
      key: key,
      query: query.trim(),
      sourceLang: sourceLang,
      targetLang: targetLang,
      data: data,
      timestamp: Date.now(),
      isQuickMode: !!isQuickMode
    };

    // 1. Write to IndexedDB
    const db = await openDatabase();
    if (db) {
      try {
        await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(record);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      } catch (err) {
        console.warn('IndexedDB set failed:', err);
      }
    }

    // 2. Mirror to localStorage with LRU pruning
    try {
      localStorage.setItem(LS_PREFIX + key, JSON.stringify(record));
      pruneLocalStorage();
    } catch {
      // localStorage quota or disabled
    }

    return record;
  }

  /**
   * Prune oldest localStorage cache items if exceeding limit
   */
  function pruneLocalStorage() {
    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(LS_PREFIX)) {
          keys.push(k);
        }
      }
      if (keys.length > MAX_LS_ENTRIES) {
        const entries = [];
        keys.forEach((k) => {
          try {
            const item = JSON.parse(localStorage.getItem(k));
            entries.push({ k, ts: item.timestamp || 0 });
          } catch {
            entries.push({ k, ts: 0 });
          }
        });
        entries.sort((a, b) => a.ts - b.ts);
        const toRemove = entries.slice(0, keys.length - MAX_LS_ENTRIES);
        toRemove.forEach((e) => localStorage.removeItem(e.k));
      }
    } catch {
      // ignore
    }
  }

  /**
   * Get all cached query words for offline dictionary browsing
   */
  async function getAll() {
    const db = await openDatabase();
    if (db) {
      try {
        return await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.getAll();
          req.onsuccess = () => {
            const list = req.result || [];
            list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            resolve(list);
          };
          req.onerror = () => reject(req.error);
        });
      } catch (err) {
        console.warn('IndexedDB getAll failed:', err);
      }
    }

    // Fallback: collect from localStorage
    const list = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(LS_PREFIX)) {
          try {
            list.push(JSON.parse(localStorage.getItem(k)));
          } catch {}
        }
      }
      list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    } catch {}

    return list;
  }

  /**
   * Clear all offline cached dictionary entries
   */
  async function clear() {
    const db = await openDatabase();
    if (db) {
      try {
        await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.clear();
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        });
      } catch (err) {
        console.warn('IndexedDB clear failed:', err);
      }
    }

    try {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(LS_PREFIX)) keys.push(k);
      }
      keys.forEach((k) => localStorage.removeItem(k));
    } catch {}
  }

  return {
    get: get,
    set: set,
    getAll: getAll,
    clear: clear,
    normalizeKey: normalizeKey
  };
});
