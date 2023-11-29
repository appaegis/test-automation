const { HTTPS } = require("./https");
const { gql } = require("graphql-request");
const {
  sshProfileSchema,
  sshProfileRuleSchema,
} = require("../../../../core_lib/src/schema");
const { SSHRuleAPI } = require("./sshRule");

exports.SSHProfileAPI = class sshProfile extends HTTPS {
  constructor() {
    super();
    this.sshRuleAPI = new SSHRuleAPI();
  }

  async listSSHAuthProfiles() {
    let result = await this.graphQLClient.query(
      gql`query {
        listSSHAuthProfiles(limit: 100) {
            items {
                ${sshProfileSchema}
              }
        }
      }`,
      {}
    );
    return result.listSSHAuthProfiles.items;
  }

  async createSSHAuthProfile(name) {
    //Please use createSshAuthProfileRule instead
    let result = await this.graphQLClient.query(
      gql`
      mutation CreateSshAuthProfile($input: CreateSSHAuthProfileInput!) {
        createSSHAuthProfile(input: $input) {
          ${sshProfileSchema}
        }
      }
      `,
      {
        input: {
          name,
        },
      }
    );
    return result;
  }

  async createSshAuthProfileRule(name, rule) {
    let newAuthProfile = await this.createSSHAuthProfile(name);
    await this.sshRuleAPI.init();
    let rules = await this.sshRuleAPI.listSSHAuthRules();
    let ruleID = undefined;
    for (let i = 0; i < rules.length; i += 1) {
      if (rules[i].name == rule) ruleID = rules[i].id;
    }

    let result = await this.graphQLClient.query(
      gql`
      mutation CreateSshAuthProfileRule($input: CreateSSHAuthProfileRuleInput!) {
        createSSHAuthProfileRule(input: $input) {
            ${sshProfileRuleSchema}
        }
    }
      `,
      {
        input: {
          profileID: newAuthProfile.createSSHAuthProfile.id,
          ruleID: ruleID,
        },
      }
    );
    return result;
  }

  async listSSHAuthProfileRules() {
    let result = await this.graphQLClient.query(
      gql`query {
            listSSHAuthProfileRules(limit: 100) {
                items {
                    ${sshProfileRuleSchema}
                  }
            }
          }`,
      {}
    );
    return result.listSSHAuthProfileRules.items;
  }

  async deleteSSHAuthProfileRule(name) {
    let sshAuthProfileRules = await this.listSSHAuthProfileRules();
    const entryID = this.findEntryID(sshAuthProfileRules, name, (entry) => {
      return sshAuthProfileRules[entry].profile.name == name;
    });
    if (!entryID) return entryID;
    let result = await this.graphQLClient.query(
      gql`
        mutation DeleteSshAuthProfileRule(
          $input: DeleteSSHAuthProfileRuleInput!
        ) {
          deleteSSHAuthProfileRule(input: $input) {
            id
          }
        }
      `,
      { input: { id: entryID } }
    );
    await this.deleteSSHAuthProfile(name);
    return result;
  }

  async deleteSSHAuthProfile(name) {
    //Please use deleteSSHAuthProfileRule instead
    let sshAuthProfiles = await this.listSSHAuthProfiles();
    const entryID = this.findEntryID(sshAuthProfiles, name);
    if (!entryID) return entryID;
    let result = await this.graphQLClient.query(
      gql`
        mutation DeleteSshAuthProfile($input: DeleteSSHAuthProfileInput!) {
          deleteSSHAuthProfile(input: $input) {
            id
          }
        }
      `,
      { input: { id: entryID } }
    );
    return result;
  }

  async updateSSHAuthProfile(originName, editName) {
    //Please use deleteSSHAuthProfileRule instead
    let sshAuthProfiles = await this.listSSHAuthProfiles();
    const entryID = this.findEntryID(sshAuthProfiles, originName);
    if (!entryID) return entryID;
    let result = await this.graphQLClient.query(
      gql`
      mutation UpdateSshAuthProfile($input: UpdateSSHAuthProfileInput!) {
          updateSSHAuthProfile(input: $input) {
            ${sshProfileSchema}
          }
        }
      `,
      {
        input: {
          id: entryID,
          name: editName,
        },
      }
    );
    return result;
  }
};
