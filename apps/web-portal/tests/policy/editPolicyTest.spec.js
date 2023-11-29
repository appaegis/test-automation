const { test, expect } = require("../../src/fixtures/commonSetup");
const { Policies } = require("../../src/pages/policies");
const { UserAPI } = require("../../src/library/apiRequest/user");
const { Users } = require("../../src/pages/users");

test.setTimeout(120 * 1000);
const USER_ACCOUNT = "appaegisqa+editPolicy@gmail.com";
const POLICY_NAME = "Edit_Policy_automation_testing";
const DESCRIPTION = "Edit_Policy_automation";

test.use({
  policies: async ({ page }, use) => {
    await use(new Policies(page));
  },
  userAPI: async ({}, use) => {
    await use(new UserAPI());
  },
  users: async ({ page }, use) => {
    await use(new Users(page));
  },
});

test.beforeAll(async ({ userAPI }) => {
  await userAPI.init();
  await userAPI.createUser([USER_ACCOUNT], "user");
});

test.beforeEach(async ({ policies }) => {
  await policies.goto();
  await policies.createPolicy(POLICY_NAME, DESCRIPTION, [
    {
      groupsAndUsers: [USER_ACCOUNT, process.env.ADMIN_USERNAME],
      actions: ["Print", "Copy", "Paste"],
    },
  ]);
});
test.afterEach(async ({ policies }) => {
  await policies.goto();
  await policies.deletePolicy(POLICY_NAME);
});

test.afterAll(async ({ userAPI }) => {
  await userAPI.init();
  try {
    await userAPI.deleteUser(USER_ACCOUNT);
  } catch (error) {
    if (String(error).includes("Request failed with status code 500")) {
      test.info().annotations.push({
        type: "info",
        description: "User is deleted",
      });
    }
    //FIXME change error code once AC-5458 if fixed
  }
});

test.describe("Edit Policy", () => {
  test("Edit policy @C43 @Somke", async ({ policies }) => {
    const nameToBeChanged = "@C43_Change_Name_Test";
    const descriptionToBeChanged = "@C43_Change_Description";
    try {
      await policies.editPolicy(
        POLICY_NAME,
        nameToBeChanged,
        descriptionToBeChanged
      );
      const row = await policies.policyTable.getRow(nameToBeChanged);
      const policyNameAndDescription = await row.getValueByHeader("Policy");
      expect(policyNameAndDescription).toContain(nameToBeChanged);
      expect(policyNameAndDescription).toContain(descriptionToBeChanged);
    } finally {
      await policies.editPolicy(nameToBeChanged, POLICY_NAME, DESCRIPTION);
    }
  });

  test("Policy should be editable back and forth with adding/deleting the user @C12353 @Somke", async ({
    users,
    policies,
  }) => {
    const nameToBeChanged = "@C12353_Change_Name_Test";
    const descriptionToBeChanged = "@C12353_Change_Description";
    try {
      await users.goto();
      await users.deleteUser(USER_ACCOUNT);
      await policies.goto();
      await policies.editPolicy(
        POLICY_NAME,
        nameToBeChanged,
        descriptionToBeChanged
      );
    } finally {
      await policies.editPolicy(nameToBeChanged, POLICY_NAME, DESCRIPTION);
    }
  });
});
