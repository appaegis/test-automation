const { test, expect } = require("../../src/fixtures/commonSetup");
const { Login } = require("../../src/pages/login");
const { Users } = require("../../src/pages/users");
const { Web } = require("../../src/pages/web");

let login;
let users;
let browserContext;
test.setTimeout(120 * 1000);

test.beforeEach(async ({ browser, page }) => {
  browserContext = browser;
  users = new Users(page);
  await users.goto();
});

test.describe("Create User @C7859", () => {
  test("Create User With Password Login Without Emial Verification", async ({
    page,
  }) => {
    try {
      await users.createUser(["appaegisqa+testing@gmail.com"], "Default", [], {
        skipEmailVerification: true,
      });
      const url = await users.copyRegistrationInvitationLink().textContent();
      await users.modal.button("Ok").click();
      const signUpPage = await browserContext.newPage();
      await signUpPage.goto(url);
      login = new Login(signUpPage);
      const password = "C7859testUser!";
      await login.signUp(password);
      await login.loginWithNewlyCreatedInfo(password);
      const web = new Web(signUpPage);
      await expect(web.context).toBeVisible({
        timeout: parseInt(process.env.LONG_TIMEOUT) * 2,
      });
      await signUpPage.close();
      await users.inputSearch("testing");
    } finally {
      const users = new Users(page);
      await users.deleteUser("appaegisqa+testing@gmail.com");
    }
  });
});