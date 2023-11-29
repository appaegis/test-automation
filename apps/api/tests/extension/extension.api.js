const { test, expect } = require("@playwright/test");
const { ExtensionAPI } = require("../../src/extension");
const extensionAPI = new ExtensionAPI();
test.beforeAll(async () => {
  await extensionAPI.init(process.env.GRAPHQL_API);
});
const EXTENSION_NAME = "Screenshot Tool";
const EXTENSION_ID = "edlifbnjlicfpckhgjhflgkeeibhhcii";

test.describe("Extension API testing", () => {
  test("scrapExtension @C6069", async () => {
    const result = await extensionAPI.scrapExtension(EXTENSION_ID);
    expect(result.extensionID).toEqual(EXTENSION_ID);
    expect(result.name).toContain(EXTENSION_NAME);
    expect(result.version).toBeDefined();
    expect(result.description).toBeDefined();
    expect(result.icon).toBeDefined();
  });

  test("getExtension @C6902", async () => {
    const extension = await extensionAPI.getExtension(EXTENSION_ID);
    expect(extension.extensionID).toEqual(EXTENSION_ID);
    expect(extension.name).toContain(EXTENSION_NAME);
    expect(extension.version).toBeDefined();
    expect(extension.description).toBeDefined();
    expect(extension.icon).toBeDefined();
  });

  test("listExtensions @6903", async () => {
    const extensions = await extensionAPI.listExtensions();
    const extension = extensions.find((extension) =>
      extension.name.includes(EXTENSION_NAME)
    );
    expect(extension.extensionID).toEqual(EXTENSION_ID);
    expect(extension.name).toContain(EXTENSION_NAME);
    expect(extension.version).toBeDefined();
    expect(extension.description).toBeDefined();
    expect(extension.icon).toBeDefined();
  });

  test("deleteExtension @6904", async () => {
    await extensionAPI.deleteExtension(EXTENSION_ID);
    const extensions = await extensionAPI.listExtensions();
    const extension = extensions.find(
      (extension) => extension.name === EXTENSION_NAME
    );
    expect(extension).toBeUndefined();
  });
});
