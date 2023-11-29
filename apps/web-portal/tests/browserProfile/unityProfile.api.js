const { test, expect } = require("../../src/fixtures/apiSetup");
const {
  UnityProfileAPI,
} = require("../../src/library/apiRequest/unityProfile");


test.describe.configure({ mode: "serial" });

const unityProfileAPI = new UnityProfileAPI();
const PROFILE_NAME = "Automation_Browser_Profile_3757";
const PROFILE_ID = "this-is-automation-id-fortesting-3757";

test.beforeAll(async () => {
  await unityProfileAPI.init(process.env.GRAPHQL_API);
});

test.afterAll(async () => {});

test.describe("Unity Profle API testing", () => {
  test("listUnityProfileMetas @C5892", async () => {
    const result = await unityProfileAPI.listUnityProfileMetas();
    expect(result.items[0].id).toBeDefined();
    expect(result.items[0].defaultProfile).toBeDefined();
    expect(result.items[0].priorityList).toBeDefined();
  });

  test("createUnityProfileInTransaction @C5890", async () => {
    const profile = {
      payload: {
        name: PROFILE_NAME,
        actions: ["copy", "paste"],
        id: PROFILE_ID,
      },
    };
    const result = await unityProfileAPI.createUnityProfileInTransaction(
      profile,
      ["Default"],
      [process.env.ADMIN_USERNAME],
    );
    expect(result.createUnityProfileInTransaction.profile.id).toEqual(
      PROFILE_ID,
    );
    expect(result.createUnityProfileInTransaction.profile.name).toEqual(
      PROFILE_NAME,
    );
    expect(result.createUnityProfileInTransaction.teams[0].id).toBeDefined();
    expect(result.createUnityProfileInTransaction.users[0].id).toBeDefined();
    expect(result.createUnityProfileInTransaction.meta.id).toBeDefined();
  });

  test("listUnityProfiles C5894", async () => {
    const result = await unityProfileAPI.listUnityProfiles();
    expect(result.items[0].id).toBeDefined();
    expect(result.items[0].name).toBeDefined();
    expect(result.items[0].actions).toBeDefined();
  });

  test("deleteUnityProfile @C5893", async () => {
    await unityProfileAPI.deleteUnityProfile(PROFILE_NAME);
    const profiles = await unityProfileAPI.listUnityProfiles();
    const matchedResult = profiles.items.find((profile) => {
      return profile.name === PROFILE_NAME;
    });
    expect(matchedResult).toBeUndefined();
  });

  test("updateUnityProfileMeta @C5891", async () => {
    test.skip(true, "remove this skip unitl AC-3766 is fixed");
    const metas = await unityProfileAPI.listUnityProfileMetas();
    let error = undefined;
    try {
      await unityProfileAPI.updateUnityProfileMeta(
        ["this-is-not-exist-profile"],
        metas.items[0].id,
      );
    } catch (e) {
      error = string(e);
    } finally {
      await unityProfileAPI.updateUnityProfileMeta(
        metas.items[0].priorityList,
        metas.items[0].id,
      );
      expect(error).toBeDefined();
    }
  });
});
