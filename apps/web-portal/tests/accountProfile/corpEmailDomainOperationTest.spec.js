const { test, expect } = require("../../src/fixtures/commonSetup");
const { AccountProfile } = require("../../src/pages/accountProfile");
const {
  EmailDomainAPI,
} = require("../../src/library/apiRequest/accountProfile");

test.describe.configure({ mode: "serial" });

let emailDomainAPI = new EmailDomainAPI();
let TEST_DOMAIN_1 = "Automation_C6070_1.com";
let TEST_DOMAIN_2 = "Automation_C6070_2.com";
let TEST_DOMAIN_NAME_PREFIX = "Automation_C6070";

test.use({
  accountProfile: async ({ page }, use) => {
    await use(new AccountProfile(page));
  },
});

test.beforeAll(async ({}) => {
  await emailDomainAPI.init(process.env.GRAPHQL_API);
});

test.beforeEach(async ({ accountProfile, waitForSpinnerLoaded }) => {
  await accountProfile.goto();
  await waitForSpinnerLoaded();
  await emailDomainAPI.init(process.env.GRAPHQL_API);
});

test.afterAll(async () => {
  let emailDomainEntries = await emailDomainAPI.queryEmailDomains();
  for (
    let i = 0;
    emailDomainEntries.listEmailDomains.items.length > i;
    i += 1
  ) {
    if (
      emailDomainEntries.listEmailDomains.items[i].domain.includes(
        TEST_DOMAIN_NAME_PREFIX
      )
    ) {
      await emailDomainAPI.deleteEmailDomain(
        emailDomainEntries.listEmailDomains.items[i].domain
      );
    }
  }
});

test.describe("Setting >> Account Profile >> Corporate email domains UI test.  @C6070 Smoke", () => {
  test("Can add one domain and save it by enter.", async ({
    accountProfile,
    waitForSpinnerLoaded,
  }) => {
    await accountProfile.clickAddEmailIcon();
    await accountProfile.updateEmailDomain("", TEST_DOMAIN_1);
    await accountProfile.page.keyboard.press("Enter");
    await waitForSpinnerLoaded();
    expect(await accountProfile.getDomain(TEST_DOMAIN_1)).toEqual(
      TEST_DOMAIN_1
    );
  });

  test("Can edit domains.", async ({
    accountProfile,
    waitForSpinnerLoaded,
    delay,
  }) => {
    await accountProfile.updateEmailDomain(TEST_DOMAIN_1, TEST_DOMAIN_2);
    await accountProfile.page.keyboard.press("Enter");
    await waitForSpinnerLoaded();
    expect(await accountProfile.getDomain(TEST_DOMAIN_2)).toEqual(
      TEST_DOMAIN_2
    );
  });

  test("Can delete domains by icon", async ({
    accountProfile,
    waitForSpinnerLoaded,
  }) => {
    await accountProfile.clickAddEmailIcon();
    await accountProfile.updateEmailDomain("", TEST_DOMAIN_1);
    await accountProfile.page.keyboard.press("Enter");
    await waitForSpinnerLoaded();
    await accountProfile.clickDeleteEmailTrashIcon(TEST_DOMAIN_2);
    await accountProfile.clickSave();
    await waitForSpinnerLoaded();
    expect(await accountProfile.getDomain(TEST_DOMAIN_2)).toEqual("");
  });

  test("Can delete domains by inputting empty string", async ({
    accountProfile,
    waitForSpinnerLoaded,
  }) => {
    await accountProfile.updateEmailDomain(TEST_DOMAIN_1, "");
    await accountProfile.clickSave();
    await waitForSpinnerLoaded();
    expect(await accountProfile.getDomain(TEST_DOMAIN_1)).toEqual("");
  });

  test("Can just only add five domains.(save config by click save button)", async ({
    accountProfile,
    waitForSpinnerLoaded,
  }) => {
    await accountProfile.addDomainUntilFiveEntries(TEST_DOMAIN_NAME_PREFIX);
    await accountProfile.clickSave();
    await waitForSpinnerLoaded();
    await expect(accountProfile.add).not.toBeVisible();
  });
});
