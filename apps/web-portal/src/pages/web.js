const { expect } = require("@playwright/test");
const { Drawer } = require("../components/drawer");
const { Application } = require("../components/application");
const { Button } = require("../components/common");
const { Modal } = require("../components/modal");

exports.Web = class Web {
  constructor(page) {
    this.page = page;
    this.context = page.locator(
      "//main[contains(normalize-space(),'Web Applications') or contains(normalize-space(),'Welcome to Mammoth Cyber!')]"
    );
    this.drawer = new Drawer(this.context);
    this.button = new Button(this.context);
    this.appName = this.drawer.textField("App Name");
    this.appType = this.drawer.dropdownFieldWithSearch("App Type");
    this.protocol = this.drawer.dropdownFieldWithSearch("Protocol");
    this.policy = this.drawer.dropdownFieldWithSearch("Policy");
    this.appCategory = this.drawer.textField("App Category");
    this.targetURL = this.drawer.textField("Target URL");
    this.save = this.drawer.button("Save");
    this.addApp = new Button(this.context, "Add App");
    this.search = this.context.locator(
      "input[placeholder='Search by app name']"
    );
  }

  async goto() {
    await this.page.goto("/launcher", {
      timeout: parseInt(process.env.LONG_TIMEOUT),
    });
    await this.context.waitFor();
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

  async inputTargetURL(targetURL) {
    await this.targetURL.fill(targetURL);
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
    await this.save.click({ force: true });
  }

  async clickAddApp() {
    await this.addApp.click();
  }

  async createWebApplication(appName, appType, protocol, policy, url) {
    await this.clickAddApp();
    await this.inputAppName(appName);
    await this.selectAppType(appType);
    await this.selectProtocol(protocol);
    await this.selectPolicy(policy);
    await this.inputTargetURL(url);
    await this.clickSave();
    await expect(this.drawer.context).not.toBeVisible({
      timeout: parseInt(process.env.LONG_TIMEOUT),
    });
    await expect(
      this.page.locator(
        "xpath=//*[normalize-space()='Successfully added the application!' and not(@class) ]"
      )
    ).not.toBeVisible({ timeout: 15000 });
  }

  launchApp(page, appName) {
    return new Application(this.context, appName).launch(page);
  }

  async deleteApp(appName) {
    const app = new Application(this.context, appName);
    await app.delete();
    await new Modal(this.page).button("Delete").click();
    await expect(app.element).not.toBeVisible();
  }
};
