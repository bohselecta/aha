import { test, expect } from "@playwright/test";
async function setup(page: import("@playwright/test").Page) {
  const session = await (
    await page.request.post("/api/v1/session", {
      data: {
        pairing_secret: "synthetic-browser-test",
        operator_label: "Synthetic regression reviewer",
      },
    })
  ).json();
  const create = async (title: string) =>
    (
      await page.request.post("/api/v1/cases", {
        headers: { "X-CSRF-Token": session.csrf_token },
        data: { title, timezone: "UTC", synthetic: true },
      })
    ).json();
  return { create };
}
test("late upload completion cannot reopen the previous case", async ({
  page,
}) => {
  const { create } = await setup(page),
    a = await create("SYNTHETIC delayed A"),
    b = await create("SYNTHETIC destination B");
  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Case", exact: true })
    .selectOption(a.id);
  await page.getByRole("button", { name: "Inbox", exact: false }).click();
  let release!: () => void, received!: () => void;
  const arrived = new Promise<void>((r) => (received = r)),
    held = new Promise<void>((r) => (release = r));
  await page.route(`**/cases/${a.id}/ingest`, async (route) => {
    const response = await route.fetch();
    received();
    await held;
    await route.fulfill({ response });
  });
  await page.getByLabel("Source file").setInputFiles({
    name: "synthetic.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("SYNTHETIC delayed source"),
  });
  await page.getByLabel("Receipt note").fill("Synthetic delayed upload");
  await page.getByRole("button", { name: "Preserve original" }).click();
  await arrived;
  await page
    .getByRole("combobox", { name: "Case", exact: true })
    .selectOption(b.id);
  await expect(
    page.getByText("No sources yet.", { exact: false }),
  ).toBeVisible();
  release();
  await expect(
    page.getByRole("combobox", { name: "Case", exact: true }),
  ).toHaveValue(b.id);
  await page.getByRole("button", { name: "Refresh case" }).click();
  await expect(
    page.getByRole("combobox", { name: "Case", exact: true }),
  ).toHaveValue(b.id);
  await expect(page.getByText("synthetic.txt", { exact: false })).toHaveCount(
    0,
  );
});
test("retry after a lost proposal response creates exactly one proposal", async ({
  page,
}) => {
  const { create } = await setup(page),
    c = await create("SYNTHETIC lost response");
  await page.goto("/");
  await page
    .getByRole("combobox", { name: "Case", exact: true })
    .selectOption(c.id);
  await page
    .getByRole("button", { name: "Case register", exact: false })
    .click();
  let first = true;
  const keys: string[] = [];
  await page.route(`**/cases/${c.id}/commands`, async (route) => {
    keys.push(route.request().headers()["idempotency-key"]);
    if (first) {
      first = false;
      await route.fetch();
      await route.abort("connectionreset");
    } else await route.continue();
  });
  await page
    .getByLabel("Your observation or scope limitation")
    .fill("SYNTHETIC note after lost response");
  await page.getByRole("button", { name: "Send note for review" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "Send note for review" }).click();
  await expect(
    page.getByText("Proposal saved.", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Review queue", exact: false })
    .click();
  await expect(
    page.getByRole("button", { name: "Accept reviewed representation" }),
  ).toHaveCount(1);
  expect(keys).toHaveLength(2);
  expect(keys[0]).toBe(keys[1]);
});
