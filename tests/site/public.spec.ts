import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("public synthetic demo is navigable, accessible and isolated", async ({
  page,
}) => {
  const errors: string[] = [];
  const outbound: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => {
    if (!r.url().startsWith("http://127.0.0.1:4174/")) outbound.push(r.url());
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Every answer",
  );
  await expect(page.locator("input[type=file]")).toHaveCount(0);
  await page.getByRole("link", { name: "Explore a fictional case" }).click();
  await page.getByRole("button", { name: "Inspect receipt.txt" }).click();
  await expect(page.getByTestId("source-text")).toContainText(
    "Customer identity is not recorded",
  );
  await page.getByRole("button", { name: "Inspect calibration.txt" }).click();
  await expect(page.getByTestId("source-text")).toContainText(
    "plus 47 minute offset is excluded",
  );
  await page.getByLabel("Search source text").fill("eggs");
  await expect(page.locator("aside li")).toHaveCount(2);
  await page.getByLabel("Search source text").fill("nonexistentxyz");
  await expect(page.getByRole("status")).toHaveText("No matching sources.");
  await page.getByLabel("Search source text").fill("");
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: "artifacts/public-site-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({
    path: "artifacts/public-site-mobile.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
  expect(outbound).toEqual([]);
});
