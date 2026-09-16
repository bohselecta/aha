import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 30000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: "http://127.0.0.1:8081",
    viewport: { width: 1440, height: 1000 },
    trace: "retain-on-failure",
  },
  webServer: {
    command: ".venv/bin/python tests/e2e/server.py",
    url: "http://127.0.0.1:8081/api/v1/health",
    reuseExistingServer: false,
  },
  reporter: [
    ["list"],
    ["json", { outputFile: "artifacts/browser-tests.json" }],
  ],
});
