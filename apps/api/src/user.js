const { HTTPS } = require("./https");
const { gql } = require("graphql-request");
const { TeamAPI } = require("./team");
exports.UserAPI = class User extends HTTPS {
  async getUserEntry(user = process.env.ADMIN_USERNAME) {
    const res = await this.graphQLClient.query(
      gql`
        query accounStatus($id: String!) {
          getUserEntry(id: $id) {
            name
            id
            lastlogin
            phone
            tenant {
              id
              domain
              description
              firstLogin
              sku {
                skuType
                name
                capacity {
                  customizedDomain
                  features
                  logRetationDays
                  networkQuota
                  resourceProtocol
                  resourceQuota
                  userQuota
                }
              }
              paidUserQuota
              paidSubscriptionStartAt
            }
          }
        }
      `,
      { id: user },
    );
    return res;
  }

  async deleteUser(email) {
    email = email.toLowerCase();
    const result = await this.restfulClient.delete(
      `${process.env.EXECUTE_API}/users/${email}`,
      {
        headers: {
          "idtoken": process.env.APItoken,
          "content-type": "application/x-www-form-urlencoded",
        },
      },
    );
    return result;
  }
  async createUser(
    emails,
    adminRole = "user",
    teams = ["Default"],
    accessRoleIds = [],
    mfa = false,
    skipSignUpVerification = true,
    isMagicLinkTurnOn = false,
  ) {
    const teamAPI = new TeamAPI();
    await teamAPI.init(process.env.GRAPHQL_API);
    const teamsEntries = await teamAPI.listTeamEntrys();
    const teamIds = teamsEntries.listTeamEntrys.items
      .filter((team) => {
        return teams.includes(team.name);
      })
      .map((team) => {
        return team.id;
      });
    const addResult = await this.restfulClient.post(
      `${process.env.EXECUTE_API}/users/batch`,
      {
        emails,
        adminRole,
        teamIds,
        accessRoleIds,
        mfa,
        skipSignUpVerification,
        isMagicLinkTurnOn,
      },
      {
        headers: {
          idtoken: process.env.APItoken,
        },
      },
    );
    const confirmResult = await this.restfulClient.post(
      process.env.COGNITO_IDP,
      {
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: emails[0].toLowerCase(),
        Password: process.env.ADMIN_PASSWORD,
        UserAttributes: [],
        ValidationData: null,
        ClientMetadata: {
          awsMarketplaceToken: "",
          skipSignUpVerificationCheckedCode:
            addResult.data.emailCandidateList[0]
              .skipSignUpVerificationCheckedCode,
        },
      },
      {
        headers: {
          "content-type": "application/x-amz-json-1.1",
          "x-amz-target": "AWSCognitoIdentityProviderService.SignUp",
        },
      },
    );
    return confirmResult;
  }
};
