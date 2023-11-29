const { test, expect } = require("../../src/fixtures/apiSetup");
const { gql } = require("graphql-request");
test.describe.configure({ mode: "serial" });

test.describe("GetTenantEntry API testing @C5605", () => {
  test("GetTenantEntry - tenant exist", async ({ graphQLAPI }) => {
    const result = await graphQLAPI.query(
      gql`
        query GetTenantEntry($id: ID!) {
          getTenantEntry(id: $id) {
            id
            name
            sku {
              skuType
              name
              capacity {
                customizedDomain
                features
                logRetationDays
                networkQuota
                resourceProtocol
                resourceQuota
                userQuota
              }
            }
          }
        }
      `,
      { id: process.env.tenantID }
    );
    expect(result.getTenantEntry).not.toBeNull();
    expect(result.getTenantEntry.id).not.toBeNull();
    expect(result.getTenantEntry.name).not.toBeNull();
    expect(result.getTenantEntry.sku.skuType).toEqual("Professional");
    expect(result.getTenantEntry.sku.capacity.customizedDomain).toBeTruthy();
    expect(result.getTenantEntry.sku.capacity.resourceProtocol).toMatchObject([
      "https",
      "http",
      "ssh",
      "rdp",
      "stcp",
      "kubectl",
    ]);
    expect(result.getTenantEntry.sku.capacity.resourceQuota).toEqual(1000);
    expect(result.getTenantEntry.sku.capacity.userQuota).toEqual(5000);
  });

  test("GetTenantEntry - tenant not exist", async ({ graphQLAPI }) => {
    const result = await graphQLAPI.query(
      gql`
        query GetTenantEntry($id: ID!) {
          getTenantEntry(id: $id) {
            id
            name
          }
        }
      `,
      { id: "id-not-exit" }
    );
    expect(result.getTenantEntry).toBeNull();
  });
});
