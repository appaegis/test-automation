const { Page } = require("../interface/page");

exports.AppLauncherBase = class Base extends Page {
  constructor(page, path, title) {
    super(page, path);
    this.context = page.locator(
      `//main[contains(normalize-space(),'${title}') or contains(normalize-space(),'Welcome to Mammoth Cyber!')]`
    );
  }
};
