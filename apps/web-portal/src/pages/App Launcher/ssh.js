const { expect } = require("@playwright/test");
const { Drawer } = require("../../components/drawer");
const { Application } = require("../../components/application");
const { Button } = require("../../components/common");
const { Modal } = require("../../components/modal");
const { Dialog } = require("../../components/dialog");

exports.Ssh = class Ssh {
  constructor(page) {
    this.page = page;
    this.context = page.locator(
      "//main[contains(normalize-space(),'SSH Applications') or contains(normalize-space(),'Welcome to Mammoth Cyber!')]"
    );
    this.drawer = new Drawer(this.context);
    this.button = new Button(this.context);
    this.dialog = new Dialog(page);
    this.modal = new Modal(page);
    this.appName = this.drawer.textField("App Name");
    this.appType = this.drawer.dropdownFieldWithSearch("App Type");
    this.protocol = this.drawer.dropdownFieldWithSearch("Protocol");
    this.policy = this.drawer.dropdownFieldWithSearch("Policy");
    this.appCategory = this.drawer.textField("App Category");
    this.allowedHostOrSubnet = this.drawer.textField("Allowed Host or Subnet");
    this.save = this.drawer.button("Save");
    this.addApp = new Button(this.context, "Add App");
    this.search = this.context.locator('xpath=//input[@name="search"]');
    this.network = this.drawer.dropdownFieldWithSearch("Network");
    this.advancedSettings = this.drawer.checkBox("Advanced Settings");
    this.userAuthentication = this.drawer.dropdownFieldWithSearch(
      "User Authentication"
    );
    this.sshCertificateAuthority = this.drawer.dropdownFieldWithSearch(
      "SSH Certificate Authority"
    );
    this.connect = this.modal.button("Connect");
    this.portNumber = this.drawer.textField("Port Number");
    this.useAuthentication = this.drawer.dropdownFieldWithSearch(
      "User Authentication"
    );
    this.SSHCertificateAuthority = this.drawer.dropdownFieldWithSearch(
      "SSH Certificate Authority"
    );
    this.userName = this.drawer.textField("User Name");
    this.addSuccess = this.page.locator("div[class]", {
      hasText: "Successfully added the application!",
    });
  }

  async goto() {
    await this.page.goto("/ssh_connection", {
      timeout: parseInt(process.env.LONG_TIMEOUT),
    });
    await this.context.waitFor();
  }

  async inputSearch(searchText) {
    await this.search.click();
    await this.search.fill("");
    await this.search.fill(searchText);
    await this.search.press("Enter");
  }

  async inputUserName(userName) {
    await this.userName.fill(userName);
  }

  async selectAppType(appType) {
    await this.appType.open();
    await this.appType.select(appType);
  }

  async inputAppName(appName) {
    await this.appName.fill(appName);
  }

  async inputTargetURL(targetURL) {
    await this.targetURL.fill(targetURL);
  }

  async selectProtocol(protocol) {
    await this.protocol.open();
    await this.protocol.select(protocol);
    try {
      await Promise.all([
        this.page.waitForResponse(
          (resp) => resp.url().includes("/graphql") && resp.status() === 200,
          { timeout: parseInt(process.env.SHORT_TIMEOUT) }
        ),
      ]);
    } catch (e) {
      if (String(e).includes("TimeoutError")) {
        console.log(String(e).includes("TimeoutError"));
      } else {
        throw e;
      }
    }
  }

  async selectUserAuthentication(method) {
    await this.useAuthentication.open();
    await this.useAuthentication.select(method);
  }

  async selectSshCertificateAuthority(CA) {
    await this.SSHCertificateAuthority.open();
    await this.SSHCertificateAuthority.select(CA);
  }

  async selectPolicy(policy) {
    await this.policy.open();
    await this.policy.select(policy);
  }

  async clickSave() {
    await this.save.click({ force: true });
    await expect(this.save.context).not.toBeVisible({ timeout: 10000 });
    await expect(this.addSuccess).toBeVisible({ timeout: 10000 });
    await expect(this.addSuccess).not.toBeVisible({ timeout: 10000 });
  }

  async clickAddApp() {
    await this.addApp.click();
  }

  async clickConnectButton() {
    await this.connect.click();
  }

  async inputPortNumber(port) {
    await this.portNumber.fill(port);
  }

  async checkAndSelectAdvancedSettings(sshProfile) {
    await this.advancedSettings.checkAndSelectOption(sshProfile);
  }

  async inputUserName(userName) {
    await this.userName.fill(userName);
  }

  async inputAllowedHostOrSubnet(AllowedHostOrSubnet) {
    await this.allowedHostOrSubnet.fill(AllowedHostOrSubnet);
  }

  async configAppType(networkType, serviceEdge) {
    await this.selectAppType(networkType);
    if (serviceEdge) {
      await this.network.open();
      await this.network.select(serviceEdge);
    }
  }

  async checkSshAppExist(appName) {
    await expect(new Application(this.context, appName).element).toBeVisible({
      timeout: 20000,
    });
  }

  async deleteApp(appName) {
    const app = new Application(this.context, appName);
    await app.delete();
    await new Modal(this.page).button("Delete").click();
    await expect(app.element).not.toBeVisible();
  }

  async createCAApplication(inputArg) {
    const defaultArg = {
      appName: undefined,
      appType: "Cloud Services",
      policy: "Default",
      sshCertificateAuthority: undefined,
      publicIpAddress: undefined,
      userName: "ubuntu",
    };
    const arg = { ...defaultArg, ...inputArg };
    await this.clickAddApp();
    await this.selectProtocol("ssh");
    await this.configAppType(arg.appType);
    await this.selectPolicy(arg.policy);
    await this.selectUserAuthentication("SSH Certificate");
    await this.selectSshCertificateAuthority(arg.sshCertificateAuthority);
    await this.inputAllowedHostOrSubnet(arg.publicIpAddress);
    await this.inputUserName(arg.userName);
    await this.inputAppName(arg.appName);
    await this.clickSave();
    await this.inputSearch(arg.appName);
    await this.checkSshAppExist(arg.appName);
  }

  async launchSshApp(appName) {
    await expect(
      this.context.locator(`[data-test="app"]:has-text("${appName}")`)
    ).toBeVisible({ timeout: 2000 });
    await this.context
      .locator(`[data-test="app"]:has-text("${appName}")`)
      .click();
    await this.clickConnectButton(appName);
    const sshAppTab = await this.page.waitForEvent("popup");
    await sshAppTab.waitForLoadState();
    return sshAppTab;
  }
};
