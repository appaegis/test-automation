import { check, sleep } from "k6";
import http from "k6/http";
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
// const {
//  getAuthAndTenantID,
//  getCurrentDate,
//  elasticSearchHost,
// } = require("../load_testing/src/untils.js");

// export function setup() {
//  const authAndTenantID = getAuthAndTenantID();
//  return authAndTenantID;
// }

// define configuration
export const options = {
  //define thresholds
  thresholds: {
    http_req_failed: [{ threshold: "rate<0.005" }], 
    http_req_duration: ["p(99)<1000"], // 99% of requests should be below 1s
  },
  // define scenarios
  scenarios: {
    shared_iter_scenario: {
      executor: "shared-iterations",
      vus: 1000,
      iterations: 20000,
      startTime: "1s"
    },
  }
};

export default function (authAndTenantID) {
  // console.log("auth: " + authAndTenantID);
  // ------------------------------Pre-check-----------------------------------
  const urlPreCheck = "https://qa-api.mammothcyber.io/rest/v1/public/signInPreCheck";
  const payloadPreCheck = JSON.stringify({
    "email": "heybruce+001@gmail.com"
  });
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  // send a post request and save response as a variable
  const resPreCheck = http.post(urlPreCheck, payloadPreCheck, params);
  // check that response is 200
  check(resPreCheck, {
    "Pre-check response code was 200": (resPreCheck) => resPreCheck.status == 200,
  });
  if(resPreCheck.status != 200) {
    console.log("*** Pre-check ***   Status: " + resPreCheck.status + " Body: " + resPreCheck.body);
  };
  
  // -----------------------------Cognito----------------------------------------
//   const urlCognito = "https://cognito-idp.us-east-1.amazonaws.com/";
//   const idToken = authAndTenantID.idToken;
//   const payloadCognito = JSON.stringify({
//     "AuthFlow": "USER_SRP_AUTH",
//     "ClientId": "6mnhfltvibt1d7q5i6k1bff3da",
//     "AuthParameters": {
//       "USERNAME": "heybruce+001@gmail.com",
//       "SRP_A": idToken
//     },
//     "ClientMetadata": {}
//   });
//   const resCognito = http.post(urlCognito, payloadCognito, params);
//   check(resCognito, {
//     "Cognito IDP response code was 200": (resCognito) => resCognito.status == 200,
//   });
//   if(resPreCheck.status != 200) {
//     console.log("*** Cognito IDP ***   Status: " + resPreCheck.status + " Body: " + resPreCheck.body);
//   };
  sleep(1);
}

export function handleSummary(data) {
  console.log('Preparing the end-of-test summary...');

  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  // Send the results to some remote server or trigger a hook
//   const resp = http.post('http://es.mammothcyber.io/load_testing_locallogin/_doc/', JSON.stringify(data), params);
//   if (resp.status != 200) {
//     console.error('Error, got status ' + resp.status + " Body: " + resp.body);
//   }

  return {
    stdout : textSummary(data, {indent: '**', enableColors: true}),
    // './test_results/localLoginSummary.json' : JSON.stringify(data),
  };
};