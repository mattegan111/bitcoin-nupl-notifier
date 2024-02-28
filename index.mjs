import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import AWS from "aws-sdk";
const ses = new AWS.SES({region: 'ap-southeast-2'});

const levelsOfConcern = [0.582, 0.68, 0.70, 0.74]; //NUPL levels at which I intend to sell
const lowestLevelOfConcern = Math.min(...levelsOfConcern);

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

    // Extract the NUPL values from the last 10 days, reverse chronological
    const fortnightOfNUPL = await page.evaluate(() => {
        return document.querySelector('.js-plotly-plot').data.slice(-1)[0].y.slice(-14).reverse();
    });
    const yesterdaysNUPL = fortnightOfNUPL[0];
    console.log('Last Y Value:', fortnightOfNUPL[0]);
    await browser.close();

    // Send email if NUPL has reached a new high for the last fortnight and NUPL is sufficiently concerning
    
    const newFortnightlyHigh = fortnightOfNUPL.every(x => x <= yesterdaysNUPL);
    const levelIsConcerning = yesterdaysNUPL > lowestLevelOfConcern;
    if(newFortnightlyHigh && levelIsConcerning){
        // Make a string of which NUPL levels have been exceeded
        const levelsExceededStr = levelsOfConcern
        .filter(level => level < yesterdaysNUPL)
        .sort((a, b) => b - a)
        .join(', ');

        // Send Alert email
        await sendEmail(yesterdaysNUPL, levelsExceededStr);
    } else {
        // Send dummy email for monitoring purposes
        let testEmailStr = `
            newFortnightlyHigh ${newFortnightlyHigh.toString()}, 
            levelIsConcerning ${levelIsConcerning.toString()} 
        `;
        await sendEmail(yesterdaysNUPL, testEmailStr); 
    }
    
    return {result : yesterdaysNUPL};
};

const sendEmail = async (yesterdaysNUPL, levelsExceededStr) => {

    const emailDetails = {
        Destination: {
            ToAddresses: ['mnegan93@gmail.com'],
        },
        Message: {
            Body: {
                Text: { Data: `${levelsExceededStr} NUPL has been hit` },
            },
            Subject: { Data: `NUPL: ${yesterdaysNUPL}` },
        },
        Source: 'mnegan93@gmail.com',
    };

    try {
        const data = await ses.sendEmail(emailDetails).promise();
        console.log(data);
      } catch (err) {
        console.log(err, err.stack);
    }
};