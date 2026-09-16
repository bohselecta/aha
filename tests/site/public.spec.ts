import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
test("follow the question opens its actual record", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Follow the question" }).click();
  await expect(page.locator(".ex-inspector")).toContainText(
    "Do the two red-vehicle references identify the same vehicle?",
  );
});
test("investigator workspace: explore, trace sources, compare uncertainty, and clear a lens", async ({
  page,
}) => {
  const errors: string[] = [];
  const requests: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("request", (r) => requests.push(r.url()));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "A fresh perspective.A clearer case.",
  );
  await expect(
    page.getByText(/M1|parser|acceptance gate|prerecorded|still being built/),
  ).toHaveCount(0);
  await page.getByRole("link", { name: "Open sample case" }).first().click();
  await expect(
    page.getByRole("heading", { name: "The Lantern Annex" }),
  ).toBeVisible();
  await expect(page.locator("input[type=file]")).toHaveCount(0);
  await expect(page.locator(".ex-node")).toHaveCount(18);
  const keyboardNode = page.getByRole("button", {
    name: "Inspect attendant.txt",
  });
  await keyboardNode.focus();
  await keyboardNode.press("Enter");
  await expect(page.getByTestId("source-text")).toBeVisible();
  await page.locator(".ex-inspector").press("Escape");
  await expect(keyboardNode).toBeFocused();
  const originalPositions = await page
    .locator(".ex-node")
    .evaluateAll((ns) => ns.map((n) => n.getAttribute("transform")));
  await page.getByLabel("Search this case").fill("eggs");
  await expect(page.getByRole("status")).toContainText(
    "Matching all search words",
  );
  await expect(page.locator(".ex-wire.relationship")).toHaveCount(1);
  expect(
    await page
      .locator(".ex-node")
      .evaluateAll((ns) => ns.map((n) => n.getAttribute("transform"))),
  ).toEqual(originalPositions);
  await page
    .getByRole("button", {
      name: "Inspect Receipt includes eggs; customer not identified.",
    })
    .click();
  await expect(page.getByText("Why shown?", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "receipt.txt", exact: true }).click();
  await expect(page.getByTestId("source-text")).toContainText(
    "Customer identity is not recorded",
  );
  await page.getByRole("button", { name: "Clear lens", exact: true }).click();
  expect(
    await page
      .locator(".ex-node")
      .evaluateAll((ns) => ns.map((n) => n.getAttribute("transform"))),
  ).toEqual(originalPositions);
  await page.getByRole("button", { name: "Table", exact: true }).click();
  await page.getByLabel("Evidence basis").selectOption("OBSERVED");
  await expect(page.locator("tbody tr")).toHaveCount(5);
  await page.getByRole("button", { name: "Clear lens", exact: true }).click();
  await page.getByRole("button", { name: "Timeline", exact: true }).click();
  await expect(
    page.getByRole("cell", { name: /before 22:10/ }).first(),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Inspect A red van left before 22:10; plate not observed.",
    })
    .click();
  await expect(
    page.getByText(/2026-09-11T03:10:00Z \(exclusive\)/),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Questions & conflicts", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Inspect Conflicting accounts" })
    .click();
  await expect(
    page.getByText("Same vehicle is unconfirmed.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Inspect The camera clock was 47 minutes fast.",
    })
    .click();
  await expect(
    page.getByText("Retired explanation: new evidence and review required."),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Camera offset between minus 2 and plus 2 minutes for the interval.",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "calibration.txt", exact: true })
    .click();
  await expect(page.getByTestId("source-text")).toContainText(
    "plus 47 minute offset is excluded",
  );
  await page
    .getByRole("button", { name: "Possibilities", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Inspect Two different vehicles" })
    .click();
  await expect(
    page.getByText("Two vehicles shared a color.", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Do the two red-vehicle references identify the same vehicle?",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", { name: "What different findings would change" }),
  ).toBeVisible();
  await expect(
    page.getByText("Same vehicle would not establish who operated it."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sources", exact: true }).click();
  await page.getByLabel("Search this case").fill("nonexistentxyz");
  await expect(
    page.getByRole("heading", { name: "No matches under these filters" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Show all records" }).click();
  await page.getByRole("button", { name: "Inspect attendant.txt" }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole("button", { name: "Atlas", exact: true }).click();
  await page.getByRole("button", { name: "Map", exact: true }).click();
  await page.screenshot({
    path: "artifacts/atlas-desktop.png",
    fullPage: true,
  });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page
    .getByRole("button", { name: "Questions & conflicts", exact: true })
    .click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: "artifacts/atlas-mobile.png", fullPage: true });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "The Lantern Annex" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Back to Aha!" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  expect(errors).toEqual([]);
  expect(
    requests.filter((u) => !u.startsWith("http://127.0.0.1:4174/")),
  ).toEqual([]);
  expect(requests.filter((u) => u.includes("/api/"))).toEqual([]);
});
