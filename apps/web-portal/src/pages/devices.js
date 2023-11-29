/* eslint-disable spellcheck/spell-checker */
const { Drawer } = require("../components/drawer");
const { Table, Row } = require("../components/table");
const { StringHandler } = require("../library/handler/string");
const HEADERS = ["User", "Device Type", "Device Name", "Browser", "Device Registry", "Device Status",
  "Extension", "Block Sign-In", "Geographic Location", "Last Login"];


exports.DeviceList = class DeviceList {
  constructor(page) {
    this.page = page;
    this.context = this.page.locator("main", { hasText: "Device List" });

    // Table, in Device List page, there are two table DOM elements.
    this.table = new Table(this.context.locator("//div[contains(@Class, \"table\") and .//table and not(ancestor::aside)]"));

    // Drawer to display single record details
    this.drawer = new DeviceDetail(this.context);
    this.closeButton = this.drawer.button("Close");
  }

  async goto() {
    await this.page.goto("/devices", {
      timeout: parseInt(process.env.LONG_TIMEOUT),
    });
    await this.context.waitFor();
  }

  /**
   * Before query completed, the value is 0. Use wait to get the updated value.
   * @return {number} the total entry number inside `this.table`.
   */
  async entryCount() {
    return parseInt((
      await this.context
        .locator("//*[contains(normalize-space(),'Filter')]/preceding-sibling::span")
        .textContent()).split(" ")[0]);
  }

  /**
   * Get a specific device record which is combined by `User` and `Device Name`.
   * @param {string} user the User account for the record
   * @param {string} deviceName the device name for the record
   * @return {Row} record return all value of this record as an object
   */
  async getRow(user, deviceName) {
    return await this.table.getRowByValues([user, deviceName]);
  }

  /**
   * @param {Row} row a Row object from `getRow`
   * @return {object} return all value of this row as an object which each key is the column name
   */
  async getRowValue(row) {
    const record = {
      "User": null,
      "Device Type": null,
      "Device Name": null,
      "Browser": null,
      "Device Registry": null,
      "Device Status": null,
      "Extension": 0,
      "Block Sign-in": null,
      "Geographic Location": null,
      "Last Login": null,
    };
    // eslint-disable-next-line guard-for-in
    for (const key in record) {
      record[key] = await row.getValueByHeader(key, 1);
    }
    return record;
  }

  /**
   * To click User column in a Row to open its detail drawer
   * @param {Row} row a Row object from `getRow`
   */
  async clickUserInRowToOpenDetailDrawer(row) {
    await row.clickSpecificColumn(HEADERS[0], 1);
    await this.drawer.context.waitFor();
  }
};

class DeviceDetail extends Drawer {
  constructor(context) {
    super(context);
    // Define method for each column HEADER to get their value
    HEADERS.forEach((header) => {
      // TODO: independent methods for `Extension` and `Block Sign-In` which are not text but other formats.
      if (!["Extension", "Block Sign-In"].includes(header)) {
        const methodName = StringHandler.toCamelCase(header);
        this[methodName] = function () {
          return new SpanText(this.context, header);
        };
      }
    });
  }
};

/**
 * This may be only used in Device List Drawer. Its DOM element tree is like below
 * <div>
 * <span>HEADER</span>
 *   value
 * </div>
 * TODO: If any other place on the Portal uses this component, move this to `src\components\common.js`
 */
class SpanText {
  constructor(context, header) {
    this.context = context;
    this.header = header;
    this.divElement = this.context.locator(`//div[span[text()="${this.header}"]]`);
    this.spanElement = this.context.locator(`//div//span[text()="${this.header}"]`);
  }

  /**
   * Use this.divElement to get the entire text content inside <div> which will include <span>.
   * Use this.spanElement to get the text content inside <span>
   * Then, remove the span text and space/line break to get the exact value
   * @return {string}
   */
  async text() {
    const fullText = await this.divElement.textContent();
    const spanText = await this.spanElement.textContent();
    return fullText.replace(spanText, "").trim();
  }
};
