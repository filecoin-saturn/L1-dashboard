import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { preview } from "vite";
import type { PreviewServer } from "vite";
import puppeteer from "puppeteer";
import type { Browser, Page } from "puppeteer";

const TEST_FILE_ADDRESS = "f16m5slrkc6zumruuhdzn557a5sdkbkiellron4qa";

describe("embed mode", async () => {
  let server: PreviewServer;
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    server = await preview();
    browser = await puppeteer.launch();
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close((error) => (error ? reject(error) : resolve()));
    });
  });

  describe("Address page", async () => {
    test("navbar should be invisible", async () => {
      await page.goto(`${server.resolvedUrls.local[0]}address`);
      const navbar = (await page.$("[data-testid=navbar]"))!;
      expect(navbar).toBe(null);
    }, 60_000);

    test("input value should update on form submission navigate to related page", async () => {
      await page.goto(`${server.resolvedUrls.local[0]}address`);
      const inputField = (await page.$("[data-testid=input-field]"))!;
      const searchButton = (await page.$("[data-testid=search-button]"))!;

      await inputField?.type(TEST_FILE_ADDRESS);
      await page.keyboard.press("Enter");

      const currentUrl = await page.url();
      const expectedUrl = `${server.resolvedUrls.local[0]}address/${TEST_FILE_ADDRESS}?period=7+Days`;

      expect(inputField).toBeTruthy();
      expect(searchButton).toBeTruthy();
      expect(currentUrl).toBe(expectedUrl);
    }, 60_000);
  });

  describe("Dashborad page", async () => {
    test("displays the correct address and overview", async () => {
      await page.goto(`${server.resolvedUrls.local[0]}address/${TEST_FILE_ADDRESS}?period=7+Days`);

      const addressElement = await page.waitForSelector("[data-testid=address]");
      const earningsElement = await page.waitForSelector("[data-testid=earnings]");
      const bandwidthElement = await page.waitForSelector("[data-testid=bandwidth]");
      const retrievalsElement = await page.waitForSelector("[data-testid=requests]");
      const addressText = await page.evaluate((el) => el?.textContent, addressElement);

      expect(addressElement).toBeTruthy();
      expect(earningsElement).toBeTruthy();
      expect(bandwidthElement).toBeTruthy();
      expect(retrievalsElement).toBeTruthy();
      expect(addressText).toBe(TEST_FILE_ADDRESS);
    }, 60_000);

    test("changes time period when selected", async () => {
      await page.goto(`${server.resolvedUrls.local[0]}address/${TEST_FILE_ADDRESS}?period=7+Days`);

      const selectElement = await page.$("[data-testid=time-period-select]");
      await selectElement?.select("90 Days");

      const currentUrl = await page.url();
      const expectedUrl = `${server.resolvedUrls.local[0]}address/${TEST_FILE_ADDRESS}?period=90+Days`;
      expect(currentUrl).toBe(expectedUrl);
    }, 60_000);

    test("displays data charts", async () => {
      await page.goto(`${server.resolvedUrls.local[0]}address/${TEST_FILE_ADDRESS}?period=7+Days`);

      const charts = await page.$$("[data-testid=chart-container]");
      expect(charts.length).toBe(4);
    }, 60_000);

    test("displays the global earnings chart", async () => {
      await page.goto(`${server.resolvedUrls.local[0]}address/${TEST_FILE_ADDRESS}?period=7+Days`);
      const titleElement = (await page.$("[data-testid=earningsChart]"))!;
      expect(titleElement).toBeTruthy();
    }, 60_000);

    test("displays the Global Bandwidth Served chart", async () => {
      await page.goto(`${server.resolvedUrls.local[0]}address/${TEST_FILE_ADDRESS}?period=7+Days`);
      const titleElement = (await page.$("[data-testid=bandwidthChart]"))!;
      expect(titleElement).toBeTruthy();
    }, 60_000);

    test("displays loader when isLoading prop is true", async () => {
      await page.goto(`${server.resolvedUrls.local[0]}address/${TEST_FILE_ADDRESS}?period=7+Days`);
      const loaderElement = await page.$("[data-testid=loader]");
      expect(loaderElement).toBeTruthy();
    }, 60_000);

    test("Copy Id icon button should trigger the data", async () => {
      await page.goto(`${server.resolvedUrls.local[0]}address/${TEST_FILE_ADDRESS}?period=365+Days`);
      const CopyId = await page.waitForSelector("[data-testid=node-table-copy-icon]");
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
  });
});
