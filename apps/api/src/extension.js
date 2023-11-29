const { test } = require("@playwright/test");
const { HTTPS } = require("./https");
const { gql } = require("graphql-request");

exports.ExtensionAPI = class Extension extends HTTPS {
  async scrapExtension(extensionID) {
    const result = await this.graphQLClient.query(
      gql`
        query ScrapExtension($input: ScrapExtensionInput!) {
          scrapExtension(input: $input) {
            description
            extensionID
            icon
            name
            provider
            version
            createdAt
            updatedAt
          }
        }
      `,
      {
        input: {
          extensionID,
        },
      }
    );
    return result.scrapExtension;
  }

  async listExtensions() {
    const result = await this.graphQLClient.query(
      gql`
        {
          listExtensions(limit: 1000) {
            items {
              description
              extensionID
              icon
              name
              provider
              version
              createdAt
              updatedAt
            }
            nextToken
            total
          }
        }
      `
    );
    return result.listExtensions.items;
  }

  async deleteExtension(extensionID) {
    const result = await this.graphQLClient.query(
      gql`
        mutation DeleteExtension($input: DeleteExtensionInput!) {
          deleteExtension(input: $input) {
            description
            extensionID
            icon
            name
            provider
            version
            createdAt
            updatedAt
          }
        }
      `,
      {
        input: {
          extensionID,
        },
      }
    );
    return result;
  }
  async getExtension(extensionID) {
    const result = await this.graphQLClient.query(
      gql`
    {
      getExtension(extensionID: "${extensionID}") {
        description
        extensionID
        icon
        name
        provider
        version
        createdAt
        updatedAt
      }
    }
    `
    );
    return result.getExtension
  }
};
