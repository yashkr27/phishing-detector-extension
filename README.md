# PhishGuard Browser Extension

A Chrome Manifest V3 browser extension that detects phishing URLs in real-time using your own AI-powered API.

![Chrome](https://img.shields.io/badge/Chrome-MV3-4285F4?logo=googlechrome&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Features

- 🔍 **Auto-scans** every URL you navigate to
- 🟢 / 🔴 **Badge** on the extension icon — green for safe, red for phishing
- 🛡️ **In-page warning banner** for high-confidence phishing sites
- 📊 **Confidence meter** in the popup
- ⚙️ **Settings page** — configure API URL, confidence threshold, and auto-scan toggle
- ⚡ **Session cache** — no repeated API calls for the same URL

---

## Project Structure

```
phishing-detector-extension/
├── manifest.json          ← Chrome Manifest V3
├── background.js          ← Service worker (orchestrator)
├── content.js             ← In-page warning overlay
├── popup.html/css/js      ← Extension popup UI
├── options.html/js        ← Settings page
├── modules/
│   ├── settings.js        ← chrome.storage read/write
│   ├── api.js             ← POST /predict wrapper
│   ├── badge.js           ← Extension badge helpers
│   ├── cache.js           ← Session cache helpers
│   └── ui.js              ← Popup DOM rendering
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

---

## Prerequisites

This extension calls the **PhishGuard FastAPI** backend.

- **Backend repo**: [phishing-detection-api](https://github.com/yashkr27/phishing-detection-api)
- The API must be running and accessible from your browser

---

## Installation

### 1. Start the API

```bash
# In the phishing-detection-api project directory:
uvicorn app.main:app --reload
```

Default: `http://127.0.0.1:8000`

### 2. Load the extension in Chrome

1. Open Chrome → navigate to `chrome://extensions`
2. Enable **Developer mode** (toggle, top-right)
3. Click **Load unpacked**
4. Select this `phishing-detector-extension/` folder
5. Pin the extension icon to your toolbar

### 3. Configure (if using a deployed API)

1. Click the extension icon → ⚙️ **Settings**
2. Update **API Base URL** to your deployed URL (e.g., `https://your-api.railway.app`)
3. Click **Save Settings**

> **Note:** If you change the API URL from the default, also update `host_permissions` in `manifest.json` and reload the extension.

---

## Configuration Options

| Setting | Default | Description |
|---|---|---|
| API Base URL | `http://127.0.0.1:8000` | Where your FastAPI is running |
| Confidence Threshold | `80%` | Minimum confidence to show the in-page warning banner |
| Auto-Scan | `ON` | Scan every tab automatically on navigation |

---

## Module Architecture

```
[Tab navigates]
      │
background.js  (orchestrator)
      │
      ├─ modules/settings.js  → reads apiUrl, threshold, autoScan
      ├─ modules/cache.js     → session cache check
      ├─ modules/api.js       → POST /predict
      ├─ modules/badge.js     → updates extension badge
      │
      └─ broadcasts result →
              ├─ popup.js + modules/ui.js   (popup rendering)
              └─ content.js                 (in-page banner)
```

---

## License

MIT
