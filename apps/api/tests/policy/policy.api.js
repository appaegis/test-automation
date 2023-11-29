const { test, expect } = require("@playwright/test");
const { PolicyAPI } = require("../../src/policy");
const { PolicyPrepFixtures } = require("../../src/fixtures/policyPrepFixtures");
const POLICY_NAME = "automation_policy_api_test";

test.describe.configure({ mode: "serial" });

test.use({
  policyAPI: async ({}, use) => {
    const policyAPI = new PolicyAPI();
    await policyAPI.init(process.env.GRAPHQL_API);
    await use(policyAPI);
  },

  policyPrepFixtures: async ({ policyAPI }, use) => {
    const policyPrepFixtures = new PolicyPrepFixtures(policyAPI);
    await policyPrepFixtures.policyCleanup(POLICY_NAME);
    await use(policyPrepFixtures);
    await policyPrepFixtures.policyCleanup(POLICY_NAME);
  },
});

test.describe("API for Policy CRUD", () => {
  test("Add a policy @C12339", async ({ policyPrepFixtures }) => {
    // Arrange & Act
    const result = await policyPrepFixtures.policySetup(POLICY_NAME);

    // Assert
    expect(result.policyEntry.id).toBeDefined();
    expect(result.addRulesResult[0].rule.id).toBeDefined();
    expect(result.addRulesResult[0].teams[0].id).toBeDefined();
    expect(result.addRulesResult[0].users[0].id).toBeDefined();
  });

  test("List policy @C12340", async ({ policyAPI, policyPrepFixtures }) => {
    // Arrange
    await policyPrepFixtures.policySetup(POLICY_NAME);

    // Act
    const result = await policyAPI.listPolicyEntries();
    const matchPolicy = result.find((policy) => {
      return policy.name == POLICY_NAME;
    });
    expect(matchPolicy).toBeDefined();
  });

  test("Delete policy @C12341", async ({ policyAPI, policyPrepFixtures }) => {
    // Arrange
    await policyPrepFixtures.policySetup(POLICY_NAME);

    // Act
    await policyAPI.deletePolicy(POLICY_NAME);

    // Assert
    const result = await policyAPI.listPolicyEntries();
    const matchPolicy = result.find((policy) => {
      return policy.name == POLICY_NAME;
    });
    expect(matchPolicy).not.toBeDefined();
  });
});
