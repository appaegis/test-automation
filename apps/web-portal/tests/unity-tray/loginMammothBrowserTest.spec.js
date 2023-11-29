const { test, expect } = require("../../src/fixtures/mammothBrowserFixture");
const { EAB } = require("../../src/pages/eab");
test.setTimeout(120 * 1000);

test.describe("Login Mammoth Browser @C7902 @Smoke @Mammoth Browser", () => {
  test("Login with deafult domain", async ({ unityTray }) => {
    const page = await EAB.getAppSessionPage();
    await expect(
      page.eabPage.locator("//h1[contains(normalize-space(), 'Recent Apps')]"),
      "Recent Apps title should be visible"
    ).toBeVisible();
    await expect(
      page.eabPage.locator("//h1[contains(normalize-space(), 'App Launcher')]"),
      "App Launcher title should be visible"
    ).toBeVisible();
    await unityTray.launchApp();
    const loginStatus = await unityTray.getLoginStatus();
    expect(
      loginStatus.includes("Ready"),
      "Status Should be 'Ready' after login"
    ).toBeTruthy();
  });
});
