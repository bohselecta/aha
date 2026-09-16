import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "tests/site",
  workers: 1,
  use: { baseURL: "http://127.0.0.1:4174" },
  webServer: {
    command:
      "npm exec -w apps/site vite preview -- --host 127.0.0.1 --port 4174",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: !process.env.CI,
  },
});
