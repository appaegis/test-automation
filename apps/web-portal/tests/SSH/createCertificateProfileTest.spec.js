const { test, expect } = require("../../src/fixtures/commonSetup");
const { Sidebar } = require("../../src/pages/sidebar");
const { SSHCertificatesAPI } = require("../../src/library/apiRequest/sshCertificates");
const { SSHCertificates } = require("../../src/pages/sshCertificates");

// Test parameters.
const SSH_CA_PROFILE_NAME = "automationCreateCertificateProfile";
const SSH_CA_CN = "C34";
const sshCertificatesAPI = new SSHCertificatesAPI();

test.use({
  sshCertificates: async ({ page }, use) => {
    await use(new SSHCertificates(page));
  },
});

test.afterAll(async ({}) => {
  await sshCertificatesAPI.init();
  await sshCertificatesAPI.deleteCertificate(SSH_CA_PROFILE_NAME);
});

test.describe("Create a certificate with self-generated", () => {
  test("Create a certificate with self-generated @C34 regression", async ({ sshCertificates, waitForSpinnerLoaded }) =>{
    await sshCertificates.goto();
    await waitForSpinnerLoaded();

    // Create a new self-generated CA.
    await sshCertificates.addSelfGeneratedCA(SSH_CA_PROFILE_NAME, SSH_CA_CN);
    await waitForSpinnerLoaded();

    // Confirm the CA is created success.
    await sshCertificates.inputSearch(SSH_CA_PROFILE_NAME);
    const row = await sshCertificates.oldTable.getRow(SSH_CA_PROFILE_NAME);
    const value = await row.getValueByHeader("Name", 2);
    expect(value).toEqual(SSH_CA_PROFILE_NAME);
  });
});
