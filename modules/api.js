// modules/api.js
// Thin wrapper around the PhishGuard FastAPI /predict endpoint.

import { API_URL } from "./settings.js";

/**
 * Checks whether a URL is eligible for scanning
 * (only http/https URLs — not chrome://, file://, etc.).
 * @param {string} url
 * @returns {boolean}
 */
export function isScannableUrl(url) {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://");
}

/**
 * Ensures the API base URL matches the allowed backend.
 * Throws if the URL has been tampered with.
 * @param {string} apiBaseUrl
 */
function validateApiBase(apiBaseUrl) {
  const normalised = apiBaseUrl.replace(/\/+$/, "");
  if (normalised !== API_URL) {
    throw new Error(
      `Blocked request to unauthorised API: ${apiBaseUrl}. ` +
      `Only ${API_URL} is allowed.`
    );
  }
}

/**
 * Calls POST /predict and returns a normalised result object.
 *
 * @param {string} url        - The URL to analyse
 * @param {string} apiBaseUrl - Base URL of the FastAPI server
 * @returns {Promise<{url: string, label: string, confidence: number, error: string|null, timestamp: number}>}
 */
export async function fetchPrediction(url, apiBaseUrl) {
  try {
    validateApiBase(apiBaseUrl);
    const base = apiBaseUrl.replace(/\/+$/, ""); // strip trailing slash(es)
    const response = await fetch(`${base}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      throw new Error(`Server error: HTTP ${response.status}`);
    }

    const data = await response.json();

    return {
      url,
      label:      data.label,
      confidence: data.confidence,
      error:      null,
      timestamp:  Date.now(),
    };
  } catch (err) {
    return {
      url,
      label:      "error",
      confidence: 0,
      error:      err.message,
      timestamp:  Date.now(),
    };
  }
}

/**
 * Quick health-check ping to confirm the API is reachable.
 * @param {string} apiBaseUrl
 * @returns {Promise<boolean>}
 */
export async function pingApi(apiBaseUrl) {
  try {
    validateApiBase(apiBaseUrl);
    const base = apiBaseUrl.replace(/\/+$/, "");
    const res = await fetch(`${base}/`, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

