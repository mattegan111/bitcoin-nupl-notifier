This is a AWS Lambda function project using puppeteer and chromium to scrape bitcoin pricing indicator data from the web. 
Scraping is scheduled to run daily via AWS EventBridge Scheduler.
It also uses AWS Simple Email Service to notify me of key market patterns i.e., greed indicators based on the Net Unrealised Profit Loss indicator.
