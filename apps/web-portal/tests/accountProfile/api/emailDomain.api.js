const { test, expect } = require("../../../src/fixtures/apiSetup");
const { EmailDomainAPI } = require("../../../src/library/apiRequest/accountProfile");
const { UserAPI } = require("../../../src/library/apiRequest/user");
test.describe.configure({ mode: "serial" });

const EMAIL_DOMAIN = "automation.com";
const USER_ACCOUNT = 'appaegisqa+c6923@gmail.com';
const USER_TOKEN_EMAIL_DOMAIN = 'userTokenTest.com';
const MAX_EMAIL_DOMAIN_ENTRY = 5;

let emailDomainAPI = new EmailDomainAPI();
let userEmailDomainAPI = new EmailDomainAPI();
let userAPI = new UserAPI();

test.beforeAll(async () => {
  await emailDomainAPI.init(process.env.GRAPHQL_API);
  await userAPI.init();
  await userAPI.createUser([USER_ACCOUNT], "user");
  await userEmailDomainAPI.init(process.env.GRAPHQL_API, USER_ACCOUNT);
});

test.afterAll(async () => {
  await emailDomainAPI.deleteEmailDomain(USER_TOKEN_EMAIL_DOMAIN);
  await emailDomainAPI.deleteEmailDomain(EMAIL_DOMAIN);
  await userAPI.init(process.env.GRAPHQL_API);
  await userAPI.deleteUser(USER_ACCOUNT);
});

test.describe("Corporate email domains API testing", () => {
  test("createEmailDomain @C6089", async () => {
    let result = await emailDomainAPI.createEmailDomain(EMAIL_DOMAIN);
    expect(result.createEmailDomain.domain).toEqual(EMAIL_DOMAIN);
  });

  test("queryEmailDomains @C6091", async () => {
    let emailDomainEntries = await emailDomainAPI.queryEmailDomains();
    let entry = emailDomainEntries.listEmailDomains.items.find((emailDomainEntry) => EMAIL_DOMAIN == emailDomainEntry.domain);
    test.fail(!entry, `${EMAIL_DOMAIN} should be existed`);
  });

  test("deleteEmailDomain @C6090", async () => {
    await emailDomainAPI.deleteEmailDomain(EMAIL_DOMAIN);
    let emailDomainEntries = await emailDomainAPI.queryEmailDomains();
    let entry = emailDomainEntries.listEmailDomains.items.find((emailDomainEntry) => EMAIL_DOMAIN === emailDomainEntry.domain);
    test.fail(entry, `${EMAIL_DOMAIN} should be deleted`);
  });

  test("Should not be able to create over five domains @C6923", async() => {
    test.skip(true, "remove this skip unitl AC-3981 is fixed");
    // query the current domain entry number.
    let emailDomainEntries = await emailDomainAPI.queryEmailDomains();
    for(let i=emailDomainEntries.listEmailDomains.items.length+1; MAX_EMAIL_DOMAIN_ENTRY+1 > i;i+=1){
      // create to five domains, and try to fill the sixth entry.
      await emailDomainAPI.createEmailDomain('sampledomain0' + i + '.com');
    }
    await emailDomainAPI.createEmailDomain('sampledomain06.com');

    // query again and confirm the total entry is still five.
    emailDomainEntries = await emailDomainAPI.queryEmailDomains();
    for(let i=0; emailDomainEntries.listEmailDomains.items.length > i; i+=1){
      if(emailDomainEntries.listEmailDomains.items[i].domain.includes('sampledomain')){
        await emailDomainAPI.deleteEmailDomain(emailDomainEntries.listEmailDomains.items[i].domain);
      }
    }
    if (MAX_EMAIL_DOMAIN_ENTRY+1 == emailDomainEntries.listEmailDomains.items.length){
      test.fail(true, `have ${emailDomainEntries.listEmailDomains.items.length} domain(shouldn't)`);
    }
  });

  test("User token should not work @C6924", async() => {
    // should not create email domain success.
    let createResult;
    try{
      createResult = await userEmailDomainAPI.createEmailDomain(USER_TOKEN_EMAIL_DOMAIN);
    }catch(e){
      if (toString(e).includes('Unauthorized to perform create on EmailDomain')){
        test.fail(true, "should not create email domain success");
      }  
    }

    // create an email domain and try to delete it with user token.
    var deleteResult
    try{
      await emailDomainAPI.createEmailDomain(USER_TOKEN_EMAIL_DOMAIN);
      deleteResult = await userEmailDomainAPI.deleteEmailDomain(USER_TOKEN_EMAIL_DOMAIN);
    }catch(e){
      if (toString(e).includes('Unauthorized to perform delete on EmailDomain')){
        test.fail(true, "should not delete email domain success");
      }
    }
  });
});
