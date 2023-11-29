const {
  TimeoutSetting,
} = require("../../src/accountProfile");
const { test, expect } = require("@playwright/test");

const timeoutSetting = new TimeoutSetting();
const IDLE_TIMEOUT_PORTAL = 60 * 60 * 24 * 1000;
const IDLE_TIMEOUT_EAB = 60 * 60 * 12 * 1000;

test.describe.configure({ mode: "serial" });

test.use({
  timeoutSetting: async ({}, use) => {
    await use(new TimeoutSetting());
  },
});

test.beforeAll(async () => {
  await timeoutSetting.init();
});

test.describe("UpdateTenantEntry and GetIdleTimeout testing @C13717", () => {
  test("UpdateTenantEntry", async () => {
    const result = await timeoutSetting.updateTenantEntry(IDLE_TIMEOUT_PORTAL, IDLE_TIMEOUT_EAB);
    expect(result.id).toEqual(process.env.tenantID);
  });
  test("GetIdleTimeout", async () => {
    const result = await timeoutSetting.getIdletimeout();
    expect(result.idleTimeoutForPortal).toEqual(IDLE_TIMEOUT_PORTAL);
    expect(result.idleTimeoutForEab).toEqual(IDLE_TIMEOUT_EAB);
  });
});
