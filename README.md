# Bitcoin NUPL Notifier #

## Scrapes the web and alerts you when a key indicator signals excessive market greed ##


### Description ###

This is a AWS Lambda function project using puppeteer and chromium to scrape bitcoin pricing indicator data from the web. 
Scraping is scheduled to run daily via AWS EventBridge Scheduler.
It also uses AWS Simple Email Service to notify me of key market patterns i.e., greed indicators based on the Net Unrealised Profit Loss indicator.


### Deployment & More Using AWS ###

Due to the large size of Chromium, which is necessary for Puppeteer to function, a direct deployment of the entire package to AWS Lambda is not feasible. Here's how we address this challenge and ensure smooth deployment and operation:


Uploading Node Modules to S3:
Package the node_modules directory, including Puppeteer and Chromium, into a ZIP file.
Upload this ZIP file to an AWS S3 bucket.

Creating a Lambda Layer:
In the AWS Management Console, create a new Lambda layer using the ZIP file from S3. This layer will provide the necessary Node.js modules to your Lambda function.

Configuring the Lambda Function:
Create a new Lambda function and attach the previously created layer. This setup enables the function to access Puppeteer and Chromium without exceeding the Lambda package size limit.

EventBridge Scheduler:
To automate the execution of the Lambda function, use AWS EventBridge (formerly CloudWatch Events).
Set up a 24-hour CRON job to trigger the function daily at 8 AM. This ensures that the NUPL values are checked and alerts are sent out consistently every day.

Using AWS SES for Email Alerts:
AWS Simple Email Service (SES) is used to send email alerts.
Verify your personal email address with AWS SES to enable sending. This step is crucial for the SES service to authorize emails sent from your Lambda function.

Permissions and IAM Roles:
Ensure your Lambda function has the necessary permissions to access S3, SES, and to execute under the assigned roles. Typically, this involves creating a custom IAM role with policies allowing S3 read access, SES send permissions, and basic execution rights for Lambda.
