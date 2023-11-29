const { expect } = require("@playwright/test");
const {
  DropdownWithSearch,
  Dropdown,
  Button,
  TextField,
  RadioButton,
  TextArea,
  Checkbox,
} = require("./common");

exports.Drawer = class Drawer {
  constructor(context) {
      this.context = context.locator("xpath=//aside[contains(@class, 'open')]");
  }

  textField(fieldName) {
    return new TextField(this.context, fieldName);
  }

  textArea(fieldName) {
    return new TextArea(this.context, fieldName);
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

  radioButton(radioName) {
    return new RadioButton(this.context, radioName);
  }

  checkBox(checkboxName) {
    return new Checkbox(this.context, checkboxName);
  }
};
