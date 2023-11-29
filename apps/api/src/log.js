const { test } = require("@playwright/test");
const { HTTPS } = require("./https");
const { gql } = require("graphql-request");

exports.LogAPI = class Log extends HTTPS {
  async searchAccessLog(limit = 10, filter = {}) {
    const result = this.graphQLClient.query(
      gql`
      query SearchAccessLog($filter: LogAccessLogConditionInput!){
     searchAccessLog(filter: $filter
    limit: ${limit}
    orderBy: [timestamp]
    direction: [desc] ) {
    hits {
      client_browser
      client_browser_version
      app_name
      app_type
      client_os
      user{
        id
        name
      }
      geoip {
        ip
      }
      timestamp
    }
    nextToken
  }
}
              `,
      {
        filter,
      }
    );
    return result;
  }

  async getAccessLogPresentValues(field = "user_name", filter = {}) {
    const result = this.graphQLClient.query(
      gql`
        query GetPresentValues(
          $field: String!
          $filter: LogAccessLogConditionInput!
        ) {
          getAccessLogPresentValues(field: $field, filter: $filter)
        }
      `,
      {
        field,
        filter,
      }
    );
    return result;
  }
  async getAccessLogCategorizedCounts(
    primaryGroupBy,
    secondaryGroupBy,
    filter = {}
  ) {
    const result = this.graphQLClient.query(
      gql`
        query GetCategorizedCounts(
          $filter: LogAccessLogConditionInput!
          $primaryGroupBy: String!
          $secondaryGroupBy: String!
        ) {
          getAccessLogCategorizedCounts(
            filter: $filter
            primaryGroupBy: $primaryGroupBy
            secondaryGroupBy: $secondaryGroupBy
          ) {
            primaryGroup
            secondaryGroup
            count
          }
        }
      `,
      {
        primaryGroupBy,
        secondaryGroupBy,
        filter,
      }
    );
    return result;
  }

  async getActiveInfo(){
    return await this.restfulClient.post('https://qa.ce.appaegistest.com/applauncher/active_info',new URLSearchParams({json:JSON.stringify({
        idToken: process.env.APItoken,
        resourceEntryTenantId: process.env.tenantID
    })}).toString(),{
        headers:{
        "content-type": "application/x-www-form-urlencoded"
        }
      })
  }
};
