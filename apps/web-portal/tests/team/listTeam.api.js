const { test, expect } = require("@playwright/test");
const { TeamAPI } = require('../../src/library/apiRequest/team')
const teamAPI = new TeamAPI()
test.beforeAll(async()=>{
  await teamAPI.init(process.env.GRAPHQL_API)
})

test.describe("listTeamEntrys API testing @C5614", () => {
  test("listTeamEntrys", async () => {
    let result = await teamAPI.listTeamEntrys()
    expect(result.listTeamEntrys.items.length).toBeGreaterThanOrEqual(1);
    expect(result.listTeamEntrys.items[0].id).not.toBeNull();
    expect(result.listTeamEntrys.items[0].name).not.toBeNull();
  });
});
