const { expect } = require("@playwright/test");
const { Button } = require("../../src/components/common");
const { DownloadHandler } = require("../library/handler/download");
const { Modal } = require("../../src/components/modal");
const { OldTable } = require("../components/Table");

class NetworkDetail {
  constructor(page) {
    this.page = page;
    this.context = this.page.locator("main", {
      has: this.page.locator("div:has-text(\"Network Detail\")"),
    });

    this.dockerComposeFile1 = this.context.locator("xpath=//div[contains(@class, 'detail_title') and contains(normalize-space(), 'ServiceEdge 1')]//ancestor::div[contains(@class, 'col col--nested-vertical col--se-wrapper')]//td[contains(normalize-space(), 'Download docker-compose file')]//following-sibling::td//div");
    this.dockerComposeFile2 = this.context.locator("xpath=//div[contains(@class, 'detail_title__wrapper') and contains(normalize-space(), 'ServiceEdge 2')]");
    this.cancel = new Button(this.context, "Cancel");
  }
}

exports.ServiceEdge = class ServiceEdge {
  constructor(page) {
    this.page = page;
    this.context = this.page.locator("main", {
      has: this.page.locator("div:has-text(\"Service Edges\")"),
    });

    this.addNetworkButton = new Button(this.context, "Network");
    this.search = this.context.locator("xpath=//input[@name=\"search\"]");
    this.modal = new Modal(this.context, "Add a new network");
    this.networkName = this.modal.textField("Network");
    this.networkDescription = this.modal.textArea("Description");
    this.create = this.modal.button("Create");
    this.oldTable = new OldTable(this.context);

    // Service edge detail page.
    this.networkDetailPage = new NetworkDetail(this.page);
  }

  async goto() {
    await this.page.goto("/network", { timeout: parseInt(process.env.LONG_TIMEOUT) });
    await this.context.waitFor();
  }

  async addServiceEdge(name, description) {
    await this.addNetworkButton.click();
    await this.networkName.fill(name);
    await this.networkDescription.fill(description);
    await this.create.click();
  }

  async inputSearch(searchText) {
    await this.search.click();
    await this.search.fill("");
    await this.search.fill(searchText);
    await this.search.press("Enter");
  }
  async downloadDockerComposeFile(filePath) {
    const download = new DownloadHandler(this.page);
    await this.networkDetailPage.dockerComposeFile1.click();
    await download.waitForDownload();
    await download.saveFileAs(filePath);
  }

  async clickCancel() {
    await this.networkDetailPage.cancel.click();
  }

  async waitForDockerComposeFileReady() {
    await expect(this.networkDetailPage.dockerComposeFile2).toBeVisible();
  }
};
