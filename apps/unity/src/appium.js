const { main } = require("appium");

async function startAppiumServer(
  port,
  address,
  relaxedSecurityEnabled = true,
  loglevel = "debug",
  logFile = "appium.log"
) {
  // https://github.com/appium/appium/blob/2.0/packages/schema/lib/appium-config.schema.json
  return await main({
    port,
    address,
    relaxedSecurityEnabled,
    loglevel,
    logFile,
    basePath: "/wd/hub",
  });
}

module.exports = { startAppiumServer };
