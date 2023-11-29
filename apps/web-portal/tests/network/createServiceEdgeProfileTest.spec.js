const { test, expect } = require("../../src/fixtures/commonSetup");
const { ServiceEdge } = require("../../src/pages/serviceEdge");
const { Sidebar } = require("../../src/pages/sidebar");
const { ServiceEdgeAPI } = require("../../src/library/apiRequest/serviceEdge");

// Test parameters.
const SE_PROFILE_NAME = "automationCreateServiceEdgeProfileTest";
const SE_PROFILE_DESCRIPTION = "automationCreateServiceEdgeProfileTest";
const serviceEdgeAPI = new ServiceEdgeAPI();

test.use({
  serviceEdge: async ({ page }, use) => {
    await use(new ServiceEdge(page));
  },
});

test.beforeAll(async ({}) => {
  await serviceEdgeAPI.init();
});

test.afterAll(async ({}) => {
  await serviceEdgeAPI.deleteSEProfile(SE_PROFILE_NAME);
});

test.describe("Create a service edge profile", () => {
  test("Create a service edge profile @C12172 sanity", async ({ serviceEdge, waitForSpinnerLoaded }) =>{
    await serviceEdge.goto();
    await waitForSpinnerLoaded();
    await serviceEdge.addServiceEdge(SE_PROFILE_NAME, SE_PROFILE_DESCRIPTION);
    await waitForSpinnerLoaded();
    await serviceEdge.inputSearch(SE_PROFILE_NAME);
    const row = await serviceEdge.oldTable.getRow(SE_PROFILE_NAME);
    const value = await row.getValueByHeader("Network", 3);
    expect(value).toEqual(SE_PROFILE_NAME);
  });
});
