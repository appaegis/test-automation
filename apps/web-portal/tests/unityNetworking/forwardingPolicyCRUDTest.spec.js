const { text } = require("stream/consumers");
const { test, expect } = require("../../src/fixtures/commonSetup");
const { UnityNetworking } = require("../../src/pages/unityNetworking");

test.skip(
  true,
  "QA-148 Unity Networking page is re-designed, need to refine tests"
);

test.use({
  unityNetworking: async ({ page }, use) => {
    await use(new UnityNetworking(page));
  },
});
test.describe.configure({ mode: "serial" });

test.beforeAll(async ({ unityNetworking }) => {
  await unityNetworking.goto();
});

const FORWARDING_POLICY_NAME = "C5718-forwawrding-policy";
const FORWARDING_POLICY_NAME_WITH_EXCEPTION = `${FORWARDING_POLICY_NAME}-exception`;
const FORWARDING_POLICY_IP = "1.1.1.1";

test.describe("CRUD test for Unity Netwokring", () => {
  test("Create Forwarding policy", async ({ unityNetworking }) => {
    await unityNetworking.createForwardingPolicy(
      FORWARDING_POLICY_NAME,
      FORWARDING_POLICY_IP
    );
    const row = await unityNetworking.table.getRow(FORWARDING_POLICY_NAME);
    expect(await row.getValueByHeader("Name", 1)).toEqual(
      FORWARDING_POLICY_NAME
    );
    expect(await row.getValueByHeader("Detection", 1)).toEqual("DNS");
  });

  test("Update Forwarding policy", async ({ unityNetworking }) => {
    const row = await unityNetworking.table.getRow(FORWARDING_POLICY_NAME);
    await row.selectSettingOption("Edit");
    await unityNetworking.inputName(`${FORWARDING_POLICY_NAME}-modify`);
    await unityNetworking.selectDetection("ping");
    await unityNetworking.clickSaveButton();
    await unityNetworking.waitForPageLoading();
    expect(await row.getValueByHeader("Name", 1)).toEqual(
      `${FORWARDING_POLICY_NAME}-modify`
    );
    expect(await row.getValueByHeader("Detection", 1)).toEqual("Ping");
  });

  test("Delete Forwarding policy", async ({ unityNetworking }) => {
    const row = await unityNetworking.table.getRow(FORWARDING_POLICY_NAME);
    await unityNetworking.deleteForwardingPolicy(FORWARDING_POLICY_NAME);
    await expect(row.element).not.toBeVisible();
  });

  test("Create Forwarding policy with Exception", async ({
    unityNetworking,
  }) => {
    test.skip(
      true,
      "remove this line once https://appaegis.atlassian.net/browse/AC-4889 is fixed"
    );
    await unityNetworking.createForwardingPolicy(
      FORWARDING_POLICY_NAME_WITH_EXCEPTION,
      FORWARDING_POLICY_IP,
      "dns",
      "direct",
      "internet",
      "direct"
    );
    const row = await unityNetworking.table.getRow(
      FORWARDING_POLICY_NAME_WITH_EXCEPTION
    );
    expect(await row.getValueByHeader("Name", 1)).toEqual(
      FORWARDING_POLICY_NAME_WITH_EXCEPTION
    );
    expect(await row.getValueByHeader("Detection", 1)).toEqual("DNS");
    expect(await row.getValueByHeader("Forwarding Action", 1)).toEqual(
      "Direct Connect"
    );
    expect(await row.getValueByHeader("Override", 1)).toEqual(
      "Internet Access"
    );
  });

  test("Update exception of Forwarding policy", async ({ unityNetworking }) => {
    test.skip(
      true,
      "remove this line once https://appaegis.atlassian.net/browse/AC-4889 is fixed"
    );
    const row = await unityNetworking.table.getRow(
      FORWARDING_POLICY_NAME_WITH_EXCEPTION
    );
    await row.selectSettingOption("Edit");
    await unityNetworking.inputName(
      `${FORWARDING_POLICY_NAME_WITH_EXCEPTION}-modify`
    );
    await unityNetworking.selectDetection("ping");
    const exceptionRow = await unityNetworking.editDrawerTable.getRow(
      "Internet Access"
    );
    await exceptionRow.selectSettingOption("Edit");
    await unityNetworking.selectExceptionAction("appaegis");
    await unityNetworking.clickExpectionSaveButton();
    await unityNetworking.clickSaveButton();
    await unityNetworking.waitForPageLoading();
    expect(await row.getValueByHeader("Name", 1)).toEqual(
      `${FORWARDING_POLICY_NAME_WITH_EXCEPTION}-modify`
    );
    expect(await row.getValueByHeader("Detection", 1)).toEqual("Ping");
    expect(await row.getValueByHeader("Forwarding Action", 1)).toEqual(
      "Direct Connect"
    );
    expect(await row.getValueByHeader("Override", 1)).toEqual(
      "Internet Access"
    );
  });

  test("Delete exception of Forwarding policy", async ({ unityNetworking }) => {
    test.skip(
      true,
      "remove this line once https://appaegis.atlassian.net/browse/AC-4889 is fixed"
    );
    const row = await unityNetworking.table.getRow(
      FORWARDING_POLICY_NAME_WITH_EXCEPTION
    );
    await row.selectSettingOption("Edit");
    const exceptionRow = await unityNetworking.editDrawerTable.getRow(
      "Internet Access"
    );
    await exceptionRow.selectSettingOption("Delete");
    await unityNetworking.clickSaveButton();
    await unityNetworking.waitForPageLoading();
    expect(await row.getValueByHeader("Override", 1)).toEqual("-");
    await unityNetworking.deleteForwardingPolicy(
      FORWARDING_POLICY_NAME_WITH_EXCEPTION
    );
    await expect(row.element).not.toBeVisible();
  });
});
