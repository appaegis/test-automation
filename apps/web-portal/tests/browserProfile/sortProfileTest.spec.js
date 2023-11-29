const { test, expect } = require("../../src/fixtures/commonSetup");
const {
  BrowserProfile,
} = require("../../src/pages/MammothBrowser/browserProfile");
const {
  UnityProfileAPI,
} = require("../../src/library/apiRequest/unityProfile");

const unityProfileAPI = new UnityProfileAPI();
const USER = process.env.ADMIN_USERNAME;
const PROFILE_NAME = "Automation_Browser_Profile_C5637";
const PROFILE_ID = "this_is_automaiton_browser_profile_c5637";
const PROFILES = [];
const PROFILES_ID = [];

test.use({
  browserProfile: async ({ page }, use) => {
    await use(new BrowserProfile(page));
  },
});

test.beforeAll(async ({}) => {
  await unityProfileAPI.init(process.env.GRAPHQL_API);
  await createThreeBrowserProfiles();
});

test.beforeEach(async ({ browserProfile }) => {
  await browserProfile.goto();
});

test.afterAll(async () => {
  await deleteThreeBrowserProfiles();
});

test.describe("profile order can be sorted by dragging and dropping profiles and saving the configuration.  @C5637 Smoke", () => {
  test("profile order can be sorted by dragging and dropping profiles and saving the configuration", async ({
    browserProfile,
    waitForSpinnerLoaded,
  }) => {
    // Parser the current priority.
    const row1Old = await browserProfile.table.getRow(PROFILES[0]);
    const row3Old = await browserProfile.table.getRow(PROFILES[2]);
    const row1OldPriority = await browserProfile.getRowTextWithDraggable(
      row1Old,
      "Priority"
    );
    const row3OldPriority = await browserProfile.getRowTextWithDraggable(
      row3Old,
      "Priority"
    );

    // Change the priority.
    const row1 = await browserProfile.getKeyTableRow(PROFILES[0]);
    const row3 = await browserProfile.getKeyTableRow(PROFILES[2]);
    await row1.dragTo(row3);
    await waitForSpinnerLoaded();

    // Make sure the priority is correct after re-sorting.
    const row1New = await browserProfile.table.getRow(PROFILES[0]);
    const row3New = await browserProfile.table.getRow(PROFILES[2]);
    const row1NewPriority = await browserProfile.getRowTextWithDraggable(
      row1New,
      "Priority"
    );
    const row3NewPriority = await browserProfile.getRowTextWithDraggable(
      row3New,
      "Priority"
    );
    expect(row1NewPriority).toEqual((Number(row1OldPriority) + 2).toString());
    expect(row3NewPriority).toEqual((Number(row3OldPriority) - 1).toString());
  });
});

async function createThreeBrowserProfiles() {
  for (let i = 1; i < 4; i += 1) {
    PROFILES.push(PROFILE_NAME + "_" + i);
    PROFILES_ID.push(PROFILE_ID + "_" + i);
    await unityProfileAPI.createUnityProfileInTransaction(
      {
        payload: {
          name: PROFILES[i - 1],
          actions: ["copy", "paste"],
          id: PROFILES_ID[i - 1],
        },
      },
      ["Default"],
      [USER]
    );
  }
}

async function deleteThreeBrowserProfiles() {
  for (let i = 1; i < 4; i += 1) {
    await unityProfileAPI.deleteUnityProfile(PROFILE_NAME + "_" + i);
  }
}
