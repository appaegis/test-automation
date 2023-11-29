const {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserPool,
} = require("amazon-cognito-identity-js");

async function getIdTokenAndTenantUsingUserPassword({ username, password }) {
  // const USER_POOL_ID = 'YOUR_USER_POOL_ID'
  const USER_POOL_ID = process.env.USER_POOL_ID;
  // const CLIENT_ID = 'YOUR_CLIENT_ID'
  const CLIENT_ID = process.env.CLIENT_ID;

  const userPool = new CognitoUserPool({
    UserPoolId: USER_POOL_ID,
    ClientId: CLIENT_ID,
  });

  const cognitoUser = new CognitoUser({
    Username: username,
    Pool: userPool,
  });

  const authenticationDetails = new AuthenticationDetails({
    Username: username,
    Password: password,
  });
  const result = await new Promise((resolve, reject) => {
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess(...args) {
        resolve(...args);
      },
      onFailure(...args) {
        console.log("onFailure", ...args);
        reject(...args);
      },
      mfaRequired(...args) {
        console.log("mfaRequired", ...args);
        reject("mfaRequired");
      },
      mfaSetup(...args) {
        reject("mfaSetup");
      },
      selectMFAType(...args) {
        reject("selectMFAType");
      },
      totpRequired(...args) {
        reject("totpRequired");
      },
    });
  });
  let tenantID = result.idToken.payload.usertenantid
    ? result.idToken.payload.usertenantid
    : result.idToken.payload.superusertenantid;
  return { idToken: `${result.idToken.jwtToken}`, tenantID };
}

module.exports = getIdTokenAndTenantUsingUserPassword;

async function getAuth() {
  const info = await getIdTokenAndTenantUsingUserPassword({
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
  });
  return info;
}
if (typeof require !== "undefined" && require.main === module) {
  getAuth().then((a) => {
    console.log(JSON.stringify(a));
  });
}
