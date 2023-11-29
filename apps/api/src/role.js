const { test } = require("@playwright/test");
const { HTTPS } = require("./https");
const { gql } = require("graphql-request");

exports.RoleAPI = class Role extends HTTPS {
  async listRoleEntrys() {
    const result = await this.graphQLClient.query(
      gql`
        {
          listRoleEntrys(limit: 100) {
            items {
              default
              id
              name
              rules {
                items {
                  id
                }
              }
              teams {
                items {
                  id
                }
              }
              users {
                items {
                  id
                }
              }
              roleEntryTenantId
              createdAt
              updatedAt
            }
            nextToken
          }
        }
      `
    );
    return result.listRoleEntrys.items;
  }

  async deleteRoleEntry(name) {
    const listRoleEntrys = await this.listRoleEntrys();
    const entryID = this.findEntryID(listRoleEntrys, name);
    if (!entryID) return entryID;
    const result = await this.graphQLClient.query(
      gql`
        mutation DeleteRoleEntry($input: DeleteRoleEntryInput!) {
          deleteRoleEntry(input: $input) {
            default
            id
            rules {
              items {
                id
              }
            }
            teams {
              items {
                id
              }
            }
            users {
              items {
                id
              }
            }
            name
            roleEntryTenantId
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
    await Promise.all(
      result.deleteRoleEntry.teams.items.map((team) =>
        this.deleteTeamRoleLink(team.id)
      )
    );
    await Promise.all(
      result.deleteRoleEntry.users.items.map((user) =>
        this.deleteUserRoleLink(user.id)
      )
    );
    return result;
  }

  async deleteUserRoleLink(entryID) {
    if (!entryID) return entryID;
    const result = await this.graphQLClient.query(
      gql`
        mutation DeleteUserRoleLink($input: DeleteUserRoleLinkInput!) {
          deleteUserRoleLink(input: $input) {
            id
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

  async deleteTeamRoleLink(entryID) {
    if (!entryID) return entryID;
    const result = await this.graphQLClient.query(
      gql`
        mutation DeleteTeamRoleLink($input: DeleteTeamRoleLinkInput!) {
          deleteTeamRoleLink(input: $input) {
            id
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
