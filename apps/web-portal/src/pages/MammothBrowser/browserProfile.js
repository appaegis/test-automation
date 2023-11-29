const { expect } = require("@playwright/test");
const { Button } = require("../../components/common");
const { Drawer } = require("../../components/drawer");
const { Dialog } = require("../../components/dialog");
const { Sidebar } = require("../sidebar");
const { Table } = require("../../components/table");

exports.BrowserProfile = class BrowserProfile {
  constructor(page) {
    this.page = page;
    this.context = page.locator("main", {
      has: page.locator("article:has-text(\"Browser Profile\")"),
    });

    // Page part.
    this.addProfileButton = new Button(this.context, "Add");

    // Sidebar.
    this.sidebar = new Sidebar(this.page);

    // Unity profile drawer.
    this.drawer = new Drawer(this.context);
    this.name = this.drawer.textField("Name");
    this.teamsOrUsers = this.drawer.dropdownFieldWithSearch("Groups/Users");
    this.assignUnityBrowserExtensions = this.drawer.dropdownFieldWithSearch(
      "Assign Unity Browser Extensions",
    );
    this.download = this.drawer.checkBox("Download");
    this.upload = this.drawer.checkBox("Upload");
    this.print = this.drawer.checkBox("Print");
    this.copy = this.drawer.checkBox("Copy");
    this.paste = this.drawer.checkBox("Paste");
    this.save = this.drawer.button("Save");
    this.cancel = this.drawer.button("Cancel");
    this.delete = this.drawer.button("Delete");

    // Dialog part.
    this.dialog = new Dialog(page);
    this.dialogSave = this.dialog.button("Save");
    this.dialogCancel = this.dialog.button("Cancel");
    this.dialogDelete = this.dialog.button("Delete");

    this.table = new Table(page);
  }

  async goto() {
    await this.page.goto("/browser/profiles", {
      timeout: parseInt(process.env.LONG_TIMEOUT),
    });
    await this.context.waitFor();
  }

  async clickAddUnityProfileButton() {
    await this.addProfileButton.click();
  }

  async clickDrawerDeleteButton() {
    await this.delete.click();
  }

  async inputProfileName(profileName) {
    await this.name.fill(profileName);
  }

  async selectTeamsUsers(teamsOrUsers) {
    await this.teamsOrUsers.open();
    for (const element of teamsOrUsers) await this.teamsOrUsers.select(element);
    await this.teamsOrUsers.close();
  }

  async checkAllPolicy() {
    await this.download.check();
    await this.upload.check();
    await this.print.check();
    await this.copy.check();
    await this.paste.check();
  }

  async uncheckAllPolicy() {
    await this.download.uncheck();
    await this.upload.uncheck();
    await this.print.uncheck();
    await this.copy.uncheck();
    await this.paste.uncheck();
  }

  async toBecheckedAllPolicy() {
    await expect(this.download.checkBoxElement).toBeChecked();
    await expect(this.upload.checkBoxElement).toBeChecked();
    await expect(this.print.checkBoxElement).toBeChecked();
    await expect(this.copy.checkBoxElement).toBeChecked();
    await expect(this.paste.checkBoxElement).toBeChecked();
  }

  async toBeUncheckedAllPolicy() {
    await expect(this.download.checkBoxElement).not.toBeChecked();
    await expect(this.upload.checkBoxElement).not.toBeChecked();
    await expect(this.print.checkBoxElement).not.toBeChecked();
    await expect(this.copy.checkBoxElement).not.toBeChecked();
    await expect(this.paste.checkBoxElement).not.toBeChecked();
  }

  async clickDrawerSaveButton() {
    await this.save.click();
  }

  async clickDrawerCancelButton() {
    await this.cancel.click();
  }

  async clickDialogSaveButton() {
    await this.dialogSave.click();
  }

  async clickDialogDeleteButton() {
    await this.dialogDelete.click();
  }

  getKeyTableRow(profileName) {
    return this.context.locator(`tr:has-text("${profileName}")`);
  }

  getDefaultRow() {
    return this.context.locator("h3:has-text(\"Default Profile\")");
  }

  getDeleteButton() {
    return this.delete.element;
  }

  async getRowTextWithDraggable(row, header, offSet = 1) {
    const eleText = await row.element
      .locator(`td:nth-child(${row.headers.indexOf(header) + offSet})`)
      .textContent();
    return eleText.replace(/drag_indicator/, "").trim();
  }
};
