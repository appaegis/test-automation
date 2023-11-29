const { Button, TextField } = require("../../components/common");
const { Drawer } = require("../../components/drawer");
const { Modal } = require("../../components/modal");
const { Application } = require("../../components/application");

exports.RDP = class RDP {
  constructor(page) {
    this.page = page;
    this.context = this.page.locator(
      "//main[contains(normalize-space(),'RDP Connections') or contains(normalize-space(),'Welcome to Mammoth Cyber!')]"
    );
    this.addAppButton = new Button(this.context, "Add App");
    this.drawer = new Drawer(this.context);
    this.appName = this.drawer.textField("App Name");
    this.appType = this.drawer.dropdownFieldWithSearch("App Type");
    this.protocol = this.drawer.dropdownFieldWithSearch("Protocol");
    this.policy = this.drawer.dropdownFieldWithSearch("Policy");
    this.allowedHostOrSubnet = this.drawer.textField("Allowed Host or Subnet");
    this.search = this.context.locator(
      "input[placeholder='Search by app name']"
    );
    this.saveButton = this.drawer.button("Save");
    this.userName = this.modalTextField("User Name");
    this.password = this.modalTextField("Password");
    this.modal = new Modal(this.page);
    this.connectButton = this.modal.button("Connect");
  }

  modalTextField(fieldName) {
    return this.page.locator(
      `//*[contains(@class, 'view_app_modal')]//*[normalize-space()='${fieldName}' and not(@class)]//following-sibling::div//input`
    );
  }

  async goto() {
    await this.page.goto("/rdp_connection");
    await this.context.waitFor();
  }

  async clickConnectButton() {
    await this.connectButton.click();
  }

  async inputUserName(userName) {
    await this.userName.fill(userName);
  }

  async inputPassword(password) {
    await this.password.fill(password);
  }

  async inputSearch(searchText) {
    await this.search.fill(searchText);
    await this.search.press("Enter");
  }

  async selectAppType(appType) {
    await this.appType.open();
    await this.appType.select(appType);
  }

  async inputAppName(appName) {
    await this.appName.element.click();
    await this.appName.fill(appName);
  }

  async inputAllowedHostOrSubnet(hostOrSubnet) {
    await this.allowedHostOrSubnet.fill(hostOrSubnet);
  }

  async selectProtocol(protocol) {
    await this.protocol.open();
    await this.protocol.select(protocol);
  }

  async selectPolicy(policy) {
    await this.policy.open();
    await this.policy.select(policy);
  }

  async clickSave() {
    await this.saveButton.click({ force: true });
  }

  async clickAddApp() {
    await this.addAppButton.click();
  }

  async createRDPApplication(appName, appType, policy, hostOrSubnet) {
    await this.clickAddApp();
    await this.inputAppName(appName);
    await this.selectAppType(appType);
    await this.selectProtocol("rdp");
    await this.selectPolicy(policy);
    await this.inputAllowedHostOrSubnet(hostOrSubnet);
    await this.clickSave();
    await this.drawer.context.waitFor({
      state: "hidden",
      timeout: parseInt(process.env.LONG_TIMEOUT),
    });
    await this.page
      .locator(
        "xpath=//*[normalize-space()='Successfully added the application!' and not(@class) ]"
      )
      .waitFor({
        state: "hidden",
        timeout: parseInt(process.env.LONG_TIMEOUT),
      });
  }

  async launchRDPApp(appName, userName, password) {
    await this.context
      .locator(`[data-test="app"]:has-text("${appName}")`)
      .waitFor({ timeout: parseInt(process.env.SHORT_TIMEOUT) });
    await this.context
      .locator(`[data-test="app"]:has-text("${appName}")`)
      .click();
    await this.inputUserName(userName);
    await this.inputPassword(password);
    await this.clickConnectButton();
    const rdpAppTab = await this.page.waitForEvent("popup");
    await rdpAppTab.waitForLoadState();
    await rdpAppTab
      .locator(
        "//*[contains(normalize-space(),'Waiting for response') and not(child::*)]"
      )
      .waitFor({
        state: "detached",
        timeout: parseInt(process.env.LONG_TIMEOUT),
      });
    return rdpAppTab;
  }

  async deleteApp(appName) {
    const app = new Application(this.context, appName);
    await app.delete();
    await new Modal(this.page).button("Delete").click();
    await app.element.waitFor({
      state: "detached",
      timeout: parseInt(process.env.SHORT_TIMEOUT),
    });
  }

  async uploadFile(file) {
    await this.page.locator("xpath=//input[@type='file']").setInputFiles(file);
  }
  async downloadFile(file) {
    await this.page
      .locator("xpath=//button[normalize-space()='Download']")
      .click();
    await this.page
      .locator(
        "xpath=//*[contains(@class, 'item-label') and .//@alt='for-collaspe-open']"
      )
      .click();
    await this.page
      .locator(
        `xpath=//*[contains(@class, 'item-label') and normalize-space()='${file}']`
      )
      .click();
    await this.page
      .locator("xpath=//button[normalize-space()='Confirm']")
      .click();
  }
};
