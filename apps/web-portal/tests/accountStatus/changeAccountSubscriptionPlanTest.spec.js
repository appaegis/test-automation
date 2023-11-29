const { test, expect } = require("../../src/fixtures/commonSetup");
const { AccountStatus } = require("../../src/pages/accountStatus");

let accountStatus;
const PRICE_URL = `${process.env.MMC_WEBSITE}/pricing.html`;

test.beforeEach(async ({ page }) => {
  accountStatus = new AccountStatus(page);
  await accountStatus.goto();
  expect(
    await accountStatus.context.locator("a:has-text('View our price plan')")
  ).toHaveAttribute("href", PRICE_URL);
  await accountStatus.clickSubscriptionButton();
});

test.describe("Account status subscriptions @C5524", () => {
  test("Professional", async () => {
    await accountStatus.selectSubscription("Professional");
    expect(await accountStatus.talkToSales.element).toBeVisible();
    expect(
      await accountStatus.modal.context.locator(
        "span[class*='simple-drop-down']"
      )
    ).toHaveText("Professional");
    expect(
      await accountStatus.modal.context.locator(
        "p:has-text('You can have up to 5000 users to invite!')"
      )
    ).toBeVisible();
  });
  test("Team", async () => {
    await accountStatus.selectSubscription("Team");
    expect(await accountStatus.talkToSales.element).toBeVisible();
    expect(
      await accountStatus.modal.context.locator(
        "span[class*='simple-drop-down']"
      )
    ).toHaveText("Team");
    expect(
      await accountStatus.modal.context.locator(
        "p:has-text('You can have up to 100 users to invite!')"
      )
    ).toBeVisible();
  });

  test("Basic", async () => {
    await accountStatus.selectSubscription("Basic");
    expect(await accountStatus.talkToSales.element).not.toBeVisible();
    expect(
      await accountStatus.modal.context
        .locator("[class*=user-quota-selector--control-panel]")
        .locator("span[class*='simple-drop-down']")
    ).toHaveText("1");
    expect(
      await accountStatus.modal.context
        .locator("p")
        .filter({ hasText: /USD \d* per year/ })
    );
  });
});
