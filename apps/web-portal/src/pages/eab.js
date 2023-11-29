const { expect, chromium } = require("@playwright/test");
const { RadioButton } = require("../components/common");
const os = require("os");
/**
 * @module EAB
 */

exports.EAB = class EAB {
  constructor(page) {
    this.page = page;
    this.appLauncher =
      "xpath=//*[contains(@class, 'MuiGrid-item') and .//*[normalize-space()='App Launcher']]";
    this.customDomain = new RadioButton(this.page, "Custom Domain");
  }

  /**
   * check current supported OS for Mammoth Browser
   * @method
   * @name runOnlySupportedPlatform
   *
   */

  static runOnlySupportedPlatform(test, supportList) {
    test.skip(
      !supportList.includes(os.platform()),
      `This test support ${supportList.toString()} platforms`
    );
  }
  static async getAppSessionPage(context = 0, page = 0) {
    return this.getContext(
      process.env.MAMMOTH_BROWSER_APP_SESSION_PORT,
      context,
      page
    );
  }

  static async getInternetSessionPage(context = 0, page = 0) {
    return this.getContext(
      process.env.MAMMOTH_BROWSER_INTERNET_SESSION_PORT,
      context,
      page
    );
  }

  /**
   * to connect opening browser and return a page for playwright;
   * @method getContext
   *
   * @param {number} port - debugging port for opening browser
   * @param {number} context - context index of a browser
   * @param {number} page - page index of a browser window
   */

  static async getContext(port, context, page) {
    let browser;
    await expect
      .poll(
        async () => {
          try {
            browser = await chromium.connectOverCDP(
              `https://127.0.0.1:${port}`
            );
            const browserContext = browser.contexts()[context];
            const eabPage = browserContext.pages()[page];
            return eabPage;
          } catch (e) {
            if (e.toString().includes("ECONNREFUSED")) return undefined;
          }
        },
        {
          message: `connection https://127.0.0.1:${port} is not estiblished in ${process.env.LONG_TIMEOUT}`,
          timeout: parseInt(process.env.LONG_TIMEOUT) * 2,
        }
      )
      .toBeDefined();
    const browserContext = browser.contexts()[context];
    const eabPage = browserContext.pages()[page];
    return { browserContext, eabPage };
  }

  static async getLoginSessionPage(context = 0, page = 0) {
    return this.getContext(process.env.UNITY_LOGIN_PORT, context, page);
  }

  async goToLoginPage(customDomain) {
    if (customDomain) await this.customDomain.checkAndFill(customDomain);
    await this.clickContinueButton();
  }

  async clickContinueButton() {
    await this.page
      .locator("//button[contains(normalize-space(), 'Continue')]")
      .click();
  }

  async clickApp(appName, context = this.appLauncher) {
    const appSessionPage = await this.getAppSessionPage();
    const pagePromise = appSessionPage.context.waitForEvent("page");
    await appSessionPage.page
      .locator(
        `${context}//*[normalize-space()='${appName}' and not(child::*)]`
      )
      .click();
    return await pagePromise;
  }
};
