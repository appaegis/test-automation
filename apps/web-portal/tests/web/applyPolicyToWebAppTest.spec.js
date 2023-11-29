const { test, expect } = require("../../src/fixtures/commonSetup");
const { Policies } = require("../../src/pages/policies");
const { Web } = require("../../src/pages/web");
test.setTimeout(120 * 1000);

test.use({
  web: async ({ page }, use) => {
    await use(new Web(page));
  },
  policies: async ({ page }, use) => {
    await use(new Policies(page));
  },
});

test.beforeEach(async ({ policies }) => {
  await policies.goto();
});

test.afterEach(async ({ web, policies }) => {
  await web.goto();
  await web.deleteApp("C221_Web_Application");
  await policies.goto();
  await policies.deletePolicy("Policy_C211");
});

test.describe("Apply policy @C211 @Smoke", () => {
  test("Apply policies Copy, Paste, Print to web application", async ({
    sideBar,
    page,
    web,
    policies,
    delay,
  }) => {
    await policies.createPolicy("Policy_C211", "C211_Automation", [
      {
        groupsAndUsers: [process.env.ADMIN_USERNAME],
        actions: ["Print", "Copy", "Paste"],
      },
    ]);
    await sideBar.clickSideBar("App Launcher");
    await sideBar.clickSideBar("Web");
    await web.createWebApplication(
      "C221_Web_Application",
      "Cloud Services",
      "https",
      "Policy_C211",
      "google.com"
    );
    await web.inputSearch("C221_Web_Application");
    let googlePage = await web.launchApp(page, "C221_Web_Application");
    await delay(parseInt(process.env.NORMAL_TIMEOUT));
    await googlePage.locator("canvas").click({ button: "right" });
    await expect(googlePage.locator('li:has-text("Copy")')).toBeVisible();
    await expect(googlePage.locator('li:has-text("Paste")')).toBeVisible();
    await expect(
      googlePage.locator('li:has-text("Print to PDF")')
    ).toBeVisible();
    await googlePage.close();
  });
});
