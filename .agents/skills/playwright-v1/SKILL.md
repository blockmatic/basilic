---
name: playwright-v1
description: Ad-hoc Playwright browser automation (scripts in /tmp). Use when testing a URL in a visible browser. App E2E belongs in the consuming repo's E2E dirs — see project rules (e.g. e2e-playwright.mdc).
---

# Playwright (ad-hoc)

Not for app E2E. Those live in the consuming app's E2E test directories.

## Run

1. Detect localhost: `node lib/helpers.js` from this skill dir, or ask for a URL.
2. Write a script to `/tmp/playwright-test-*.js` (never into the repo).
3. Visible browser unless the user asks for headless: `chromium.launch({ headless: false })`.
4. Execute: `node run.js /tmp/playwright-test-*.js` from this skill directory.

First time: `npm run setup` in this skill directory (installs Playwright + Chromium).
