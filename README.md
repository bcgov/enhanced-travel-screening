# Enhanced Traveller Screening

### A component of the COVID-19 response

---

## Introduction

This is a digital service built in partnership with the Ministry of Health and Service B.C. which supports British Columbians returning from out-of-country to self isolate. Travellers complete a self isolation plan which may be reviewed with a provincial official to determine whether they require additional support in order to self isolate. In addition, Service BC is able to followup with travellers to ensure the success of their self isolation plan.

## Table of Contents

1. [Project Status](#project-status)
1. [Features](#features)
1. [Getting Help or Reporting an Issue](#getting-help-or-reporting-an-issue)
1. [How to Contribute](#how-to-contribute)
1. [Development](#development)
1. [License](#license)

## Project Status

[![img](https://img.shields.io/badge/Lifecycle-Stable-97ca00)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)

This application has been released and is in active feature development.

## Features

This project includes the following features:

1. Public web form for returning travellers
1. Ability to download a blank PDF version of the form
1. Admin portal with login
1. Secure lookup of submissions
1. Tracking notes and determinations associated with submissions
1. Integration with PHAC
1. Integration with Service BC
1. Real-time analytics

## Getting Help or Reporting an Issue

To report bugs/issues/feature requests, please file an [issue](https://github.com/bcgov/enhanced-travel-screening/issues).

## How to Contribute

If you would like to contribute, please see our [contributing](CONTRIBUTING.md) guidelines.

Please note that this project is released with a [Contributor Code of Conduct](CODE-OF-CONDUCT.md). By participating in this project you agree to abide by its terms.

## Development

### Set up local .env

You will need to create a local .env file in the project root directory. Take a look at /.config/.env.example for an example.

This .env file is gitignored as it is only used for local development work. Note that locally there will always be a `TEST_DB` database created, so you will most likely want to choose a different value for your DB_NAME variable.

### Using Docker

Make sure you have Docker and Docker-compose installed in your local environment. For instructions on how to install it, follow the links below:
- https://docs.docker.com/get-docker/
- https://docs.docker.com/compose/install/

To set up and run database, backend (server), and frontend (client) applications:
- Run `make build-local` within the root folder of the project
- Run `make run-local`
- The first time you run the application locally, you'll also need to seed the database collections and users:
  - Run `make local-db-seed`

To tear down your environment:
- Run `make close-local`

To run server tests:
- Make sure containers are running
  - `make run-local`
- Run `make local-server-tests`

Additional commands for local development with Docker can be found in the [Makefile](makefile).

### Using npm

From both the client and the server folders, run `npm i` to install dependencies.

- Add a hostname alias to your environment
  - Edit your `/etc/hosts` filename
  - Add `127.0.0.1   server`
- Run client: `npm start` run within client folder
- Start Database: `make run-local-db`
- Once the DB is running, `npm run db:seed` to seed the database
- Run server: `npm run watch` from within the server folder
- Run server tests: `npm test` from within the server folder

Communication from front end to back end is facilitated by [the proxy field](https://create-react-app.dev/docs/proxying-api-requests-in-development/) in client package.json.

### Front End Views

The application frontend will be served locally at http://localhost:4000/

##### /form
 - allows a traveller to submit their traveller data and receive a confirmation number
 - link to download a blank PDF version of the form

##### /confirmation/:formId
 - redirect here after form submission, display confirmation number and retrieve the health status and isolation plan status from the server's response to the form submission.
 - display statuses as friendly icons

##### /login
- allows an admin to login

##### /lookup
- search for a form submission by confirmation number or last name

##### /form/:formId
- render a static version of a form submission
- allow the admin to set a status for this submission and add notes

### API Routes
The API uses a proxy so does not need a port specified. All routes will be served at http://localhost/api/v1/
- /version [GET] return app version information
- /login [POST] validate login credentials, issue token
- /form [POST] submit new form
- /form/:id [POST] edit an existing form
- /form/:id [GET] retrieve an existing form
- /phac/submission [POST] submit PHAC records
- In production: / [GET] serve the built client app

## Database

The application uses Amazon DocumentDB, a non-relational database, fully managed, that emulates the MongoDB 3.6 API and utilizes a distributed, fault-tolerant, self-healing storage system.

You can find more information at: 
- https://aws.amazon.com/documentdb/
- https://docs.aws.amazon.com/documentdb/latest/developerguide/what-is.html

Keep in mind that DocumentDB does not support all MongoDB 3.6 features and APIs. Check the links below to explore the differences:
- https://docs.aws.amazon.com/documentdb/latest/developerguide/mongo-apis.html
- https://docs.aws.amazon.com/documentdb/latest/developerguide/functional-differences.html

For this project, there are 2 database clusters configured under private subnets inside a custom VPC; one to be used for development and staging environments and the other for the production environment.

For local development, a MongoDB 3.6 container is being used.

### Shelling into the Database [Development/Production]

All access to the bastion host must be done via AWS IAM. To do so via the terminal, [AWS SSM](https://docs.aws.amazon.com/systems-manager/latest/userguide/ssm-agent.html) is used. This allows for shell access while using MFA. The following script can be used to authenticate via SSM. Note that execution privileges may need to be granted to the script (`chmod +x ssm.sh`). Additionally, an [AWS CLI profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) should be configured to work with the AWS lease. The included script uses a profile name of `covid`.

```sh
#!/bin/sh

echo "Please enter your MFA code"
read TOKEN

PROFILE="covid"
DEVICE=`aws --profile "$PROFILE" iam list-mfa-devices | jq -r '.MFADevices[0].SerialNumber'`
CREDS=`aws --profile "$PROFILE" sts get-session-token --serial-number $DEVICE --token-code $TOKEN`

export AWS_ACCESS_KEY_ID=`echo "$CREDS" | jq -r '.Credentials.AccessKeyId'`
export AWS_SECRET_ACCESS_KEY=`echo "$CREDS" | jq -r '.Credentials.SecretAccessKey'`
export AWS_SESSION_TOKEN=`echo "$CREDS" | jq -r '.Credentials.SessionToken'`
export AWS_DEFAULT_REGION="ca-central-1"
```

SSM relies on setting environment variables. As such, the above script should be invoked using `source ssm.sh`. Invocation via `source` allows the scrip to export environment variables.

Next, the certificate for the bastion host must be downloaded. This is available from LastPass. In the command below, this file is saved as `~/.ssh/ets-bastion-host2.pem`.

Once authenticated with SSM, run `ssh -i ~/.ssh/ets-bastion-host2.pem -L 27017:ets-dev.cluster-cyk1pye3ihk7.ca-central-1.docdb.amazonaws.com:27017 ec2-user@i-0d7ed042e3b6479e7 -N`. It may benefit the reader to add this to `~/.zshrc` as an alias. Note that for prod, the database ARN will differ.

Finally, the database can be accessed via localhost as a proxy. Point your Mongo client to `localhost:27017` with the credentials used in AWS. SSL must be set to unvalidated/insecure.

### Lambda functions

This application uses AWS Lambda functions to facilitate memory-intensive tasks. The server/lambda folder must contain everything that is necessary for the lambda functions to work, since it will be shipped to AWS using its own .yml workflow. There is also a common lambda layer (server/lambda/layer) being shared across lambda functions.

To run a lambda locally:
- Prerequisite: Install and configure the [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-install.html)
- Navigate to the lambda folder `cd server/lambda/layer/common/nodejs/` and run `npm i` to install dependencies
- Back at the project root `cd ../../../../..`, start the application with `make run-local`
- Run the desired lambda function command from the [Makefile](makefile), which will be in the format `make run-local-lambda-*`
- Wait for output.json to appear in the project root directory

To trigger the workflow to deploy all lambda functions to AWS:
- Run `make tag-lambda-prod`

## License

    Copyright 2020 Province of British Columbia

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
