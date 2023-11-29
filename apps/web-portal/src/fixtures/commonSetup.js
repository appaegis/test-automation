const base = require("@playwright/test");
const { Login } = require("../pages/login");
const fs = require("fs");
const { Sidebar } = require("../pages/sidebar");

/**
 * common function
 * @module commonSetup
 */

exports.test = base.test.extend({
  context: async ({ context }, use) => {
    let sessionStorage = JSON.parse(fs.readFileSync("./session.json", "utf-8"));

    sessionStorage = JSON.parse(sessionStorage);
    await context.addInitScript((storage) => {
      for (const [key, value] of Object.entries(storage)) {
        console.log(key);
        window.sessionStorage.setItem(key, value);
      }
    }, sessionStorage);
    await use(context);
  },
  page: async ({ browser, page }, use) => {
    if (process.env.DEBUG) {
      browser = await base.chromium.connectOverCDP("http://localhost:9222/");
      const defaultContext = browser.contexts()[0];
      page = defaultContext.pages()[0];
    }
    await use(page);
  },
  sideBar: async ({ page }, use) => {
    const sideBar = new Sidebar(page);
    await use(sideBar);
  },

  waitForSpinnerLoaded: async ({ page }, use) => {
    async function waitForloading() {
      await base.expect
        .poll(
          async () => {
            return await page
              .locator("xpath=//*[contains(@class, 'spinner')]")
              .count();
          },
          {
            message: "make sure page is loaded",
            timeout: parseInt(process.env.LONG_TIMEOUT),
          }
        )
        .toEqual(0);
    }
    use(waitForloading);
  },
  delay: async ({}, use) => {
    function delay(delayTime) {
      return new Promise(function (resolve) {
        setTimeout(resolve, delayTime);
      });
    }
    use(delay);
  },
  /**
   * screenshot whole screent
   * @method
   * @name takeScreenShot
   * @param {object} driver - a remote webdriverio object.
   * @param {string} fileName - the screenshot file name, default name is screenShot_${UUID}
   */
  takeScreenShot: async ({}, use) => {
    use(async (driver, fileName) => {
      const name = fileName
        ? fileName
        : `screenShot_${Math.random().toString(36).slice(-6)}`;
      const clipboardText = await driver.executeScript(
        "macos: screenshots",
        []
      );
      const file = base.test.info().outputPath(`${name}.png`);
      const firstKey = Object.keys(clipboardText)[0];
      await fs.promises.writeFile(
        file,
        Buffer.from(clipboardText[firstKey].payload, "base64")
      );
      await base.test.info().attach(name, { path: file });
    });
  },
});
exports.expect = base.expect;
