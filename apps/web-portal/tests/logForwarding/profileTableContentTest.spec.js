const { test, expect } = require("../../src/fixtures/commonSetup");
const { LogForwarding } = require("../../src/pages/logforwarding");
const {
  LogForwardingAPI,
} = require("../../src/library/apiRequest/logForwarding");

test.use({
  logForwarding: async ({ page }, use) => {
    await use(new LogForwarding(page));
  },
});
const ENTRY_NAME = "Syslog_testing_3131";

test.beforeEach(async ({ logForwarding }) => {
  await logForwarding.goto();
  await logForwarding.configLogForwarding(
    ENTRY_NAME,
    "Syslog",
    "cloud",
    "1.1.1.1",
    "514"
  );
});

test.afterEach(async () => {
  const logForwardingAPI = new LogForwardingAPI();
  await logForwardingAPI.init();
  await logForwardingAPI.deleteLogForwardingEntry(ENTRY_NAME);
});

test.describe("Check the log forwarding profile is correct @C7687", () => {
  test("Table information should be correct", async ({ logForwarding }) => {
    const row = await logForwarding.table.getRow(ENTRY_NAME);
    expect(await row.getValueByHeader("Name")).toEqual(ENTRY_NAME);
    expect(await row.getValueByHeader("Service")).toEqual("Syslog");
    expect(await row.getValueByHeader("Connection Status")).toEqual("Offline");
    expect(await row.getValueByHeader("Last processed timestamp")).toEqual("-");
    expect(await row.getValueByHeader("Last failure timestamp")).toEqual("-");
  });
  test("Detailed information should be correct", async ({ logForwarding }) => {
    const row = await logForwarding.table.getRow(ENTRY_NAME);
    await row.element.locator("td:first-child").click({ force: true });
    let information = await logForwarding.getTableDetailData(ENTRY_NAME);
    await expect(
      information.locator("div[class]", { hasText: "Name:" })
    ).toContainText(ENTRY_NAME);
  });
});
