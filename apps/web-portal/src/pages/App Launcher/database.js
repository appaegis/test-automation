const { AppLauncherBase } = require("./base");

exports.Database = class DatabasePage extends AppLauncherBase {
  constructor(page) {
    super(page, "/database", "Databases");
  }
};
