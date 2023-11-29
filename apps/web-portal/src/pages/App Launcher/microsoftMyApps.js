const { expect } = require("@playwright/test")

class MicrosoftMyApps {
    constructor(page) {
        this.page = page
        this.context = page.locator("main", { hasText: "Microsoft My Apps" })
        this.table = this.context.locator('div[class*="list"]')
        this.appLabel = this.context.locator('span[class*="label_"]')
        this.spinner = this.page.locator("xpath=//*[contains(@class, 'spinner')]")
        this.defaultPageTip = page.locator('p[class*="content"]')
    }

    async waitForTableLoaded() {
        await this.table.waitFor( {timeout: parseInt(process.env.NORMAL_TIMEOUT)} )
    }

    async verifyAppIsImported(appName) {
        const texts = await this.appLabel.allTextContents()
        await expect(texts.includes(appName)).toBeTruthy()
    }

    async waitForPageLoaded() {
        await expect(this.spinner).not.toBeVisible
    }

    async verifyPageIsDefault() {
        await expect(this.defaultPageTip).toContainText('Connect your Microsoft account and import end-user applications into Mammoth Cyber App Launcher dashboard for seamless secure access')
    }
}
module.exports = { MicrosoftMyApps }