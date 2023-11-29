const { test, expect } = require("../../src/fixtures/apiSetup");
const { gql } = require("graphql-request");
test.describe.configure({ mode: "serial" });

test.describe("listNetworkEntrys API testing @C5612", () => {
  test("listNetworkEntrys", async ({ graphQLAPI }) => {
    let result = await graphQLAPI.query(
      gql`
        query {
          listNetworkEntrys(limit: 1) {
            items {
              AgentToken
              activeServiceEdges(limit: 1) {
                items {
                  id
                }
              }
              description
              devicemgmt
              id
              name
              networkTag
              networkType
              nwcidr
              resource(limit: 1) {
                items {
                  id
                  resourcetype
                }
              }
              serviceedge(limit: 1) {
                items {
                  id
                }
              }
              tenant {
                id
              }
              validationCode
              vpcid
              vpnRoutes
            }
            nextToken
          }
        }
      `,
      {}
    );
    expect(result.listNetworkEntrys.items.length).toBeGreaterThanOrEqual(1);
    expect(result.listNetworkEntrys.items[0].id).not.toBeNull();
    expect(result.listNetworkEntrys.items[0].name).not.toBeNull();
  });
});
