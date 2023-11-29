const { test, expect } = require("../../src/fixtures/commonSetup");
const {
  BrowserProfile,
} = require("../../src/pages/MammothBrowser/browserProfile");

test.describe.configure({ mode: "serial" });

const PROFILE_NAME = "Default Profile";

test.use({
  browserProfile: async ({ page }, use) => {
    await use(new BrowserProfile(page));
  },
});

test.beforeEach(async ({ browserProfile }) => {
  await browserProfile.goto();
});

test.describe("check The default browser profile always shows and can not be deleted. @C5539 Smoke", () => {
  test("check The default browser profile always shows there and can be edited", async ({
    browserProfile,
    waitForSpinnerLoaded,
  }) => {
    const row = await browserProfile.getDefaultRow();
    await expect(row).toBeVisible({
      timeout: parseInt(process.env.NORMAL_TIMEOUT),
    });
    await row.locator(`text=${PROFILE_NAME}`).click();
    await browserProfile.checkAllPolicy();
    await browserProfile.clickDrawerSaveButton();
    await waitForSpinnerLoaded();
    await row.locator(`text=${PROFILE_NAME}`).click();
    await browserProfile.toBecheckedAllPolicy();
    await browserProfile.uncheckAllPolicy();
    await browserProfile.clickDrawerSaveButton();
    await waitForSpinnerLoaded();
    await row.locator(`text=${PROFILE_NAME}`).click();
    await browserProfile.toBeUncheckedAllPolicy();
  });

  test("check The default browser profile always can not be deleted", async ({
    browserProfile,
  }) => {
    //FIXME This test actaully not work
    const deleteButton = await browserProfile.getDeleteButton();
    await expect(deleteButton).not.toBeVisible({
      timeout: parseInt(process.env.NORMAL_TIMEOUT),
    });
  });
});
