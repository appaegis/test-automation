const { test } = require("@playwright/test");
const { HTTPS } = require("./https");
const { gql } = require("graphql-request");
const { TeamAPI } = require("./team");

exports.PolicyAPI = class Policy extends HTTPS {
  async listPolicyEntries() {
    const result = await this.graphQLClient.query(gql`
      query ListPolicyEntrys {
        listPolicyEntrys {
          items {
            id
            name
            description
            resources {
              items {
                resname
                appsetting {
                  appprotocol
                  appinternalurl
                }
                resourcetype
                description
                network {
                  name
                }
              }
            }
            rules {
              items {
                id
                actions
                appliedToAllUsers
                teams {
                  items {
                    id
                    team {
                      id
                      name
                    }
                  }
                  total
                }
                users {
                  items {
                    id
                    user {
                      id
                      name
                    }
                  }
                  total
                }
              }
              total
            }
            contentLogEnabled
          }
          nextToken
        }
      }
    `);
    return result.listPolicyEntrys.items;
  }

  async deletePolicy(policyName) {
    const polices = await this.listPolicyEntries();
    const targetPolicy = polices.find((policy) => {
      return policy.name == policyName;
    });
    await this.#deletePolicyEntry(targetPolicy.id);
    await this.#deletePolicyRuleInTransaction(targetPolicy.rules.items);
  }

  async #deletePolicyRuleInTransaction(rules) {
    for (const rule of rules) {
      await this.graphQLClient.query(
        gql`
          mutation DeletePolicyRuleInTransaction(
            $input: DeletePolicyRuleInTransactionTransactionInput!
          ) {
            deletePolicyRuleInTransaction(input: $input) {
              rule {
                id
              }
            }
          }
        `,
        {
          input: {
            rule: {
              payload: {
                id: rule.id,
              },
            },
            teams: rule.teams.items.map((team) => {
              return {
                payload: {
                  id: team.id,
                },
              };
            }),
            users: rule.users.items.map((user) => {
              return {
                payload: {
                  id: user.id,
                },
              };
            }),
          },
        }
      );
    }
  }

  async createPolicy(params) {
    const defaultParams = {
      description: "",
      contentLogEnabled: false,
    };
    const payload = { ...defaultParams, ...params };
    const policyEntry = await this.#createPolicyEntry(payload);
    const addRulesResult = await this.#createPolicyRuleInTransaction(
      payload,
      policyEntry.id
    );
    return { policyEntry, addRulesResult };
  }

  async #deletePolicyEntry(id) {
    await this.graphQLClient.query(
      gql`
        mutation DeletePolicyEntry($input: DeletePolicyEntryInput!) {
          deletePolicyEntry(input: $input) {
            id
            rules {
              items {
                id
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
                      name
                    }
                  }
                }
              }
            }
          }
        }
      `,
      {
        input: {
          id,
        },
      }
    );
  }

  async #createPolicyEntry(params) {
    const result = await this.graphQLClient.query(
      gql`
        mutation CreatePolicyEntry($input: CreatePolicyEntryInput!) {
          createPolicyEntry(input: $input) {
            id
          }
        }
      `,
      {
        input: {
          name: params.name,
          description: params.description,
          contentLogEnabled: params.contentLogEnabled,
        },
      }
    );
    return result.createPolicyEntry;
  }

  async #createPolicyRuleInTransaction(params, policyID) {
    const teamAPI = new TeamAPI();
    await teamAPI.init(process.env.GRAPHQL_API);
    const teams = await teamAPI.listTeamEntrys();
    let resultList = [];
    for (const rule of params.rules) {
      const ruleID = Math.random().toString(36).slice(-10);
      const result = await this.graphQLClient.query(
        gql`
          mutation CreatePolicyRuleInTransaction(
            $input: CreatePolicyRuleInTransactionTransactionInput!
          ) {
            createPolicyRuleInTransaction(input: $input) {
              rule {
                id
              }
              teams {
                id
              }
              users {
                id
              }
            }
          }
        `,
        {
          input: {
            rule: {
              payload: {
                actions: [...rule.actions],
                ruleEntryPolicyId: policyID,
                id: ruleID,
              },
            },
            teams: rule.teams.map((team) => {
              const targetTeam = teams.listTeamEntrys.items.find((perTeam) => {
                return perTeam.name == team;
              });
              return {
                payload: {
                  ruleTeamLinkRuleId: ruleID,
                  ruleTeamLinkTeamId: targetTeam.id,
                },
              };
            }),
            users: rule.users.map((user) => ({
              payload: {
                ruleUserLinkRuleId: ruleID,
                ruleUserLinkUserId: user,
              },
            })),
          },
        }
      );
      resultList.push(result.createPolicyRuleInTransaction);
    }
    return resultList;
  }
};
