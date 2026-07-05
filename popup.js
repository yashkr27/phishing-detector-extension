// popup.js — Popup controller
// Thin orchestrator: imports UI helpers, delegates all DOM work to ui.js.

import { showState, renderUrl, renderResult,
         setRescanSpinning }  from "./modules/ui.js";

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
    renderResult(cached);
  }
  // No cached result → stay on loading; background will push SCAN_RESULT shortly
}

// ── Live updates from background service worker ───────────

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SCAN_START") {
    showState("loadingState");
    setRescanSpinning(false);
  }
  if (message.type === "SCAN_RESULT") {
    renderResult(message.result);
    setRescanSpinning(false);
  }
});

// ── Rescan button ─────────────────────────────────────────

document.getElementById("rescanBtn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;
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
