exports.DownloadHandler = class DownloadHandler {
  constructor(page) {
    this.page = page;
    this.downloadEvent = this.page.waitForEvent("download");
    this.download = undefined;
  }

  async waitForDownload() {
    this.download = await this.downloadEvent;
  }

  async saveFileAs(filePath) {
    await this.download.saveAs(filePath);
  }
};
