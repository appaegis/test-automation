const { HTTPS } = require("./https");
const { gql } = require("graphql-request");
const { TeamAPI } = require("./team");

/**
 * APIs used for Browser Profile operations on the Portal, retain the original name `UnityProfile`.
 * Thus, we uses this old name 'UnityProfile' here.
 * @class
 * @extends HTTPS
 */
exports.UnityProfileAPI = class UnityProfile extends HTTPS {
  constructor() {
    super();
    this.teamAPI = new TeamAPI();
  }

  async deleteTeamUnityProfileLink(id) {
    const result = await this.graphQLClient.query(
      gql`
        mutation DeleteTeamUnityProfileLink(
          $input: DeleteTeamUnityProfileLinkInput!
        ) {
          deleteTeamUnityProfileLink(input: $input) {
            id
          }
        }
      `,
      {
        input: {
          id,
        },
      },
    );
    return result;
  }

  async updateUnityProfileMeta(priorityList, metaID) {
    const result = await this.graphQLClient.query(
      gql`
        mutation UpdateUnityProfileMeta($input: UpdateUnityProfileMetaInput!) {
          updateUnityProfileMeta(input: $input) {
            id
            tenantId
            defaultProfile
            priorityList
          }
        }
      `,
      {
        input: {
          priorityList,
          id: metaID,
        },
      },
    );
    return result;
  }
  async deleteUserUnityProfileLink(id) {
    const result = await this.graphQLClient.query(
      gql`
        mutation DeleteUserUnityProfileLink(
          $input: DeleteUserUnityProfileLinkInput!
        ) {
          deleteUserUnityProfileLink(input: $input) {
            id
          }
        }
      `,
      {
        input: {
          id,
        },
      },
    );
    return result;
  }

  async deleteUnityProfile(profileName) {
    const unityProfiles = await this.listUnityProfiles();
    const matchedResult = unityProfiles.items.find((profile) => {
      return profileName === profile.name;
    });
    const result = await this.graphQLClient.query(
      gql`
        mutation DeleteUnityProfile($input: DeleteUnityProfileInput!) {
          deleteUnityProfile(input: $input) {
            id
            name
            users {
              items {
                id
              }
            }
            teams {
              items {
                id
              }
            }
          }
        }
      `,
      {
        input: {
          id: matchedResult.id,
        },
      },
    );
    await Promise.all(
      result.deleteUnityProfile.teams.items.map(
        (team) => this.deleteTeamUnityProfileLink(team.id),
      ),
    );
    await Promise.all(
      result.deleteUnityProfile.users.items.map(
        (user) => this.deleteUserUnityProfileLink(user.id),
      ),
    );
    const metas = await this.listUnityProfileMetas();
    const index = metas.items[0].priorityList.indexOf(matchedResult.id);
    if (index > -1) {
      metas.items[0].priorityList.splice(index, 1);
    }
    await this.updateUnityProfileMeta(
      metas.items[0].priorityList,
      metas.items[0].id,
    );
    return result;
  }

  async listUnityProfiles() {
    const result = await this.graphQLClient.query(gql`
      query ListUnityProfiles {
        listUnityProfiles {
          items {
            id
            name
            actions
            teams {
              items {
                id
                team {
                  id
                  name
                }
              }
            }
            users {
              items {
                id
                user {
                  id
                }
              }
            }
            createdAt
          }
          nextToken
        }
      }
    `);
    return result.listUnityProfiles;
  }

  async listUnityProfileMetas() {
    const result = await this.graphQLClient.query(gql`
      query ListUnityProfileMetas {
        listUnityProfileMetas {
          items {
            id
            defaultProfile
            priorityList
          }
        }
      }
    `);
    return result.listUnityProfileMetas;
  }
  async createUnityProfileInTransaction(profile, teams, users) {
    this.teamAPI.init(process.env.GRAPHQL_API);
    const metas = await this.listUnityProfileMetas();
    metas.items[0].priorityList.push(profile.payload.id);
    const teamsList = await this.teamAPI.listTeamEntrys();
    const teamsPayload = teamsList.listTeamEntrys.items
      .filter((team) => teams.includes(team.name))
      .map((team) => {
        return {
          payload: {
            teamUnityProfileLinkTeamId: team.id,
            teamUnityProfileLinkUnityProfileId: profile.payload.id,
          },
        };
      });

    const usersPayload = users.map((user) => {
      return {
        payload: {
          userUnityProfileLinkUnityProfileId: profile.payload.id,
          userUnityProfileLinkUserId: user,
        },
      };
    });

    const result = await this.graphQLClient.query(
      gql`
        mutation CreateUnityProfileInTransaction(
          $input: CreateUnityProfileInTransactionTransactionInput!
        ) {
          createUnityProfileInTransaction(input: $input) {
            profile {
              actions
              id
              name
              tenantId
              createdAt
              updatedAt
            }
            teams {
              id
              createdAt
              updatedAt
            }
            users {
              id
              createdAt
              updatedAt
            }
            meta {
              defaultProfile
              id
              priorityList
              tenantId
              createdAt
              updatedAt
            }
          }
        }
      `,
      {
        input: {
          profile: profile,
          meta: {
            payload: {
              priorityList: metas.items[0].priorityList,
              id: metas.items[0].id,
              defaultProfile: metas.items[0].defaultProfile,
            },
          },
          teams: teamsPayload,
          users: usersPayload,
        },
      },
    );
    return result;
  }
};
