const { test, expect } = require("../../src/fixtures/apiSetup");
const { SSHProfileAPI } = require("../../src/sshProfile");
const { SSHRuleAPI } = require("../../src/sshRule");
test.describe.configure({ mode: "serial" });

const SSH_PROFILE_RULE_NAME = "Automation_Profile_RULE_3769";
const SSH_PROFILE_NAME = "Automation_Profile_3769";
const SSH_PROFILE_NAME_EDIT = `${SSH_PROFILE_NAME}_edit`;
const SSH_RULE_NAME = "Automation_Rule_3769";

let sshProfileAPI = new SSHProfileAPI();
let sshRuleAPI = new SSHRuleAPI();
test.beforeAll(async () => {
  await sshProfileAPI.init(process.env.GRAPHQL_API);
  await sshRuleAPI.init(process.env.GRAPHQL_API);
  await sshRuleAPI.createSSHAuthRule(SSH_RULE_NAME);
});

test.afterAll(async () => {
  await sshProfileAPI.deleteSSHAuthProfileRule(SSH_PROFILE_RULE_NAME);
  await sshProfileAPI.deleteSSHAuthProfile(SSH_PROFILE_NAME);
  let a = await sshRuleAPI.deleteSSHAuthRule(SSH_RULE_NAME);
});

test.describe("SSH Profle API testing", () => {
  test("createSSHAuthProfile @C5798", async () => {
    let sshProfile = await sshProfileAPI.createSSHAuthProfile(SSH_PROFILE_NAME);
    expect(sshProfile.createSSHAuthProfile.id).toBeDefined();
    expect(sshProfile.createSSHAuthProfile.name).toEqual(SSH_PROFILE_NAME);
    expect(sshProfile.createSSHAuthProfile.rules.items).toHaveLength(0);
  });

  test("listSSHAuthProfiles @C5787", async () => {
    let sshProfiles = await sshProfileAPI.listSSHAuthProfiles();
    for (let i = 0; i < sshProfiles.length; i += 1) {
      if (sshProfiles[i].name == SSH_PROFILE_NAME) {
        expect(sshProfiles[i].id).toBeDefined();
        expect(sshProfiles[i].name).toEqual(SSH_PROFILE_NAME);
        expect(sshProfiles[i].rules.items).toHaveLength(0);
        return;
      }
    }
    test.fail(`${SSH_PROFILE_NAME} should be found`);
  });

  test("updateSSHAuthProfile @C5805", async () => {
    await sshProfileAPI.updateSSHAuthProfile(
      SSH_PROFILE_NAME,
      SSH_PROFILE_NAME_EDIT
    );
    let sshProfiles = await sshProfileAPI.listSSHAuthProfiles();
    for (let i = 0; i < sshProfiles.length; i += 1) {
      if (sshProfiles[i].name == SSH_PROFILE_NAME_EDIT) {
        expect(sshProfiles[i].id).toBeDefined();
        expect(sshProfiles[i].name).toEqual(SSH_PROFILE_NAME_EDIT);
        expect(sshProfiles[i].rules.items).toHaveLength(0);
        await sshProfileAPI.updateSSHAuthProfile(
          SSH_PROFILE_NAME_EDIT,
          SSH_PROFILE_NAME
        );
        return;
      }
    }
    test.fail(`${SSH_PROFILE_NAME_EDIT} should be found`);
  });

  test("deleteSSHAuthProfile @C5799", async () => {
    await sshProfileAPI.deleteSSHAuthProfile(SSH_PROFILE_NAME);
    let sshProfiles = await sshProfileAPI.listSSHAuthProfiles();
    for (let i = 0; i < sshProfiles.length; i += 1) {
      if (sshProfiles[i].name == SSH_PROFILE_NAME) {
        test.fail(`${SSH_PROFILE_NAME} should be deleted`);
      }
    }
  });

  test("createSshAuthProfileRule @C5790", async () => {
    let sshProfileRule = await sshProfileAPI.createSshAuthProfileRule(
      SSH_PROFILE_RULE_NAME,
      SSH_RULE_NAME
    );
    expect(sshProfileRule.createSSHAuthProfileRule.id).toBeDefined();
    expect(sshProfileRule.createSSHAuthProfileRule.rule).toBeDefined();
  });

  test("listSSHAuthProfileRules @C5800", async () => {
    let sshProfileRules = await sshProfileAPI.listSSHAuthProfileRules();
    for (let i = 0; i < sshProfileRules.length; i += 1) {
      if (sshProfileRules[i].rule.name == SSH_RULE_NAME) {
        expect(sshProfileRules[i].id).toBeDefined();
        expect(sshProfileRules[i].rule).toBeDefined();
        return;
      }
    }
    test.fail(`${SSH_PROFILE_RULE_NAME} should be found`);
  });

  test("deleteSSHAuthProfileRule @C5801", async () => {
    await sshProfileAPI.deleteSSHAuthProfileRule(SSH_PROFILE_RULE_NAME);
    let sshProfileRules = await sshProfileAPI.listSSHAuthProfileRules();
    for (let i = 0; i < sshProfileRules.length; i += 1) {
      if (sshProfileRules[i].name == SSH_PROFILE_RULE_NAME) {
        test.fail(`${SSH_PROFILE_RULE_NAME} should be deleted`);
      }
    }
  });
});
