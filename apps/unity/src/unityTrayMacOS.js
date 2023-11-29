const { UnityTray } = require("./unityTray");
const { remote } = require("webdriverio");
const { homedir } = require("os");
const fs = require("fs");
const userHomeDir = homedir();
const { expect } = require("@playwright/test");
const applescript = require("applescript");

exports.UnityTrayMacOS = class UnityTrayMacOS extends UnityTray {
  static capabilities = {
    path: "/wd/hub",
    outputDir: "out",
    hostname: process.env.APPIUM_HOST,
    port: parseInt(process.env.MAMMOTH_BROWSER_PORT),
    capabilities: {
      "platformName": "mac",
      "appium:automationName": "mac2",
      "appium:bundleId": "com.mammothcyber.browser",
      "appium:showServerLogs": true,
      "appium:environment": {
        MAMMOTH_UTRAY_ENV: process.env.NODE_ENV,
      },
      "appium:arguments": [
        "--args",
        `--remote-debugging-port=${process.env.MAMMOTH_BROWSER_APP_SESSION_PORT}`,
      ],
      "appium:noReset": true,
    },
  };
  constructor(driver) {
    super();
    this.driver = driver;
    this.menuBar = "//XCUIElementTypeMenuBar";
    this.unityLauncher =
      "//XCUIElementTypeApplication[contains(@title, 'mammoth-unity')]";
    this.MMC =
      "//XCUIElementTypeApplication[contains(@title, 'Mammoth Cyber')]";
    this.menu = "//XCUIElementTypeMenuItem";
    // TODO modify path after supporting running on prod
    this.AUTH_PATH = `${userHomeDir}/Library/Application\ Support/Mammoth_${process.env.NODE_ENV.toUpperCase()}/Browser/credentials.json`;
    this.FOLDER_PATH = `${userHomeDir}/Library/Application\ Support/Mammoth_${process.env.NODE_ENV.toUpperCase()}`;
  }

  static async initialUnityTray() {
    const unityTrayDriver = await remote(UnityTrayMacOS.capabilities);
    return new UnityTrayMacOS(unityTrayDriver);
  }

  async getAllMenus() {
    const menus = await this.driver.executeScript("macos: appleScript", [
      {
        script: `
    set menuList to {}
    tell application "System Events"
      set allUIElements to menu items of menu 1 of menu bar item 1 of menu bar 2 of application process "mammoth-unity"
      repeat with anElement in allUIElements
        set menuItemName to title of anElement
        set end of menuList to menuItemName
      end repeat
    end tell
    return menuList
    `,
      },
    ]);
    return menus.split(",");
  }

  async clickMammothBrowserIcon() {
    await this.driver.waitUntil(async () => {
      try {
        await this.driver.executeScript("macos: appleScript", [
          {
            script: `
          tell application "System Events"
            click menu bar item 1 of menu bar 2 of application process \"mammoth-unity\"
          end tell
        `,
            timeout: parseInt(process.env.LONG_TIMEOUT),
          },
        ]);
        return true;
      } catch (error) {
        if (error.toString().includes("Can’t get application process 'mammoth-unity'")) {
          return false;
        } else {
          throw error;
        }
      }
    }, { timeout: parseInt(process.env.LONG_TIMEOUT), interval: parseInt(process.env.SHORT_TIMEOUT) });
    await this.driver.executeScript("macos: appleScript", [
      {
        script: `
      tell application "System Events"
        click menu bar item 1 of menu bar 2 of application process \"mammoth-unity\"
      end tell
    `,
        timeout: parseInt(process.env.LONG_TIMEOUT),
      },
    ]);
  }

  async findMenuItem(menuName) {
    return await this.driver.findElement(
      "xpath",
      `//XCUIElementTypeMenuItem[contains(@title, "${menuName}")]`,
    );
  }

  async getLoginStatus() {
    const menus = await this.getAllMenus();
    const loginStatus = menus.find((menu) => {
      return menu.includes("Status");
    });
    return loginStatus;
  }

  /**
   * @name closeApp
   * For forcing refresh the menu on mammoth-unity
   * For testing session exist after re-open without login
   */

  async closeApp() {
    await this.launchApp();
    await this.clickMenuItem("Quit");
    // Fixed timeout after closing Mammoth Cyber, process should be killed after 5s
    await new Promise(function (resolve) {
      setTimeout(resolve, 5000);
    });
  }
  /**
   * @name activateApp
   * Open the app after closing the app
   */
  async activateApp() {
    /*
    "this.driver.executeScript" does not work with following script
    Use thrid party library "applescript" to replace
    */
    const script = `
    tell application "System Events"
      do shell script "MAMMOTH_UTRAY_ENV=qa open -a 'Mammoth Browser'"
    end tell`;
    applescript.execString(script, (err, rtn) => {
      if (err) {
        throw err;
      }
    });
  }

  async mouseOver(menu) {
    let menuElement;
    await this.driver.waitUntil(async () => {
      menuElement = await this.findMenuItem(menu);
      const inEnabled = await this.driver.isElementEnabled(menuElement.ELEMENT);
      return inEnabled, { timeout: parseInt(process.env.LONG_TIMEOUT) };
    });
    await this.driver.executeScript("macos: hover", [
      { elementId: menuElement.ELEMENT },
    ]);
  }

  async clickMenuItem(...menus) {
    let levelOfSubMenuScript = "of menu 1 of menu bar 2";
    await expect
      .poll(
        async () => {
          try {
            for (let i = 0; i < menus.length; i++) {
              const subMenuText = await this.driver.executeScript(
                "macos: appleScript",
                [
                  {
                    script: `
          tell application "System Events"
            set subMenu to menu items ${levelOfSubMenuScript} of application process \"mammoth-unity\" whose name contains \"${menus[i]}\"
            set subMenuText to name of first item in subMenu
            click first item in subMenu
          end tell
          return subMenuText
        `,
                  },
                ],
              );
              levelOfSubMenuScript =
                `of menu 1 of menu item "${subMenuText.trim()}"` +
                levelOfSubMenuScript;
            }
          } catch (e) {
            if (e.toString().includes("Can’t get item 1")) {
              return false;
            } else {
              throw e;
            }
          }
          return true;
        },
        {
          message: `error "No menu items containing '${menus}' found."`,
          timeout: parseInt(process.env.LONG_TIMEOUT),
        },
      )
      .toBeTruthy();
  }
  async deleteSSHConfig() {
    if (fs.existsSync(this.sshConfigPath)) {
      fs.unlinkSync(this.sshConfigPath);
    }
  }

  async waitUntilSSHHostIsCopied(appName) {
    let content = undefined;
    await this.driver.waitUntil(
      async () => {
        content = fs.readFileSync(this.sshConfigPath, { encoding: "utf8" });
        return content.includes(appName.toLowerCase());
      },
      { timeout: parseInt(process.env.SHORT_TIMEOUT) },
    );
    await this.waitUntilClipboardContain(appName);
  }

  async waitUntilClipboardContain(appName) {
    await this.driver.waitUntil(
      async () => {
        const clipboardText = await this.driver.executeScript(
          "macos: appleScript",
          [
            {
              script: `
              tell application \"System Events\" to get the clipboard as text
          `,
            },
          ],
        );
        return clipboardText.includes(appName.toLowerCase());
      },
      { timeout: parseInt(process.env.SHORT_TIMEOUT) },
    );
  }
};
