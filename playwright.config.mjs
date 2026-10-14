// The demo's own tests: a real browser, real taps. `pnpm test:demo` builds the demo and runs them.
// The server is scripts/dev.mjs on port 7301: this package's block of ports is 7300 to 7399, and tests use 7301 and up.
import { defineConfig, devices } from "@playwright/test";

// This package's ports are 7300 to 7399; tests use 7301 unless TEST_PORT names another (a worktree takes its own).
const port = Number(process.env.TEST_PORT ?? 7301);
const phone = { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true };

export default defineConfig({
  testDir: "e2e",
  testMatch: "*.demo.mjs",
  fullyParallel: true,
  forbidOnly: true,
  reporter: "list",
  use: { baseURL: `http://127.0.0.1:${port}`, reducedMotion: "no-preference", locale: "en-US" },
  webServer: { command: "node scripts/dev.mjs", env: { PORT: String(port) }, url: `http://127.0.0.1:${port}/`, reuseExistingServer: false },
  projects: [
    { name: "chromium-phone", use: { ...devices["Desktop Chrome"], ...phone } },
    { name: "chromium-desk", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 900 } } },
    // WebKit on a desktop viewport with touch: `isMobile` is Chromium's to honour.
    { name: "webkit-phone", use: { ...devices["Desktop Safari"], viewport: phone.viewport, hasTouch: true } },
  ],
});
