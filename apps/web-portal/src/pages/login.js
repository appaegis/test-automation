const { expect } = require("@playwright/test");
const { Button } = require("../../src/components/common");
const { Dialog } = require("../../src/components/dialog");
const { EAB } = require("./eab");


exports.Login = class Login {
  constructor(page) {
    this.page = page;
    this.email = page.locator('input[placeholder="Email"]');
    this.azureEmail = page.locator('input[type="email"]');
    this.azurePassword = page.locator('input[type="password"]');
    this.continue = new Button(this.page, "Continue");
    this.next = page.locator('input[value="Next"]');
    this.password = page.locator('input[placeholder="Password"]');
    this.signUpPassword = page.locator(
      'input[placeholder="Enter your password"]'
    );
    this.signUpPasswordConfirm = page.locator(
      'input[placeholder="Confirm your password"]'
    );
    this.signIn = new Button(this.page, "Sign In");
    this.azureSignInButton = page.locator('input[value="Sign in"]');
    this.azureYesButton = page.locator('input[value="Yes"]');
    this.signUpButton = new Button(this.page, "Create account");
    this.accept = new Button(this.page, "Accept");
    this.signInWithAzureIDButton = new Button(
      this.page,
      "Sign in with Azure AD"
    );
    this.dialog = new Dialog(page);
    this.dialogContent = this.dialog.content("//div[contains(@class, 'Dialog_content')]");
  }

  async goto(url = process.env.URL) {
    await this.page.goto(url, { timeout: parseInt(process.env.LONG_TIMEOUT) });
  }

  async clickSignInWithAzureIDButton() {
    await this.signInWithAzureIDButton.click();
  }

  async login(
    account = process.env.ADMIN_USERNAME,
    password = process.env.ADMIN_PASSWORD
  ) {
    await this.inputEmail(account);
    await this.clickContinueButton();
    await this.inputPassword(password);
    await this.clickSignIn();
    await expect(this.page).toHaveURL("/launcher", {
      timeout: parseInt(process.env.LONG_TIMEOUT) * 2,
    });
    await this.page
      .locator("//*[@data-test='side_menu' and normalize-space()='Web']")
      .waitFor({ timeout: parseInt(process.env.LONG_TIMEOUT) * 2 });
  }
  /**
   * @typedef {Object} Page
   * Mammoth Browser's App Launcher page
   */

  /**
   * login Mammoth browser and  return the App Launcher page once it is rendered
   * @method loginMammothBrowser
   *
   * @param {string} account - account
   * @param {string} password - password
   * @throws {Error}
   * @return {Page}
   */
  async loginMammothBrowser(
    account = process.env.ADMIN_USERNAME,
    password = process.env.ADMIN_PASSWORD
  ) {
    await this.inputEmail(account);
    await this.clickContinueButton();
    await this.oldInputPassword(password);
    await this.clickSignIn();
    try {
      const page = await this.page
        .locator("//*[@aria-label and contains(@class, 'MuiTypography-root')]")
        .waitFor({ timeout: parseInt(process.env.LONG_TIMEOUT) * 4 });
      return page.eabPage;
    } catch (e) {
      if (e.toString().includes("Target closed")) {
        // after login, Mammoth browser closes the login session and pop up another, so we need to get the session again.
        const page = await EAB.getAppSessionPage();
        await page.eabPage
          .locator(
            "//*[@aria-label and contains(@class, 'MuiTypography-root')]"
          )
          .first()
          .waitFor({ timeout: parseInt(process.env.LONG_TIMEOUT) * 2 });
        return page.eabPage;
      }
      throw e;
    }
  }

  async loginWithAzure(azureAccount, azurePassword) {
    await this.clickSignInWithAzureIDButton();
    await expect(this.next).toBeVisible();
    await this.azureEmail.fill(azureAccount);
    await this.next.click();
    await expect(this.azureSignInButton).toBeVisible({ timeout: 10000 });
    await this.page.locator("div:has-text('Enter password')");
    await this.azurePassword.fill(azurePassword);
    await this.azureSignInButton.click();
    await this.azureYesButton.click();
    await expect(this.page).toHaveURL("/launcher", { timeout: 30000 });
  }

  async signUp(password) {
    await this.signUpPassword.locator("//following-sibling::button").waitFor();
    await this.signUpPassword.click();
    await this.page
      .locator("//li[contains(normalize-space(), 'Minimum 8 characters')]")
      .waitFor();
    await this.inputSignUpPassword(password);
    await this.inputPasswordConfirmation(password);
    await this.clickSignUp();
    await expect(this.page.locator("h2")).toContainText("License Agreement");
    await this.clickAccept();
  }

  async inputEmail(email) {
    await this.email.fill(email);
  }

  async inputPassword(password) {
    await this.page
      .locator(
        "//*[contains(normalize-space(),'arrow_back') and not(child::*)]"
      )
      .waitFor();
    await this.password.fill(password);
  }

  // mammoth Browser is still using old login page, remove this function once changed to new login page
  async oldInputPassword(password) {
    await this.password.fill(password);
  }

  async inputSignUpPassword(password) {
    await this.signUpPassword.waitFor();
    await this.signUpPassword.fill(password);
  }

  async inputPasswordConfirmation(password) {
    await this.signUpPasswordConfirm.fill(password);
  }

  async clickContinueButton() {
    await this.continue.click();
  }

  async clickSignIn() {
    await this.signIn.click();
  }

  async clickSignUp() {
    await this.signUpButton.click();
  }

  async clickAccept() {
    await this.accept.click();
  }

  /**
   * After setting the password, you will be redirected to the login page, 
   * the account will be automatically filled in. Press the 'Continue' button to input the password.
   * @param { string } password 
   */
  async loginWithNewlyCreatedInfo(password) {
    // continue page
    await this.email.waitFor();
    await this.clickContinueButton(); 
    // page for input password
    await this.inputPassword(password);
    await this.clickSignIn();
  }
};
