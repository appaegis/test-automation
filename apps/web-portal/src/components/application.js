const { expect } = require("@playwright/test");

exports.Application = class Application {
  constructor(context, name) {
    this.name = name;
    this.element = context.locator(
      `[data-test="app"]:has-text("${this.name}")`
    );
    this.deleteButton = this.element.locator(":text-is('delete')");
  }

  async launch(page) {
    await this.element.hover();
    await expect(this.deleteButton).toBeVisible();
    await this.element.click();
    let popup = await page.waitForEvent("popup");
    await popup.waitForLoadState();
    await popup.locator("xpath=//*[contains(@class, 'progress')]").waitFor()
    return popup;
  }

  async delete() {
    await this.element.hover();
    await expect(this.deleteButton).toBeVisible();
    await this.deleteButton.click();
  }
};
