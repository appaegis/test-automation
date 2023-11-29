const { test, expect } = require("../../src/fixtures/apiSetup");
const { gql } = require("graphql-request");
test.describe.configure({ mode: "serial" });
const { GraphQLClient } = require("../../src/graphql");

test.describe("ListMarketplaceCustomerByTenantId API testing @C5604", () => {
  test("ListMarketplaceCustomerByTenantId - user register from aws marketplaceCustomerTenantId", async () => {
    test.skip(
      process.env.NODE_ENV != "qa",
      "marketplace account currently only works on qa"
    );
    let graphQLSync = await GraphQLClient.getClient(
      process.env.APP_SYNC,
      "appaegisqa+aws03@gmail.com",
      process.env.ADMIN_PASSWORD
    );
    let result = await graphQLSync.query(
      gql`
        query ListMarketplaceCustomerByTenantId(
          $marketplaceCustomerTenantId: ID
          $sortDirection: ModelSortDirection
          $filter: ModelMarketplaceCustomerFilterInput
          $limit: Int
          $nextToken: String
        ) {
          listMarketplaceCustomerByTenantId(
            marketplaceCustomerTenantId: $marketplaceCustomerTenantId
            sortDirection: $sortDirection
            filter: $filter
            limit: $limit
            nextToken: $nextToken
          ) {
            items {
              id
              tenant {
                id
                paidUserQuota
              }
              marketplaceCustomerTenantId
            }
            nextToken
          }
        }
      `,
      { marketplaceCustomerTenantId: process.env.tenantID }
    );
    expect(
      result.listMarketplaceCustomerByTenantId.items.length
    ).toBeGreaterThanOrEqual(1);
    expect(
      result.listMarketplaceCustomerByTenantId.items[0]
        .marketplaceCustomerTenantId
    ).toEqual(process.env.tenantID);
    expect(
      result.listMarketplaceCustomerByTenantId.items[0].tenant.paidUserQuota,
      `response\n ${JSON.stringify(result)}`
    ).toBeDefined();
  });

  test("ListMarketplaceCustomerByTenantId - user not register from aws marketplaceCustomerTenantId", async ({
    graphQLSync,
  }) => {
    let result = await graphQLSync.query(
      gql`
        query ListMarketplaceCustomerByTenantId(
          $marketplaceCustomerTenantId: ID
          $sortDirection: ModelSortDirection
          $filter: ModelMarketplaceCustomerFilterInput
          $limit: Int
          $nextToken: String
        ) {
          listMarketplaceCustomerByTenantId(
            marketplaceCustomerTenantId: $marketplaceCustomerTenantId
            sortDirection: $sortDirection
            filter: $filter
            limit: $limit
            nextToken: $nextToken
          ) {
            items {
              id
              tenant {
                id
              }
              marketplaceCustomerTenantId
            }
            nextToken
          }
        }
      `,
      { marketplaceCustomerTenantId: process.env.tenantID }
    );
    expect(result.listMarketplaceCustomerByTenantId.items.length).toEqual(0);
  });

  test("ListMarketplaceCustomerByTenantId - tenant not exist", async ({
    graphQLSync,
  }) => {
    let result = await graphQLSync.query(
      gql`
        query ListMarketplaceCustomerByTenantId(
          $marketplaceCustomerTenantId: ID
          $sortDirection: ModelSortDirection
          $filter: ModelMarketplaceCustomerFilterInput
          $limit: Int
          $nextToken: String
        ) {
          listMarketplaceCustomerByTenantId(
            marketplaceCustomerTenantId: $marketplaceCustomerTenantId
            sortDirection: $sortDirection
            filter: $filter
            limit: $limit
            nextToken: $nextToken
          ) {
            items {
              id
              tenant {
                id
              }
              marketplaceCustomerTenantId
            }
            nextToken
          }
        }
      `,
      { marketplaceCustomerTenantId: "not-exist" }
    );
    expect(result.listMarketplaceCustomerByTenantId.items.length).toEqual(0);
  });
});
