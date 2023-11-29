const { test } = require("@playwright/test");
const { HTTPS } = require("./https");
const { gql } = require("graphql-request");

exports.EmailDomainAPI = class EmailDomain extends HTTPS {
  async createEmailDomain(domain) {
    const result = await this.graphQLClient.query(
      gql`
        mutation CreateEmailDomain($input: CreateEmailDomainInput!) {
          createEmailDomain(input: $input) {
            domain
          }
        }
      `,
      {
        input: {
          domain,
        },
      },
    );
    return result;
  }

  async queryEmailDomains() {
    const result = await this.graphQLClient.query(
      gql`
        query queryEmailDomains($filter: ModelEmailDomainConditionInput) {
          listEmailDomains(filter: $filter) {
            items {
              domain
              id
              tenantId
              createdAt
              updatedAt
            }
          }
        }
      `,
    );
    return result;
  }

  async deleteEmailDomain(domain) {
    const emailDomainEntries = await this.queryEmailDomains();
    const entry = emailDomainEntries.listEmailDomains.items.find(
      (emailDomainEntry) => domain == emailDomainEntry.domain,
    );
    if (!entry) return entry;
    const result = await this.graphQLClient.query(
      gql`
        mutation DeleteEmailDomain($input: DeleteEmailDomainInput!) {
          deleteEmailDomain(input: $input) {
            domain
          }
        }
      `,
      {
        input: {
          id: entry.id,
        },
      },
    );
    return result;
  }
};

exports.TimeoutSetting = class TimeoutSetting extends HTTPS {
  /**
   * Update idle timeout value.
   * @param {number} idleTimeoutForPortal - idle timeout for portal.
   * @param {number} idleTimeoutForEab - idle timeout for EAB.
   */
  async updateTenantEntry(idleTimeoutForPortal = 24 * 60 * 60 * 1000, idleTimeoutForEab = 24 * 60 * 60 * 1000) {
    const result = await this.graphQLClient.query(
      gql` 
        mutation updateTenantEntry($input: UpdateTenantEntryInput!) {
          updateTenantEntry(input: $input) {
            id
          }
        }
      `,
      {
        input: {
          id: process.env.tenantID,
          idleTimeoutForEab,
          idleTimeoutForPortal,
        },
      },
    );
    return result.updateTenantEntry;
  }

  async getIdletimeout() {
    const result = await this.graphQLClient.query(
      gql` 
        query GetIdleTimeout($tenantId: ID!) {
          getTenantEntry(id: $tenantId) {
            id
            idleTimeoutForEab
            idleTimeoutForPortal
          }
        }
      `,
      {
        "tenantId": process.env.tenantID,
      },
    );
    return result.getTenantEntry;
  }
};
