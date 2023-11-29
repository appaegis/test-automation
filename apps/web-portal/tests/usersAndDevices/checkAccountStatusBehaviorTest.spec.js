const { test, expect } = require("../../src/fixtures/commonSetup");
const { Login } = require("../../src/pages/login");
const { Users } = require("../../src/pages/users");
const { Web } = require("../../src/pages/web");
const account = 'appaegisqa+disableduser@gmail.com';
const password = 'Aa@123456';

test.use({
    users: async({ page }, use) => {
        await use(new Users(page));
    },
})

test.beforeEach(async ({ users, browser }) => {
    await users.goto();
    await users.createUser([account], 'default', [], {
        skipEmailVerification: true,
    });
    const invitationLink = await users.copyRegistrationInvitationLink().textContent();
    await users.modal.button("Ok").click();
    const setUpPasswordPage = await browser.newPage();
    await setUpPasswordPage.goto(invitationLink);
    const login = new Login(setUpPasswordPage);
    await login.signUp(password);
    await login.loginWithNewlyCreatedInfo(password);
    const web = new Web(setUpPasswordPage);
    await expect(web.context).toBeVisible({
        timeout: parseInt(process.env.LONG_TIMEOUT) * 2,
      });
    await setUpPasswordPage.close();
});

test.describe("Check account status behavior @sanity", () => {
    test("Disabled user should not be able to log in @C7", async ({ users, browser }) => {
        await users.clickUserForEdit(account);
        await users.userDetail.updateDisabledUser();
        await expect(users.page.locator(".small_modal")).toHaveText('Successfully edited the user!', {
            timeout: parseInt(process.env.LONG_TIMEOUT)});
        const loginPage = await browser.newPage();
        await loginPage.goto(process.env.CUSTOM_URL);
        const login = new Login(loginPage);
        await login.inputEmail(account);
        await login.clickContinueButton();
        await expect(login.dialogContent).toHaveText('Login failed.', { 
            timeout: parseInt(process.env.NORMAL_TIMEOUT) });
        await loginPage.close();
    });
});

test.afterEach(async ({ users }) => {
    await users.deleteUser(account);
})