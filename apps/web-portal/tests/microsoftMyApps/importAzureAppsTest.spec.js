const { Login } = require("../../src/pages/login");
const { test } = require("@playwright/test");
const { AzureConnector } = require("../../src/pages/Connectors/azureConnector");
const {
  MicrosoftMyApps,
} = require("../../src/pages/App Launcher/microsoftMyApps");
const { Sidebar } = require("../../src/pages/sidebar");

test.skip(
  process.env.ADMIN_USERNAME != "appaegisqa+automation@gmail.com",
  "Only support specific tenant"
);

const AZURE_URL_ENTRANCE = process.env.CUSTOM_URL;

test.describe.configure({ mode: "serial" });
let page;

test.use({
  baseURL: AZURE_URL_ENTRANCE,
});

test.beforeAll(async ({ browser }) => {
  page = await browser.newPage();
  const azureConnector = new AzureConnector(page);
  const login = new Login(page);
  await login.goto(AZURE_URL_ENTRANCE);
  await login.login(process.env.ADMIN_USERNAME, process.env.ADMIN_PASSWORD);
  await azureConnector.goto();
});

test.describe("Suite test for importing apps from Azure @C6991 @Smoke", () => {
  test("Set up Azure connector and check apps are imported", async () => {
    const azureConnector = new AzureConnector(page);
    const sideBar = new Sidebar(page);
    const microsoftMyApps = new MicrosoftMyApps(page);
    const APPLICATION_ID = process.env.AZURE_APP_REGISTRATION_APPLICATION_ID;
    const DIRECTORY_ID = "9cda3a5a-6b23-401d-878e-730a8bce2418";
    const APP_1 = "Excel";
    const APP_2 = "Word";

    await azureConnector.saveAppInfo(APPLICATION_ID, DIRECTORY_ID);
    await sideBar.clickSideBar("App Launcher");
    await sideBar.clickSideBar("Microsoft My Apps");
    await microsoftMyApps.waitForTableLoaded();
    await microsoftMyApps.verifyAppIsImported(APP_1);
    await microsoftMyApps.verifyAppIsImported(APP_2);
  });

  test("Delete the Azure connector and verify that the page imported apps is default", async () => {
    const azureConnector = new AzureConnector(page);
    const sideBar = new Sidebar(page);
    const microsoftMyApps = new MicrosoftMyApps(page);
    const APPLICATION_ID = "";
    const DIRECTORY_ID = "";

    await azureConnector.goto();
    await azureConnector.saveAppInfo(APPLICATION_ID, DIRECTORY_ID);
    await sideBar.clickSideBar("App Launcher");
    await sideBar.clickSideBar("Microsoft My Apps");
    await microsoftMyApps.waitForPageLoaded();
    await microsoftMyApps.verifyPageIsDefault();
  });
});
