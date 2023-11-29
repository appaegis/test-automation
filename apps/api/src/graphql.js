const { GraphQLClient: GraphQLRequest } = require("graphql-request");
const getIdTokenAndTenantUsingUserPassword = require("../../../../core_lib/src/authorize");

exports.GraphQLClient = class GraphQLClient {
  client = null;

  constructor(endpoint, token) {
    this.client = new GraphQLRequest(endpoint, {
      headers: {
        authorization: token,
      }
    });
  }

  static async getClient(
    endpoint,
    username = process.env.ADMIN_USERNAME,
    password = process.env.ADMIN_PASSWORD
  ) {
    if (username != process.env.currentUser) {
      const info = await getIdTokenAndTenantUsingUserPassword({
        username,
        password,
      });
      process.env.currentUser = username;
      process.env.APItoken = info.idToken;
      process.env.tenantID = info.tenantID;
    }
    return new GraphQLClient(endpoint, `Bearer ${process.env.APItoken}`);
  }

  query(query, variables) {
    return this.client.request(query, variables);
  }
};
