const { expect } = require("@playwright/test");
exports.DropdownWithSearch = class DropdownWithSearch {
  constructor(context, name) {
    this.context = context;
    this.name = name;
    this.element = this.context.locator(`:text-is("${this.name}") + div >> ul`);
  }

  async select(option) {
    await this.element
      .locator(`li:has-text("${option}")`)
      .click({ timeout: parseInt(process.env.NORMAL_TIMEOUT) });
  }

  async open(workAround = "") {
    if (!workAround) {
      await this.context
        .locator(`:text-is("${this.name}") + div`)
        .click({ timeout: parseInt(process.env.NORMAL_TIMEOUT) });
    } else {
      await workAround.click();
    }
  }

  async close(workAround = "") {
    //FIXME remove work around until https://mammothcyber.atlassian.net/browse/AC-4531 is fixed
    if (!workAround) {
      await this.context
        .locator(`:text-is("${this.name}") + div`)
        .click({ timeout: parseInt(process.env.NORMAL_TIMEOUT) });
    } else {
      await workAround.click();
    }
  }
};

exports.Dropdown = class Dropdown {
  constructor(context, name) {
    this.context = context;
    this.name = name;
    this.elementOption = this.context.locator(
      `:text-is("${this.name}") + div >> select`
    );
  }
  async selectOption(option) {
    await this.elementOption.selectOption(option);
  }
  async selectText(text) {
    await this.elementOption.selectText(text);
  }
};

exports.Button = class Button {
  constructor(context, buttonName) {
    this.context = context;
    this.element = this.context.locator("button", { hasText: buttonName });
  }
  async click(option = {}) {
    await this.element.click(option);
  }
};

exports.Checkbox = class Checkbox {
  constructor(context, checkboxName) {
    this.context = context;
    this.name = checkboxName;
    this.checkBoxElement = this.context.locator(
      `xpath=//div[normalize-space()='${checkboxName}']`
    );
    this.selectElement = this.checkBoxElement.locator(
      `xpath=//following-sibling::div//select`
    );
  }
  async check(option = {}) {
    await this.checkBoxElement.check(option);
  }
  async uncheck(option = {}) {
    await this.checkBoxElement.uncheck(option);
  }
  async checkAndSelectOption(selectName) {
    await expect(
      this.checkBoxElement.locator(
        `xpath=//following-sibling::div//option[normalize-space()='${selectName}']`
      )
    ).toContainText(`${selectName}`);
    await this.checkBoxElement.locator(`xpath=//label`).click();
    await expect(this.checkBoxElement.locator(`xpath=//label`)).toBeChecked({
      timeout: 2000,
    });
    await expect(this.selectElement.first()).toBeEnabled({ timeout: 2000 });
    await this.selectElement.first().click({ force: true });
    await expect(
      this.checkBoxElement.locator(
        `xpath=//following-sibling::div//li[normalize-space()='${selectName}']`
      )
    ).toBeVisible();
    await this.checkBoxElement
      .locator(
        `xpath=//following-sibling::div//li[normalize-space()='${selectName}']`
      )
      .click();
  }
};

exports.TextField = class TextField {
  constructor(context, name) {
    this.context = context;
    this.name = name;
    this.element = this.context.locator(
      `:text-is("${this.name}") + div >> input:not([disabled])`
    );
  }

  async fill(text, option = {}) {
    await this.element.fill(text, option);
  }
};

exports.TextArea = class TextArea {
  constructor(context, name) {
    this.context = context;
    this.name = name;
    this.element = this.context.locator(
      `:text-is("${this.name}") + div >> textarea:not([disabled])`
    );
  }

  async fill(text, option = {}) {
    await this.element.fill(text, option);
  }
};

exports.RadioButton = class RadioButton {
  constructor(context, name) {
    this.context = context;
    this.name = name;
    this.element = this.context.locator(
      `xpath=//label[normalize-space()='${this.name}' and @value]`
    );
  }
  async check() {
    await this.element.check();
  }

  async checkAndFill(text) {
    await this.element.check();
    await expect(this.element).toBeChecked({
      timeout: parseInt(process.env.SHORT_TIMEOUT),
    });
    await this.element
      .locator(`xpath=//following-sibling::*//input[@class]`)
      .fill(text);
  }

  async checkAndSelectOption(option) {
    await this.element.check();
    await expect(this.element).toBeChecked({
      timeout: parseInt(process.env.SHORT_TIMEOUT),
    });
    //Because of intercepts pointer events https://github.com/microsoft/playwright/issues/12298#issuecomment-1051261068, so add {force: true}
    await this.element
      .locator(`xpath=//following-sibling::div//select`)
      .first()
      .click({ force: true });
    await this.element
      .locator(
        `xpath=//following-sibling::div//li[normalize-space()='${option}']`
      )
      .click();
  }
};
