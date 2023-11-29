const { test, expect } = require("@playwright/test");
const { LogForwardingAPI } = require("../../src/library/apiRequest/logForwarding");
test.describe.configure({ mode: "serial" });

let logForwarding = new LogForwardingAPI();
test.beforeAll(async () => {
  await logForwarding.init();
});
const LOG_FORWARDING_NAME="Automation_Log_Forwarding"


test.afterAll(async () => {
  await logForwarding.deleteLogForwardingEntry(LOG_FORWARDING_NAME);
  await logForwarding.deleteLogForwardingEntry("editAPItesting");
});

test.describe("Log Forwarding API testing", () => {
  test("Add logForwarding instance @C5608", async () => {
    let variables = {
      input: {
        serviceType: "Syslog",
        azureSentinel: { SharedKey: null, CustomerId: null },
        tagList: ["Appaegis"],
        port: 514,
        enable: true,
        logFormat: "json",
        name: LOG_FORWARDING_NAME,
        networkType: "cloud",
        serverAddr: "1.1.1.1",
        serverStatus: "offline",
        connectionType: "tcp",
        tenantEntryId: `${logForwarding.graphQLClient.tenantID}`,
      },
    };
    let res = await logForwarding.createLogForwardingEntry(variables);
    expect(res.createLogForwardingEntry.id).toBeDefined;
    expect(res.createLogForwardingEntry.tenantEntryId).toBeDefined;
    expect(res.createLogForwardingEntry).toMatchObject({
      serviceType: "Syslog",
      status: null,
      tagList: ["Appaegis"],
      lastProcessedTime: null,
      lastFailedSendingTime: null,
      lastFailedMessage: null,
      successCount: null,
      failureCount: null,
      azureSentinel: { CustomerId: null, SharedKey: null },
      name: LOG_FORWARDING_NAME,
      logFormat: "json",
      connectionType: "tcp",
      networkType: "cloud",
      networkId: null,
      serverAddr: "1.1.1.1",
      serverStatus: "offline",
      port: 514,
    });
  });
  test("List Entries @C5606", async () => {
    let res = await logForwarding.getLogForwardingEntries();
    let logForwardingProfiles = res.listLogForwardingEntrys.items;
    for (let i = 0; i < logForwardingProfiles.length; i += 1) {
      if (logForwardingProfiles[i].name == LOG_FORWARDING_NAME) {
        expect(logForwardingProfiles[i].id).toBeDefined;
        expect(logForwardingProfiles[i].tenantEntryId).toBeDefined;
        expect(logForwardingProfiles[i]).toMatchObject({
          serviceType: "Syslog",
          status: null,
          tagList: ["Appaegis"],
          azureSentinel: { CustomerId: null, SharedKey: null },
          name: LOG_FORWARDING_NAME,
          logFormat: "json",
          connectionType: "tcp",
          networkType: "cloud",
          networkId: null,
          serverAddr: "1.1.1.1",
          serverStatus: "offline",
          port: 514,
        });
        return
      }
    }
    test.fail(`${LOG_FORWARDING_NAME} should be found`)
  });

  test("Edit Entry @C5609", async () => {
    let variables = {
      input: {
        tenantEntryId: `${logForwarding.graphQLClient.tenantID}`,
        serviceType: "Syslog",
        status: null,
        tagList: ["editTag"],
        azureSentinel: { CustomerId: null, SharedKey: null },
        name: "editAPItesting",
        logFormat: "json",
        connectionType: "tcp",
        networkType: "cloud",
        networkId: null,
        serverAddr: "9.9.9.9",
        serverStatus: "offline",
        port: 515,
        enable: false,
      },
    };
    let res = await logForwarding.editLogForwardingEntry(LOG_FORWARDING_NAME, variables);

    expect(res.updateLogForwardingEntry.id).toBeDefined;
    expect(res.updateLogForwardingEntry.tenantEntryId).toBeDefined;
    expect(res.updateLogForwardingEntry).toMatchObject({
      serviceType: "Syslog",
      tagList: ["editTag"],
      azureSentinel: { CustomerId: null, SharedKey: null },
      name: "editAPItesting",
      logFormat: "json",
      connectionType: "tcp",
      networkType: "cloud",
      networkId: null,
      serverAddr: "9.9.9.9",
      port: 515,
      enable: false,
      serverStatus: "offline",
    });
  });

  test("Delete Entry @C5607", async () => {
    let deleteEntryID = await logForwarding.deleteLogForwardingEntry("editAPItesting");
    test.fail(!deleteEntryID, `logForwarding Entry "${LOG_FORWARDING_NAME}" not found`)
    let res = await logForwarding.getLogForwardingEntries();
    let logForwardingProfiles = res.listLogForwardingEntrys.items;
    for (let i = 0; i < logForwardingProfiles.length; i += 1) {
      expect(
        logForwardingProfiles[i].name,
        "entry 'editAPItesting' should be deleted"
      ).not.toEqual("editAPItesting");
    }
  });
});
