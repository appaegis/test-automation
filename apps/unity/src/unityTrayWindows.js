const { UnityTray } = require("./unityTray");
const { remote } = require("webdriverio");
const { homedir } = require("os");
const userDir = homedir();

/**
 * Using appium WinAppDriver to interact with Windows
 * @module UnityTrayWindows
 */
exports.UnityTrayWindows = class UnityTrayWindows extends UnityTray {
  static capabilities = {
    outputDir: "out",
    path: "/wd/hub",
    hostname: process.env.APPIUM_HOST,
    port: parseInt(process.env.MAMMOTH_BROWSER_PORT),
    capabilities: {
      platformName: "Windows",
      "appium:automationName": "windows",
      "appium:app":
        `${userDir}\\AppData\\Local\\Mammoth_${process.env.NODE_ENV.toUpperCase()}\\Applications\\mammoth-unity.exe`.replace(
          /\\\\/g,
          "\\"
        ),
      "appium:createSessionTimeout": 1000,
    },
  };

  constructor(driver) {
    super();
    this.driver = driver;
    this.menu = "//Menu[@Name='Context']//MenuItem";
    // TODO modify path after supporting running on prod;
    this.AUTH_PATH = `${userDir}\\AppData\\Local\\Mammoth_${process.env.NODE_ENV.toUpperCase()}\\Browser\\credentials.json`;
    this.FOLDER_PATH = `${userDir}\\AppData\\Local\\Mammoth_${process.env.NODE_ENV.toUpperCase()}`;
  }

  /**
   * The way we initial driver for mammoth browser windows testing would be like:
   * 1. activate Mammoth Browser => meet process id keep changing error
   * 2. catch error, then use "Root" as our target app instead of using Mammoth Browser
   * so the desktop will be the root, not "mammoth browser"
   * @method
   * @name initialUnityTray
   */

  static async initialUnityTray() {
    let unityTrayDriver;
    const root = Object.assign({}, UnityTrayWindows.capabilities);
    root["capabilities"] = {
      platformName: "Windows",
      "appium:automationName": "windows",
      "appium:app": "Root",
      "appium:createSessionTimeout": 2000,
    };
    try {
      await remote(UnityTrayWindows.capabilities);
    } catch (e) {
      if (
        !String(e).includes(
          "Failed to locate opened application window with appId"
        )
      ) {
        console.error(e);
      }
    }
    // Change the application to Root from Unity once get the error
    unityTrayDriver = await remote(root);
    return new UnityTrayWindows(unityTrayDriver);
  }

  async findMenuItem(menuName, locateWay = "name") {
    return await this.driver.findElement(locateWay, menuName);
  }

  async clickMammothBrowserIcon() {
    const taskBar = await this.findMenuItem("Taskbar");
    const subMenu = await this.driver.findElementFromElement(
      taskBar.ELEMENT,
      "xpath",
      "//*[contains(@Name, 'Mammoth Browser')]"
    );
    await this.driver.elementClick(subMenu.ELEMENT);
  }

  async getLoginStatus() {
    const menu = await this.findMenuItem("Context");
    const subMenu = await this.driver.findElementFromElement(
      menu.ELEMENT,
      "xpath",
      "//MenuItem"
    );
    const loginStatus = await this.driver.getElementText(subMenu.ELEMENT);
    return loginStatus;
  }

  async clickMenuItem(...menus) {
    for (let i = 0; i < menus.length; i++) {
      const element = await this.findMenuItem(menus[i]);
      await this.driver.elementClick(element.ELEMENT);
    }
  }
};
