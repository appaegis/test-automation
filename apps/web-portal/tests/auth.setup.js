import { test as setup, expect } from "@playwright/test";
const { Login } = require("../src/pages/login");
const fs = require("fs");

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  const SESSION_FILE = "./session.json"
  if (!fs.existsSync(SESSION_FILE)){
    const login = new Login(page);
    await login.goto();
    await login.login();
    const sessionStorage = await page.evaluate(() =>
      JSON.stringify(sessionStorage)
    );
    fs.writeFileSync(SESSION_FILE, JSON.stringify(sessionStorage), "utf-8");
  }
});
