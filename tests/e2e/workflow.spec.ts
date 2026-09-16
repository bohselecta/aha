import { test, expect } from "@playwright/test";
import { readFile, chmod, writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
test("synthetic source review, note review, history, integrity and backup", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Pair your workspace" }),
  ).toBeVisible();
  await page.getByLabel("Local operator label").fill("Synthetic reviewer");
  await page.getByLabel("Pairing secret").fill("synthetic-browser-test");
  await page.getByRole("button", { name: "Open local workspace" }).click();
  await expect(
    page.getByRole("heading", { name: "Inbox", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /attendant.txt/ }),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/inbox-light.png", fullPage: true });
  let axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations).toEqual([]);
  await page.getByRole("button", { name: /attendant.txt/ }).click();
  await expect(page.getByLabel("Immutable text derivative")).toContainText(
    "van",
  );
  await page.getByLabel("Immutable text derivative").focus();
  await page.getByLabel("Immutable text derivative").press("ControlOrMeta+a");
  await page
    .getByLabel("Reported statement")
    .fill("The attendant source reports a red van.");
  await page
    .getByLabel("Why this represents the selected source")
    .fill("Literal source attribution; vehicle identity remains unknown.");
  await page.getByRole("button", { name: "Send statement for review" }).click();
  await expect(
    page.getByText("Review decision saved. History retained."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close detail" }).click();
  await page
    .getByRole("button", { name: "Review queue", exact: false })
    .click();
  await page
    .getByLabel("Reason for your decision")
    .fill("Compared the statement with its exact source passage.");
  await page
    .getByRole("button", { name: "Accept reviewed representation" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Nothing awaiting review" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Case register", exact: false })
    .click();
  await page
    .getByLabel("Your observation or scope limitation")
    .fill("SYNTHETIC browser note <script>not executable</script>");
  await page.getByRole("button", { name: "Send note for review" }).click();
  await expect(
    page.getByRole("heading", { name: "Review queue", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("Reason for your decision")
    .fill("Read the full note and confirmed representation.");
  await page
    .getByRole("button", { name: "Accept reviewed representation" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Nothing awaiting review" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Case register", exact: false })
    .click();
  await page.getByLabel("Filter this view").fill("browser note");
  await expect(
    page.getByRole("cell", {
      name: "SYNTHETIC browser note <script>not executable</script>",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Integrity & backup", exact: false })
    .click();
  await page.getByRole("button", { name: "Verify stored content" }).click();
  await expect(page.getByText("All checked content matches")).toBeVisible();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Create portable backup" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain(".aha-case.zip");
  await page.getByRole("button", { name: "Dark theme", exact: true }).click();
  axe = await new AxeBuilder({ page }).analyze();
  expect(axe.violations).toEqual([]);
  await page.screenshot({
    path: "artifacts/integrity-dark.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 720, height: 900 });
  await expect(
    page.getByRole("button", { name: "Verify stored content" }),
  ).toBeVisible();
  await page.screenshot({ path: "artifacts/reflow.png", fullPage: true });
  const root = (await readFile("test-results/e2e-root.txt", "utf8")).trim();
  const fixture = JSON.parse(
    await readFile("packages/fixtures/demo/case.json", "utf8"),
  );
  const original = fixture.records.find(
    (r: { kind: string }) => r.kind === "Evidence",
  );
  const originalPath = `${root}/cases/CASE-${fixture.case.id}/originals/sha256/${original.sha256.slice(0, 2)}/${original.sha256}`;
  await chmod(originalPath, 0o600);
  await writeFile(originalPath, "SYNTHETIC tamper test");
  await page.getByRole("button", { name: "Verify stored content" }).click();
  await expect(
    page.getByText("Integrity failure — export blocked"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Create portable backup" }).click();
  await expect(page.getByRole("alert")).toContainText("Backup blocked");
  await page.screenshot({
    path: "artifacts/integrity-failure.png",
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
