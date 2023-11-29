exports.Page = class Page {
  path = "";
  constructor(page, path) {
    this.page = page;
    this.path = path;
  }
  async goto() {
    await this.page.goto(this.path, {
      timeout: parseInt(process.env.LONG_TIMEOUT),
    });
    if (this.context) {
      await this.context.waitFor();
    }
  }
};
