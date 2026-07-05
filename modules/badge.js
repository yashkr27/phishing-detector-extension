// modules/badge.js
// All chrome.action badge mutations live here.
// Each function is pure: tabId in, badge update out.

/**
 * Show a grey "…" badge while a scan is in progress.
 * @param {number} tabId
 */
export function setBadgeLoading(tabId) {
  chrome.action.setBadgeText({ tabId, text: "…" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#6b7280" });
}

/**
 * Show a green "✓" badge for a legitimate site.
 * @param {number} tabId
 */
export function setBadgeSafe(tabId) {
  chrome.action.setBadgeText({ tabId, text: "✓" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#10b981" });
}

/**
 * Show a red "!" badge for a phishing site.
 * @param {number} tabId
 */
export function setBadgePhishing(tabId) {
  chrome.action.setBadgeText({ tabId, text: "!" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#ef4444" });
}

/**
 * Show an amber "?" badge when the API is unreachable or errors.
 * @param {number} tabId
 */
export function setBadgeError(tabId) {
  chrome.action.setBadgeText({ tabId, text: "?" });
  chrome.action.setBadgeBackgroundColor({ tabId, color: "#f59e0b" });
}

/**
 * Remove the badge entirely (e.g. for non-scannable pages).
 * @param {number} tabId
 */
export function clearBadge(tabId) {
  chrome.action.setBadgeText({ tabId, text: "" });
}

/**
 * Apply the correct badge state based on a scan result object.
 * @param {number} tabId
 * @param {{ label: string, error: string|null }} result
 */
export function applyBadgeFromResult(tabId, result) {
  if (result.error) {
    setBadgeError(tabId);
  } else if (result.label === "phishing") {
    setBadgePhishing(tabId);
  } else {
    setBadgeSafe(tabId);
  }
}
