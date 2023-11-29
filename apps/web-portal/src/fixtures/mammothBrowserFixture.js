const { test, expect } = require("./commonSetup");
const { Login } = require("../pages/login");
const { UnityTrayMacOS } = require("../library/unity/unityTrayMacOS");
const { UnityTrayWindows } = require("../library/unity/unityTrayWindows");
const { startAppiumServer } = require("../library/unity/appium");
const { EAB } = require("../pages/eab");
const fs = require("fs");
const os = require("os");

/**
 * Import EAB fixture when testing Mammoth Browser;
 * use test.use(mammothBrowserFixture) to inject the fixture;
 * @module mammothBrowserFixture
 */

exports.test = test.extend({
  server: [
    async ({}, use) => {
      const server = await startAppiumServer(
        parseInt(process.env.MAMMOTH_BROWSER_PORT),
        "127.0.0.1",
        true,
        "trace"
      );
      console.log(`server is opened on ${process.env.MAMMOTH_BROWSER_PORT}`);
      await use(server);
      console.log("Appium server is closing...");
      await server.close();
    },
    { scope: "worker", auto: true },
  ],

  unityTray: [
    async ({ server }, use) => {
      const unityTray =
        os.platform == "win32"
          ? await UnityTrayWindows.initialUnityTray()
          : await UnityTrayMacOS.initialUnityTray();
      await use(unityTray);
      console.log("close unityTray...");
      await unityTray.launchApp();
      await unityTray.clickMenuItem("Quit");
    },
    { scope: "worker", auto: true },
  ],
  /**
   * Launch Mammoth Browser and login to App launcher page
   * @method
   * @name loginIntoMammothBrowser
   */
  loginIntoMammothBrowser: [
    async ({ unityTray }, use) => {
      try {
        if (!parseInt(process.env.UDEBUG)) {
          const session = await EAB.getAppSessionPage();
          let EABPage = session.eabPage;
          const eab = new EAB(EABPage);
          await eab.goToLoginPage();
          const login = new Login(EABPage);
          EABPage = await login.loginMammothBrowser();
          await unityTray.waitForStatusIsReady();
        }
      } catch (error) {
        console.error("login Into MammothBrowser failed");
        throw error;
      }
      await use();
      if (fs.existsSync(unityTray.AUTH_PATH) && !parseInt(process.env.UDEBUG)) {
        fs.unlinkSync(unityTray.AUTH_PATH);
        if (os.platform != "win32"){
        fs.rmSync(unityTray.FOLDER_PATH, { recursive: true, force: true });
        }
      }
    },
    { scope: "worker", auto: true },
  ],
});

exports.expect = expect;
