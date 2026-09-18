import { defineConfig, devices } from "@playwright/test"

const baseURL = "http://127.0.0.1:3100"

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: "list",
  use: {
    baseURL,
    colorScheme: "light",
    reducedMotion: "reduce",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 2560, height: 1440 },
      },
    },
  ],
  webServer: {
    command: "npm run build --workspace @suhdo/showcase && npm run start --workspace @suhdo/showcase -- --hostname 127.0.0.1 --port 3100",
    url: baseURL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
})
