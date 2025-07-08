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
  // The first page is now the Address Splitter tool, not a splash screen
  const title = await page.waitForSelector("h1");
  const text = await title.textContent();
  expect(text).toBe("Address Splitter Tool");
});

test("renders navigation menu", async () => {
  const page: Page = await electronApp.firstWindow();
  await page.waitForSelector("nav");
  
  // Check if Address Splitter link exists
  const addressSplitterLink = await page.getByText("Address Splitter");
  expect(addressSplitterLink).toBeTruthy();
  
  // Check if Filter Tool link exists
  const filterLink = await page.getByText("Filter Tool");
  expect(filterLink).toBeTruthy();
  
  // Check if Record Splitter link exists
  const recordSplitterLink = await page.getByText("Record Splitter");
  expect(recordSplitterLink).toBeTruthy();
  
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
  const themeToggle = await page.locator('[data-testid="theme-toggle"], button[title*="Theme"], button[title*="theme"]').first();
  expect(themeToggle).toBeTruthy();
});

test.afterAll(async () => {
  await electronApp.close();
});
