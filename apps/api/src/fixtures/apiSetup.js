const base = require("@playwright/test");
const { GraphQLClient } = require("../library/apiRequest/graphql");

exports.test = base.test.extend({
  graphQLSync: async ({}, use) => {
    await use(await GraphQLClient.getClient(process.env.APP_SYNC));
  },
  graphQLAPI: async ({}, use) => {
    await use(await GraphQLClient.getClient(process.env.GRAPHQL_API));
  },
});
exports.expect = base.expect;
