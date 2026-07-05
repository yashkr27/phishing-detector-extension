// popup.js — Popup controller
// Shows cached result immediately, always triggers a fresh scan,
// and updates the display when the result arrives.

import { showState, renderUrl, renderResult,
         setRescanSpinning }  from "./modules/ui.js";

// ── Live updates from background service worker ───────────
// Register the listener SYNCHRONOUSLY at module load time so we
// never miss a SCAN_RESULT broadcast.

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

  // Try to show cached result immediately (instant UI)
  const cached = await new Promise((resolve) =>
    chrome.runtime.sendMessage({ type: "GET_RESULT", tabId: tab.id }, resolve)
  );

  if (cached) {
    renderResult(cached);
  } else {
    showState("loadingState");
  }
}

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
