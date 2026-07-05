// background.js — Service Worker (Manifest V3)
// Thin orchestrator: imports focused modules and wires events together.

import { getSettings }                            from "./modules/settings.js";
import { getCache, setCache }                     from "./modules/cache.js";
import { isScannableUrl, fetchPrediction }        from "./modules/api.js";
import { applyBadgeFromResult, setBadgeLoading,
         clearBadge }                             from "./modules/badge.js";

// ── Core: analyse a URL for a given tab ──────────────────

async function analyzeUrl(url, tabId, forceRefresh = false, useCache = true) {
  const { apiUrl, threshold, autoScan } = await getSettings();

  if (!autoScan && !forceRefresh) return;

  if (!isScannableUrl(url)) {
    clearBadge(tabId);
    return;
  }

  // Only serve from cache when explicitly allowed (e.g. popup GET_RESULT)
  // Tab navigations always fetch fresh from BE
  if (useCache && !forceRefresh) {
    const cached = await getCache(url);
    if (cached) {
      applyBadgeFromResult(tabId, cached);
      broadcast(tabId, { type: "SCAN_RESULT", result: cached });
      return;
    }
  }

  // In-flight: show loading badge and notify popup
  setBadgeLoading(tabId);
  broadcast(tabId, { type: "SCAN_START", url });

  const result = await fetchPrediction(url, apiUrl);



  // Trust the API's label directly — no local threshold override.

  // Persist to session cache (only if not an error)
  if (!result.error) {
    await setCache(url, result);
  }

  // Update badge
  applyBadgeFromResult(tabId, result);

  // Notify popup
  broadcast(tabId, { type: "SCAN_RESULT", result });


  // Trigger in-page warning overlay for high-confidence phishing
  if (result.label === "phishing" && result.confidence >= threshold && !result.error) {
    chrome.tabs.sendMessage(tabId, {
      type:       "SHOW_WARNING",
      confidence: result.confidence,
    }).catch(() => {
      // Content script may not be injected yet on this page — that's fine
    });
  }
}

// ── Messaging helpers ─────────────────────────────────────

/**
 * Broadcast a message to the runtime (popup listens for matching tabId).
 */
function broadcast(tabId, message) {
  chrome.runtime.sendMessage({ ...message, tabId }).catch(() => {});
}

// ── Tab lifecycle listeners ───────────────────────────────

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    analyzeUrl(tab.url, tabId, false, false); // always fresh BE call on page load
  }
});

chrome.tabs.onActivated.addListener(async ({ tabId }) => {
  const tab = await chrome.tabs.get(tabId);
  if (tab?.url) analyzeUrl(tab.url, tabId, false, false); // always fresh on tab switch
});

// ── Message handler (from popup) ──────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {

  // Popup requests a force-rescan
  if (message.type === "RESCAN") {
    chrome.tabs.get(message.tabId, (tab) => {
      if (tab?.url) analyzeUrl(tab.url, message.tabId, true);
    });
    sendResponse({ ok: true });
  }

  // Popup requests the latest cached result on open
  if (message.type === "GET_RESULT") {
    chrome.tabs.get(message.tabId, async (tab) => {
      if (!tab?.url) return sendResponse(null);
      const cached = await getCache(tab.url);
      sendResponse(cached ?? null);
    });
    return true; // keep channel open for async response
  }
});
