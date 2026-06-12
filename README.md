# Design & Dev QA — Figma Plugin

Compares a selected Figma frame against a live website.
Uses Playwright to capture real computed CSS — like pressing F12.

## Setup

```bash
npm install
npx playwright install chromium
npm run start:backend
```

### Windows PowerShell blocked?

If you see `running scripts is disabled on this system`, use `.cmd` instead of `npm`:

```bat
cd figma-design-qa
npm.cmd install
npm.cmd run build
dev.cmd              REM watch + backend
start-backend.cmd    REM backend only
```

Or double-click `dev.cmd` / `start-backend.cmd` in File Explorer.

In Figma → Plugins → Development → Import plugin from manifest.json
Then: `npm run build` (or `npm run dev` to watch)

## How it works

1. Select a Figma frame
2. Enter a website URL
3. Click Run Audit
4. Playwright captures the full page screenshot + all computed styles
5. Comparison engine matches Figma layers to DOM elements
6. Issues are shown with pins on the screenshot

## What it checks

Padding | Gap | Font size | Font weight | Font family |
Line height | Border radius | Borders | Shadows |
Background color | Container width/height | Image size

## Website blocked (403)?

Many hosts block headless/automated browsers. Use **your real Chrome**:

1. Double-click **`connect-chrome.cmd`** — opens Chrome with debugging on port 9222
2. **Open your website** in that Chrome window (log in if needed)
3. In the Figma plugin, keep **"Use my Chrome"** checked
4. Click **Run Audit**

The scanner tries multiple methods (your Chrome → visible profile → headless) automatically.
Restart backend after code updates: `start-backend.cmd`
