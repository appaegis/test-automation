const { HTTPS } = require("./https");
const { gql } = require("graphql-request");

exports.TeamAPI = class Team extends HTTPS {
    async listTeamEntrys(){
        const result = await this.graphQLClient.query(
            gql`
              query {
                listTeamEntrys(limit: 100) {
                  items {
                    externalId
                    id
                    name
                    othermember
                    teamEntryOwnerId
                    tenant {
                      id
                    }
                    userEntryOwnteamsId
                    createdAt
                    updatedAt
                  }
                  nextToken
                }
              }
            `,
            {}
          );
        return result
    }
}