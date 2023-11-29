const { expect } = require("@playwright/test");
const { Button } = require("../components/common");
const { Drawer } = require("../components/drawer");
const { AnalyticsSection } = require("../components/analyticsSection")

exports.Dashboard = class Dashboard {
    constructor(page){
        this.page = page
        this.mainSection = new AnalyticsSection(page)
        this.appaegisUnitySection = new AnalyticsSection(page, "Appaegis Unity")
        this.topActiveUsersSection = new AnalyticsSection(page, "Top Active users")
        this.searchPermissionForSection = new AnalyticsSection(page, "Search Permission for")
        this.dataActivityTrackerSection= new AnalyticsSection(page, "Data Activity Tracker")
        this.secureAccessTrackerSection = new AnalyticsSection(page, "Secure Access Tracker")
    }

    async goto() {
        await this.page.goto("/analytics/main", {timeout: parseInt(process.env.LONG_TIMEOUT)});
    }
    
}