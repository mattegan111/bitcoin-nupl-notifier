import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export const handler = async (e) => {
    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });

    const page = await browser.newPage();
    await page.goto('https://www.lookintobitcoin.com/charts/relative-unrealized-profit--loss/', {
        waitUntil: 'networkidle2'
    });

    // Wait for the element with the specified class to be rendered
    await page.waitForSelector('.js-plotly-plot');

    // Extract the data
    const result = await page.evaluate(() => {
        return document.querySelector('.js-plotly-plot').data.slice(-1)[0].y.slice(-1)[0];
    });

    console.log('Last Y Value:', result);

    await browser.close();
    
    const response = {result : result};

    return response
};