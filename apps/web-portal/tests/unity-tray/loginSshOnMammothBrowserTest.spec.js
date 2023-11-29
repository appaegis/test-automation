const { test, expect } = require("../../src/fixtures/mammothBrowserFixture");
const { EC2 } = require("../../src/library/aws/ec2Client.js");
const { Ssh } = require("../../src/pages/App Launcher/ssh");
const { exec, spawnSync } = require("child_process");
const { EAB } = require("../../src/pages/eab");
const { remote } = require("webdriverio");

EAB.runOnlySupportedPlatform(test, ["darwin"]);
let publicIpAddress;
const APPLICATION_NAME = "C8076_CA_SSH";

test.setTimeout(180 * 1000);

test.use({
  ssh: async ({ page }, use) => {
    use(new Ssh(page));
  },
});
let terminalDriver = undefined;

test.beforeEach(async ({ ssh }) => {
  exec(
    `appium -p ${process.env.APPIUM_FOR_TERMINAL_PORT} --base-path=/wd/hub --relaxed-security --log ./terminal.log`,
  );
  await ssh.goto();
  const ec2Client = new EC2([process.env.qa_test_public_ssh_1]);
  await ec2Client.startEC2Instance();
  const data = await ec2Client.getEC2Detailed();
  publicIpAddress = data.Reservations[0].Instances[0].PublicIpAddress;
  await ssh.createCAApplication({
    appName: APPLICATION_NAME,
    sshCertificateAuthority: "SSH CA:  qa-test-public-ssh-1",
    publicIpAddress: publicIpAddress,
    userName: "ubuntu",
  });
});

test.afterEach(async ({ ssh, unityTray }) => {
  await resetTerminal(terminalDriver);
  await terminalDriver.deleteSession();
  const result = spawnSync("pkill", [
    "-f",
    `appium.*-p ${process.env.APPIUM_FOR_TERMINAL_PORT}`,
  ]);
  if (result.status === 0) {
    console.log(
      `Appium on port ${process.env.APPIUM_FOR_TERMINAL_PORT} has been killed.`,
    );
  } else {
    console.error(
      `Failed to kill Appium on port ${process.env.APPIUM_FOR_TERMINAL_PORT}.`,
    );
  }
  await unityTray.deleteSSHConfig();
  await ssh.goto();
  await ssh.inputSearch(APPLICATION_NAME);
  await ssh.deleteApp(APPLICATION_NAME);
});

test.describe("Connect ssh with CA through unity @8076 @Sanity @Mammoth Browser", () => {
  test("Login should be successful", async ({ unityTray, takeScreenShot }) => {
    try {
      // We're using sharing login session among Mammoth Browser tests
      // In order to force refresh SSH menu for mammoth-unity, we need to restart the menu.
      await unityTray.closeApp();
      await unityTray.activateApp();
      await unityTray.launchApp();
      const loginStatus = await unityTray.getLoginStatus();
      expect(
        loginStatus.includes("Ready"),
        "Status Should be 'Ready' after login",
      ).toBeTruthy();
      await unityTray.clickMenuItem("SSH", `unity-${APPLICATION_NAME}`);
      await unityTray.waitUntilSSHHostIsCopied(`unity-${APPLICATION_NAME}`);
      await openTerminal();
      await pasteCopiedSSHCommand();
      await verifySSHConnectionIsWorking();
    } catch (e) {
      await takeScreenShot(unityTray.driver);
      throw Error(e);
    }
  });
});

async function pasteCopiedSSHCommand() {
  await terminalDriver.executeScript("macos: keys", [
    { keys: [{ key: "v", modifierFlags: 1 << 4 }] },
  ]);
  const acceptNewHost = " -oStrictHostKeyChecking=accept-new".split("");
  await terminalDriver.executeScript("macos: keys", [{ keys: acceptNewHost }]);
  await terminalDriver.executeScript("macos: keys", [
    { keys: ["XCUIKeyboardKeyReturn"] },
  ]);
}

async function verifySSHConnectionIsWorking() {
  await terminalDriver.waitUntil(
    async () => {
      const terminal = await terminalDriver.findElement(
        "xpath",
        "//XCUIElementTypeTextView",
      );
      const result = await terminalDriver.getElementText(terminal.ELEMENT);
      const isConnected = result.includes("ubuntu@ip");
      return isConnected;
    },
    { timeout: parseInt(process.env.LONG_TIMEOUT) },
  );
}

async function openTerminal() {
  const terminalCaps = JSON.parse(process.env.terminalCapabilities);
  terminalDriver = await remote(terminalCaps);
  return terminalDriver;
}

async function resetTerminal(terminalDriver) {
  await terminalDriver.executeScript("macos: keys", [
    { keys: ["e", "x", "i", "t"] },
  ]);
  await terminalDriver.executeScript("macos: keys", [
    { keys: ["XCUIKeyboardKeyReturn"] },
  ]);
  await terminalDriver.executeScript("macos: keys", [
    { keys: [{ key: "k", modifierFlags: 1 << 4 }] },
  ]);
  await terminalDriver.waitUntil(
    async () => {
      const terminal = await terminalDriver.findElement(
        "xpath",
        "//XCUIElementTypeTextView",
      );
      const result = await terminalDriver.getElementText(terminal.ELEMENT);
      return !result.includes("ubuntu@ip");
    },
    { timeout: parseInt(process.env.LONG_TIMEOUT) },
  );
}
