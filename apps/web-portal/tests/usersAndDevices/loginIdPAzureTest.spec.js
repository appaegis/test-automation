const { test, expect } = require("@playwright/test");
const { Login } = require("../../src/pages/login");
test.skip(
  !process.env.AZURE_URL_ENTRANCE,
  "test demo for monitoring aws services"
);

test.use({ baseURL: process.env.AZURE_URL_ENTRANCE });

test.describe("Login using IdP Azure @C7903", () => {
  test("Login using IdP Azure", async ({ page }) => {
    const AZURE_ACCOUNT = "appaegisqa@aaccess.cloud";
    const login = new Login(page);
    await login.goto(process.env.AZURE_URL_ENTRANCE);
    await login.loginWithAzure(
      AZURE_ACCOUNT,
      `APPAEGIS${process.env.ADMIN_PASSWORD}`
    );
  });
});
