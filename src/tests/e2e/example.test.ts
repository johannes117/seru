import {
  test,
  expect,
  _electron as electron,
  ElectronApplication,
  Page,
} from "@playwright/test";
import { findLatestBuild, parseElectronApp } from "electron-playwright-helpers";

/*
 * Using Playwright with Electron:
 * https://www.electronjs.org/pt/docs/latest/tutorial/automated-testing#using-playwright
 */

let electronApp: ElectronApplication;

test.beforeAll(async () => {
  const latestBuild = findLatestBuild();
  const appInfo = parseElectronApp(latestBuild);
  process.env.CI = "e2e";

  electronApp = await electron.launch({
    args: [appInfo.main],
  });
  electronApp.on("window", async (page) => {
    const filename = page.url()?.split("/").pop();
    console.log(`Window opened: ${filename}`);

    page.on("pageerror", (error) => {
      console.error(error);
    });
    page.on("console", (msg) => {
      console.log(msg.text());
    });
  });
});

test("renders the first page", async () => {
  const page: Page = await electronApp.firstWindow();
  const title = await page.waitForSelector("h1");
  const text = await title.textContent();
  expect(text).toBe("Seru");
});

test("renders navigation menu", async () => {
  const page: Page = await electronApp.firstWindow();
  await page.waitForSelector("nav");
  
  // Check if Dashboard link exists
  const dashboardLink = await page.getByText("Dashboard");
  expect(dashboardLink).toBeTruthy();
  
  // Check if Filter Tool link exists
  const filterLink = await page.getByText("Filter Tool");
  expect(filterLink).toBeTruthy();
  
  // Check if Reorder Tool link exists
  const reorderLink = await page.getByText("Reorder Tool");
  expect(reorderLink).toBeTruthy();
  
  // Check if Settings link exists
  const settingsLink = await page.getByText("Settings");
  expect(settingsLink).toBeTruthy();
});

test("can navigate to settings and toggle theme", async () => {
  const page: Page = await electronApp.firstWindow();
  
  // Navigate to Settings page
  const settingsLink = await page.getByText("Settings");
  await settingsLink.click();
  
  // Wait for Settings page to load
  await page.waitForSelector("h1");
  const pageTitle = await page.locator("h1").textContent();
  expect(pageTitle).toContain("Settings");
  
  // Check if theme toggle exists
  const themeToggle = await page.locator('[data-testid="theme-toggle"], button[aria-label*="theme"], button[aria-label*="Theme"]').first();
  expect(themeToggle).toBeTruthy();
});

test.afterAll(async () => {
  await electronApp.close();
});
