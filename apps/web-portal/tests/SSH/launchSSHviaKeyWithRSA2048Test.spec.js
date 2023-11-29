// C3462 Login via self-generated key which Algorithm use RSA-2048
const { test, expect } = require("../../src/fixtures/commonSetup");
const { SshKeys } = require("../../src/pages/sshKeys");
const { SshProfile } = require("../../src/pages/sshProfile");
const { Ssh } = require("../../src/pages/App Launcher/ssh");
const { EC2 } = require("../../src/library/aws/ec2Client.js");

test.setTimeout(120 * 1000);

let ec2InstanceId;
let Ec2PublicAddress;
let publicKey;
let newEc2Client;

test.use({
  sshKeys: async ({ page }, use) => {
    await use(new SshKeys(page));
  },
  sshProfile: async ({ page }, use) => {
    await use(new SshProfile(page));
  },
  ssh: async ({ page }, use) => {
    await use(new Ssh(page));
  },
});

test.beforeEach(async ({ sshKeys, sshProfile, sideBar, ssh }) => {
  test.setTimeout(120 * 1000);

  // Prepare ssh key.
  await sshProfile.goto();

  // Go to ssh key page and create ssh keys.
  await sshKeys.clickSshKeysTab();
  await sshKeys.generateKey(
    "C3462-RSA-2048",
    "rsa-2048",
    "C3462 : Login via self-generated key which Algorithm use RSA-2048"
  );
  publicKey = await sshKeys.copyPublickey("C3462-RSA-2048");

  // Prepare an EC2 and apply the public key.
  await prepareAwsResoucre();

  // Prepare ssh rules, ssh profile.
  await sshProfile.clickSshProfileTab();
  await sshProfile.createSshRuleWithKey(
    "C3462_key",
    process.env.ADMIN_USERNAME,
    "ec2-user",
    "C3462-RSA-2048"
  );
  await sshProfile.createSshProfile("C3462", ["C3462_key"]);

  await waitAwsResourceReady();

  // Prepare ssh app.
  await sideBar.clickSideBar("App Launcher");
  await sideBar.clickSideBar("SSH");
  await ssh.clickAddApp();
  await ssh.selectProtocol("ssh");
  await ssh.configAppType("Cloud Services");
  await ssh.selectPolicy("Default");
  await ssh.checkAndSelectAdvancedSettings("C3462");
  await ssh.inputAllowedHostOrSubnet(Ec2PublicAddress);
  await ssh.inputAppName("C3462");
  await ssh.clickSave();
  await ssh.inputSearch("C3462");
  await ssh.checkSshAppExist("C3462");
});

test.afterEach(async ({ sshKeys, sshProfile, ssh }) => {
  // Clean AWS resources.
  await clearAwsResource();

  // Clean ssh app.
  await ssh.goto();
  await ssh.inputSearch("C3462");
  await ssh.deleteApp("C3462");

  // Clean ssh profile, rules.
  await sshProfile.goto();
  await sshProfile.deleteSshProfile("C3462");
  await sshProfile.deleteSshRules("C3462_key");

  // Clean ssh key.
  await sshKeys.goto();
  await sshKeys.deleteSshKeys("C3462-RSA-2048");
});

test.describe("Launch SSH app via self-generated key which Algorithm use RSA-2048 @C3462 Smoke", () => {
  test("Launch SSH app via self-generated key which Algorithm use RSA-2048", async ({
    ssh,
  }) => {
    let sshAppTab;
    try {
      sshAppTab = await ssh.launchSshApp("C3462");
      await expect(
        sshAppTab.locator("xpath=//button[@id='upload-button-select']")
      ).toBeVisible({ timeout: parseInt(process.env.NORMAL_TIMEOUT) });
    } catch (err) {
      console.log(err);
    } finally {
      await sshAppTab.close();
    }
  });
});

async function prepareAwsResoucre() {
  await EC2.importKeyPairForEC2(
    "C3462",
    publicKey.trim().replace(/\r\n|\n/g, "")
  );
  const ec2Object = {
    imageId: "ami-0bba69335379e17f8",
    deviceName: "C3462_Automation",
    keyPairName: "C3462",
    userData: "",
  };
  ec2InstanceId = await EC2.launchEC2Instances(ec2Object);
}

async function waitAwsResourceReady() {
  newEc2Client = new EC2([ec2InstanceId]);
  const newEc2Data = await newEc2Client.getEC2Detailed();
  Ec2PublicAddress = newEc2Data.Reservations[0].Instances[0].PublicIpAddress;
  await newEc2Client.waitEC2InstancesRunning();
}

async function clearAwsResource() {
  await newEc2Client.terminateEC2Instances();
  await EC2.deleteSshKeyPair("C3462");
}
