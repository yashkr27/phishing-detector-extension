// modules/settings.js
// Centralised settings access — reads from chrome.storage.sync

export const DEFAULTS = {
  apiUrl:    "http://127.0.0.1:8000",
  threshold: 0.50,
  autoScan:  true,
};

/**
 * Returns current settings merged with defaults.
 * @returns {Promise<{apiUrl: string, threshold: number, autoScan: boolean}>}
 */
export function getSettings() {
  return new Promise((resolve) =>
    chrome.storage.sync.get(DEFAULTS, resolve)
  );
}

/**
 * Persists settings to chrome.storage.sync.
 * @param {Partial<typeof DEFAULTS>} updates
 * @returns {Promise<void>}
 */
export function saveSettings(updates) {
  return new Promise((resolve) =>
    chrome.storage.sync.set(updates, resolve)
  );
}
