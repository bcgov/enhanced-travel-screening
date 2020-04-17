# Enhanced Traveller Screening

### Covid 19 response app

---

### Development

#### Using Docker

Make sure you have Docker and Docker-compose installed in your local environment. For instructions on how to install it, follow the links below:
- https://docs.docker.com/get-docker/
- https://docs.docker.com/compose/install/

To set up and run database, backend (server), and frontend (client) applications:
- Run `make local` within the root folder of the project

To tear down your environment:
- Run `make close-local`

To migrate from dynamoDB to MongoDB/DocumentDB database:
- Make sure of running DynamoDB, `docker run -p 8000:8000 --name dynamoDB --network=enhanced-travel-screening_frontend amazon/dynamodb-local`
- - `enhanced-travel-screening` represents the folder name of your project directory
- Run `make local-db-migration`

To seed database:
- Run `make local-db-seed`

To run server tests:
- Make sure containers are running (`make local`)
- Shell into server container running `make local-server-workspace` and run `npm test`
- or
- run `make local-server-tests`

#### Using npm

From both the client and the server folders, run `npm i` to install dependencies.

- Add a hostname alias to your environment
- - Edit your `/etc/hosts` filename
- - Add `127.0.0.1   server`


- Run client: `npm start` run within client folder
- Start Database: `make run-local-db`
- Once the DB is running, `npm run db:seed` to seed the database
- Run server: `npm run watch` from within the server folder
- Run server tests: `npm test` from within the server folder

Communication from front end to back end is facilitated by [the proxy field](https://create-react-app.dev/docs/proxying-api-requests-in-development/) in client package.json.

### Front End Views

###### /form
 - allows a traveller to submit their traveller data and receive a confirmation number

###### /confirmation/:formId
 - redirect here after form submission, display confirmation number and retrieve the health status and isolation plan status from the server's response to the form submission.
 - display statuses as friendly icons
 - button to download a PDF version of traveller submission

###### /login
- allows an admin to login

###### /lookup
- single input field to search for a form submission by confirmation number

###### /form/:formId
- render a static version of a form submission
- allow the admin to set a status for this submission: ["accepted", "support", "rejected"] and add notes

### API Routes

- /login [POST] validate login creds, isssue token
- /form [POST] submit new form
- /form/:id [POST] edits an existing form
- /form/:id [GET] retrieves an existing form
- In production: / [GET] serves the built client app
