// modules/cache.js
// Session-scoped result cache using chrome.storage.session.
// Results are keyed by URL and cleared when the browser session ends.

const PREFIX = "cache_";

/**
 * Retrieve a cached scan result for a URL.
 * @param {string} url
 * @returns {Promise<object|null>}
 */
export function getCache(url) {
  return new Promise((resolve) =>
    chrome.storage.session.get(PREFIX + url, (r) =>
      resolve(r[PREFIX + url] ?? null)
    )
  );
}

/**
 * Store a scan result for a URL.
 * @param {string} url
 * @param {object} result
 * @returns {Promise<void>}
 */
export function setCache(url, result) {
  return new Promise((resolve) =>
    chrome.storage.session.set({ [PREFIX + url]: result }, resolve)
  );
}

/**
 * Remove the cached result for a URL (force-rescan).
 * @param {string} url
 * @returns {Promise<void>}
 */
export function clearCache(url) {
  return new Promise((resolve) =>
    chrome.storage.session.remove(PREFIX + url, resolve)
  );
}
