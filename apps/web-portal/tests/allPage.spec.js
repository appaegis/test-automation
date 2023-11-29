const { test, expect } = require("../src/fixtures/commonSetup");
test.setTimeout(10 * 60 * 1000);

test("go to different page", async ({ page, delay }) => {
  await page.goto(process.env.URL);
  await expect(page).toHaveURL("/launcher", {
    timeout: parseInt(process.env.LONG_TIMEOUT) * 2,
  });
  await page
    .locator("//*[@data-test='side_menu' and normalize-space()='Web']")
    .waitFor({ timeout: parseInt(process.env.LONG_TIMEOUT) * 2 });
  const URLs = await getAllURL(page);
  for (const url of URLs) {
    await test.step(`test ${url} page exist`, async () => {
      await page.goto(url);
      await expect(page.locator("//main"), { message: `${url} page not found` }).toBeVisible( { timeout: parseInt(process.env.LONG_TIMEOUT) } );
    });
  }
});

async function getAllURL(page) {
  let urls = [];
  urls = [];
  await test.step("gather all URLs", async () => {
    const eles = await page.locator("//*[@data-test]//a").count(); ;
    for (let i = 0; i < eles; i++) {
      const href = await page.locator("//*[@data-test]//a").nth(i).getAttribute("href");
      if (href) {
        urls.push(href);
      }
    }
  });

  return urls;
}
