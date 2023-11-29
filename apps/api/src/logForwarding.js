const { test } = require("@playwright/test");
const { HTTPS } = require("./https");
const { gql } = require("graphql-request");
const { logForwardingEntrySchema } = require("../../../../core_lib/src/schema");

exports.LogForwardingAPI = class LogForwarding extends HTTPS {
  async getLogForwardingEntries() {
    let res = await this.graphQLClient.query(
      gql`
            query ListLogForwardingEntrys($filter: ModelLogForwardingEntryFilterInput, $limit: Int, $nextToken: String) {
                listLogForwardingEntrys(filter: $filter, limit: $limit, nextToken: $nextToken) {
                    items{
                        ${logForwardingEntrySchema}
                    }
               }
            }
        `,
      { limit: 1000 }
    );
    return res;
  }

  async deleteLogForwardingEntry(name) {
    let res = await this.getLogForwardingEntries();
    let logForwardingProfiles = res.listLogForwardingEntrys.items;
    let entryID = this.findEntryID(logForwardingProfiles, name);
    if (!entryID) return entryID;
    res = await this.graphQLClient.query(
      gql`
        mutation DeleteLogForwardingEntry($input: DeleteLogForwardingEntryInput!, $condition: ModelLogForwardingEntryConditionInput){
            deleteLogForwardingEntry(input: $input, condition: $condition) {
                ${logForwardingEntrySchema}
           }
        }`,
      { input: { id: entryID } }
    );

    return res;
  }

  async createLogForwardingEntry(variables) {
    let res = await this.graphQLClient.query(
      gql`
        mutation CreateLogForwardingEntry($input: CreateLogForwardingEntryInput!, $condition: ModelLogForwardingEntryConditionInput){
            createLogForwardingEntry(input: $input, condition: $condition) {
                ${logForwardingEntrySchema}
            }
        }
        `,
      variables
    );
    return res;
  }

  async editLogForwardingEntry(originalName, variables) {
    let entryID = "not found";
    let res = await this.getLogForwardingEntries();
    let logForwardingProfiles = res.listLogForwardingEntrys.items;
    for (let i = 0; i < logForwardingProfiles.length; i += 1) {
      if (logForwardingProfiles[i].name == originalName)
        entryID = logForwardingProfiles[i].id;
    }
    if (!entryID)
      throw (
        `no logForwarding entry "${originalName}" found please check your name is correct \n` +
        JSON.stringify(logForwardingProfiles)
      );
    variables.input.id = entryID;
    res = await this.graphQLClient.query(
      gql`
        mutation UpdateLogForwardingEntry($input: UpdateLogForwardingEntryInput!, $condition: ModelLogForwardingEntryConditionInput){
            updateLogForwardingEntry(input: $input, condition: $condition) {
                ${logForwardingEntrySchema}
            }
        }`,
      variables
    );
    return res;
  }
};
