import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import AWS from "aws-sdk"
const ses = new AWS.SES({region: 'ap-southeast-2'});

const levelsOfInterest = [0.40, 0.41, 0.68, 0.70, 0.74]; //NUPL levels at which user should be notified

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
    await browser.close();
    console.log('Last Y Value:', result);

    if(levelsOfInterest.some(x => x < result)){
        await sendEmail(result, levelsOfInterest);
    }
    
    const response = {result : result};
    return response
};

const sendEmail = async (result, levelsOfInterest) => {
    // Make a record of which NUPL levels have been exceeded
    const levelsExceededStr = levelsOfInterest
    .filter(level => level < result)
    .sort((a, b) => b - a)
    .join(', ');

    const emailDetails = {
        Destination: {
            ToAddresses: ['mnegan93@gmail.com'],
        },
        Message: {
            Body: {
                Text: { Data: `${levelsExceededStr} NUPL has been hit` },
            },
            Subject: { Data: `NUPL: ${result}` },
        },
        Source: 'mnegan93@gmail.com',
    };

    try {
        const data = await ses.sendEmail(emailDetails).promise();
        console.log(data);
      } catch (err) {
        console.log(err, err.stack);
    }
}