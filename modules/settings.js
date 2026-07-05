// modules/settings.js
// Centralised settings access — reads from chrome.storage.sync

export const DEFAULTS = {
  apiUrl:    "https://phishing-detection-api-n362.onrender.com",
  threshold: 0.50,
  autoScan:  true,
};

/**
 * Returns current settings merged with defaults.
 * Automatically migrates old localhost URLs to the deployed API.
 * @returns {Promise<{apiUrl: string, threshold: number, autoScan: boolean}>}
 */
export function getSettings() {
  return new Promise((resolve) =>
    chrome.storage.sync.get(DEFAULTS, async (settings) => {
      // Migrate: if stored URL is a localhost URL, replace with deployed API
      if (
        settings.apiUrl.startsWith("http://127.0.0.1") ||
        settings.apiUrl.startsWith("http://localhost")
      ) {
        settings.apiUrl = DEFAULTS.apiUrl;
        await new Promise((r) => chrome.storage.sync.set({ apiUrl: DEFAULTS.apiUrl }, r));
      }
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
