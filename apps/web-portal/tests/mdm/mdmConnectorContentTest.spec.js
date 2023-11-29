/* eslint-disable guard-for-in */
const { test, expect } = require("../../src/fixtures/commonSetup");
const { MDMConnector } = require("../../src/pages/Connectors/mdmConnector");
const { FileHandler } = require("../../src/library/handler/file");

test.setTimeout(120 * 1000);

const certFilePath = "tests/mdmConnectorTest.crt";
const fs = new FileHandler();

test.use({
  mdmConnector: async ({ page }, use) => {
    await use(new MDMConnector(page));
  },
});

test.afterAll(async () => {
  await fs.deleteFile(certFilePath);
});

test.describe("MDM Connector Page and Drawer test", () => {
  test("Test MDM Connector Page initial status", async ({ mdmConnector }) => {
    await mdmConnector.goto();
    expect(await mdmConnector.entryCount()).toEqual(0);
    expect(await mdmConnector.noDataDisplayText()).toContain("No data available");
  });

  test("Download cert file from add MDM connector drawer", async ({ mdmConnector }) => {
    const connectorInfo = {
      name: "AutoTest-DownloadCert",
      clientID: "",
      tenantID: "",
      description: "AutoTest-DownloadCert",
    };

    await mdmConnector.goto();
    await mdmConnector.addMDMConnector(connectorInfo, certFilePath);
    expect(await fs.isFileExist(certFilePath)).toBeTruthy();
  });
});
