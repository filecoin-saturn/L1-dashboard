import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { preview } from 'vite'
import type { PreviewServer } from 'vite'
import puppeteer from 'puppeteer'
import type { Browser, Page } from 'puppeteer'

const PORT = 3011
const ORIGIN = `http://localhost:${PORT}`
const TEST_FILE_ADDRESS = 'f16m5slrkc6zumruuhdzn557a5sdkbkiellron4qa'

describe('embed mode', async () => {
    let server: PreviewServer
    let browser: Browser
    let page: Page

    beforeAll(async () => {
        server = await preview({ preview: { port: PORT } })
        browser = await puppeteer.launch()
        page = await browser.newPage()
    })

    afterAll(async () => {
        await browser.close()
        await new Promise<void>((resolve, reject) => {
            server.httpServer.close(error => error ? reject(error) : resolve())
        })
    })

    test('navbar should be invisible', async () => {
        await page.goto(`${ORIGIN}/webui/address/${TEST_FILE_ADDRESS}`)
        const navbar = (await page.$('.navbar'))!
        const className: string = await (await navbar.getProperty('className')).jsonValue()
        expect(className.split(' ')).toContain('invisible')
    }, 60_000)
})

describe('website mode', async () => {
    let server: PreviewServer
    let browser: Browser
    let page: Page

    beforeAll(async () => {
        server = await preview({ preview: { port: PORT } })
        browser = await puppeteer.launch()
        page = await browser.newPage()
    })

    afterAll(async () => {
        await browser.close()
        await new Promise<void>((resolve, reject) => {
            server.httpServer.close(error => error ? reject(error) : resolve())
        })
    })

    test('navbar should be visible', async () => {
        await page.goto(`${ORIGIN}/webui/address/${TEST_FILE_ADDRESS}?mode=website`)
        const navbar = (await page.$('.navbar'))!
        const className: string = await (await navbar.getProperty('className')).jsonValue()
        expect(className.split(' ')).toContain('visible')
    }, 60_000)
})
