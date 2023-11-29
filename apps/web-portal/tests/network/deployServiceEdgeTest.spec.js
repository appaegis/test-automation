const { test, expect } = require("../../src/fixtures/commonSetup");
const { ServiceEdge } = require("../../src/pages/serviceEdge");
const { ServiceEdgeAPI } = require("../../src/library/apiRequest/serviceEdge");
const { EC2 } = require("../../src/library/aws/ec2Client.js");
const { FileHandler } = require("../../src/library/handler/file.js");

// Test parameters.
const SE_PROFILE_NAME = "automationDeployServiceEdgeTest";
const SE_DOCKER_FILE = "tests/network/docker-compose.yml";
const USER_DATA_SCRIPT =
  "src/fixtures/ec2UserData/deployServiceEdgeViaDockerComposeYml.sh";
const serviceEdgeAPI = new ServiceEdgeAPI();
let EC2Client;

test.use({
  serviceEdge: async ({ page }, use) => {
    await use(new ServiceEdge(page));
  },
});

test.beforeAll(async ({}) => {
  await serviceEdgeAPI.init();
  await serviceEdgeAPI.addServiceEdgeProfile(SE_PROFILE_NAME);
});
test.beforeEach(async ({ serviceEdge, waitForSpinnerLoaded }) => {
  await serviceEdge.goto();
  await waitForSpinnerLoaded();

  // Get the service edge docker compose file content.
  const row = await serviceEdge.oldTable.getRow(SE_PROFILE_NAME);
  await row.clickEdit();
  await serviceEdge.waitForDockerComposeFileReady();
  await serviceEdge.downloadDockerComposeFile(SE_DOCKER_FILE);
  await serviceEdge.clickCancel();
});

test.afterAll(async ({}) => {
  await serviceEdgeAPI.deleteSEProfile(SE_PROFILE_NAME);
  await EC2Client.terminateEC2Instances();
});

test.describe("Deploy service edge via docker-compose.yml and check service edge status", () => {
  test("Deploy service edge via docker-compose.yml and check service edge status @C52 regression", async ({
    serviceEdge,
    waitForSpinnerLoaded,
  }) => {
    test.setTimeout(300 * 1000);

    // Create an EC2 and with CA public key and user data.
    await startEC2Resource();

    // Check service edge status.
    await waitForServiceEdgeStatus(SE_PROFILE_NAME);
    await serviceEdge.goto();
    await waitForSpinnerLoaded();

    const row = await serviceEdge.oldTable.getRow(SE_PROFILE_NAME);
    const seStatus = await row.getValueByHeader("Network", 6);
    expect(seStatus).toEqual("Online");
  });
});
/**
 * @function prepareAwsResource
 */
async function startEC2Resource() {
  const dockerFile = new FileHandler();
  const userDataFile = new FileHandler();
  const dockerFileContent = await dockerFile.getFileContent(
    SE_DOCKER_FILE,
    "utf8",
  );
  await dockerFile.deleteFile(SE_DOCKER_FILE);
  let userData = await userDataFile.getFileContent(USER_DATA_SCRIPT, "utf8");
  userData = userData.replace("SE_DOCKER_COMPOSE_FILE", dockerFileContent);
  const EC2Object = {
    imageId: "ami-0bba69335379e17f8",
    deviceName: "Automation-Deploy-Service-Edge-Test",
    keyPairName: "qa-test-tokyo",
    userData: userData,
  };
  const EC2InstanceId = await EC2.launchEC2Instances(EC2Object);
  EC2Client = new EC2([EC2InstanceId]);
  await EC2Client.waitEC2InstancesRunning();
}

/**
 * @function waitForServiceEdgeStatus
 */
async function waitForServiceEdgeStatus() {
  let networkEntries;
  let targetIndex;
  await expect
    .poll(
      async () => {
        networkEntries = await serviceEdgeAPI.listNetworkEntries();
        targetIndex = networkEntries.findIndex(
          (v) => v.name === SE_PROFILE_NAME,
        );
        return networkEntries[targetIndex].activeServiceEdges.items.length;
      },
      {
        message: "make sure service edge status is online",
        timeout: 240000,
      },
    )
    .not.toEqual(0);
}
