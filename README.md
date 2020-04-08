# Enhanced Traveller Screening

### Covid 19 response app

---

### Development

From both the client and the server folders, run `npm i` to install dependencies.

- Run client: `npm start` run within client folder
- Start Database: `npm run db:start`
- Once the DB is running, `npm run db:seed` to seed the database
- Run server: `npm run watch` from within the server folder

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
