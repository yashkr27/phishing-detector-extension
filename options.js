// options.js — Settings page controller

import { getSettings, saveSettings, DEFAULTS } from "./modules/settings.js";

// ── Load saved settings into the form ────────────────────

getSettings().then((settings) => {
  document.getElementById("apiUrl").value            = settings.apiUrl;
  document.getElementById("threshold").value         = Math.round(settings.threshold * 100);
  document.getElementById("thresholdVal").textContent = `${Math.round(settings.threshold * 100)}%`;
  document.getElementById("autoScanToggle").checked  = settings.autoScan;
});

// ── Slider live preview ───────────────────────────────────

document.getElementById("threshold").addEventListener("input", (e) => {
  document.getElementById("thresholdVal").textContent = `${e.target.value}%`;
});

// ── Save button ───────────────────────────────────────────

document.getElementById("saveBtn").addEventListener("click", async () => {
  const updates = {
    apiUrl:    document.getElementById("apiUrl").value.trim() || DEFAULTS.apiUrl,
    threshold: parseInt(document.getElementById("threshold").value, 10) / 100,
    autoScan:  document.getElementById("autoScanToggle").checked,
  };

  await saveSettings(updates);

  const msg = document.getElementById("saveMsg");
  msg.classList.add("visible");
  setTimeout(() => msg.classList.remove("visible"), 2500);
});
