const { expect } = require("@playwright/test");
const { DropdownWithSearch, Dropdown, Button, TextField } = require("./common");
const WIDGET_LOADING_TIME = 15000;

exports.AnalyticsSection = class AnalyticsSection {
  constructor(context, name = undefined) {
    this.context = name
      ? context.locator(
          `xpath=//*[contains(@class, 'section') and .//h6[normalize-space()='${name}']]`
        )
      : context.locator(
          "xpath=//*[contains(@class, 'section') and not(.//h6)]"
        );
  }
  async waitForLoading() {
    await expect
      .poll(
        async () => {
          return await this.context
            .locator("xpath=//*[contains(@class, 'spinner')]")
            .count();
        },
        {
          message: "make sure widget is loaded",
          timeout: WIDGET_LOADING_TIME,
        }
      )
      .toEqual(0);
  }
  async getCount(fieldName) {
    await this.waitForLoading();
    return await this.context
      .locator(
        `xpath=//*[contains(@class, 'card') and .//*[contains(normalize-space(), '${fieldName}')]]//button`
      )
      .innerText();
  }
};
