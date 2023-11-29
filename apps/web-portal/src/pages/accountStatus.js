const { expect } = require("@playwright/test");
const { Button } = require("../components/common");
const { Modal } = require("../components/modal");

exports.AccountStatus = class AccountStatus {
  constructor(page) {
    this.page = page;
    this.context = page.locator("main", { hasText: "Account Status" });
    this.modal = new Modal(this.page);
    this.changeSubscriptionButton = new Button(
      this.context,
      "Change subscription",
    );
    this.talkToSales = this.modal.button("Talk To Sales");
  }

  async goto() {
    await this.page.goto("/account_status", {timeout: parseInt(process.env.LONG_TIMEOUT)});
    await this.context.waitFor();
  }

  async clickSubscriptionButton() {
    await this.changeSubscriptionButton.click();
  }

  async selectSubscription(subscription) {
    await this.modal.context.locator("[class=simple-drop-down-input]").click();
    await this.modal.context
      .locator("[class*=simple-drop-down-input__menu]")
      .locator(`:has-text('${subscription}')`)
      .click();
  }
};
