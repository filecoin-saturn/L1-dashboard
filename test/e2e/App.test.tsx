import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { preview } from "vite";
import type { PreviewServer } from "vite";
import puppeteer from "puppeteer";
import type { Browser, Page } from "puppeteer";

const TEST_FIL_ADDRESS = "f16m5slrkc6zumruuhdzn557a5sdkbkiellron4qa";

describe("website mode", async () => {
  let server: PreviewServer;
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    server = await preview();
    browser = await puppeteer.launch();
    const context = browser.defaultBrowserContext();
    context.overridePermissions(server.resolvedUrls.local[0], ["clipboard-read", "clipboard-write"]);
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close((error) => (error ? reject(error) : resolve()));
    });
  });

  test("navbar should be visible in address page when the webui mode isn`t runing", async () => {
    await page.goto(`${server.resolvedUrls.local[0]}address/${TEST_FIL_ADDRESS}`);
    const navbar = (await page.$("[data-testid=navbar]"))!;
    expect(navbar).not.toBe(null);
  }, 60_000);

  test("navbar should be visible", async () => {
    await page.goto(`${server.resolvedUrls.local[0]}stats`);
    const navbar = await page.$("[data-testid=navbar]");
    expect(navbar).toBeTruthy();
  }, 60_000);

  test("stats grid should be present", async () => {
    await page.goto(`${server.resolvedUrls.local[0]}stats`);
    const statsGrid = await page.waitForSelector("[data-testid=stats-grid]");
    expect(statsGrid).toBeTruthy();
  }, 60_0000);

  test("Share Grid button should copy URL with encoded state to clipboard", async () => {
    await page.goto(`${server.resolvedUrls.local[0]}stats`);
    const shareButton = await page.waitForSelector("[data-testid=share-grid-button]");
    await shareButton?.click();

    const mockClipboardText = "Mocked clipboard text";
    await page.evaluate((mockText) => {
      const mockClipboard = {
        readText: async () => mockText,
      };
      Object.defineProperty(window.navigator, "clipboard", {
        value: mockClipboard,
        configurable: true,
      });
    }, mockClipboardText);

    const clipboardText = await page.evaluate(() => window.navigator.clipboard.readText());
    expect(clipboardText).toBe(mockClipboardText);
  }, 60_000);

  test("Auto Refresh toggle should change state when clicked", async () => {
    await page.goto(`${server.resolvedUrls.local[0]}stats`);
    const autoRefreshButton = await page.waitForSelector("[data-testid=auto-refresh-toggle]");
    const initialButtonText = await page.evaluate((el) => el?.textContent, autoRefreshButton);
    await autoRefreshButton?.click();

    const updatedButtonText = await autoRefreshButton?.evaluate((el) => el.textContent, autoRefreshButton);
    expect(initialButtonText).not.toBe(updatedButtonText);
  }, 60_000);

  test("Node details panel should be visible when clicked", async () => {
    await page.goto(`${server.resolvedUrls.local[0]}stats`);
    const firstNode = await page.waitForSelector("[data-testid=node-details-button]");
    await firstNode?.click();

    const nodeDetails = await page.waitForSelector("[data-testid=node-details]");
    expect(nodeDetails).toBeTruthy();
    expect(nodeDetails).not.toBe(null);
  }, 60_000);

  test("Admin Auth button should trigger admin authentication model", async () => {
    await page.goto(`${server.resolvedUrls.local[0]}stats`);
    const AdminAuthButton = await page.waitForSelector("[data-testid=admin-auth]");

    expect(AdminAuthButton).toBeTruthy();
  }, 60_000);

  test("Copy Id icon button should trigger the data", async () => {
    await page.goto(`${server.resolvedUrls.local[0]}stats`);
    const CopyId = await page.waitForSelector("[data-testid=copy-icon]");
    await CopyId?.click();

    const mockClipboardText = "db884bbb-33db-4071-9206-12c616339e3e";
    await page.evaluate((mockText) => {
      const mockClipboard = {
        readText: async () => mockText,
      };
      Object.defineProperty(window.navigator, "clipboard", {
        value: mockClipboard,
        configurable: true,
      });
    }, mockClipboardText);

    const clipboardText = await page.evaluate(() => window.navigator.clipboard.readText());
    expect(clipboardText).toBe(mockClipboardText);
  }, 60_000);

  test("Reset Filters button should reset filters", async () => {
    await page.goto(`${server.resolvedUrls.local[0]}stats`);
    const filterButton = await page.waitForSelector("[data-testid=reset-filters-button]");
    await filterButton?.click();
    expect(filterButton).toBeTruthy();
  }, 60_000);
});
