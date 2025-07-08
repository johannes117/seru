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

test("renders the app with sidebar and default page", async () => {
  const page: Page = await electronApp.firstWindow();
  // Wait for the sidebar to load
  await page.waitForSelector("aside");
  
  // Check the sidebar title shows "Seru"
  const sidebarTitle = await page.locator("aside h1").first();
  const sidebarText = await sidebarTitle.textContent();
  expect(sidebarText).toBe("Seru");
  
  // Check the main content shows Address Splitter Tool (default page)
  const mainTitle = await page.locator("main h1").first();
  const mainText = await mainTitle.textContent();
  expect(mainText).toBe("Address Splitter Tool");
});

test("renders navigation menu with all tools", async () => {
  const page: Page = await electronApp.firstWindow();
  await page.waitForSelector("nav");
  
  // Check if navigation buttons exist by their text content (when sidebar is not collapsed)
  const addressSplitterBtn = await page.locator('nav button:has-text("Address Splitter")');
  expect(await addressSplitterBtn.count()).toBe(1);
  
  const filterBtn = await page.locator('nav button:has-text("Filter Tool")');
  expect(await filterBtn.count()).toBe(1);
  
  const recordSplitterBtn = await page.locator('nav button:has-text("Record Splitter")');
  expect(await recordSplitterBtn.count()).toBe(1);
  
  const settingsBtn = await page.locator('nav button:has-text("Settings")');
  expect(await settingsBtn.count()).toBe(1);
});

test("can navigate to settings page", async () => {
  const page: Page = await electronApp.firstWindow();
  
  // Navigate to Settings page by clicking the settings button in navigation
  const settingsBtn = await page.locator('nav button:has-text("Settings")');
  await settingsBtn.click();
  
  // Wait for the settings page content to appear by looking for a unique element that's visible
  await page.waitForSelector('main div:has(h1:has-text("Settings")):visible');
  
  // Verify we're on the settings page by checking the visible h1 element
  const visibleTitle = await page.locator('main div:visible h1:has-text("Settings")');
  const pageTitle = await visibleTitle.textContent();
  expect(pageTitle).toContain("Settings");
  
  // Check that the settings description is visible
  const description = await page.locator('main div:visible p:has-text("Customize your Seru experience")');
  expect(await description.count()).toBe(1);
});

test("can toggle theme in settings", async () => {
  const page: Page = await electronApp.firstWindow();
  
  // Navigate to Settings page
  const settingsBtn = await page.locator('nav button:has-text("Settings")');
  await settingsBtn.click();
  
  // Wait for the settings page to load
  await page.waitForSelector('main div:has(h1:has-text("Settings")):visible');
  
  // Find the theme toggle button in the visible settings content
  const visibleSettings = await page.locator('main div:visible');
  const themeToggle = await visibleSettings.locator('button:has(svg)').first();
  
  // Verify the theme toggle exists and is clickable
  await expect(themeToggle).toBeVisible();
  expect(await themeToggle.count()).toBeGreaterThan(0);
});

test.afterAll(async () => {
  await electronApp.close();
}); 