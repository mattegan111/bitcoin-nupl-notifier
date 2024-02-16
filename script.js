import { launch } from 'puppeteer-core';

exports.handler(async () => {
    const browser = await launch({
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
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
})();