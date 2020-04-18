const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { randomBytes } = require('crypto');
const { passport } = require('./auth.js');
const requireHttps = require('./require-https.js');
const postServiceItem = require('./utils/ServiceBC.js');
const { validate, FormSchema, DeterminationSchema } = require('./validation.js');
const { dbClient, collections } = require('./db');
const { errorHandler, asyncMiddleware } = require('./error-handler.js');

const apiBaseUrl = '/api/v1';
const app = express();

app.use(requireHttps);
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Remove empty strings (DynamoDB doesn't accept)
const scrubObject = (obj) => {
  const scrubbed = obj;
  Object.keys(scrubbed).forEach((key) => {
    if (typeof scrubbed[key] === 'object' && scrubbed[key] !== null) {
      scrubbed[key] = scrubObject(scrubbed[key]); // Nested object
    } else if (scrubbed[key] === '') {
      scrubbed[key] = null; // Null instead of empty for DynamoDB
    }
  });
  return scrubbed;
};

// Login using username and password, receive JWT
app.post(`${apiBaseUrl}/login`,
  passport.authenticate('login', { session: false }),
  (req, res) => res.json({ token: req.user.token }));

// Create new form, not secured
app.post(`${apiBaseUrl}/form`,
  asyncMiddleware(async (req, res) => {
    const scrubbed = scrubObject(req.body);
    await validate(FormSchema, scrubbed); // Validate submitted form against schema
    const formsCollection = dbClient.db.collection(collections.FORMS);

    // Generate unique random hex id
    async function generateRandomHexId() {
      const randomHexId = randomBytes(4).toString('hex').toUpperCase();

      // Query database do make sure id does not exist, avoiding collision
      if (await formsCollection.countDocuments({ id: randomHexId }, { limit: 1 }) > 0) {
        return generateRandomHexId();
      }
      return randomHexId;
    }

    // Form ID
    const id = await generateRandomHexId();

    // Boolean indicating if user really have an isolation plan
    const isolationPlanStatus = scrubbed.accomodations
      && scrubbed.ableToIsolate && scrubbed.supplies;

    const currentISODate = new Date().toISOString();
    const formItem = {
      id,
      isolationPlanStatus,
      determination: null,
      notes: null,
      ...scrubbed,
      createdAt: currentISODate,
      updatedAt: currentISODate,
    };

    // Post to ServicesBC and cache status of the submission
    const serviceResponse = await postServiceItem(formItem);

    await formsCollection.insertOne({
      ...formItem,
      // Following NoSQL recommendation, in this case, we want to store
      // BC Services transactional data on the form itself
      serviceBCTransactions: [
        {
          ...serviceResponse,
          processedAt: new Date().toISOString(),
        },
      ],
    });

    return res.json({ id, isolationPlanStatus });
  }));

// Edit existing form
app.patch(`${apiBaseUrl}/form/:id`,
  passport.authenticate('jwt', { session: false }),
  asyncMiddleware(async (req, res) => {
    await validate(DeterminationSchema, req.body);
    const { id } = req.params;
    const formsCollection = dbClient.db.collection(collections.FORMS);

    await formsCollection.updateOne(
      { id }, // Query
      { // UpdateQuery
        $set: {
          notes: req.body.notes,
          determination: req.body.determination,
          updatedAt: new Date().toISOString(),
        },
      },
    );
    return res.json({ id });
  }));

// Get existing form by ID
app.get(`${apiBaseUrl}/form/:id`,
  passport.authenticate('jwt', { session: false }),
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    const formsCollection = dbClient.db.collection(collections.FORMS);
    const formItem = await formsCollection.findOne({ id });

    if (!formItem) return res.status(404).json({ error: `No submission with ID ${id}` });

    return res.json(formItem);
  }));

// get travellers by last name (partial match)
app.get(`${apiBaseUrl}/last-name/:lname`,
  passport.authenticate('jwt', { session: false }),
  asyncMiddleware(async (req, res) => {
    const { lname } = req.params;
    const formsCollection = dbClient.db.collection(collections.FORMS);

    const forms = await formsCollection.find({
      // i: for substring search, case insensitive
      // ^: match results that starts with
      lastName: { $regex: new RegExp(`^${lname}`, 'i') },
    }).toArray();

    if (forms.length === 0) return res.status(404).json({ error: `No traveller found with last name ${lname}` });

    const travellers = forms.map((form) => {
      // Remove serviceTransactions from return query
      const { serviceTransactions, ...formData } = form;
      return formData;
    });

    return res.json({ travellers });
  }));

// Validate JWT
app.get(`${apiBaseUrl}/validate`,
  passport.authenticate('jwt', { session: false }),
  (req, res) => res.json({}));

// Client app
if (process.env.NODE_ENV === 'production') {
  app.get('/*', (req, res) => res.sendFile(path.join(__dirname, '../client/build/index.html')));
}

app.use(errorHandler);

module.exports = app;
