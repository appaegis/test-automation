/**
 * @description to install packages for each OS.
 */

const os = require("os");
const { execSync } = require("child_process");

// OS specific dependencies
console.log("Start installation OS specific packages!");

// TODO: use json to manage
if (os.platform() === "win32") {
  console.debug("Going to install required packages only for Windows!");
  execSync("npm install appium-windows-driver@2.7.2 --no-save", { stdio: "inherit" });
} else if (os.platform() === "darwin") {
  console.debug("Going to install required packages only for MacOS!");
  execSync("npm install appium-mac2-driver@1.5.3 applescript --no-save", { stdio: "inherit" });
} else {
  throw new Error("NOT SUPPORT OS: " + os.platform());
}
console.log("Installation Done!");
