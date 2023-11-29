const { test, expect } = require("@playwright/test");
const { SSHRuleAPI } = require("../../src/library/apiRequest/sshRule");
const { LogAPI } = require("../../src/library/apiRequest/log");

const logAPI = new LogAPI();

test.beforeAll(async () => {
  await logAPI.init(process.env.GRAPHQL_API);
});

test.describe("log directive @5824", () => {
  test("searchAccessLog", async () => {
    const filter = {
      and: [
        {
          client_browser: { eq: "Chrome" },
        },
        {
          app_type: { eq: "web" },
        },
      ],
    };
    const result = await logAPI.searchAccessLog(10, filter);
    result.searchAccessLog.hits.map((log) => {
      expect(log.client_browser).toEqual("Chrome");
      expect(log.app_type).toEqual("web");
    });
  });
  test("getAccessLogPresentValues", async () => {
    const filterUser = {
      user_name: { eq: process.env.ADMIN_USERNAME },
    };
    const filterApp = {
      or: [
        {
          app_type: { eq: "ssh" },
        },
        {
          app_type: { eq: "web" },
        },
      ],
    };
    const matchedUser = await logAPI.getAccessLogPresentValues(
      "user_name",
      filterUser
    );
    expect(matchedUser.getAccessLogPresentValues[0]).toEqual(
      process.env.ADMIN_USERNAME
    );
    const matchedApps = await logAPI.getAccessLogPresentValues(
      "app_type",
      filterApp
    );
    matchedApps.getAccessLogPresentValues.forEach((value) => {
      expect(value).toMatch(/ssh|web/);
    });
  });

  test("getAccessLogCategorizedCounts", async () => {
    const filter = {
      and: [
        { client_browser: { eq: "Chrome" } },
        {
          geoip: {
            country_code2: {
              eq: "TW",
            },
          },
        },
      ],
    };
    const result = await logAPI.getAccessLogCategorizedCounts(
      "client_browser",
      "geoip.country_code2",
      filter
    );
    expect(result.getAccessLogCategorizedCounts[0]).toMatchObject({
      primaryGroup: "Chrome",
      secondaryGroup: "TW",
    });
    expect(result.getAccessLogCategorizedCounts[0].count).toBeDefined();
  });
});
