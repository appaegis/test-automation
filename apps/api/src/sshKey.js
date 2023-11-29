const { test } = require("@playwright/test");
const { HTTPS } = require("./https");
const { gql } = require("graphql-request");
const {
  sshKeySchema,
  generateSshKeySchema,
} = require("../../../../core_lib/src/schema");

exports.SSHKeyAPI = class SSHKey extends HTTPS {
  async generateKeyPair(algorithm = "rsa-2048") {
    let result = await this.graphQLClient.query(
      gql`
        ${generateSshKeySchema}
      `,
      {
        input: {
          algorithm: algorithm,
        },
      }
    );
    return result.generateSshKey;
  }

  async createSshKeyEntry(name, algorithm, description = "") {
    let keyInformation = await this.generateKeyPair(algorithm);
    let result = await this.graphQLClient.query(
      gql`
        ${sshKeySchema}
      `,
      {
        input: {
          name,
          description,
          algorithm: keyInformation.algorithm,
          publicKey: keyInformation.publicKey,
          isShared: true,
        },
      }
    );
    return result;
  }

  async listSshKeyEntrys() {
    let result = await this.graphQLClient.query(
      gql`
        query {
          listSshKeyEntrys(limit: 100) {
            items {
              id
              name
              user
              gcpKeyIndex
              isShared
              description
              publicKey
              algorithm
              rules {
                items {
                  id
                  name
                  groups
                  users
                  tenantId
                  sshAuthMethod
                  sshUserName
                  deriveUsernameFromEmail
                  sshcaID
                  offline
                  certificateLifetime
                  createdAt
                  updatedAt
                }
                nextToken
              }
              createdAt
              updatedAt
            }
          }
        }
      `
    );
    return result.listSshKeyEntrys.items;
  }

  async deleteSshKeyEntry(name) {
    let sshKeyEntries = await this.listSshKeyEntrys();
    let entryID = this.findEntryID(sshKeyEntries, name);
    if (!entryID) return entryID;
    let result = await this.graphQLClient.query(
      gql`
        mutation DeleteSshKeyEntry($input: DeleteSshKeyEntryInput!) {
          deleteSshKeyEntry(input: $input) {
            id
            name
            user
            gcpKeyIndex
            isShared
            description
            publicKey
            algorithm
            rules {
              items {
                id
                name
                groups
                users
                tenantId
                sshAuthMethod
                sshUserName
                deriveUsernameFromEmail
                sshcaID
                offline
                certificateLifetime
                createdAt
                updatedAt
              }
              nextToken
            }
            createdAt
            updatedAt
          }
        }
      `,
      {
        input: {
          id: entryID,
        },
      }
    );
    return result;
  }
};
