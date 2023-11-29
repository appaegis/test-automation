const { test, expect } = require("../../src/fixtures/commonSetup");

const { LogForwarding } = require("../../src/pages/logforwarding");
const {
  LogForwardingAPI,
} = require("../../src/library/apiRequest/logForwarding");
const { Web } = require("../../src/pages/web");
const { EC2 } = require("../../src/library/aws/ec2Client.js");

test.describe.configure({ mode: "serial" });
test.setTimeout(180 * 1000);

test.use({
  logForwarding: async ({ page }, use) => {
    use(new LogForwarding(page));
  },
  logForwardingAPI: async ({}, use) => {
    const logforwardingAPI = new LogForwardingAPI();
    await logforwardingAPI.init();
    use(logforwardingAPI);
  },
  web: async ({ page }, use) => {
    use(new Web(page));
  },
});
let publicIpAddress;
const APPLICATION_NAME = "C7680_Web_Application";
const ENTRY_NAME = "Syslog_testing_7680";

test.beforeEach(async ({ logForwarding, logForwardingAPI }) => {
  const ec2Client = new EC2([process.env.qa_test_public_ssh_1]);
  await ec2Client.startEC2Instance();
  const data = await ec2Client.getEC2Detailed();
  publicIpAddress = data.Reservations[0].Instances[0].PublicIpAddress;
  await logForwardingAPI.init();
  await logForwarding.goto();
  await logForwarding.configLogForwarding(
    ENTRY_NAME,
    "Syslog",
    "cloud",
    publicIpAddress,
    "514"
  );
  const row = await logForwarding.table.getRow(ENTRY_NAME);
  expect(await row.getValueByHeader("Name")).toEqual(ENTRY_NAME);
});

test.afterEach(async ({ logForwardingAPI, web }) => {
  await logForwardingAPI.deleteLogForwardingEntry("Syslog_testing_7680");
  await web.goto();
  await web.deleteApp(APPLICATION_NAME);
});

test.describe("Check Log forwarding is correct @C7680", () => {
  test("Web Application forwarding", async ({
    sideBar,
    page,
    waitForSpinnerLoaded,
    web,
    logForwarding,
    logForwardingAPI,
  }) => {
    await sideBar.clickSideBar("App Launcher");
    await sideBar.clickSideBar("Web");
    await web.createWebApplication(
      APPLICATION_NAME,
      "Cloud Services",
      "https",
      "Default",
      "google.com"
    );
    await web.inputSearch(APPLICATION_NAME);
    const googlePage = await web.launchApp(page, APPLICATION_NAME);
    await googlePage.close();
    await waitLogForwardingEvent(logForwardingAPI);
    await sideBar.clickSideBar("Log Forwarding");
    await waitForSpinnerLoaded();
    const row = await logForwarding.table.getRow("Syslog_testing_7680");
    expect(await row.getValueByHeader("Last processed timestamp")).not.toEqual(
      "-"
    );
    expect(await row.getValueByHeader("Last failure timestamp")).toEqual("-");
    expect(await row.getValueByHeader("Connection Status")).toEqual("Online");
  });
});

async function waitLogForwardingEvent(logForwardingAPI) {
  await expect
    .poll(
      async () => {
        const res = await logForwardingAPI.getLogForwardingEntries();
        const logForwardingEntrys = res.listLogForwardingEntrys.items;
        for (let index = 0; index < logForwardingEntrys.length; index++) {
          if (
            logForwardingEntrys[index].name == "Syslog_testing_7680" &&
            logForwardingEntrys[index].lastProcessedTime |
              logForwardingEntrys[index].lastFailedSendingTime
          ) {
            return true;
          }
        }
        return false;
      },
      {
        message: "make sure log forwarding message is sent",
        timeout: parseInt(process.env.LONG_TIMEOUT),
      }
    )
    .toBe(true);
}
