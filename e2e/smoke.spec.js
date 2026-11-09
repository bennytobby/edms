// Read-only checks (@live): safe to run against production.
const { expect, test } = require("@playwright/test");

test("home, sign-in, sign-up, API docs and health check work @live", async ({ page, request }) => {
  const health = await request.get("/health");
  expect(health.status()).toBe(200);

  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Electronic Document Management System" }),
  ).toBeVisible();

  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
  await expect(page.getByLabel("User ID")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();

  await page.goto("/register");
  await expect(page.getByRole("heading", { name: "Create Your EDMS Account" })).toBeVisible();

  expect((await request.get("/api-docs/")).status()).toBe(200);
});

test("home page works at phone width (390 px) @live", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: "Electronic Document Management System" }),
  ).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("source files are not served, and the favicon and share image are @live", async ({
  request,
}) => {
  for (const path of ["/server.js", "/package.json", "/.git/config", "/vercel.json"]) {
    const res = await request.get(path, { maxRedirects: 0 });
    expect(res.status(), `${path} must not be served`).not.toBe(200);
  }
  for (const path of ["/favicon.svg", "/og.png"]) {
    expect((await request.get(path)).status(), path).toBe(200);
  }
});
