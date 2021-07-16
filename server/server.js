const express = require('express');
const bodyParser = require('body-parser');
const { randomBytes } = require('crypto');
const { passport } = require('./auth.js');
const requireHttps = require('./require-https.js');
const postToSlack = require('./lambda/layer/common/nodejs/custom_modules/post-to-slack.js');
const deriveTravellerKey = require('./utils/derive-traveller-key.js');
const {
  validate, FormSchema, DeterminationSchema, PhacSchema,
} = require('./validation.js');
const { dbClient, collections } = require('./db');
const { errorHandler, asyncMiddleware } = require('./error-handler.js');
const logger = require('./logger.js');

const apiBaseUrl = '/api/v1';
const app = express();

app.use(requireHttps);
app.use(bodyParser.json({ limit: '10Mb' }));

// Remove empty strings
const scrubObject = (obj) => {
  const scrubbed = obj;
  Object.keys(scrubbed).forEach((key) => {
    if (typeof scrubbed[key] === 'object' && scrubbed[key] !== null) {
      scrubbed[key] = scrubObject(scrubbed[key]); // Nested object
    } else if (scrubbed[key] === '') {
      scrubbed[key] = null;
    }
  });
  return scrubbed;
};

const generateUniqueHexId = async (collection) => {
  const randomHexId = randomBytes(4).toString('hex').toUpperCase();
  if (await collection.countDocuments({ id: randomHexId }, { limit: 1 }) > 0) {
    return generateUniqueHexId(collection); // Ensure ID is unique
  }
  return randomHexId;
};

// Login using username and password, receive JWT
app.post(`${apiBaseUrl}/login`,
  passport.authenticate('login', { session: false }),
  (req, res) => res.json({ token: req.user.token }));

// Create new form, not secured
app.post(`${apiBaseUrl}/form`,
  asyncMiddleware(async (req, res) => {
    await dbClient.connect();
    const scrubbed = scrubObject(req.body);
    await validate(FormSchema, scrubbed); // Validate submitted form against schema

    console.log(dbClient);
    console.log(dbClient.db);
    console.log(dbClient.printConfig());
    const formsCollection = dbClient.db.collection(collections.FORMS);
    const id = await generateUniqueHexId(formsCollection);

    // Boolean indicating if user really have an isolation plan
    const isolationPlanStatus = scrubbed.accomodations
      && scrubbed.ableToIsolate && scrubbed.supplies;

    const currentIsoDate = new Date().toISOString();
    const formItem = {
      ...scrubbed,
      id,
      isolationPlanStatus,
      determination: null,
      notes: null,
      derivedTravellerKey: deriveTravellerKey(scrubbed),
      createdAt: currentIsoDate,
      updatedAt: currentIsoDate,
    };

    await formsCollection.insertOne(formItem);

    return res.json({ id, isolationPlanStatus });
  }));

// Submission from PHAC, secured by JWT for PHAC users only
app.post(`${apiBaseUrl}/phac/submission`,
  passport.authenticate('jwt-phac', { session: false }),
  asyncMiddleware(async (req, res) => {
    await dbClient.connect();
    await validate(PhacSchema, req.body); // Validate submitted submissions against schema
    const phacCollection = dbClient.db.collection(collections.PHAC);

    const currentIsoDate = new Date().toISOString();
    const phacItems = await Promise.all(req.body.map(async (item) => ({
      ...item,
      id: await generateUniqueHexId(phacCollection),
      derivedTravellerKey: deriveTravellerKey(item),
      createdAt: currentIsoDate,
      updatedAt: currentIsoDate,
    })));

    const results = { successful: {}, duplicates: [], errors: [] };
    const start = new Date().getTime();
    const messages = [`Processing PHAC submission of ${phacItems.length} items`];
    try {
      await phacCollection.insertMany(phacItems, { ordered: false });
      results.successful = phacItems.reduce((a, v) => ({ ...a, [v.covid_id]: v.id }), {});
    } catch (error) {
      try {
        const { writeErrors } = error.result.result;
        results.duplicates = writeErrors
          .filter((e) => e.err.code === 11000)
          .map((e) => e.err.op.covid_id);
        results.errors = writeErrors
          .filter((e) => e.err.code !== 11000)
          .map((e) => e.err.op.covid_id);
        results.successful = phacItems.filter((_, i) => (
          !writeErrors.map((e) => e.err.index).includes(i)
        )).reduce((a, v) => ({ ...a, [v.covid_id]: v.id }), {});
      } catch (err) {
        results.errors = phacItems.map((i) => i.covid_id);
        messages.push(`Error processing PHAC submission: ${err}`);
      }
    }
    try {
      await postToSlack('PHAC Submission', start, ...messages,
        `Successful: ${Object.keys(results.successful).length}`,
        `Duplicates: ${results.duplicates.length}`,
        `Errors: ${results.errors.length}`);
    } catch (error) {
      logger.error(`Unable to post to Slack: ${error}`);
    }
    return res.json(results);
  }));

// Edit existing form
app.patch(`${apiBaseUrl}/form/:id`,
  passport.authenticate('jwt', { session: false }),
  asyncMiddleware(async (req, res) => {
    await validate(DeterminationSchema, req.body);
    const { id } = req.params;
    const formsCollection = dbClient.db.collection(collections.FORMS);
    const currentDate = new Date().toISOString();

    const { notes } = await formsCollection.findOne({ id });

    await formsCollection.updateOne(
      { id }, // Query
      { // UpdateQuery
        $set: {
          notes: req.body.notes,
          determination: req.body.determination,
          updatedAt: currentDate,
        },
      },
    );

    const notesLog = notes !== req.body.notes ? ' and new notes' : '';
    logger.info(`Form ${id} updated by "${req.user.id}" with determination "${req.body.determination}"${notesLog}`, currentDate);

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

// Version number
app.get(`${apiBaseUrl}/version`,
  (req, res) => res.json({ version: process.env.VERSION }));

app.use(errorHandler);

module.exports = app;
