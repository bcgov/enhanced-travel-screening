const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { randomBytes } = require('crypto');
const { passport } = require('./auth.js');
const db = require('./database.js');

const apiBaseUrl = '/api/v1';
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
    // res.header('Authorization', `Bearer ${req.user.token}`);
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
    await db.put(item).promise();
    res.json({ id, healthStatus: 'accepted', isolationPlanStatus: 'accepted' });
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
      TableName: 'forms',
      Key: { id },
    };
    try {
      const item = await db.get(params).promise();
      console.dir(item)
      if (Object.keys(item).length === 0) return res.status(404).json({ error: `No submission with ID ${id}` });
      return res.json(item.Item);
    } catch (error) {
      return res.status(500).json({ error: `Failed to retrieve submission with ID ${id}` });
    }
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
