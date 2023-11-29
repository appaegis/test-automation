const { test } = require("@playwright/test");
const { HTTPS } = require("./https");
const { gql } = require("graphql-request");
const { deleteLauncherSchema, listLaunchableAppsSchema } = require("../../../libs/src/schema");

exports.AppHandlerAPI = class AppHandler extends HTTPS {
  async deleteApp(appProtocol, appName) {
    // Search app id by name
    const appId = await this.searchAppId(appProtocol, appName);
    if (!appId) return appId;
    // Delete by app ID.
    const result = await this.graphQLClient.query(
      gql`
        mutation DeleteResourceEntry($input: DeleteResourceEntryInput!, $condition: ModelResourceEntryConditionInput) {
          deleteResourceEntry(input: $input, condition: $condition) {
            ${deleteLauncherSchema}
          }
        }
      `,
      {
        "input": {
          "id": appId,
        },
      },
    );
    return result;
  }

  /**
   * @method listLaunchableApps to get a list of launchable app entries.
   * @returns {object} a list of app entries.
   */

  async listLaunchableApps() {
    const result = await this.graphQLClient.query(
      gql`
        query listLaunchableApps($tenantId: ID!, $filter: ModelResourceEntryFilterInput, $limit: Int, $nextToken: String) {
          listResourceEntrysByTenantId(
            resourceEntryTenantId: $tenantId
            filter: $filter
            limit: $limit
            nextToken: $nextToken
          ) {
            ${listLaunchableAppsSchema}
          }
        }
      `,
      {
        "tenantId": process.env.tenantID,
        "limit": 1000,
      },
    );
    return result.listResourceEntrysByTenantId.items;
  }

  async searchAppId(appProtocol, appName) {
    const appEntries = await this.listLaunchableApps();
    let appId = undefined;
    appEntries.forEach((element) => {
      if (element.appsetting.appprotocol === appProtocol) {
        if (element.resname === appName) {
          appId = element.id;
          return;
        }
      }
    });
    return appId;
  }
};
