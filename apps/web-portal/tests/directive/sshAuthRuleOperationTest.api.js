const { test, expect } = require("../../src/fixtures/apiSetup");
const { SSHRuleAPI } = require("../../src/library/apiRequest/sshRule");
test.describe.configure({ mode: "serial" });

let sshRuleAPI = new SSHRuleAPI();
const AUTH_RULE_NAME = "Automation_Rule_directive_model_testing";
const EDIT_NAME = `${AUTH_RULE_NAME}_Edit`;

test.beforeAll(async () => {
  await sshRuleAPI.init(process.env.GRAPHQL_API);
});

test.afterAll(async () => {
  await sshRuleAPI.deleteSSHAuthRule(AUTH_RULE_NAME);
  await sshRuleAPI.deleteSSHAuthRule(EDIT_NAME);
});

test.describe("model directive should generates 5 different operations @5825, auth admin @5821", () => {
  test("createSSHAuthRule", async () => {
    const result = await sshRuleAPI.createSSHAuthRule(AUTH_RULE_NAME);
    expect(result.createSSHAuthRule.id, JSON.stringify(result)).toBeDefined();
  });

  test("model directive should generates 5 different operations @5825", async () => {
    const result = await sshRuleAPI.getSSHAuthRule(AUTH_RULE_NAME);
    expect(result.getSSHAuthRule.id, JSON.stringify(result) ).toBeDefined();
  });

  test("listSSHAuthRules", async () => {
    const result = await sshRuleAPI.listSSHAuthRules();
    expect(result[0].id, JSON.stringify(result)).toBeDefined();
  });

  test("updateSSHAuthRule", async () => {
    const result = await sshRuleAPI.updateSSHAuthRule(
      AUTH_RULE_NAME,
      EDIT_NAME
    );
    expect(result.updateSSHAuthRule.id, JSON.stringify(result)).toBeDefined();
  });

  test("deleteSSHAuthRule", async () => {
    const result = await sshRuleAPI.deleteSSHAuthRule(EDIT_NAME);
    expect(result.deleteSSHAuthRule.id, JSON.stringify(result)).toBeDefined();
  });
});
