/* eslint-disable guard-for-in */
const { test, expect } = require("../../src/fixtures/commonSetup");
const { DeviceList } = require("../../src/pages/devices");
const os = require("os");

test.setTimeout(120 * 1000);

test.use({
  deviceList: async ({ page }, use) => {
    await use(new DeviceList(page));
  },
});

test.describe("Device List Page and device record detail test", () => {
  test("Test Device List Page table record and its detail", async ({ deviceList }) => {
    /**
     * This case assumes the running machine has logged-in EAB before.
     * TODO: Need a better way to design cases. This is just a sample case and will be removed one day.
     */
    await deviceList.goto();
    const row = await deviceList.getRow(process.env.ADMIN_USERNAME, os.hostname());
    const values = await deviceList.getRowValue(row);
    // Check single row value on Table
    expect(values["User"]).toEqual(process.env.ADMIN_USERNAME);
    expect(values["Device Type"].includes("macOS") || values["Device Type"].includes("Windows"));
    expect(values["Device Name"]).toEqual(os.hostname());
    expect(values["Browser"].includes("Mammoth Browser"));
    expect(await deviceList.entryCount()).toBeGreaterThan(0);

    // Check single row value in its detail drawer
    await deviceList.clickUserInRowToOpenDetailDrawer(row);
    expect(await deviceList.drawer.user().text()).toContain(process.env.ADMIN_USERNAME);
    expect(await deviceList.drawer.deviceType().text()).toContain(values["Device Type"]);
    expect(await deviceList.drawer.deviceName().text()).toContain(values["Device Name"]);
    expect(await deviceList.drawer.browser().text()).toContain(values["Browser"]);
    expect(await deviceList.drawer.deviceRegistry().text()).toContain(values["Device Registry"]);
    expect(await deviceList.drawer.deviceStatus().text()).toContain(values["Device Status"]);
    expect(await deviceList.drawer.geographicLocation().text()).toContain(values["Geographic Location"]);
    expect(await deviceList.drawer.lastLogin().text()).toContain(values["Last Login"]);
  });
});
