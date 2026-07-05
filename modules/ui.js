// modules/ui.js
// All popup DOM mutations live here.
// Functions are pure: data in, DOM update out — no fetch, no storage.

// ── State IDs ─────────────────────────────────────────────

const STATES = ["loadingState", "safeState", "phishingState", "errorState", "noscanState"];

const $ = (id) => document.getElementById(id);

// ── Internal helpers ──────────────────────────────────────

function animateBar(fillEl, valueEl, fraction) {
  valueEl.textContent = `${Math.round(fraction * 100)}%`;
  // Defer to next frame so CSS transition runs after display:flex
  requestAnimationFrame(() => {
    fillEl.style.width = `${Math.round(fraction * 100)}%`;
  });
}

function formatTimestamp(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return `Scanned ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

// ── Exports ───────────────────────────────────────────────

/**
 * Show exactly one state panel, hiding all others.
 * @param {"loadingState"|"safeState"|"phishingState"|"errorState"|"noscanState"} stateId
 */
export function showState(stateId) {
  STATES.forEach((s) => {
    $(s).style.display = s === stateId ? "flex" : "none";
  });
}

/**
 * Update the shield icon in the header to reflect the current verdict.
 * @param {"safe"|"phishing"|"error"|"neutral"} state
 */
export function updateShieldIcon(state) {
  const shield = $("shieldIcon");
  const check  = $("shieldCheck");
  const x      = $("shieldX");

  shield.className = "shield-icon";
  check.style.display = "none";
  x.style.display     = "none";

  if (state === "safe") {
    shield.classList.add("is-safe");
    check.style.display = "inline";
  } else if (state === "phishing") {
    shield.classList.add("is-phish");
    x.style.display = "inline";
  } else if (state === "error") {
    shield.classList.add("is-error");
  }
}

/**
 * Render the URL string (truncated) in the URL bar.
 * @param {string} url
 */
export function renderUrl(url) {
  $("urlText").textContent =
    url.length > 50 ? url.slice(0, 47) + "…" : url;
}

/**
 * Apply a complete scan result object to the popup UI.
 * @param {{ label: string, confidence: number, error: string|null, timestamp: number }|null} result
 */
export function renderResult(result) {
  if (!result || result.error) {
    showState("errorState");
    if (result?.error) $("errorMsg").textContent = result.error;
    updateShieldIcon("error");
    $("timestamp").textContent = formatTimestamp(result?.timestamp);
    return;
  }

  if (result.label === "phishing") {
    showState("phishingState");
    animateBar($("phishConfidenceFill"), $("phishConfidenceVal"), result.confidence);
    updateShieldIcon("phishing");
  } else {
    showState("safeState");
    // Safe bar shows legitimacy confidence = 1 - phishing probability
    animateBar($("safeConfidenceFill"), $("safeConfidenceVal"), 1 - result.confidence);
    updateShieldIcon("safe");
  }

  $("timestamp").textContent = formatTimestamp(result.timestamp);
}

/**
 * Toggle the spinning animation on the rescan button.
 * @param {boolean} spinning
 */
export function setRescanSpinning(spinning) {
  const btn = $("rescanBtn");
  if (spinning) {
    btn.classList.add("spinning");
  } else {
    btn.classList.remove("spinning");
  }
}
