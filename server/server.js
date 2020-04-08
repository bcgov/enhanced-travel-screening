const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { randomBytes } = require('crypto');
const puppeteer = require('puppeteer');
const { passport, genTokenForSubmission } = require('./auth.js');
const { db, formsTable } = require('./database.js');

const apiBaseUrl = '/api/v1';
const FE_URL = process.env.FE_URL || 'http://localhost:4000';
const port = 80;
const app = express();
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
    const item = {
      TableName: 'forms',
      Item: {
        ...scrubbed,
        id,
      },
      ConditionExpression: 'attribute_not_exists(id)',
    };
    const id = randomBytes(4).toString('hex').toUpperCase(); // Random ID
    const scrubbed = scrubObject(req.body);
    const item = {
      TableName: formsTable,
      Item: {
        ...scrubbed,
        id,
      },
      ConditionExpression: 'attribute_not_exists(id)',
    };
    await db.put(item).promise();
    const accessToken = genTokenForSubmission(id);
    res.json({
      id,
      healthStatus: 'accepted',
      isolationPlanStatus: 'accepted',
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ error: `Failed to create submission. ${error.message}` });
  }
});

// Edit existing form
app.patch(`${apiBaseUrl}/form/:id`,
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id } = req.params;
    const params = {
      TableName: 'forms',
      Key: { id },
      UpdateExpression: 'set notes = :n, determination = :d',
      ExpressionAttributeValues: {
        ':n': req.body.notes,
        ':d': req.body.determination,
      },
      ConditionExpression: 'attribute_exists(id)',
      ReturnValues: 'UPDATED_NEW',
    };
    try {
      await db.update(params).promise();
      res.json({ id });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update submission' });
    }
  });

// Get existing form by ID
app.get(`${apiBaseUrl}/form/:id`,
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id } = req.params;
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

// PDF route
// uses a conf number to fetch a submission and renders it as a pdf
// employs a front end route to do this
// front end route looks for a JWT in params and can only fetch data if the token is valid
app.post(`${apiBaseUrl}/pdf`, async (req, res) => {
  const { id, accessToken } = req.body;
  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`${FE_URL}/renderpdf/${id}/${accessToken}`, {
      waitUntil: 'networkidle2',
    });
    await page.setViewport({ width: 1680, height: 1050 });
    const pdf = await page.pdf({
      path: path.join(__dirname, 'pdfs', `travellerScreeningReport-${id}.pdf`),
      format: 'A4',
    });
    await browser.close();
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Length': pdf.length,
    });
    const pdfPath = path.join(__dirname, 'pdfs', `travellerScreeningReport-${id}.pdf`);
    res.sendFile(pdfPath);
  })();
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
