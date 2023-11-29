const { expect } = require("@playwright/test");
const { Button } = require("../components/common");

exports.AccountProfile = class AccountProfile {
  constructor(page) {
    this.page = page;
    this.context = page.locator("main", { hasText: "Account Profile" });
    this.corporateEmailDomainsBlock = this.context.locator("form", {
      hasText: "Identity Tracker Settings",
    });
    this.save = new Button(this.corporateEmailDomainsBlock, "Save");
    this.add = this.corporateEmailDomainsBlock.locator(
      "xpath=//*[@data-test='addButton']"
    );
  }

  async goto() {
    await this.page.goto("/tenant", {
      timeout: parseInt(process.env.LONG_TIMEOUT),
    });
    await this.context.waitFor();
  }

  async clickDeleteEmailTrashIcon(emailDomain) {
    const inputEntry = await this.searchEmailDomainItem(emailDomain);
    await inputEntry.locator("xpath=//*[@data-test='deleteButton']").click();
  }

  async updateEmailDomain(existEmailDomain, updateEmailDomain) {
    // select the domain entry input element.
    const inputEntry = await this.searchEmailDomainItem(existEmailDomain);
    await inputEntry.locator("input").fill(updateEmailDomain);
  }

  async clickAddEmailIcon() {
    await this.add.hover();
    await this.add.click();
  }

  async clickSave() {
    await expect(this.save.context).toBeVisible();
    await this.save.click();
  }

  async getDomain(emailDomain) {
    const inputValue = await this.searchEmailDomainItem(emailDomain);
    if (inputValue) {
      return await inputValue.locator("input").inputValue();
    } else {
      return "";
    }
  }

  async addDomainUntilFiveEntries(emailDomainPrefix) {
    const emailDomainEntries = await this.getCurrentDomainEntries();
    for (let i = 0; i < (await emailDomainEntries.count()); i += 1) {
      const inputValue = await emailDomainEntries
        .nth(i)
        .locator("input")
        .inputValue();
      if (!inputValue) {
        await emailDomainEntries
          .nth(i)
          .locator("input")
          .fill(emailDomainPrefix + i + ".com");
      }
    }
    for (let i = await emailDomainEntries.count(); i < 5; i += 1) {
      await this.clickAddEmailIcon();
      await expect(emailDomainEntries.nth(i).locator("input")).toBeVisible();
      await emailDomainEntries
        .nth(i)
        .locator("input")
        .fill(emailDomainPrefix + "_" + i + ".com");
    }
  }

  async searchEmailDomainItem(emailDomain) {
    const emailDomainEntries = await this.getCurrentDomainEntries();
    for (let i = 0; i < (await emailDomainEntries.count()); i += 1) {
      const inputValue = await emailDomainEntries
        .locator("input")
        .nth(i)
        .inputValue();
      if (emailDomain === inputValue) {
        return emailDomainEntries.nth(i);
      }
    }
  }

  async getCurrentDomainEntries() {
    const emailDomainItems = await this.corporateEmailDomainsBlock.locator(
      "xpath=//*[contains(@class, 'array-input__item')]"
    );
    return emailDomainItems;
  }
};
