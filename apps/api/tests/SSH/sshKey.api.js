const { test, expect } = require("../../src/fixtures/apiSetup");
const { SSHKeyAPI } = require("../../src/sshKey");
test.describe.configure({ mode: "serial" });

const SSH_KEY_NAME = "Automation_SSH_KEY";
const ALGORITHM = "rsa-2048";

let sshKeyAPI = new SSHKeyAPI();
test.beforeAll(async () => {
  await sshKeyAPI.init(process.env.GRAPHQL_API);
});

test.afterAll(async () => {
  await sshKeyAPI.deleteSshKeyEntry(SSH_KEY_NAME);
});

test.describe("SSH Key API testing", () => {
  test("generateKeyPair @C5811", async () => {
    let result = await sshKeyAPI.generateKeyPair(ALGORITHM);
    expect(result.algorithm).toEqual(ALGORITHM);
    expect(result.publicKey).toBeDefined();
  });

  test("createSshKeyEntry @C5812", async () => {
    let result = await sshKeyAPI.createSshKeyEntry(
      SSH_KEY_NAME,
      ALGORITHM
    );
    expect(result.insertSshKeyEntry.id).toBeDefined();
    expect(result.insertSshKeyEntry.name).toEqual(SSH_KEY_NAME);
    expect(result.insertSshKeyEntry.user).toEqual(process.env.ADMIN_USERNAME);
    expect(result.insertSshKeyEntry.publicKey).toBeDefined();
    expect(result.insertSshKeyEntry.privatekey).not.toBeDefined();
    expect(result.insertSshKeyEntry.algorithm).toEqual(ALGORITHM);
  });
  test("listSshKeyEntrys @C5813", async () => {
    let sshKeyEntries = await sshKeyAPI.listSshKeyEntrys();
    for (let i = 0; i < sshKeyEntries.length; i += 1) {
      if (sshKeyEntries[i].name == SSH_KEY_NAME) {
        expect(sshKeyEntries[i].id).toBeDefined();
        expect(sshKeyEntries[i].name).toEqual(SSH_KEY_NAME);
        expect(sshKeyEntries[i].user).toEqual(process.env.ADMIN_USERNAME);
        expect(sshKeyEntries[i].publicKey).toBeDefined();
        expect(sshKeyEntries[i].privatekey).not.toBeDefined();
        expect(sshKeyEntries[i].algorithm).toEqual(ALGORITHM);
        return;
      }
    }
    test.fail(`${SSH_KEY_NAME} should be found`);
  });
  test("deleteSshKeyEntry @C5814", async () => {
    await sshKeyAPI.deleteSshKeyEntry(SSH_KEY_NAME);
    let sshKeyEntries = await sshKeyAPI.listSshKeyEntrys();
    for (let i = 0; i < sshKeyEntries.length; i += 1) {
      if (sshKeyEntries == SSH_KEY_NAME) {
        test.fail(`${SSH_KEY_NAME} should be deleted`);
      }
    }
  });
});
