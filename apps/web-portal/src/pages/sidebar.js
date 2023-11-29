exports.Sidebar = class Sidebar {
  constructor(page) {
    this.page = page;
    this.sidebar = page.locator('[data-test="side_menu"]');
  }

  async clickSideBar(sideMenu, category = "") {
    await this.sidebar
      .locator(
        `xpath=//span[normalize-space()='${sideMenu}' and ./ancestor::*[@data-test and contains(normalize-space(),'${category}')]]`
      )
      .click();
  }
};
