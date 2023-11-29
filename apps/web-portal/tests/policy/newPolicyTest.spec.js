const { test, expect } = require("../../src/fixtures/commonSetup");
const { Policies } = require("../../src/pages/policies");
const { PolicyAPI } = require("../../src/library/apiRequest/policy");

const ACTIONS = ["Copy", "Download", "Upload", "Paste", "Screenshot"];

test.use({
  policies: async ({ page }, use) => {
    use(new Policies(page));
  },
  policyAPI: async ({}, use) => {
    const policyAPI = new PolicyAPI();
    await policyAPI.init(process.env.GRAPHQL_API);
    use(policyAPI);
  },
});

test.afterAll(async({policyAPI})=>{
    for (const action of ACTIONS) {
        let policyName = `testWithPolicy_${action}`;
        await policyAPI.deletePolicy(policyName)
    }
})

for (const action of ACTIONS) {
  let policyName = `testWithPolicy_${action}`;
  test(`add policy with ${action} @C41`, async ({ policies }) => {
      await policies.goto();
      await policies.createPolicy(policyName, `Only ${action}`, [
        {
          groupsAndUsers: [process.env.ADMIN_USERNAME],
          actions: [action],
        },
      ]);
      const row = await policies.policyTable.getRow(policyName);
      const policyNameAndDescription = await row.getValueByHeader("Policy");
      expect(policyNameAndDescription).toContain(policyName);
      expect(policyNameAndDescription).toContain(`Only ${action}`);
  });
}
