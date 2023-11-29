const { test, expect } = require("../../src/fixtures/commonSetup");
const { RDP } = require("../../src/pages/App Launcher/rdp");
const { EC2 } = require("../../src/library/aws/ec2Client.js");
const { Policies } = require("../../src/pages/policies");
const fs = require("fs");
const path = require("path");

const KEY_NAME = "C1344_AUTOMATION";
const WINDOWS_FREE_TIER = "ami-0d862f7ba344bc551";
const PRIVATE_KEY_PATH = "src/fixtures/C1344.pem";
const APPLICATION_NAME = "C1344_RDP_APP";
const POLICY_NAME = "C1344_RDP_Policy";
const FILE_NAME = "testUpload.txt";
let publicIpAddress;
let windowsTab;
let windowsEC2;
let password;

test.setTimeout(15 * 60 * 1000);
// As https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#getPasswordData-property recommended, set timeout up to 15 min

test.describe.configure({ mode: "serial" });

test.use({
  rdp: async ({ page }, use) => {
    use(new RDP(page));
  },
  policies: async ({ page }, use) => {
    use(new Policies(page));
  },
});

test.beforeAll(async ({}) => {
  // As https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#getPasswordData-property recommended, set timeout up to 15 min
  test.setTimeout(15 * 60 * 1000);
  const keypair = await EC2.generateKeyPair();
  fs.writeFileSync(PRIVATE_KEY_PATH, keypair.privateKey);
  await EC2.importKeyPairForEC2(KEY_NAME, keypair.publickKey);
  const ec2Object = {
    imageId: WINDOWS_FREE_TIER,
    deviceName: "C1344_WINDOWS_AUTOMATION",
    keyPairName: KEY_NAME,
    userData: "",
    SecurityGroupIds: ["sg-0fe7e019364b71363"],
  };
  const instanceID = await EC2.launchEC2Instances(ec2Object);

  windowsEC2 = new EC2([instanceID]);
});

test.beforeEach(async ({ rdp, policies }) => {
  await policies.goto();
  await policies.createPolicy(POLICY_NAME, KEY_NAME, [
    {
      groupsAndUsers: [process.env.ADMIN_USERNAME],
      actions: ["Print", "Upload", "Download"],
    },
  ]);
  await rdp.goto();
  const getEC2Detailed = await windowsEC2.getEC2Detailed();
  publicIpAddress = getEC2Detailed.Reservations[0].Instances[0].PublicIpAddress;
  password = await windowsEC2.getPasswordData(PRIVATE_KEY_PATH);
  await rdp.createRDPApplication(
    APPLICATION_NAME,
    "Cloud Services",
    POLICY_NAME,
    publicIpAddress
  );
});

test.afterEach(async ({ policies, rdp }) => {
  await rdp.goto();
  await rdp.deleteApp(APPLICATION_NAME);
  await policies.goto();
  await policies.deletePolicy(POLICY_NAME);
});

test.afterAll(async ({}) => {
  if (fs.existsSync(PRIVATE_KEY_PATH)) fs.unlinkSync(PRIVATE_KEY_PATH);
  await windowsEC2.stopEC2Instance();
  await windowsEC2.terminateEC2Instances();
  await EC2.deleteSshKeyPair(KEY_NAME);
  await windowsTab.close();
});

test.describe("RDP testing @C1344", () => {
  test("RDP connection can be established with public IP", async ({ rdp }) => {
    windowsTab = await rdp.launchRDPApp(
      APPLICATION_NAME,
      "Administrator",
      password
    );
    await expect(
      windowsTab.locator("//*[contains(normalize-space(), 'Client Error')]")
    ).not.toBeVisible({ timeout: parseInt(process.env.NORMAL_TIMEOUT) });
  });

  test("RDP support upload action", async ({ rdp }) => {
    windowsTab = await rdp.launchRDPApp(
      APPLICATION_NAME,
      "Administrator",
      password
    );
    const windowsRDP = new RDP(windowsTab);
    await expect(
      windowsTab.locator("//*[contains(normalize-space(), 'Client Error')]")
    ).not.toBeVisible({ timeout: parseInt(process.env.NORMAL_TIMEOUT) });
    await windowsRDP.uploadFile(
      path.join(__dirname, `../../src/fixtures/${FILE_NAME}`)
    );
    await expect(
      windowsTab.locator("//*[contains(@class, 'loading-bar')]").last()
    ).not.toBeVisible({ timeout: parseInt(process.env.LONG_TIMEOUT) * 2 });
    await expect(
      windowsTab.locator("//*[contains(@class, 'success-icon')]").last()
    ).toBeVisible();
  });

  test("RDP support download action", async ({ rdp }) => {
    windowsTab = await rdp.launchRDPApp(
      APPLICATION_NAME,
      "Administrator",
      password
    );
    const windowsRDP = new RDP(windowsTab);
    await expect(
      windowsTab.locator("//*[contains(normalize-space(), 'Client Error')]")
    ).not.toBeVisible({ timeout: parseInt(process.env.NORMAL_TIMEOUT) });
    await windowsRDP.downloadFile(FILE_NAME);
    await expect(
      windowsTab.locator("//*[contains(@class, 'loading-bar')]").last()
    ).not.toBeVisible({ timeout: parseInt(process.env.LONG_TIMEOUT) * 2 });
    await expect(
      windowsTab.locator("//*[contains(@class, 'success-icon')]").last()
    ).toBeVisible();
  });
});
