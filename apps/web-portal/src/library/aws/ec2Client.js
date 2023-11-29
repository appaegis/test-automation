const {
  EC2,
  waitUntilInstanceRunning,
  waitUntilPasswordDataAvailable,
} = require("@aws-sdk/client-ec2");
const crypto = require("crypto");
const { execSync } = require("child_process");
const sshpk = require("sshpk");

const ec2Client = new EC2({ apiVersion: "2016-11-15" });

exports.EC2 = class EC2 {
  constructor(InstanceIds, region = "ap-northeast-1") {
    this.params = {
      InstanceIds,
    };
  }

  async startEC2Instance() {
    await ec2Client.startInstances(this.params);
    await waitUntilInstanceRunning({
      client: ec2Client,
      maxWaitTime: 200,
    }, this.params);
  }

  async stopEC2Instance() {
    await ec2Client.stopInstances(this.params);
  }

  async getEC2Detailed() {
    const data = await ec2Client.describeInstances(this.params);
    return data;
  }

  async getPasswordData(pathToPem) {
    // This is for Windows ec2
    await waitUntilInstanceRunning({
      client: ec2Client,
      maxWaitTime: 200,
    }, this.params);
    await waitUntilPasswordDataAvailable({
      client: ec2Client,
      maxWaitTime: 200,
    }, {
      InstanceId: this.params.InstanceIds[0],
    });
    const result = execSync(`aws ec2 get-password-data --instance-id ${this.params.InstanceIds[0]} --region=ap-northeast-1 --priv-launch-key ${pathToPem}`).toString();
    return JSON.parse(result).PasswordData;
  }

  static async launchEC2Instances(customLaunchInstancesParams) {
    const defaultLaunchInstancesParams = {
      deviceName: "automation",
      keyPairName: undefined,
      imageId: "ami-03f4fa076d2981b45",
      instanceType: "t2.micro",
      subnetId: "subnet-39062762",
      userData: undefined,
      SecurityGroupIds: undefined,
    };
    const parameters = {
      ...defaultLaunchInstancesParams,
      ...customLaunchInstancesParams,
    };
    const launchInstancesParams = {
      ImageId: parameters.imageId,
      InstanceType: parameters.instanceType,
      KeyName: parameters.keyPairName,
      MaxCount: 1,
      MinCount: 1,
      SubnetId: parameters.subnetId,
      UserData: Buffer.from(parameters.userData).toString("base64"),
      SecurityGroupIds: parameters.SecurityGroupIds,
      TagSpecifications: [
        {
          ResourceType: "instance",
          Tags: [
            {
              Key: "Name",
              Value: parameters.deviceName,
            },
          ],
        },
      ],
    };
    try {
      const newEc2Data = await ec2Client.runInstances(launchInstancesParams);
      return newEc2Data.Instances[0].InstanceId;
    } catch (err) {
      console.log(err);
    }
  }

  async waitEC2InstancesRunning() {
    try {
      await waitUntilInstanceRunning({
        client: ec2Client,
        maxWaitTime: 200,
      }, this.params);
    } catch (err) {
      console.log(err);
    }
  }

  async terminateEC2Instances() {
    try {
      await ec2Client.terminateInstances(this.params);
    } catch (err) {
      console.log(err);
    }
  }

  static async importKeyPairForEC2(keyPairName, publicKey) {
    const importKeyParams = {
      KeyName: keyPairName,
      PublicKeyMaterial: publicKey,
    };
    try {
      await ec2Client.importKeyPair(importKeyParams);
    } catch (err) {
      console.log(err);
    }
  }

  static async deleteSshKeyPair(keyPairName) {
    const deleteKeyParams = {
      KeyName: keyPairName,
    };
    try {
      const result = await ec2Client.deleteKeyPair(deleteKeyParams);
    } catch (err) {
      console.log(err);
    }
  }

  static async generateKeyPair(method = "rsa", length = 2048) {
    const { publicKey, privateKey } = crypto.generateKeyPairSync(method, {
      // The standard secure default length for RSA keys is 2048 bits
      modulusLength: length,
    });
    const pubPem = publicKey.export({
      type: "spki",
      format: "pem",
    });
    const pemKey = sshpk.parseKey(pubPem, "pem");
    const sshRsaPub = pemKey.toString("ssh");
    return {
      publickKey: sshRsaPub,
      privateKey: privateKey.export({
        type: "pkcs1",
        format: "pem",
      }),
    };
  }
};
