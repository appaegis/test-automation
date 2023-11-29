import { check, sleep } from "k6";
import http from "k6/http";
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

const {
  getAuthAndTenantID,
  getCurrentDate,
  elasticSearchHost,
 } = require("../load_testing/src/untils.js");
 
 export function setup() {
  const authAndTenantID = getAuthAndTenantID();
  return authAndTenantID;
 }

// define configuration
export const options = {
  //define thresholds
  thresholds: {
    http_req_failed: [{ threshold: "rate<0.005" }], 
    http_req_duration: ["p(99)<3000"], // 99% of requests should be below 3s
  },
  // define scenarios
  scenarios: {
    // arbitrary name of scenario
    // shared_iter_scenario: {
    //   executor: "shared-iterations", 
    //   vus: 20000,
    //   iterations: 50000,
    //   maxDuration: "30m"
    // },
    constant_arrival_rate: {
      executor: "constant-arrival-rate",
      rate: 50000,
      timeUnit: '167s',
      preAllocatedVUs: 20000,
      duration: '120s'
    },
  }
};

export default function (authAndTenantID) {
  const accessToken = authAndTenantID.idToken;
  const query = `
  query ListResourcePermittedActions($limit: Int) {
    listResourceEntrys(limit: $limit) {
        items {
            id
            permittedActions
        }
    }
  }
  `;
  const headers = {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
  const res = http.post("https://dev-api.mammothcyber.io/graphql", JSON.stringify({query: query}), 
    {headers: headers,}
  );
  // check that response is 200
  check(res, {
    "response code was 200": (r) => r.status == 200,
  });
  // Print out the response body when the status is not 200
  if(res.status != 200) {
    console.log(res.status + " " + res.status_text + " Body: " + res.body);
  }
  //timer between each test run for a vu
  sleep(1);
}

export function handleSummary(data) {
  console.log('Preparing the end-of-test summary...');
  // Send the results to remote server or trigger a hook
  const params = {
    headers: {
      "Content-Type": "application/json",
    },
  };
   const resp = http.post('http://es.mammothcyber.io/load_testing_getuserentryr-' + getCurrentDate() + '/_doc/', JSON.stringify(data), params);
   console.log(resp.status_text + " Body: " + resp.body);

  // Generate a test report in JSON file format 
  return {
    stdout : textSummary(data, {indent: '→', enableColors: true}),
    '../test_results/appLauncherSummary.json' : JSON.stringify(data),
  };
};
