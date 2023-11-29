const { test, expect } = require("../../src/fixtures/commonSetup");
const { Dashboard } = require("../../src/pages/dashboard");
const { Web } = require("../../src/pages/web");
const { LogAPI } = require("../../src/library/apiRequest/log");
const { Sidebar } = require("../../src/pages/sidebar");

let googlePage;
const APP_NAME = "C5981";

test.skip(true, "remove this skip unitl AC-4201 is fixed");

test.use({
  dashboard: async ({ page }, use) => {
    await use(new Dashboard(page));
  },
  web: async ({ page }, use) => {
    await use(new Web(page));
  },
});
test.beforeEach(async ({ dashboard }) => {
  await dashboard.goto();
});

test.describe("Main section count should be correct", () => {
  test("User count should greater than 0 @C5981", async ({ dashboard }) => {
    const userCount = await dashboard.mainSection.getCount("Users");
    expect(parseInt(userCount)).toBeGreaterThan(0);
  });

  test("Role count should greater than 0 @C5984", async ({ dashboard }) => {
    const rolesCount = await dashboard.mainSection.getCount("Roles");
    expect(parseInt(rolesCount)).toBeGreaterThan(0);
  });

  test("Application count should greater than 0 @C5987", async ({
    dashboard,
  }) => {
    const applicationsCount = await dashboard.mainSection.getCount(
      "Applications"
    );
    expect(parseInt(applicationsCount)).toBeGreaterThan(0);
  });

  test("Connections count should greater than 0 when opening an application @C5990", async ({
    page,
    sideBar,
    dashboard,
    web,
  }) => {
    await sideBar.clickSideBar("App Launcher");
    await sideBar.clickSideBar("Web", "App Launcher");
    try {
      await createAndWaitApplicationIsLoaded(web, page);
      await waitLogForwardingEvent();
      await sideBar.clickSideBar("Analytics");
      const activeConnectionCount = await dashboard.mainSection.getCount(
        "Active Connections"
      );
      expect(parseInt(activeConnectionCount)).toBeGreaterThan(0);
    } catch (e) {
      console.err(e);
    } finally {
      await web.goto();
      await web.deleteApp(APP_NAME);
      await googlePage.close();
    }
  });
});

async function createAndWaitApplicationIsLoaded(web, page) {
  await web.createWebApplication(
    APP_NAME,
    "Cloud Services",
    "https",
    "Default",
    "google.com"
  );
  await web.inputSearch(APP_NAME);
  googlePage = await web.launchApp(page, APP_NAME);
}

async function waitLogForwardingEvent() {
  const logAPI = new LogAPI();
  await logAPI.init();
  await expect
    .poll(
      async () => {
        let result = await logAPI.getActiveInfo();
        return APP_NAME in result.data.apps;
      },
      {
        message: "make sure log forwarding message is sent",
        timeout: parseInt(process.env.LONG_TIMEOUT),
      }
    )
    .toBe(true);
}
