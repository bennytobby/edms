// The core flow: a user signs in and reaches the dashboard.
// Needs MongoDB (CI runs it as a service). Writes data, so it is never run against production.
const { expect, test } = require("@playwright/test");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");

const mongoUrl = process.env.MONGO_CONNECTION_STRING;
test.skip(!mongoUrl || Boolean(process.env.BASE_URL), "needs a local MongoDB (set MONGO_CONNECTION_STRING)");

const user = {
  userid: "e2e_user",
  firstname: "Ada",
  lastname: "Lovelace",
  email: "e2e_user@example.com",
  phone: "5555550100",
  role: "user",
};
const password = "correct horse battery staple";

test.beforeAll(async () => {
  const client = new MongoClient(mongoUrl);
  await client.connect();
  const users = client.db("edms_e2e").collection("users");
  await users.deleteMany({ userid: user.userid });
  await users.insertOne({ ...user, pass: await bcrypt.hash(password, 10) });
  await client.close();
});

test("a user is refused with a wrong password, signs in, sees the dashboard and a real 404", async ({
  page,
}) => {
  await page.goto("/login");
  await page.getByLabel("User ID").fill(user.userid);
  await page.getByLabel("Password").fill("wrong password");
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).not.toHaveURL(/\/dashboard/);

  await page.goto("/login");
  await page.getByLabel("User ID").fill(user.userid);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign In" }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByText(`Welcome, ${user.firstname}`)).toBeVisible();

  const res = await page.goto("/this-page-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1, name: "Page Not Found" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Back to Dashboard" })).toBeVisible();
});
