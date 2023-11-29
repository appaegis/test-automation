// @ts-check

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
//default env is qa
if (!process.env.NODE_ENV) process.env.NODE_ENV = "qa";
require("dotenv").config({ path: `./config/.env.${process.env.NODE_ENV}` });

const TEST_DEFAULT_TIMEOUT = 90000;
const EXPECT_DEFAULT_TIMEOUT = 5000;

/**
 * @see https://playwright.dev/docs/test-configuration
 * @type {import('@playwright/test').PlaywrightTestConfig}
 */
const config = {
  testDir: "./tests",
  /* Maximum time one test can run for. */
  globalSetup: require.resolve("./src/fixtures/globalSteup.js"),
  timeout: TEST_DEFAULT_TIMEOUT,
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: EXPECT_DEFAULT_TIMEOUT,
  },
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html", { outputFolder: "out/test-results", open: "never" }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Maximum time each action such as `click()` can take. Defaults to 0 (no limit). */
    actionTimeout: 0,
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: process.env.URL,
    headless: true,
    screenshot: "only-on-failure",
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    { name: "setup", 
      testMatch: /.*\.setup\.js/ 
    },
    {
      name: "e2e testing",
      testMatch: /.*spec.js/,
      use: {
        channel: "chrome",
        video: "retain-on-failure",
      },
      outputDir: "out/e2e-test-results/",
      dependencies: ["setup"],
    },
  ],

  /* Folder for test artifacts such as screenshots, videos, traces, etc. */

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   port: 3000,
  // },
};

module.exports = config;
