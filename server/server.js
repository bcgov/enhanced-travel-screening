const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { randomBytes } = require('crypto');
const { passport, generateJwt, restrictToken } = require('./auth.js');
const createPdf = require('./pdf.js');
const requireHttps = require('./require-https.js');
const postServiceItem = require('./utils/ServiceBC.js');
const { validate, FormSchema, DeterminationSchema } = require('./validation.js');
const { dbClient, collections } = require('./db');

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
  (req, res) => {
    res.json({ token: req.user.token });
  });

// Create new form, not secured
app.post(`${apiBaseUrl}/form`, async (req, res) => {
  try {
    const formsCollection = dbClient.db.collection(collections.FORMS);

    const scrubbed = scrubObject(req.body);

    try {
      await validate(FormSchema, scrubbed);
    } catch (error) {
      return res.status(400).json({ error: `Failed form validation: ${error.errors}` });
    }

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

    return res.json({
      id,
      isolationPlanStatus,
      accessToken: generateJwt(id, 'pdf'),
    });
  } catch (error) {
    return res.status(500).json({ error: `Failed to create submission: ${error.message}` });
  }
});

// Edit existing form
app.patch(`${apiBaseUrl}/form/:id`,
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id } = req.params;
    if (!restrictToken(req.user, '*')) return res.status(401).send('Unauthorized');

    try {
      await validate(DeterminationSchema, req.body);
    } catch (error) {
      return res.status(400).json({ error: `Failed form validation: ${error.errors}` });
    }

    try {
      const formsCollection = dbClient.db.collection(collections.FORMS);

      await formsCollection.updateOne(
        // Query
        {
          id,
        },
        // UpdateQuery
        {
          $set: {
            notes: req.body.notes,
            determination: req.body.determination,
            updatedAt: new Date().toISOString(),
          },
        },
      );
      return res.json({ id });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to update submission' });
    }
  });

// Get existing form by ID
app.get(`${apiBaseUrl}/form/:id`,
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id } = req.params;
    if (!restrictToken(req.user, '*', [id])) return res.status(401).send('Unathorized');

    try {
      const formsCollection = dbClient.db.collection(collections.FORMS);
      const formItem = await formsCollection.findOne({ id });

      if (!formItem) return res.status(404).json({ error: `No submission with ID ${id}` });

      return res.json(formItem);
    } catch (error) {
      return res.status(500).json({ error: `Failed to retrieve submission with ID ${id}` });
    }
  });

// get travellers by last name (partial match)
app.get(`${apiBaseUrl}/last-name/:lname`,
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { lname } = req.params;
    if (!restrictToken(req.user, '*')) return res.status(401).send('Unathorized');

    try {
      const formsCollection = dbClient.db.collection(collections.FORMS);

      const forms = await formsCollection.find({
        // i: for substring search, case insensitive
        // ^: match results that starts with
        lastName: { $regex: new RegExp(`^${lname}`, 'i') },
      }).toArray();

      if (forms.length === 0) {
        return res.status(404).json({
          error: `No traveller found with last name: ${lname}`,
          success: false,
        });
      }

      const travellers = forms.map((form) => {
        // Remove serviceTransactions from return query
        const { serviceTransactions, ...formData } = form;
        return formData;
      });

      return res.json({
        success: true,
        travellers,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Failed to retrieve information for last name: ${lname}`,
      });
    }
  });

// Generate PDF for submission, requires access token
app.post(`${apiBaseUrl}/pdf`, async (req, res) => {
  const { id, accessToken } = req.body;
  try {
    const pdf = await createPdf(id, accessToken);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdf.length,
    });
    return res.sendFile(pdf.path);
  } catch (error) {
    return res.status(500).json({ error: `Failed to create PDF for ID ${id}` });
  }
});

// Validate JWT
app.get(`${apiBaseUrl}/validate`,
  passport.authenticate('jwt', { session: false }),
  (req, res) => {
    if (!restrictToken(req.user, '*')) return res.status(401).send('Unathorized');
    return res.json({});
  });

// Client app
if (process.env.NODE_ENV === 'production') {
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

module.exports = app;
