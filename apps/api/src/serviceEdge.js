const { test } = require("@playwright/test");
const { HTTPS } = require("./https");
const { gql } = require("graphql-request");
const { networkSchema } = require("../../../libs/src/schema");

exports.ServiceEdgeAPI = class ServiceEdge extends HTTPS {
  async addServiceEdgeProfile(seName) {
    await this.restfulClient.post(`${process.env.EXECUTE_API}/networks`,
      {
        "name": seName,
        "deviceMesh": false,
      },
      {
        headers: {
          idtoken: process.env.APItoken,
        },
      },
    );
  }
  async listNetworkEntries() {
    const result = await this.graphQLClient.query(
      gql`
        query ListNetworkEntrysByTenantId($networkEntryTenantId: ID, $createdAt: ModelStringKeyConditionInput, $sortDirection: ModelSortDirection, $filter: ModelNetworkEntryFilterInput, $limit: Int, $nextToken: String) {
          listNetworkEntrysByTenantId(
            networkEntryTenantId: $networkEntryTenantId
            createdAt: $createdAt
            sortDirection: $sortDirection
            filter: $filter
            limit: $limit
            nextToken: $nextToken
          ) {
            items {
              ${networkSchema}
            }
            nextToken
          }
        }      
      `,
      {
        limit: 1000,
        networkEntryTenantId: process.env.tenantID,
      },
    );
    return result.listNetworkEntrysByTenantId.items;
  }

  /**
   * @function deleteSEProfile
   * @param {string} seName Service Edge profile name.
   * @throws {string} throw an error when we cannot find matching entry of the service edge profile name.
   * @return {undefined}
  */
  async deleteSEProfile(seName) {
    let seId = undefined;
    // Search the SE ID by graphQL.
    const seEntries = await this.listNetworkEntries();
    seEntries.forEach((seEntry) => {
      if (seEntry.name === seName) {
        seId = seEntry.id;
        return;
      }
    });
    if (seId === undefined) {
      throw new Error("cannot find matching entry of seName");
    }
    await this.restfulClient.delete(`${process.env.EXECUTE_API}/networks/${seId}`,
      {
        headers: {
          idtoken: process.env.APItoken,
        },
      },
    );
  }
};
