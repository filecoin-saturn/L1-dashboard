import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { preview } from 'vite'
import type { PreviewServer } from 'vite'
import puppeteer from 'puppeteer'
import type { Browser, Page } from 'puppeteer'

describe('basic', async () => {
    let server: PreviewServer
    let browser: Browser
    let page: Page

    beforeAll(async () => {
        server = await preview({ preview: { port: 3000 } })
        browser = await puppeteer.launch()
        page = await browser.newPage()
    })

    afterAll(async () => {
        await browser.close()
        await new Promise<void>((resolve, reject) => {
            server.httpServer.close(error => error ? reject(error) : resolve())
        })
    })

    test('should have the correct title', async () => {
        await page.goto('http://localhost:3000')
        const header = (await page.$('.App-header'))!
        expect(header).toBeDefined()

        const text = await page.evaluate(header => header.textContent, header)
        expect(text).toBe('Saturn L2 Web UI')
    }, 60_000)
})
