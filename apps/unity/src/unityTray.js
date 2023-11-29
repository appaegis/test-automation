const { homedir } = require("os");
const NotImplementError = "function is not implemented";

exports.UnityTray = class UnityTray {
  constructor() {
    this.userDir = homedir();
    this.sshConfigPath = `${this.userDir}/.ssh/config`;
    this.context;
    this.menuBar;
    this.unityLauncher;
    this.MMC;
    this.menu;
  }

  NotImplementError(message) {
    this.message = message;
    this.name = "NotImplementError";
  }

  async launchApp() {
    await this.clickMammothBrowserIcon();
    await this.driver.waitUntil(
      async () => {
        const status = await this.getLoginStatus();
        return (status.includes("Ready") || status.includes("Please login"));
      },
      { timeout: parseInt(process.env.LONG_TIMEOUT) * 2 },
    );
  }

  async openBrowser() {
    await this.clickMenu("App launcher");
    await EAB.getAppSessionPage();
  }

  async findMenuItem() {
    throw NotImplementError;
  }

  async mouseOver() {
    throw NotImplementError;
  }

  async clickMammothBrowserIcon(){
    throw NotImplementError;
  }

  async getLoginStatus(){
    throw NotImplementError;
  }

  async waitForStatusIsReady() {
    await this.clickMammothBrowserIcon();
    await this.driver.waitUntil(
      async () => {
        const status = await this.getLoginStatus();
        return status.includes("Ready");
      },
      { timeout: parseInt(process.env.LONG_TIMEOUT) * 2 },
    );
  }

  async clickMenuItem() {
    throw NotImplementError;
  }
};
