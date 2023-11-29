const { Button } = require("../components/common");
const { Drawer } = require("../components/drawer");
const { Table } = require("../components/table");

exports.Policies = class Policies {
  constructor(page) {
    this.page = page;
    this.context = page.locator("main", { hasText: "Policies" });
    this.policy = this.context.locator(
      "xpath=//button[contains(normalize-space(),'Add') and not(ancestor::aside)]"
    );
    this.drawer = new Drawer(this.context);
    this.policyNameInput = this.drawer.textField("Policy Name");
    this.description = this.drawer.textArea("Description");
    this.deleteButton = new Button(this.page, "Delete");
    this.addRuleButotn = this.drawer.button("Add");
    this.groupsAndUsersDropdown =
      this.drawer.dropdownFieldWithSearch("Groups / Users");
    this.action = (action) => {
      return this.drawer.context.locator(
        `xpath=//*[@type='checkbox' and @value='${action}']`
      );
    };
    this.saveRuleButton = this.drawer.context.locator(
      "xpath=//form//button[contains(normalize-space(), 'Apply')]"
    );
    this.policyTable = new Table(this.context);
    this.savePolicyButton = this.drawer.context.locator(
      "xpath=//button[contains(normalize-space(),'Save') and not(ancestor::form)]"
    );
    this.search = this.context.locator("xpath=//input[@type='search']");
  }

  async checkAction(action) {
    await this.action(action).check({ force: true });
  }

  async goto() {
    await this.page.goto("/policy", {
      timeout: parseInt(process.env.LONG_TIMEOUT),
      waitUntil: "domcontentloaded",
    });
    await this.context.waitFor();
  }

  async inputSearch(searchText) {
    await this.search.click();
    await this.search.fill(searchText);
    await this.search.press("Enter");
  }

  async getTableRow(policy) {
    return this.context.locator(
      `[class*=appaegis-grid__tr]:has-text('${policy}')`
    );
  }

  async inputPolicyName(name) {
    await this.policyNameInput.fill(name);
  }

  async inputDescription(description) {
    await this.description.fill(description);
  }

  async clickAddRuleButton() {
    await this.addRuleButotn.click();
  }

  async clickSaveRuleButton() {
    await this.saveRuleButton.click();
  }

  async clickSavePolicyButton() {
    await this.savePolicyButton.click();
  }

  async openGroupsAndUsersDropdown() {
    await this.groupsAndUsersDropdown.open(
      this.drawer.context.locator(
        `//span[normalize-space()="Groups / Users"]//following-sibling::div[.//select]`
      )
    );
  }

  async closeGroupsAndUsersDropdown() {
    await this.groupsAndUsersDropdown.close(
      this.drawer.context.locator(
        "xpath=//*[normalize-space()='Policy Configuration']"
      )
    );
  }

  async selectGroupsAndUsers(groupsAndUsers) {
    await this.groupsAndUsersDropdown.select(groupsAndUsers);
  }
  /**
   * @method createPolicy
   * @param {string} policyName name of policy
   * @param {string} description description of policy
   * @param {object} rules
   * @param {list} rules.groupsAndUsers groups and users of a rule
   * @param {list} rules.actions actions of a rule ["Copy", "Paste", ... ]
   */
  async createPolicy(policyName, description, rules) {
    await this.clickPolicy();
    await this.inputPolicyName(policyName);
    await this.inputDescription(description);
    for (let i = 0; i < rules.length; i++) {
      await this.clickAddRuleButton();
      await this.openGroupsAndUsersDropdown();
      for (let index = 0; index < rules[i].groupsAndUsers.length; index++) {
        await this.selectGroupsAndUsers(rules[i].groupsAndUsers[index]);
      }
      await this.closeGroupsAndUsersDropdown();
      for (let index = 0; index < rules[i].actions.length; index++) {
        await this.checkAction(rules[i].actions[index].toLowerCase());
      }
      await this.clickSaveRuleButton();
    }
    await this.clickSavePolicyButton();
    await this.drawer.context.locator("//table").waitFor({
      state: "detached",
      timeout: parseInt(process.env.NORMAL_TIMEOUT),
    });
  }

  /**
   * @method editPolicy
   * @param {string} policyName find the policy
   * @param {string} nameToBeChanged name of policy want to be changed
   * @param {string} descriptionToBeChanged description of policy want to be changed
   */
  async editPolicy(
    policyName,
    nameToBeChanged = "",
    descriptionToBeChanged = "",
    rules = {}
  ) {
    const row = await this.policyTable.getRow(policyName);
    await row.selectSettingOption("Edit");
    if (nameToBeChanged) {
      await this.inputPolicyName(nameToBeChanged);
    }
    if (descriptionToBeChanged) {
      await this.inputDescription(descriptionToBeChanged);
    }
    for (let i = 0; i < rules.length; i++) {
      await this.clickAddRuleButton();
      await this.openGroupsAndUsersDropdown();
      for (let index = 0; index < rules[i].groupsAndUsers.length; index++) {
        await this.selectGroupsAndUsers(rules[i].groupsAndUsers[index]);
      }
      await this.closeGroupsAndUsersDropdown();
      for (let index = 0; index < rules[i].actions.length; index++) {
        await this.checkAction(rules[i].actions[index].toLowerCase());
      }
      await this.clickSaveRuleButton();
    }
    await this.clickSavePolicyButton();
    await this.drawer.context.locator("//table").waitFor({
      state: "detached",
      timeout: parseInt(process.env.NORMAL_TIMEOUT),
    });
  }

  async deletePolicy(policy) {
    await this.inputSearch(policy);
    const row = await this.policyTable.getRow(policy);
    await row.selectSettingOption("Delete");
    await this.clickDeleteButton();
    await row.element.waitFor({
      state: "detached",
      timeout: parseInt(process.env.LONG_TIMEOUT),
    });
  }

  async clickPolicy() {
    await this.policy.click();
  }

  async clickDeleteButton() {
    await this.deleteButton.click({ force: true });
  }
};
