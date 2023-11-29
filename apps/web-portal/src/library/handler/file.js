const fs = require("fs");

exports.FileHandler = class FileHandler {
  constructor() {
    this.fs = fs;
  }

  async getFileContent(filePath, encoding) {
    const fileContent = this.fs.readFileSync(filePath, encoding);
    return fileContent;
  }
  async deleteFile(filePath) {
    // eslint-disable-next-line spellcheck/spell-checker
    this.fs.unlinkSync(filePath);
    return;
  }

  async isFileExist(filePath) {
    return fs.existsSync(filePath);
  }
};
