const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');
const auth = require('./auth.js');
const db = require('./database.js');

const apiBaseUrl = '/api/v1';
const port = 80;
const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// Login using username and password, recieve JWT
app.post(`${apiBaseUrl}/login`,
  auth.authenticate('login', { session: false }),
  (req, res) => {
    // res.header('Authorization', `Bearer ${req.user.token}`);
    res.json({ token: req.user.token });
  });

// Create new form, not secured
app.post(`${apiBaseUrl}/form`, async (req, res) => {
  const id = crypto.randomBytes(4).toString('hex').toUpperCase(); // Random ID
  const item = {
    TableName: 'forms',
    Item: {
      ...req.body,
      id,
    },
    ConditionExpression: 'attribute_not_exists(id)',
  };
  try {
    await db.put(item).promise();
    res.json(id);
  } catch (error) {
    res.json({ error: 'Failed to create submission' });
  }
});

// Edit existing form
app.patch(`${apiBaseUrl}/form/:id`,
  auth.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id } = req.params;
    const item = {
      TableName: 'forms',
      Item: {
        ...req.body,
        id,
      },
      ConditionExpression: 'attribute_exists(id)',
    };
    try {
      await db.put(item).promise();
      res.json(id);
    } catch (error) {
      res.json({ error: 'Failed to update submission' });
    }
  });

// Get existing form by ID
app.get(`${apiBaseUrl}/form/:id`,
  auth.authenticate('jwt', { session: false }),
  async (req, res) => {
    const { id } = req.params;
    const params = {
      TableName: 'forms',
      Key: { id },
    };
    try {
      const item = await db.get(params).promise();
      if (Object.keys(item).length === 0) throw Error(`No form found with ID ${id}`);
      res.json(item.Item);
    } catch (error) {
      res.json({ error: 'Failed to retrieve submission' });
    }
  });

// Client app
app.get('/*', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  } else {
    res.send('Server up.');
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`); // eslint-disable-line no-console
});
