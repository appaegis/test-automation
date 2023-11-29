const { expect } = require("@playwright/test");
const { Button } = require("../components/common");
const { Drawer } = require("../components/drawer");
const { Dialog } = require("../components/dialog");

exports.SshProfile = class SshProfile {
  constructor(page) {
    this.page = page;
    this.context = page.locator("main", {
      has: page.locator("article", { hasText: "SSH Profile" }),
    });

    // Page part.
    this.SshProfileTab = page.locator("a[role=\"tab\"]:has-text(\"SSH Profile\")");

    // SSH Profile part
    this.sshProfilePage = this.context.locator(
      "xpath=//section[.//h2[text()='SSH Profile']]",
    );
    this.sshProfileAddButton = new Button(this.sshProfilePage, "Add");

    // SSH Rules part
    this.sshRulesPage = this.context.locator(
      "xpath=//section[.//h2[text()='SSH Rules']]",
    );
    this.sshRulesAddButton = new Button(this.sshRulesPage, "Add");

    // SSH Profile Drawer
    this.sshProfileDrawer = new Drawer(this.sshProfilePage);
    this.sshProfileName = this.sshProfileDrawer.textField("Name");
    this.sshProfileRules =
      this.sshProfileDrawer.dropdownFieldWithSearch("SSH Rules");
    this.sshProfileCancel = this.sshProfileDrawer.button("Cancel");
    this.sshProfileSave = this.sshProfileDrawer.button("Save");
    this.sshProfileDelete = this.sshProfileDrawer.button("Delete");

    // SSH Rules Drawer
    this.sshRulesDrawer = new Drawer(this.sshRulesPage);
    this.sshRulesName = this.sshRulesDrawer.textField("Name");
    this.sshRulesTeamsOrUsers =
      this.sshRulesDrawer.dropdownFieldWithSearch("Groups/Users");
    this.sshRulesUserNameType = this.sshRulesDrawer.radioButton("User Name");
    this.sshRulesAuthMethod = this.sshRulesDrawer.radioButton(
      "Select Authentication method",
    );
    this.sshRulesSelectCa =
      this.sshRulesDrawer.radioButton("SSH CA Certificate");
    this.sshRulesSelectKey = this.sshRulesDrawer.radioButton("SSH Key");
    this.sshRulesCancel = this.sshRulesDrawer.button("Cancel");
    this.sshRulesSave = this.sshRulesDrawer.button("Save");
    this.sshRulesDelete = this.sshRulesDrawer.button("Delete");

    // Dialog part.
    this.dialog = new Dialog(page);
    this.dialogCancel = this.dialog.button("Cancel");
    this.dialogDelete = this.dialog.button("Delete");
  }

  async goto() {
    await this.page.goto("/ssh/profile/rules", {
      timeout: parseInt(process.env.LONG_TIMEOUT),
    });
    await this.context.waitFor();
  }

  async clickSshProfileTab() {
    await this.SshProfileTab.click();
  }

  // Ssh profile drawer action.
  async inputAddSshProfileName(profileName) {
    await this.sshProfileName.fill(profileName);
  }

  async selectSshRules(rules) {
    await this.sshProfileRules.open();
    for (let i = 0; i < rules.length; i += 1) {
      await this.sshProfileRules.select(rules[i]);
    }
    await this.sshProfileRules.close();
  }

  async clickAddSshProfileSaveButton() {
    await this.sshProfileSave.click();
  }

  async clickAddSshProfileCancelButton() {
    await this.sshProfileCancel.click();
  }

  async clickAddSshProfileDeleteButton(profileName) {
    const row = await this.getProfileTableRow(profileName);
    await row.locator(`a:has-text("${profileName}")`).click();
    await this.sshProfileDelete.click();
    await expect(row).not.toBeVisible();
  }

  // Ssh rules drawer action.
  async inputAddSshRulesName(ruleName) {
    await this.sshRulesName.fill(ruleName);
  }

  async selectAddSshRulesTeamsUsers(teamsOrUsers) {
    await this.sshRulesTeamsOrUsers.open();
    await this.sshRulesTeamsOrUsers.select(teamsOrUsers);
    await this.sshRulesTeamsOrUsers.close();
  }

  async selectAddSshRulesUserName(userNameType) {
    await this.sshRulesUserNameType.check(userNameType);
  }

  async checkAndInputAddSshRulesUserName(userName) {
    await this.sshRulesUserNameType.checkAndFill(userName);
  }

  async selectAddSshRulesPassWord() {
    await this.sshRulesAuthMethod.check("Password");
  }

  async selectAddSshRulesCa(caProfile) {
    await this.sshRulesSelectCa.checkAndSelectOption(
      "SSH CA Certificate",
      caProfile,
    );
  }

  async selectAddSshRulesKey(keyProfile) {
    await this.sshRulesSelectKey.checkAndSelectOption(keyProfile);
  }

  async clickAddSshRulesSaveButton() {
    await this.sshRulesSave.click();
  }

  // Page action.
  async clickSshProfileAddButton() {
    await this.sshProfileAddButton.click();
    await expect(this.sshProfileDrawer).toBeVisible;
  }

  async clickSshRulesAddButton() {
    await this.sshRulesAddButton.click();
    await expect(this.sshRulesDrawer).toBeVisible;
  }

  getRulesTableRow(name) {
    return this.sshRulesPage.locator(`tr:has-text("${name}")`);
  }

  getProfileTableRow(name) {
    return this.sshProfilePage.locator(`tr:has-text("${name}")`);
  }

  // Create SSH rule action.
  async createSshRuleWithPassword(ruleName, teamsAndUsers, userName) {
    await this.clickSshRulesAddButton();
    await this.inputAddSshRulesName(ruleName);
    await this.selectAddSshRulesTeamsUsers(teamsAndUsers);
    if (userName) {
      await this.checkAndInputAddSshRulesUserName(userName);
    }
    await this.selectAddSshRulesPassWord();
    await this.clickAddSshRulesSaveButton();
    const row = await this.getRulesTableRow(ruleName);
    await expect(row).not.toBeVisible({
      timeout: parseInt(process.env.SHORT_TIMEOUT),
    });
  }

  async createSshRuleWithKey(ruleName, teamsAndUsers, userName, keyName) {
    await this.clickSshRulesAddButton();
    await this.inputAddSshRulesName(ruleName);
    if (userName) {
      await this.checkAndInputAddSshRulesUserName(userName);
    }
    await this.selectAddSshRulesKey(keyName);
    await this.selectAddSshRulesTeamsUsers(teamsAndUsers);
    await this.clickAddSshRulesSaveButton();
    const row = await this.getRulesTableRow(ruleName);
    await expect(row).not.toBeVisible({
      timeout: parseInt(process.env.SHORT_TIMEOUT),
    });
  }

  async createSshRuleWithCa(ruleName, teamsAndUsers, userName, caName) {
    await this.clickSshRulesAddButton();
    await this.inputAddSshRulesName(ruleName);
    await this.selectAddSshRulesTeamsUsers(teamsAndUsers);
    if (userName) {
      await this.checkAndInputAddSshRulesUserName(userName);
    }
    await this.selectAddSshRulesCa(caName);
    await this.clickAddSshRulesSaveButton();
    const row = await this.getRulesTableRow(ruleName);
    await expect(row).not.toBeVisible({
      timeout: parseInt(process.env.SHORT_TIMEOUT),
    });
  }

  // Create SSH profile action.
  async createSshProfile(profileName, sshRuleList) {
    await this.clickSshProfileAddButton();
    await this.inputAddSshProfileName(profileName);
    await this.selectSshRules(sshRuleList);
    await this.clickAddSshProfileSaveButton();
    const row = await this.getProfileTableRow(profileName);
    await expect(row).toBeVisible({
      timeout: parseInt(process.env.NORMAL_TIMEOUT),
    });
  }

  async deleteSshRules(ruleName) {
    const row = await this.getRulesTableRow(ruleName);
    await row.locator(`a:has-text("${ruleName}")`).click();
    await this.sshRulesDelete.click();
    await this.dialogDelete.click();
    await expect(row).not.toBeVisible({
      timeout: parseInt(process.env.NORMAL_TIMEOUT),
    });
  }

  async deleteSshProfile(profileName) {
    const row = await this.getProfileTableRow(profileName);
    await row.locator(`a:has-text("${profileName}")`).click();
    await this.sshProfileDelete.click();
    await this.dialogDelete.click();
    await expect(row).not.toBeVisible({
      timeout: parseInt(process.env.NORMAL_TIMEOUT),
    });
  }
};
