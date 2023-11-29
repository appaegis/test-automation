const { expect } = require("@playwright/test");
const { Button } = require("../components/common");
const { Table } = require("../components/table")
const { Drawer } = require("../components/drawer");

exports.LogForwarding = class LogForwarding {
  constructor(page) {
    this.page = page;
    this.context = page.locator("main", { hasText: "Log Forwarding" });
    this.drawer = new Drawer(this.context);
    this.service = this.drawer.dropdownField("Service");
    this.networkType = this.drawer.dropdownField("Network Type");
    this.name = this.drawer.textField("Name");
    this.tag = this.drawer.textField("Tag");
    this.server = this.drawer.textField("Server");
    this.port = this.drawer.textField("Port");
    this.input = this.drawer.textField("Name");
    this.save = this.drawer.button("Save");
    this.configLogForwardingButton = new Button(
      this.context,
      "Config Log Forwarding"
    );
    this.table = new Table(this.context)
  }

  async goto() {
    await this.page.goto("/logforwarding", {timeout: parseInt(process.env.LONG_TIMEOUT)});
    await this.context.waitFor();
  }

  async selectService(service) {
    await expect(this.drawer.context).toBeVisible();
    await this.service.selectOption(service);
  }

  async inputName(name) {
    await this.input.fill(name);
  }

  async inputTag(tag) {
    await this.tag.fill(tag);
  }

  async selectNetworkType(networkType) {
    await this.networkType.selectOption(networkType);
  }

  async inputServer(server) {
    await this.server.fill(server);
  }

  async inputPort(port) {
    await this.port.fill(port);
  }

  async clickSave() {
    await this.save.click({ force: true });
  }

  async clickConfigLogForwardingButton() {
    await this.configLogForwardingButton.click();
  }

  getTableRow(name) {
    return this.context.locator(`tr:has-text("${name}")`);
  }

  async getTableHeader() {
    return await this.context.locator(`[data-test="table-column-name"]`).allTextContents();
  }

  getTableDetailData(name) {
    return this.context.locator('[class*="informations"]', { hasText: name });
  }

  async configLogForwarding(name, service, networkType, server, port) {
    await this.clickConfigLogForwardingButton();
    await this.selectService(service);
    await this.inputName(name);
    await this.selectNetworkType(networkType);
    await this.inputServer(server);
    await this.inputPort(port);
    await this.clickSave();
  }
};
