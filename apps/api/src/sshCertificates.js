const { test } = require("@playwright/test");
const { HTTPS } = require("./https");
const { gql } = require("graphql-request");

exports.SSHCertificatesAPI = class SSHCertificates extends HTTPS {
  /**
   * @function deleteCertificate
   * @param {string} caName SSH certificate profile name.
   * @throws {string} throw an error when we cannot find matching entry of the SSH certificate profile name.
   * @return {undefined}
  */
  async deleteCertificate(caName) {
    let caId = undefined;
    // Search the CA ID by graphQL.
    const caEntries = await this.graphQLClient.query(
      gql `
        query GetTenantEntry($id: ID!) {
        getTenantEntry(id: $id) {
            certificateAuthorities{
              id
              caName
            }
          }
        }
      `,
      { id: process.env.tenantID },
    );
    caEntries.getTenantEntry.certificateAuthorities.forEach((caEntry) => {
      if (caEntry.caName === caName) {
        caId = caEntry.id;
        return;
      }
    });
    if (caId === undefined) {
      throw new Error("Cannot find any matching entry of SSH certificate profile name.");
    }
    await this.restfulClient.delete(`${process.env.INTRA_REST_API}/ca/${caId}`);
  }
};
