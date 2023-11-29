const { test, expect } = require("@playwright/test");
const { UserAPI } = require("../../../src/library/apiRequest/user");

test.describe.configure({ mode: "serial" });
let user = new UserAPI();
test.beforeAll(async () => {
  await user.init(process.env.GRAPHQL_API);
});

test.describe("Account status API testing @C5603", () => {
  test("getUserEntry - userID exist", async () => {
    let res = await user.getUserEntry();
    expect(res.getUserEntry).toMatchObject({
      id: process.env.ADMIN_USERNAME,
    });
  });
  test("getUserEntry - userID not exist", async () => {
    let res = await user.getUserEntry("not-exist");
    expect(res.getUserEntry).toBeNull();
  });
});
