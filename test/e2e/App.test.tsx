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
    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
    await new Promise<void>((resolve, reject) => {
      server.httpServer.close((error) => (error ? reject(error) : resolve()));
    });
  });

  test("navbar should be visible", async () => {
    await page.goto(`${server.resolvedUrls.local[0]}/address/${TEST_FIL_ADDRESS}`);
    const navbar = (await page.$("[data-test-id=navbar]"))!;
    expect(navbar).not.toBe(null);
  }, 60_000);
});
