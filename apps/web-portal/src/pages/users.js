const { expect } = require("@playwright/test");
const { Modal } = require("../components/modal");
const { Button, Checkbox } = require("../components/common");

exports.Users = class Users {
  constructor(page) {
    this.page = page;
    this.modal = new Modal(page);
    this.context = page.locator("main", { hasText: "Users" });
    this.email = this.modal.textField(
      "Emails  (Use commas to separate multiple emails.)"
    );
    this.group = this.modal.dropdownFieldWithSearch("Group");
    this.accessRole = this.modal.dropdownFieldWithSearch("Access Role");
    this.skipEmailVerification = this.modal.checkBoxField(
      "Skip Email Verification"
    );
    this.passwordLogin = this.modal.checkBoxField("Password Login");
    this.twoFactorAuthentication = this.modal.checkBoxField(
      "Two Factor Authentication"
    );
    this.magicLinkLogin = this.modal.checkBoxField("Magic Link Login");
    this.submit = this.modal.button("Submit");
    this.user = new Button(this.context, "User");
    this.search = this.context.locator("input");

    this.userDetail = new UserDetail(this.page);
  }

  async goto() {
    await this.page.goto("/users", {timeout: parseInt(process.env.LONG_TIMEOUT)});
    await this.context.waitFor();
  }

  async checkMagicLinkLogin() {
    await this.magicLinkLogin.click({ force: true });
  }

  async checkTwoFactorAuthentication() {
    await this.twoFactorAuthentication.click({ force: true });
  }

  async checkPasswordLogin() {
    await this.passwordLogin.click({ force: true });
  }

  async checkSkipEmailVerification() {
    await this.skipEmailVerification.click({ force: true });
  }

  async inputEmail(emails) {
    for (let i = 0; i < emails.length; i += 1) {
      await this.email.fill(emails[i]);
      await this.email.element.press("Enter");
    }
  }

  async deleteUser(uniqueValue) {
    await this.inputSearch(uniqueValue);
    let row = await this.getTableRow(uniqueValue);
    await row.locator("[class='toggle-button']").click();
    await row
      .locator("[class='toggle-button']")
      .locator(":text-is('Delete')")
      .click();
    await this.modal.button("Delete").click();
    await expect(row).not.toBeVisible({ timeout: parseInt(process.env.NORMAL_TIMEOUT) });
  }

  async selectGroup(group) {
    await this.group.open();
    await this.group.select(group);
  }

  async selectAccessRole(accessRoles) {
    await this.accessRole.open();
    for (let i = 0; i < accessRoles.length; i += 1) {
      await this.accessRole.select(accessRoles[i]);
    }
    await this.accessRole.close();
  }

  async clickSubmit() {
    await this.submit.click({ force: true });
  }

  async clickUser() {
    await this.user.click();
  }

  async inputSearch(searchText) {
    await this.search.fill(searchText);
    await this.search.press("Enter");
  }

  getTableRow(email) {
     return this.context.locator(`[class*=row]:has-text('${email}')`);

  }

  async createUser(Emails, group, accessRoles, optional = {}) {
    await this.clickUser();
    await this.inputEmail(Emails);
    await this.selectGroup(group);
    await this.selectAccessRole(accessRoles);
    if (optional.passwordLogin) await this.checkPasswordLogin();
    if (optional.twoFactorAuthentication)
      await this.checkTwoFactorAuthentication();
    if (optional.skipEmailVerification) await this.checkSkipEmailVerification();
    if (optional.magicLinkLogin) await this.checkMagicLinkLogin();
    await this.clickSubmit();
  }

  copyRegistrationInvitationLink() {
    return this.page.locator('[class*="copy-regiser-link__label"]');
  }

  async clickUserForEdit(email) {
    await this.inputSearch(email);
    // There is no table here, it will be modified later.
    let row = await this.getTableRow(email);
    await row.locator(`a:has-text("${email}")`).click();
    await this.userDetail.userDetailPage.waitFor();
  }
};

class UserDetail {
  constructor(page) {
    this.userDetailPage = page.locator("main", { hasText: "User Detail" });
    this.disabledUser = this.userDetailPage.locator("label:has-text('Disabled user')");
    this.save = new Button(this.userDetailPage, "Save");
  }

  async updateDisabledUser() {
    await this.disabledUser.click();
    await this.save.click();
  }
}
