const { expect } = require("@playwright/test");
const { Button } = require("../components/common");
const { Drawer } = require("../components/drawer");
const { Dialog } = require("../components/dialog");

exports.SshKeys = class SshKeys {
  constructor(page) {
    this.page = page;
    this.context = page.locator("main", {
      has: page.locator("article:has-text(\"SSH Keys\")"),
    });

    // Page part.
    this.SshKeysTab = page.locator("a[role=\"tab\"]:has-text(\"SSH Keys\")");
    this.generateKeyButton = new Button(this.context, "Generate Key");

    // Drawer part.
    this.drawer = new Drawer(this.context);
    this.drawerName = this.drawer.textField("Name");
    this.drawerAlgorithm = this.drawer.dropdownField("Algorithm");
    this.drawerDescription = this.drawer.textArea("Description");
    this.generate = this.drawer.button("Generate");
    this.drawerCancel = this.drawer.button("Cancel");
    this.drawerDelete = this.drawer.button("Delete");
    this.regenerateKeyButton = this.drawer.button("Regenerate Key");
    this.drawerSave = this.drawer.button("Save");

    // Dialog part.
    this.dialog = new Dialog(page);
    this.dialogAlgorithm = this.dialog.dropdownField("Algorithm");
    this.dialogSave = this.dialog.button("Save");
    this.dialogCancel = this.dialog.button("Cancel");
    this.dialogDelete = this.dialog.button("Delete");
  }

  async goto() {
    await this.page.goto("/ssh/profile/keys", { timeout: parseInt(process.env.LONG_TIMEOUT), waitUntil: "domcontentloaded" });
    await this.context.waitFor();
  }

  async clickSshKeysTab() {
    await this.SshKeysTab.click({});
  }

  async clickGenerateKeyButton() {
    await this.generateKeyButton.click();
  }

  async clickGenerateButton() {
    await this.generate.click();
  }

  async clickDrawerCancelButton() {
    await this.drawerCancel.click();
  }

  async clickDrawerDeleteButton() {
    await this.drawerDelete.click();
  }

  async clickDialogDeleteButton() {
    await this.dialogDelete.click();
  }

  async generateKey(name, algorithm, describe) {
    await this.clickGenerateKeyButton();
    await this.drawerName.fill(name);
    await this.drawerAlgorithm.selectOption(algorithm);
    await this.drawerDescription.fill(describe);
    await this.clickGenerateButton();
  }

  async regenerateKey(keyName, algorithm) {
    const row = await this.getKeyTableRow(keyName);
    await row.locator(`a:has-text("${keyName}")`).click();
    await this.regenerateKeyButton.click();
    await this.dialogAlgorithm.selectText(algorithm);
    await this.dialogSave.click();
    await this.drawerSave.click();
  }

  async copyPublickey(keyName) {
    const row = await this.getKeyTableRow(keyName);
    await row.locator(`a:has-text("${keyName}")`).click();
    const publickey = await this.getPublicKey().textContent();
    await this.drawerCancel.click();
    return publickey;
  }

  async deleteSshKeys(keyName) {
    const row = await this.getKeyTableRow(keyName);
    await row.locator(`a:has-text("${keyName}")`).click();
    await this.clickDrawerDeleteButton();
    await this.clickDialogDeleteButton();
    await expect(row).not.toBeVisible({ timeout: parseInt(process.env.NORMAL_TIMEOUT) });
  }

  getKeyTableRow(keyName) {
    return this.context.locator(`tr:has-text("${keyName}")`);
  }

  getPublicKey() {
    return this.context.locator("span[class*=\"key\"]");
  }
};
