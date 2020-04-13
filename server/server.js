const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { randomBytes } = require('crypto');
const { passport, generateJwt, restrictToken } = require('./auth.js');
const { db, formsTable, bcServicesTable } = require('./database.js');
const createPdf = require('./pdf.js');
const requireHttps = require('./require-https.js');
const { getToken, postItem } = require('./utils/bcServices.js');

const apiBaseUrl = '/api/v1';
const port = 80;
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
      delete scrubbed[key]; // Delete empty string
    }
  });
  return scrubbed;
};

// Login using username and password, recieve JWT
app.post(`${apiBaseUrl}/login`,
  passport.authenticate('login', { session: false }),
  (req, res) => {
    res.json({ token: req.user.token });
  });

// Create new form, not secured
app.post(`${apiBaseUrl}/form`, async (req, res) => {
  try {
    const id = randomBytes(4).toString('hex').toUpperCase(); // Random ID
    const scrubbed = scrubObject(req.body);
    if (scrubbed.certified !== true) return res.status(422).json({ error: 'Must certify to be accurate' });
    // determine if isolation plan can default to accepted
    const {
      symptoms,
      accomodations,
      ableToIsolate,
      supplies,
    } = req.body;
    const healthStatus = symptoms;
    const isolationPlanStatus = supplies && accomodations && ableToIsolate;
    const item = {
      TableName: formsTable,
      Item: {
        ...scrubbed,
        created_at: new Date().toISOString(),
        id,
        healthStatus,
        isolationPlanStatus,
        determination: null,
        notes: null,
      },
      ConditionExpression: 'attribute_not_exists(id)',
    };
    const token = await getToken();
    const response = postItem(item.Item, token);

    const errorData = {
      TableName: bcServicesTable,
      Item: {
        id: randomBytes(10).toString('hex').toUpperCase(),
        confirmationId: item.id,
        status: 'success',
        bcServicesId: response.id,
        createdAt: new Date().toISOString(),
      },
      ConditionExpression: 'attribute_not_exists(id)',
    };
    await db.put(errorData).promise();


    await db.put(item).promise();

    return res.json({
      id,
      healthStatus,
      isolationPlanStatus,
      accessToken: generateJwt(id, 'pdf'),
    });
  } catch (error) {
    return res.status(500).json({ error: `Failed to create submission. ${error.message}` });
  }

});

// Edit existing form
app.patch(`${apiBaseUrl}/form/:id`,
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id } = req.params;
    if (!restrictToken(req.user, '*')) return res.status(401).send('Unathorized');
    const params = {
      TableName: formsTable,
      Key: { id },
      UpdateExpression: 'set notes = :n, determination = :d, updated_at = :t',
      ExpressionAttributeValues: {
        ':n': req.body.notes,
        ':d': req.body.determination,
        ':t': new Date().toISOString(),
      },
      ConditionExpression: 'attribute_exists(id)',
      ReturnValues: 'UPDATED_NEW',
    };
    try {
      await db.update(params).promise();
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
    const params = {
      TableName: formsTable,
      Key: { id },
    };
    try {
      const item = await db.get(params).promise();
      if (Object.keys(item).length === 0) return res.status(404).json({ error: `No submission with ID ${id}` });
      return res.json(item.Item);
    } catch (error) {
      return res.status(500).json({ error: `Failed to retrieve submission with ID ${id}` });
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

app.listen(port, () => {
  console.log(`Listening on port ${port}`); // eslint-disable-line no-console
});
