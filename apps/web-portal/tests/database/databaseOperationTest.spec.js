const { test, expect } = require("../../src/fixtures/commonSetup");
const { Database } = require("../../src/pages/App Launcher/database");

test.setTimeout(15 * 60 * 1000);
// As https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#getPasswordData-property recommended, set timeout up to 15 min

test.use({
  database: async ({ page }, use) => {
    use(new Database(page));
  },
});

test.beforeEach(async ({ database }) => {
  await database.goto();
});

test.describe("Database testing for new tenant", () => {
  test("Database page can open", async ({ database }) => {
    await database.goto();
    await expect(
      database.page.locator(
        "//main[contains(normalize-space(),'Welcome to Mammoth Cyber!')]"
      )
    ).toBeVisible({ timeout: parseInt(process.env.NORMAL_TIMEOUT) });
  });
});
