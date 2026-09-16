import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("build a sourced event from an empty case and find uncited source text", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByLabel("Your name").fill("Synthetic manual reviewer");
  await page.getByLabel("Connection code").fill("synthetic-browser-test");
  await page.getByRole("button", { name: "Open local workspace" }).click();
  await page.getByRole("button", { name: "Create case", exact: false }).click();
  await page.getByLabel("Case title").fill("SYNTHETIC empty browser case");
  await page.getByLabel("Timezone", { exact: true }).fill("UTC");
  await page.getByRole("button", { name: "Create local case" }).click();
  await page.getByRole("button", { name: "Inbox", exact: false }).click();
  await page.getByLabel("Source file").setInputFiles({
    name: "synthetic.csv",
    mimeType: "text/csv",
    buffer: Buffer.from(
      "subject,account\nSYNTHETIC witness,The copper kettle arrived before closing.\n",
    ),
  });
  await page
    .getByLabel("Receipt note")
    .fill("Fictional source for a complete browser journey");
  await page.getByRole("button", { name: "Preserve original" }).click();
  await expect(
    page.getByText("Original preserved; text ready", { exact: true }),
  ).toBeVisible();
  await page.getByLabel("Label", { exact: true }).fill("SYNTHETIC witness");
  await page.getByRole("button", { name: "Propose entity" }).click();
  async function accept() {
    await page
      .getByRole("button", { name: "Review queue", exact: false })
      .click();
    await page
      .getByLabel("Reason for your decision")
      .fill("Compared representation and exact cited source.");
    await page
      .getByRole("button", { name: "Accept reviewed representation" })
      .click();
    await expect(
      page.getByRole("heading", { name: "Nothing awaiting review" }),
    ).toBeVisible();
  }
  await accept();
  await page
    .getByRole("button", { name: "Search sources", exact: false })
    .click();
  await page.getByLabel("Words to find").fill("copper kettle");
  await page
    .getByRole("button", { name: "Search sources", exact: true })
    .click();
  await expect(
    page.getByText(/The copper kettle arrived before closing/),
  ).toBeVisible();
  await page.getByRole("button", { name: "Inbox", exact: false }).click();
  await page
    .getByRole("button", { name: /synthetic.csv.*Review source/ })
    .click();
  await expect(page.getByLabel("Source text")).toContainText("copper kettle");
  await page.getByLabel("Source text").focus();
  await page.getByLabel("Source text").press("ControlOrMeta+a");
  await page
    .getByLabel("Reported statement")
    .fill("Witness reports a kettle delivery before closing.");
  await page
    .getByLabel("Why this represents the selected source")
    .fill("Attribution only; the source does not give an exact time.");
  await page.getByRole("button", { name: "Send statement for review" }).click();
  await expect(
    page.getByText("Proposal saved.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close detail" }).click();
  await accept();
  await page
    .getByRole("button", { name: "Case register", exact: false })
    .click();
  const form = page.locator(".record-editor");
  await form
    .getByLabel("Label", { exact: true })
    .fill("Reported kettle delivery");
  await form
    .getByRole("group", { name: /Statements describing this event/ })
    .getByRole("checkbox")
    .check();
  await form
    .getByLabel("Explain the basis")
    .fill("Event derived from the reviewed statement; timing is unknown.");
  await form
    .getByLabel("Reason for this proposal")
    .fill(
      "Separate the event from the source account without adding certainty.",
    );
  await form
    .getByRole("button", { name: "Send for review", exact: true })
    .click();
  await expect(
    page.getByText("Proposal saved.", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Review queue", exact: false })
    .click();
  await expect(
    page.getByRole("heading", { name: "Time as recorded" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Source statements" }),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await accept();
  await page.getByRole("button", { name: "Overview", exact: false }).click();
  await expect(
    page.getByText("1 of 1 sources have extracted text.", { exact: false }),
  ).toBeVisible();
});
