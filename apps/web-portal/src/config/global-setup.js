const getIdTokenAndTenantUsingUserPassword = require("../../../core_lib/src/authorize");

async function globalSetup() {
  const info = await getIdTokenAndTenantUsingUserPassword({
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
  });
  process.env.APItoken = info.idToken;
}

module.exports = globalSetup;
