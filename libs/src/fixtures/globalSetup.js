import { homedir } from "os";
const userHomeDir = homedir();

async function globalSetup() {
  process.env.GRAPHQL_API = `${process.env.MMC_API_ORIGIN}/graphql`;
  process.env.INTRA_REST_API = `${process.env.MMC_API_ORIGIN}/intra/public/api/v1`;
  process.env.APP_SYNC = `${process.env.MMC_API_ORIGIN}/appsync_graphql`;
  process.env.LONG_TIMEOUT = 15000;
  process.env.NORMAL_TIMEOUT = 10000;
  process.env.SHORT_TIMEOUT = 5000;
  process.env.MMC_WEBSITE = "https://www.mammothcyber.com";
  //UNITY_XXX_PORT are defined by delevepers for qa testing, it won't be changed.
  process.env.MAMMOTH_BROWSER_LOGIN_PORT = 19227;
  process.env.MAMMOTH_BROWSER_APP_SESSION_PORT = 19228;
  process.env.MAMMOTH_BROWSER_INTERNET_SESSION_PORT = 19229;
  //UNITY_XXX_PORT are defined by delevepers for qa testing, it won't be changed.
  process.env.APPIUM_HOST = "localhost";
  process.env.MAMMOTH_BROWSER_PORT = 4567;
  process.env.APPIUM_FOR_TERMINAL_PORT = 4724;
  process.env.terminalCapabilities = JSON.stringify({
    path: "/wd/hub",
    outputDir: "out",
    hostname: process.env.APPIUM_HOST,
    port: parseInt(process.env.APPIUM_FOR_TERMINAL_PORT),
    capabilities: {
      platformName: "mac",
      "appium:automationName": "mac2",
      "appium:bundleId": "com.apple.Terminal",
      "appium:showServerLogs": true,
      "appium:systemPort": 10111,
    },
  });
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
  process.env.qa_test_public_ssh_1 = "i-04dd19eeba9ebc70c";
}

export default globalSetup;
