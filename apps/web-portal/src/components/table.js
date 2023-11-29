const { expect } = require("@playwright/test");

class Table {
  constructor(context) {
    this.context = context;
    this.element = this.context.locator("table");
  }

  checkBoxField(fieldName) {
    return this.element.locator(
      `xpath=(//label[contains(normalize-space(), '${fieldName}')])`,
    );
  }

  async getTableHeaders() {
    await this.element.waitFor();
    return await this.element
      .locator("[data-test=\"table-column-name\"]")
      .allTextContents();
  }

  /**
   * Retrieves a row by using a unique key.
   * @param {string} uniqueNameOfRow - the value of the column used to identify the unique row.
   * @return {Promise<Row>} A promise that resolves to the unique row identified by the provided unique name.
   */
  async getRow(uniqueNameOfRow) {
    const headers = await this.getTableHeaders();
    return Row.fromUniqueName(this.element, uniqueNameOfRow, headers);
  }

  /**
   * Retrieves a row by using a composite key, which is formed by the values from two or more columns.
   * @param {Array<string>} rowValues - An array of column values used to identify the unique row.
   * @return {Promise<Row>} A promise that resolves to the unique row identified by the provided values.
   */
  async getRowByValues(rowValues) {
    const headers = await this.getTableHeaders();
    return Row.fromValues(this.element, rowValues, headers);
  }
}

/**
 * The Row class should be initialized using the static factory methods `fromUniqueName` or `fromValues`.
 */
class Row {
  constructor(context, selector, headers) {
    this.context = context;
    this.element = context.locator(selector);
    this.headers = headers;
  }

  /**
   * Factory method to create a Row instance based on a unique name.
   * @param {Locator} context - The context in which the row exists.
   * @param {string} uniqueName - The unique name used to identify the row.
   * @param {Array<string>} headers - The headers of the table.
   * @return {Row} - A Row instance.
   */
  static fromUniqueName(context, uniqueName, headers) {
    const selector = `tr:has-text("${uniqueName}")`;
    return new Row(context, selector, headers);
  }

  /**
   * Factory method to create a Row instance based on an array of multiple column values.
   * @param {Locator} context - The context in which the row exists.
   * @param {Array<string>} rowValues - An array of column values used to identify the unique row．
   * @param {Array<string>} headers - The headers of the table.
   * @return {Row} - A Row instance.
   */
  static fromValues(context, rowValues, headers) {
    const conditions = rowValues.map((value) => `td[contains(., "${value}")]`).join(" and ");
    const selector = `//tr[${conditions}]`;
    return new Row(context, selector, headers);
  }

  async clickSpecificColumn(header, offSet = 2) {
    this.element
      .locator(`td:nth-child(${this.headers.indexOf(header) + offSet})`)
      .click({ timeout: parseInt(process.env.SHORT_TIMEOUT) });
  }

  async clickSettingDot() {
    await this.element
      .locator("td:last-child")
      .locator("button[class*='setting']")
      .click({ timeout: parseInt(process.env.SHORT_TIMEOUT) });
  }

  async selectSettingOption(option) {
    await this.clickSettingDot();
    await this.clickSettingOption(option);
  }

  async getValueByIndex(index) {
    return this.headers[index];
  }

  async getValueByHeader(header, offSet = 2) {
    const eleText = await this.element
      .locator(`td:nth-child(${this.headers.indexOf(header) + offSet})`)
      .textContent();
    return eleText.trim();
  }
  async clickSettingOption(option) {
    const settingOption = this.context.locator(
      `xpath=//ancestor::body//*[contains(@id, 'popper') and @aria-hidden='false']//*[normalize-space()="${option}"]`,
    );
    await expect(settingOption).toBeVisible();
    await settingOption.hover();
    await settingOption.click();
  }
}
// For some page's table which is old design, will be deprecated soon.
class OldTable {
  constructor(context) {
    this.context = context;
    this.element = this.context.locator("//div[@class='appaegis-grid']");
  }

  async getTableHeaders() {
    await this.element.waitFor();
    return await this.element
      .locator("div[class*='appaegis-grid__thead']")
      .allTextContents();
  }

  async getRow(uniqueNameOfRow) {
    const headers = await this.getTableHeaders();
    return new OldRow(this.element, uniqueNameOfRow, headers);
  }
}
// For some page's table row which is old design, will be deprecated soon.
class OldRow {
  constructor(context, uniqueName, headers) {
    this.context = context;
    this.element = context.locator(`div[class*='appaegis-grid__tr']:has-text("${uniqueName}")`);
    this.headers = headers;
  }

  async getValueByIndex(index) {
    return this.headers[index];
  }

  async getValueByHeader(header, offSet = 2) {
    const eleText = await this.element
      .locator(`div[class*='appaegis-grid__td']:nth-child(${this.headers.indexOf(header) + offSet})`)
      .textContent();
    return eleText.trim();
  }

  async clickDetail() {
    await this.element
      .locator("span[alt*=Detail]:last-child")
      .click();
  }

  async clickEdit() {
    await this.element
      .locator("span[alt*=Edit]:last-child")
      .click();
  }
}

exports.Table = Table;
exports.OldTable = OldTable;
