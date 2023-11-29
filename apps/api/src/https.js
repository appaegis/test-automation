const { GraphQLClient } = require("./graphql");
const axios = require("axios");

exports.HTTPS = class HTTPS {
  async init(
    endpoint = process.env.APP_SYNC,
    userName = process.env.ADMIN_USERNAME,
    password = process.env.ADMIN_PASSWORD
  ) {
    // init any client in the future
    this.graphQLClient = await this.getGraphQLClient(
      endpoint,
      userName,
      password
    );
    this.restfulClient = await axios.create({
      headers: {
        Authorization: process.env.APItoken,
      },
    });
  }

  async getGraphQLClient(endpoint, userName, password) {
    let graphQLClient = await GraphQLClient.getClient(
      endpoint,
      userName,
      password
    );
    graphQLClient.tenantID = process.env.tenantID;
    return graphQLClient;
  }

  findEntryID(
    entrys,
    target,
    condition = (entryIndex) => {
      return entrys[entryIndex].name == target;
    }
  ) {
    let entryID = undefined;
    for (let i = 0; i < entrys.length; i += 1) {
      if (condition(i)) {
        entryID = entrys[i].id;
        return entryID;
      }
    }
    return entryID;
  }
};
