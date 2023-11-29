const { Button } = require("../../components/common");
const { expect } = require("@playwright/test");
const { Sidebar } = require("../sidebar");

class AzureConnector {
  constructor(page) {
    this.page = page;
    this.context = page.locator("main", { hasText: "Key Vault" });
    this.azureConnectorTab = this.context.locator("text=Azure Connector");
    this.applicationId = this.context.locator("input[placeholder=\"Application (client) ID\"]");
    this.directoryId = this.context.locator("input[placeholder=\"Directory (tenant) ID\"]");
    this.saveAppInfoButton = new Button(this.context, "Save App Info");
    this.keyVaultUrls = this.context.locator("input[placeholder=\"https://contoso.vault.azure.net\"]");
    this.keyVaultContext = this.context.locator("//div[@class='key-vault-row']/following-sibling::node()");
    this.saveButton = new Button(this.keyVaultContext, "Save");
    this.spinner = this.page.locator("xpath=//*[contains(@class, 'spinner')]");
    this.dialog = this.page.locator(".small_modal");
    this.sidebar = new Sidebar(this.page);
  }

  async goto() {
    await this.page.goto("/keyvault");
    await this.azureConnectorTab.click();
  }

  async inputApplicationId(id) {
    await this.applicationId.click();
    await this.applicationId.fill(id);
  }

  async inputDirectoryId(id) {
    await this.directoryId.click();
    await this.directoryId.fill(id);
  }

  async clickSaveAppInfoButton() {
    await this.saveAppInfoButton.click();
  }

  async inputKeyVaultUrl(url) {
    await this.keyVaultUrls.click();
    await this.keyVaultUrls.fill(url);
  }

  async clickSaveButton() {
    await this.saveButton.click();
  }

  async saveAppInfo(applicationId, directoryId) {
    await this.inputApplicationId(applicationId);
    await this.inputDirectoryId(directoryId);
    await this.clickSaveAppInfoButton();
    await expect(this.spinner).not.toBeVisible();
    await expect(this.page.locator("//*[contains(@class, 'message')]")).toHaveText("Save successfully", { timeout: parseInt(process.env.LONG_TIMEOUT) });
  }

  async saveKeyVaultUrl(keyVaultUrl) {
    await this.inputKeyVaultUrl(keyVaultUrl);
    await this.clickSaveButton();
    await expect(this.spinner).not.toBeVisible();
    await expect(this.page.locator("//*[contains(@class, 'message')]")).toHaveText("Key Vault urls saved", { timeout: parseInt(process.env.LONG_TIMEOUT) });
  }
}

module.exports = { AzureConnector };
