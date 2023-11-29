const { test, expect } = require("../../src/fixtures/commonSetup");
const {
  BrowserProfile,
} = require("../../src/pages/MammothBrowser/browserProfile");
const {
  UnityProfileAPI,
} = require("../../src/library/apiRequest/unityProfile");

test.describe.configure({ mode: "serial" });

const unityProfileAPI = new UnityProfileAPI();
const PROFILE_NAME = "C5538_Automation";

test.use({
  browserProfile: async ({ page }, use) => {
    await use(new BrowserProfile(page));
  },
});

test.beforeAll(async ({}) => {
  await unityProfileAPI.init(process.env.GRAPHQL_API);
});

test.beforeEach(async ({ browserProfile, waitForSpinnerLoaded }) => {
  await browserProfile.goto();
  await waitForSpinnerLoaded();
});

test.describe("Admin user can add / delete / edit browser profile on portal @C5538 Smoke", () => {
  test("Add browser profile", async ({ browserProfile }) => {
    try {
      await browserProfile.clickAddUnityProfileButton();
      await browserProfile.inputProfileName(PROFILE_NAME);
      await browserProfile.selectTeamsUsers([process.env.ADMIN_USERNAME]);
      await browserProfile.clickDrawerSaveButton();
      const row = await browserProfile.getKeyTableRow(PROFILE_NAME);
      await expect(row).toBeVisible({
        timeout: parseInt(process.env.NORMAL_TIMEOUT),
      });
    } catch (e) {
      await unityProfileAPI.deleteUnityProfile(PROFILE_NAME);
      test.fail(true, toString(e));
    }
  });

  test("edit browser profile", async ({
    browserProfile,
    waitForSpinnerLoaded,
  }) => {
    try {
      const row = await browserProfile.getKeyTableRow(PROFILE_NAME);
      await row.locator(`text=${PROFILE_NAME}`).click();
      await browserProfile.checkAllPolicy();
      await browserProfile.clickDrawerSaveButton();
      await waitForSpinnerLoaded();
      await row.locator(`text=${PROFILE_NAME}`).click();
      await browserProfile.toBecheckedAllPolicy();
      await browserProfile.clickDrawerCancelButton();
    } catch (e) {
      await unityProfileAPI.deleteUnityProfile(PROFILE_NAME);
      test.fail(true, toString(e));
    }
  });

  test("delete browser profile", async ({ browserProfile }) => {
    const row = await browserProfile.getKeyTableRow(PROFILE_NAME);
    await row.locator(`text=${PROFILE_NAME}`).click();
    await browserProfile.clickDrawerDeleteButton();
    await browserProfile.clickDialogDeleteButton();
    await expect(row).not.toBeVisible({
      timeout: parseInt(process.env.NORMAL_TIMEOUT),
    });
  });
});
