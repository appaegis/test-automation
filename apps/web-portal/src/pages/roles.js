const { expect } = require("@playwright/test");
const { Button } = require("../components/common");
const { Drawer } = require("../components/drawer");

exports.Roles = class Roles {
  constructor(page) {
    this.page = page;
    this.context = page.locator("main", { hasText: "Role" });
    this.drawer = new Drawer(this.context);
    this.addButton = new Button(this.context, "Add");
    this.search = this.context.locator('input[placeholder="Search"]');
    this.name = this.drawer.textField("Name");
    this.teamsAndUsers = this.drawer.dropdownFieldWithSearch("Groups/Users");
    this.saveButton = this.drawer.button("Save");
  }

  async goto() {
    await this.page.goto("/accessRole", {
      timeout: parseInt(process.env.LONG_TIMEOUT),
    });
    await this.context.waitFor();
  }

  async inputSearch(searchText) {
    await this.search.click();
    await this.search.fill(searchText);
    await this.search.press("Enter");
  }

  async getTableRow(role) {
    return this.context.locator(`tr:has-text('${role}')`);
  }

  async clickSaveButton() {
    await this.saveButton.click();
  }
  async clickAddButton() {
    await this.addButton.click();
  }

  async inputName(name) {
    await this.name.fill(name);
  }

  async selectTeamAndUsers(teamsAndUsers) {
    await this.teamsAndUsers.open();
    for (let i = 0; i < teamsAndUsers.length; i += 1) {
      await this.teamsAndUsers.select(teamsAndUsers[i]);
    }
    await this.teamsAndUsers.close();
  }

  async createRole(roleName, teamsAndUsers) {
    await this.clickAddButton();
    await this.inputName(roleName);
    await this.selectTeamAndUsers(teamsAndUsers);
    await this.clickSaveButton();
    await expect(
      this.drawer.context.filter({ hasText: "Add Role" })
    ).not.toHaveClass("open");
    await this.inputSearch(roleName);
    const row = await this.getTableRow(roleName);
    await expect(row).toBeVisible();
  }
};
