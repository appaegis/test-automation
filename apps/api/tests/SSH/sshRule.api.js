const { test, expect } = require("../../src/fixtures/apiSetup");
const { SSHRuleAPI } = require("../../src/sshRule");
test.describe.configure({ mode: "serial" });

let sshRuleAPI = new SSHRuleAPI();
const AUTH_RULE_NAME = "Automation_Rule_3768";
const EDIT_NAME = `${AUTH_RULE_NAME}_Edit`;

test.beforeAll(async () => {
  await sshRuleAPI.init(process.env.GRAPHQL_API);
});

test.afterAll(async () => {
  await sshRuleAPI.deleteSSHAuthRule(AUTH_RULE_NAME);
  await sshRuleAPI.deleteSSHAuthRule(EDIT_NAME);
});

test.describe("SSH Profile Rules API testing", () => {
  test("createSSHAuthRule @C5786", async () => {
    let result = await sshRuleAPI.createSSHAuthRule(AUTH_RULE_NAME);
    expect(result.createSSHAuthRule.id).toBeDefined();
    expect(result.createSSHAuthRule.name).toEqual(AUTH_RULE_NAME);
    expect(result.createSSHAuthRule.sshAuthMethod).toEqual("password");
    expect(result.createSSHAuthRule.deriveUsernameFromEmail).toBeTruthy();
  });

  test("listSSHAuthRules @C5788", async ({}) => {
    let authRules = await sshRuleAPI.listSSHAuthRules();
    for (let i = 0; i < authRules.length; i += 1) {
      if (authRules[i].name == AUTH_RULE_NAME) {
        expect(authRules[i].name).toEqual(AUTH_RULE_NAME);
        expect(authRules[i].sshAuthMethod).toEqual("password");
        expect(authRules[i].deriveUsernameFromEmail).toBeTruthy();
        return;
      }
    }
    test.fail(`${AUTH_RULE_NAME} should be found`);
  });

  test("updateSSHAuthRule @C5806", async () => {
    let authRule = await sshRuleAPI.updateSSHAuthRule(
      AUTH_RULE_NAME,
      EDIT_NAME
    );
    expect(authRule.updateSSHAuthRule.id).toBeDefined();
    expect(authRule.updateSSHAuthRule.name).toEqual(EDIT_NAME);
    let authRules = await sshRuleAPI.listSSHAuthRules();
    for (let i = 0; i < authRules.length; i += 1) {
      if (authRules[i].name == EDIT_NAME) {
        expect(authRules[i].name).toEqual(EDIT_NAME);
        expect(authRules[i].sshAuthMethod).toEqual("password");
        expect(authRules[i].deriveUsernameFromEmail).toBeTruthy();
        await sshRuleAPI.updateSSHAuthRule(EDIT_NAME, AUTH_RULE_NAME);
        return;
      }
    }
    test.fail(`${EDIT_NAME} should be found`);
  });

  test("deleteSSHAuthRule @C5797", async () => {
    await sshRuleAPI.deleteSSHAuthRule(AUTH_RULE_NAME);
    let authRules = await sshRuleAPI.listSSHAuthRules();
    for (let i = 0; i < authRules.length; i += 1) {
      if (authRules[i].name == AUTH_RULE_NAME) {
        test.fail(`${AUTH_RULE_NAME} should be deleted`);
      }
    }
  });
});
