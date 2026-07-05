// popup.js — Popup controller
// Thin orchestrator: imports UI helpers, delegates all DOM work to ui.js.

import { showState, renderUrl, renderResult,
         setRescanSpinning }  from "./modules/ui.js";

// ── Live updates from background service worker ───────────
// IMPORTANT: Register the listener SYNCHRONOUSLY at module load time —
// before any await — so we never miss a SCAN_RESULT broadcast that arrives
// while init() is still awaiting its GET_RESULT round-trip.

let _resultReceived = false; // shared flag used by the poll fallback below

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SCAN_START") {
    showState("loadingState");
    setRescanSpinning(false);
  }
  if (message.type === "SCAN_RESULT") {
    _resultReceived = true;
    renderResult(message.result);
    setRescanSpinning(false);
  }
});

// ── Bootstrap ─────────────────────────────────────────────

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  renderUrl(tab.url || "");

  // Internal pages (chrome://, about:, etc.) cannot be scanned
  if (!tab.url?.startsWith("http://") && !tab.url?.startsWith("https://")) {
    showState("noscanState");
    return;
  }

  showState("loadingState");

  // Ask the background service worker for a cached result
  const cached = await new Promise((resolve) =>
    chrome.runtime.sendMessage({ type: "GET_RESULT", tabId: tab.id }, resolve)
  );

  if (cached) {
    _resultReceived = true;
    renderResult(cached);
    return;
  }

  // No cached result yet — the background is still calling the API.
  // The onMessage listener (registered above) will render the result when
  // SCAN_RESULT arrives. But if that broadcast fired before the listener was
  // ready (unlikely now, but possible under load), fall back to polling the
  // cache every 500 ms for up to 30 s.
  const tabId = tab.id;
  let attempts = 0;
  const MAX_ATTEMPTS = 60; // 60 × 500 ms = 30 s

  const poll = setInterval(async () => {
    if (_resultReceived || ++attempts > MAX_ATTEMPTS) {
      clearInterval(poll);
      if (!_resultReceived && attempts > MAX_ATTEMPTS) {
        showState("errorState");
        document.getElementById("errorMsg").textContent =
          "Scan timed out. Please click Rescan.";
      }
      return;
    }

    const result = await new Promise((resolve) =>
      chrome.runtime.sendMessage({ type: "GET_RESULT", tabId }, resolve)
    );

    if (result) {
      clearInterval(poll);
      _resultReceived = true;
      renderResult(result);
    }
  }, 500);
}

// ── Rescan button ─────────────────────────────────────────

document.getElementById("rescanBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
  _resultReceived = false;
  setRescanSpinning(true);
  showState("loadingState");
  chrome.runtime.sendMessage({ type: "RESCAN", tabId: tab.id });
});

// ── Settings button ───────────────────────────────────────

document.getElementById("settingsBtn").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});

// ── Boot ──────────────────────────────────────────────────

init();
