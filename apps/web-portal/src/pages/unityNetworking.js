const { expect } = require("@playwright/test");
const { Button } = require("../components/common");
const { Drawer } = require("../components/drawer");
const { Dialog } = require("../components/dialog");
const { Table } = require("../../src/components/table");

exports.UnityNetworking = class UnityNetworking {
  constructor(page) {
    this.page = page;
    this.context = page.locator("main", { hasText: "Browser Networking" });
    this.drawer = new Drawer(this.context);
    this.addButton = new Button(
      this.context.locator("[class*='actions']"),
      "Add"
    );
    this.search = this.context.locator('input[placeholder="Search"]');
    this.name = this.drawer.textField("Name");
    this.hostName = this.drawer.textField("Hostname");
    this.detection = this.drawer.dropdownField("Detection");
    this.forwardingAction = this.drawer.dropdownField("Forwarding Action");
    this.saveButton = this.drawer.button("Save");
    this.addExceptionButton = this.drawer.button("Add");
    this.dialog = new Dialog(page);
    this.override = this.dialog.dropdownField("Override");
    this.exceptionForwardingAction =
      this.dialog.dropdownField("Forwarding Action");
    this.exceptionSave = this.dialog.button("Save");
    this.deleteButton = new Button(this.page, "Delete");
    this.table = new Table(
      this.context.locator(
        'xpath=//div[contains(@class, "table") and .//table and not(ancestor::aside)]'
      )
    );
    this.addDrawerTable = new Table(
      this.context.locator(
        'xpath=//aside[ .//*[contains(normalize-space(),"Add Forwarding Policy")]]'
      )
    );
    this.editDrawerTable = new Table(
      this.context.locator(
        'xpath=//aside[ .//*[contains(normalize-space(),"Edit Forwarding Policy")]]'
      )
    );
  }

  async goto() {
    await this.page.goto("/browser/networking", {timeout: parseInt(process.env.LONG_TIMEOUT)});
    await this.context.waitFor();
  }

  async inputSearch(searchText) {
    await this.search.click();
    await this.search.fill(searchText);
    await this.search.press("Enter");
  }

  async clickSaveButton() {
    await this.saveButton.click();
  }

  async clickAddButton() {
    await this.addButton.click();
    await expect
      .poll(() => {
        return this.page.locator("xpath=//*[contains(@id, 'popper')]").count();
      })
      .toBe(0);
  }

  async clickDeleteButton() {
    await this.deleteButton.click({ force: true });
  }

  async inputName(name) {
    await this.name.fill(name);
  }

  async selectDetection(detection) {
    await this.detection.selectOption(detection);
  }

  async inputHostName(hostName) {
    await this.hostName.fill(hostName);
  }

  async selectForwardingAction(forwardingAction) {
    await this.forwardingAction.selectOption(forwardingAction);
  }

  async clickAddExceptionButton() {
    await this.addExceptionButton.click();
  }

  async selectOverride(override) {
    await this.override.selectOption(override);
  }

  async selectExceptionAction(ExceptionAction) {
    await this.exceptionForwardingAction.selectOption(ExceptionAction);
  }

  async clickExpectionSaveButton() {
    await this.exceptionSave.click();
  }

  getTableRow(name) {
    return this.context.locator(`tr:has-text("${name}")`);
  }

  getExceptionTableRow(name) {
    return this.drawer.context.locator(`tr:has-text("${name}")`);
  }

  async createForwardingPolicy(
    name,
    IP,
    detection = "dns",
    forwadAction = "direct",
    override = undefined,
    exceptionForwardingAction = undefined
  ) {
    await this.clickAddButton();
    await this.inputName(name);
    await this.inputHostName(IP);
    await this.selectDetection(detection);
    await this.selectForwardingAction(forwadAction);
    if (override || exceptionForwardingAction) {
      await this.createException(override, exceptionForwardingAction);
    }
    await this.clickSaveButton();
    await this.waitForPageLoading();
  }

  async deleteForwardingPolicy(name) {
    const row = await this.table.getRow(name);
    await row.selectSettingOption("Delete");
    await this.clickDeleteButton();
    await this.waitForPageLoading();
  }

  async waitForPageLoading() {
    await expect(this.drawer.context).not.toBeVisible({
      timeout: parseInt(process.env.LONG_TIMEOUT),
    });
    await expect(
      this.page.locator("xpath=//*[contains(@class, 'spinner')]")
    ).not.toBeVisible({ timeout: 15000 });
  }

  async createException(override = "internet", forwadAction = "direct") {
    await this.clickAddExceptionButton();
    await this.selectOverride(override);
    await this.selectExceptionAction(forwadAction);
    await this.clickExpectionSaveButton();
  }
};