async function globalSetup() {
  // Global setup intentionally left empty.
  // Playwright webServer handles startup; globalTeardown handles cleanup.
}

// Playwright requires default export for globalSetup
// eslint-disable-next-line import/no-default-export
export default globalSetup
