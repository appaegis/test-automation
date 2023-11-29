const { expect } = require("@playwright/test");
const { DropdownWithSearch, Dropdown, Button, TextField } = require("./common");

exports.Dialog = class Dialog {
  constructor(page) {
    this.context = page.locator("article[role='dialog']");
  }

  textField(fieldName) {
    return new TextField(this.context, fieldName);
  }

  dropdownField(fieldName) {
    return new Dropdown(this.context, fieldName);
  }

  dropdownFieldWithSearch(fieldName) {
    return new DropdownWithSearch(this.context, fieldName);
  }

  button(buttonName) {
    return new Button(this.context, buttonName);
  }

  content(contentLocator) {
    return this.context.locator(contentLocator);
  }
};
