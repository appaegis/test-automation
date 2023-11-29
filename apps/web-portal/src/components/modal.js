const { expect } = require("@playwright/test");
const { DropdownWithSearch, Button, TextField, TextArea } = require("./common");

exports.Modal = class Modal {
  constructor(context) {
    this.context = context.locator("[class*=view_app_modal]");
  }

  checkBoxField(fieldName) {
    return this.context.locator(
      `xpath=(//label[contains(normalize-space(), '${fieldName}')])`
    );
  }

  textField(fieldName) {
    return new TextField(this.context, fieldName);
  }

  textArea(fieldName) {
    return new TextArea(this.context, fieldName);
  }

  dropdownFieldWithSearch(fieldName) {
    return new DropdownWithSearch(this.context, fieldName);
  }

  button(buttonName) {
    return new Button(this.context, buttonName);
  }
};
