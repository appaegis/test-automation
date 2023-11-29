/* eslint-disable spellcheck/spell-checker */
const { Dialog } = require("../../components/dialog");
const { Drawer } = require("../../components/drawer");
const { Table } = require("../../components/table");
const { DownloadHandler } = require("../../library/handler/download");

/**
 * For now, we only support the Microsoft Intune as our MDM provider.
 */
exports.MDMConnector = class MDMConnector {
  constructor(page) {
    this.page = page;
    this.context = this.page.locator("main", { hasText: "MDM Connector" });
    this.addButton = this.context.locator(
      "xpath=//button[contains(normalize-space(),'Add') and not(ancestor::aside)]",
    );

    // Drawer to add/edit MDM connector
    this.drawer = new Drawer(this.context);
    this.nameInput = this.drawer.textField("Name");
    this.clientIDInput = this.drawer.textField("Application (client) ID");
    this.tenantIDInput = this.drawer.textField("Directory (tenant) ID");
    this.description = this.drawer.textArea("Description");
    this.cancelButton = this.drawer.button("Cancel");
    this.verifyAndSaveButton = this.drawer.button("Verify and Save");
    this.downloadKeyAndCertButton = this.drawer.button("Download key and cert");

    // Table
    this.table = new Table(this.context);

    // Dialog for record deletion confirmation
    this.deletionDialog = new Dialog(this.page);
  }

  async goto() {
    await this.page.goto("/device_management", {
      timeout: parseInt(process.env.LONG_TIMEOUT),
    });
    await this.context.waitFor();
  }

  /**
   * Before query completed, the value is 0. Use wait to get the updated value.
   * @return {number} the total entry number in `this.table`.
   */
  async entryCount() {
    return parseInt((
      await this.context
        .locator("//*[contains(normalize-space(),'Add')]/preceding-sibling::span")
        .textContent()).split(" ")[0]);
  }

  /**
   * The text will only exist when no data on the table.
   * Used to check the initial status or status after removed all connectors.
   */
  async noDataDisplayText() {
    return (await this.context.locator("//article//div[contains(@class, 'nodata')]")).textContent();
  }

  async inputName(name) {
    await this.nameInput.fill(name);
  }

  async inputClientID(clientID) {
    await this.clientIDInput.fill(clientID);
  }

  async inputTenantID(tenantID) {
    await this.tenantIDInput.fill(tenantID);
  }

  async inputDescription(description) {
    await this.description.fill(description);
  }

  /**
   * Private method for addMDMConnector and editMDMConnector
   * @param {object} connectorInfo an object containing the value be input to the MDM connector
   */
  async #updateDrawer(connectorInfo) {
    const functions = {
      name: this.inputName,
      clientID: this.inputClientID,
      tenantID: this.inputTenantID,
      description: this.inputDescription,
    };
    try {
      Object.keys(connectorInfo).forEach((key) => {
        if (!(key in functions)) {
          throw new Error(`Key "${key}" from connectorInfo is not as expected.`);
        }
      });
      // Only call the input function when the caller needs it
      for (const [key, value] of Object.entries(connectorInfo)) {
        if (value && functions[key]) {
          console.debug(`Input ${key} with ${value}`);
          await functions[key].call(this, value);
        }
      }
    } catch (error) {
      console.error("There was an error checking the keys: ", error.message);
      throw error;
    }
  }

  /**
   * @param {object} connectorInfo an object containing the value be input to the MDM connector
   * @param {string} certFilePath pass this parameter to download cert file. if not pass, skip download.
   */
  async addMDMConnector(connectorInfo, certFilePath) {
    await this.addButton.click();
    await this.#updateDrawer(connectorInfo);
    if (certFilePath) {
      await this.downloadKeyAndCert(certFilePath);
    }
    await this.verifyAndSaveButton.click();
  }

  /**
   * @param {object} connectorInfo an object containing the value be input to the MDM connector
   * @param {string} certFilePath pass this parameter to download cert file. if not pass, skip download.
   */
  async editMDMConnector(connectorInfo, certFilePath) {
    const row = await this.table.getRow(connectorInfo.name);
    await row.selectSettingOption("Edit");
    await this.#updateDrawer(connectorInfo);
    if (certFilePath) {
      await this.downloadKeyAndCert(certFilePath);
    }
    await this.verifyAndSaveButton.click();
  }

  async deleteMDMConnector(name) {
    const row = await this.table.getRow(name);
    await row.selectSettingOption("Delete");
    await this.deletionDialog.button("Delete").click();
  }

  /**
   * @param {string} filePath the full file path including file name to save the CA
   */
  async downloadKeyAndCert(filePath) {
    // TODO: need Azure library to upload cert to the corrsponding apps.
    const downloadHandler = new DownloadHandler(this.page);
    await this.downloadKeyAndCertButton.click();
    await downloadHandler.waitForDownload();
    await downloadHandler.saveFileAs(filePath);
  }

  /**
   * @param {string} name the MDM connector name for the record
   * @return {object} record return all value of this record as an object
   */
  async getTableRowValue(name) {
    const record = {
      "Name": undefined,
      "Device Registry": undefined,
      "Number of Device": undefined,
      "Description": undefined,
    };
    const row = await this.table.getRow(name);
    // eslint-disable-next-line guard-for-in
    for (const key in record) {
      record[key] = await row.getValueByHeader(key, 1);
    }
    return record;
  }
};
