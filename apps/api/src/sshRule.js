const { test } = require("@playwright/test");
const { HTTPS } = require("./https");
const { gql } = require("graphql-request");
const { sshRuleSchema } = require("../../../libs/src/schema");
const { TeamAPI } = require("./team");

exports.SSHRuleAPI = class SSHRule extends HTTPS {
  async listSSHAuthRules() {
    let result = await this.graphQLClient.query(
      gql`
        query {
          listSSHAuthRules(limit: 100) {
            items {
            ${sshRuleSchema}
            }
            nextToken
          }
        }
      `
    );
    return result.listSSHAuthRules.items;
  }
  async createSSHAuthRule(
    name,
    deriveUsernameFromEmail = true,
    sshAuthMethod = "password",
    assginTeam = "Default"
  ) {
    const teamAPI = new TeamAPI();
    await teamAPI.init(process.env.GRAPHQL_API);
    const teams = await teamAPI.listTeamEntrys();
    const targetTeam = teams.listTeamEntrys.items.find((team) => {
      return team.name == assginTeam;
    });
    let result = await this.graphQLClient.query(
      gql`
        mutation CreateSshAuthRule($input: CreateSSHAuthRuleInput!) {
          createSSHAuthRule(input: $input) {
            ${sshRuleSchema}
                    }
      }
      `,
      {
        input: {
          name,
          users: [],
          groups: [targetTeam.id],
          deriveUsernameFromEmail,
          sshAuthMethod,
        },
      }
    );
    return result;
  }

  async updateSSHAuthRule(originName, newName) {
    let sshAuthRules = await this.listSSHAuthRules();
    let entryID = this.findEntryID(sshAuthRules, originName);
    if (!entryID) return entryID;
    let result = await this.graphQLClient.query(
      gql`
      mutation UpdateSshAuthRule($input: UpdateSSHAuthRuleInput!){
        updateSSHAuthRule(input: $input) {
            ${sshRuleSchema}
          }
        }
      `,
      {
        input: {
          id: entryID,
          name: newName,
        },
      }
    );
    return result;
  }

  async deleteSSHAuthRule(name) {
    let sshAuthRules = await this.listSSHAuthRules();
    let entryID = this.findEntryID(sshAuthRules, name);
    if (!entryID) return entryID;
    let result = await this.graphQLClient.query(
      gql`
        mutation DeleteSshAuthRule($input: DeleteSSHAuthRuleInput!) {
          deleteSSHAuthRule(input: $input) {
            ${sshRuleSchema}
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

  async getSSHAuthRule(name) {
    let sshAuthRules = await this.listSSHAuthRules();
    let entryID = this.findEntryID(sshAuthRules, name);
    if (!entryID) return entryID;
    let result = await this.graphQLClient.query(
      gql`
      query GetSShAuthRule($id: ID!) {\n  getSSHAuthRule(id: $id) {
            ${sshRuleSchema}
          }
        }
      `,
      {
        id: entryID,
      }
    );
    return result;
  }
};
