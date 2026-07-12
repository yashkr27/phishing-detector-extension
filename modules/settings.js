// modules/settings.js
// Centralised settings access — reads from chrome.storage.sync

/**
 * The ONLY backend URL the extension is allowed to contact.
 * This is intentionally NOT user-configurable to prevent request hijacking.
 */
export const API_URL = "https://phishing-detection-api-n362.onrender.com";

export const DEFAULTS = {
  threshold: 0.50,
  autoScan:  true,
};

/**
 * Returns current settings merged with defaults.
 * The apiUrl is always the hardcoded deployed backend — never user-supplied.
 * @returns {Promise<{apiUrl: string, threshold: number, autoScan: boolean}>}
 */
export function getSettings() {
  return new Promise((resolve) =>
    chrome.storage.sync.get(DEFAULTS, (settings) => {
      // Always enforce the hardcoded API URL
      settings.apiUrl = API_URL;
      resolve(settings);
    })
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
