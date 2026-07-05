// ─────────────────────────────────────────────────────────
//  PhishGuard – Content Script
//  Injects a warning banner when a phishing site is detected
//  with confidence above the user-configured threshold.
// ─────────────────────────────────────────────────────────

const BANNER_ID = "phishguard-warning-banner";

function createBanner(confidence) {
  if (document.getElementById(BANNER_ID)) return; // already shown

  const confidencePct = Math.round(confidence * 100);

  const banner = document.createElement("div");
  banner.id = BANNER_ID;
  banner.setAttribute("data-phishguard", "true");

  banner.innerHTML = `
    <div class="pg-inner">
      <div class="pg-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="22" height="22">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
      </div>
      <div class="pg-text">
        <strong>⚠️ PhishGuard Warning</strong>
        <span>This site has been flagged as a <b>phishing attempt</b> (${confidencePct}% confidence). Proceed with extreme caution.</span>
      </div>
      <button class="pg-dismiss" id="pg-dismiss-btn" title="Dismiss warning">✕</button>
    </div>
  `;

  // Styles (scoped within the banner to avoid leaking)
  const style = document.createElement("style");
  style.setAttribute("data-phishguard", "true");
  style.textContent = `
    #${BANNER_ID} {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2147483647;
      background: linear-gradient(90deg, #7f1d1d, #991b1b, #7f1d1d);
      border-bottom: 2px solid #ef4444;
      box-shadow: 0 4px 32px rgba(239,68,68,0.5);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 14px;
      color: #fef2f2;
      padding: 0;
      animation: pgSlideIn 0.35s cubic-bezier(0.4,0,0.2,1) forwards;
      backdrop-filter: blur(4px);
    }
    @keyframes pgSlideIn {
      from { transform: translateY(-100%); opacity: 0; }
      to   { transform: translateY(0);     opacity: 1; }
    }
    #${BANNER_ID} .pg-inner {
      display: flex;
      align-items: center;
      gap: 12px;
      max-width: 1200px;
      margin: 0 auto;
      padding: 10px 16px;
    }
    #${BANNER_ID} .pg-icon {
      flex-shrink: 0;
      color: #fca5a5;
    }
    #${BANNER_ID} .pg-text {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
      line-height: 1.4;
    }
    #${BANNER_ID} .pg-text strong {
      font-size: 14px;
      font-weight: 700;
      color: #fef2f2;
    }
    #${BANNER_ID} .pg-text span {
      font-size: 12.5px;
      color: #fca5a5;
    }
    #${BANNER_ID} .pg-text b {
      color: #fef2f2;
      font-weight: 600;
    }
    #${BANNER_ID} .pg-dismiss {
      flex-shrink: 0;
      background: rgba(255,255,255,0.15);
      border: 1px solid rgba(255,255,255,0.25);
      border-radius: 6px;
      color: #fef2f2;
      width: 28px;
      height: 28px;
      font-size: 13px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
      line-height: 1;
    }
    #${BANNER_ID} .pg-dismiss:hover {
      background: rgba(255,255,255,0.25);
    }
  `;

  document.documentElement.prepend(style);
  document.documentElement.prepend(banner);

  // Dismiss
  document.getElementById("pg-dismiss-btn").addEventListener("click", () => {
    banner.style.animation = "none";
    banner.style.transition = "opacity 0.25s, transform 0.25s";
    banner.style.opacity = "0";
    banner.style.transform = "translateY(-100%)";
    setTimeout(() => {
      banner.remove();
      style.remove();
    }, 300);
  });
}

// ── Listen for messages from background ───────────────────

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "SHOW_WARNING") {
    createBanner(message.confidence);
  }
});
