const { test, expect } = require("@playwright/test");
const { SSHRuleAPI } = require("../../src/sshRule");
const { UserAPI } = require("../../src/user");
test.describe.configure({ mode: "serial" });

const userAPI = new UserAPI();

const AUTH_RULE_NAME = "Automation_Rule_directive_auth_testing";
const EDIT_NAME = `${AUTH_RULE_NAME}_Edit`;
const USER_EMAIL = "appaegisqa+c5825@gmail.com";

let sshRuleAPI;
test.beforeAll(async () => {
  await userAPI.init();
  await userAPI.createUser([USER_EMAIL], "user");
  sshRuleAPI = new SSHRuleAPI();
  await sshRuleAPI.init(process.env.GRAPHQL_API);
  await sshRuleAPI.createSSHAuthRule(AUTH_RULE_NAME);
  await sshRuleAPI.init(process.env.GRAPHQL_API, USER_EMAIL);
});

test.afterAll(async () => {
  await sshRuleAPI.init(process.env.GRAPHQL_API);
  await userAPI.init(process.env.GRAPHQL_API);
  await userAPI.deleteUser(USER_EMAIL);
  await sshRuleAPI.deleteSSHAuthRule(AUTH_RULE_NAME);
});

test.describe("auth directive should stric different level user behvior @5821", () => {
  test("user operation should allow get", async () => {
    const getResult = await sshRuleAPI.getSSHAuthRule(AUTH_RULE_NAME);
    expect(getResult.getSSHAuthRule.id).toBeDefined();
    const listResult = await sshRuleAPI.listSSHAuthRules();
    expect(listResult[0].id).toBeDefined();
  });
  test("user operation should not allow create", async () => {
    let errorText = undefined;
    try {
      await sshRuleAPI.createSSHAuthRule(AUTH_RULE_NAME);
    } catch (error) {
      errorText = String(error);
    }
    expect(errorText).toContain("Unauthorized to perform");
  });

  test("user operation should not allow update", async () => {
    let errorText = undefined;
    try {
      await sshRuleAPI.updateSSHAuthRule(AUTH_RULE_NAME, EDIT_NAME);
    } catch (error) {
      errorText = String(error);
    }
    expect(errorText).toContain("Unauthorized to perform");
  });

  test("user operation should not allow delete", async () => {
    let errorText = undefined;
    try {
      await sshRuleAPI.deleteSSHAuthRule(AUTH_RULE_NAME);
    } catch (error) {
      errorText = String(error);
    }
    expect(errorText).toContain("Unauthorized to perform");
  });
});
