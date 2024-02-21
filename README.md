# Bitcoin NUPL Notifier #

## Scrapes the web and alerts you when a key indicator signals excessive market greed ##


### Description ###

This is a AWS Lambda function project using puppeteer and chromium to scrape bitcoin pricing indicator data from the web. 
Scraping is scheduled to run daily via AWS EventBridge Scheduler.
It also uses AWS Simple Email Service to notify me of key market patterns i.e., greed indicators based on the Net Unrealised Profit Loss indicator.


### Deployment & More Using AWS ###

Due to the large size of Chromium, which is necessary for Puppeteer to function, a direct deployment of the entire package to AWS Lambda is not feasible. Here's how we address this challenge and ensure smooth deployment and operation:


**Uploading Node Modules to S3:**

Package the node_modules directory, including Puppeteer and Chromium, into a ZIP file.
Upload this ZIP file to an AWS S3 bucket.

**Creating a Lambda Layer:**

In the AWS Management Console, create a new Lambda layer using the ZIP file from S3. This layer will provide the necessary Node.js modules to your Lambda function.

**Configuring the Lambda Function:**

Create a new Lambda function and attach the previously created layer. This setup enables the function to access Puppeteer and Chromium without exceeding the Lambda package size limit.

**EventBridge Scheduler:**

To automate the execution of the Lambda function, use AWS EventBridge (formerly CloudWatch Events).
Set up a 24-hour CRON job to trigger the function daily at 8 AM. This ensures that the NUPL values are checked and alerts are sent out consistently every day.

**Using AWS SES for Email Alerts:**

AWS Simple Email Service (SES) is used to send email alerts.
Verify your personal email address with AWS SES to enable sending. This step is crucial for the SES service to authorize emails sent from your Lambda function.

**Permissions and IAM Roles:**

Ensure your Lambda function has the necessary permissions to access S3, SES, and to execute under the assigned roles. Typically, this involves creating a custom IAM role with policies allowing S3 read access, SES send permissions, and basic execution rights for Lambda.

## Gotchas

When working with AWS Lambda, Puppeteer, and AWS SES, there are a few non-obvious hurdles that you might encounter. This section aims to preemptively address these to smooth out your deployment and development process.

### 1. Packaging Node Modules for Lambda Layers

#### File Structure and Packaging

- **Correct File Structure**: Your Lambda layer must have a specific file structure to be recognized by AWS Lambda. The structure is: a `nodejs` folder at the root, which then contains the `node_modules` folder, `package.json`, and `package-lock.json`.

    **Example**:
    ```
    nodejs/
    ├── node_modules/
    ├── package.json
    └── package-lock.json
    ```

- **Zipping Correctly**: When creating your ZIP file for the Lambda layer, ensure you zip from within the `nodejs` folder. This means that when unzipped, the structure should not be a single folder containing everything, but rather the `nodejs` folder itself at the root of the ZIP. This ensures AWS Lambda can correctly interpret and use the Node.js modules.

### 2. Creating a Lambda Layer

When creating your Lambda layer in the AWS Management Console or through the AWS CLI, pay close attention to the optional settings:

- **Compatible Runtimes**: Set this to `nodejs18.x`. As of the last update, there were compatibility issues with `nodejs20.x`, making `nodejs18.x` the safer choice for ensuring your function runs without issues.

- **Compatible Architectures**: Ensure this is set to `x86_64`. This is particularly important if your Lambda function is accessing binaries like Chromium, which may have specific architectural requirements.

### Additional Gotchas

- **AWS SES Email Verification**: Remember that AWS SES requires you to verify both the sender and receiver email addresses in sandbox environments. Without this, your emails will not be sent.

- **EventBridge CRON Syntax**: AWS uses a specific syntax for defining CRON jobs in EventBridge. Ensure your CRON expression accurately reflects your intended schedule, considering UTC time. For daily execution at 8 AM UTC, the expression is `cron(0 8 * * ? *)`.

- **Puppeteer Execution Role**: Your Lambda function's execution role must have permissions not just for SES and S3, but also for CloudWatch Logs if you wish to debug or log output from your function executions. This is often overlooked but crucial for monitoring and troubleshooting.

