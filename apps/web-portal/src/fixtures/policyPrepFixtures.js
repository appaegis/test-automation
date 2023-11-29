exports.PolicyPrepFixtures = class PolicyPrepFixtures {
  constructor(policyAPI) {
    this.policyAPI = policyAPI;
  }

  async policySetup(policyName) {
    const payload = {
      name: policyName,
      rules: [
        {
          actions: ["copy"],
          teams: ["Default"],
          users: [process.env.ADMIN_USERNAME],
        },
      ],
    };
    return await this.policyAPI.createPolicy(payload);
  }

  async policyCleanup(policyName) {
    const result = await this.policyAPI.listPolicyEntries(policyName);

    const allMatches = result
      .filter((policy) => policy.name === policyName)
      .map((policy) => policy.name);

    for (const match of allMatches) {
      await this.policyAPI.deletePolicy(match);
    }
  }
};
