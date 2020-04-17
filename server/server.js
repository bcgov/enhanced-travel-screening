const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { randomBytes } = require('crypto');
const { passport } = require('./auth.js');
const { db, formsTable, serviceBCTable } = require('./database.js');
const requireHttps = require('./require-https.js');
const postServiceItem = require('./utils/ServiceBC.js');
const { validate, FormSchema, DeterminationSchema } = require('./validation.js');
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
  (req, res) => {
    res.json({ token: req.user.token });
  });

// Create new form, not secured
app.post(`${apiBaseUrl}/form`,
  asyncMiddleware(async (req, res) => {
    const id = randomBytes(4).toString('hex').toUpperCase(); // Random ID
    const scrubbed = scrubObject(req.body);
    await validate(FormSchema, scrubbed);
    const isolationPlanStatus = scrubbed.accomodations
      && scrubbed.ableToIsolate && scrubbed.supplies;
    const item = {
      ...scrubbed,
      created_at: new Date().toISOString(),
      id,
      isolationPlanStatus,
      determination: null,
      notes: null,
    };

    const serviceResponse = await postServiceItem(item);
    const params = {
      RequestItems: {
        [formsTable]: [
          {
            PutRequest: {
              Item: item,
              ConditionExpression: 'attribute_not_exists(id)',
            },
          },
        ],
        [serviceBCTable]: [
          {
            PutRequest: {
              Item: {
                ...serviceResponse,
                id: randomBytes(10).toString('hex').toUpperCase(),
                confirmationId: item.id,
                createdAt: new Date().toISOString(),
              },
              ConditionExpression: 'attribute_not_exists(id)',
            },
          },
        ],
      },
    };
    await db.batchWrite(params).promise();
    return res.json({ id, isolationPlanStatus });
  }));

// Edit existing form
app.patch(`${apiBaseUrl}/form/:id`,
  passport.authenticate('jwt', { session: false }),
  asyncMiddleware(async (req) => {
    const { id } = req.params;
    await validate(DeterminationSchema, req.body);
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
    await db.update(params).promise();
  }));

// Get existing form by ID
app.get(`${apiBaseUrl}/form/:id`,
  passport.authenticate('jwt', { session: false }),
  asyncMiddleware(async (req, res) => {
    const { id } = req.params;
    const params = {
      TableName: formsTable,
      Key: { id },
    };
    const item = await db.get(params).promise();
    if (Object.keys(item).length === 0) return res.status(404).json({ error: `No submission with ID ${id}` });
    return res.json(item.Item);
  }));

// get travellers by last name (partial match)
app.get(`${apiBaseUrl}/last-name/:lname`,
  passport.authenticate('jwt', { session: false }),
  asyncMiddleware(async (req, res) => {
    const { lname } = req.params;
    const params = {
      TableName: formsTable,
      FilterExpression: 'begins_with(#lName,:regular) OR begins_with(#lName,:smallcaps) OR begins_with(#lName,:capitalized)',
      ExpressionAttributeNames: {
        '#lName': 'lastName',
      },
      ExpressionAttributeValues: {
        ':regular': lname,
        ':smallcaps': lname.toLowerCase(),
        ':capitalized': lname.charAt(0).toUpperCase() + lname.slice(1),
      },
    };

    try {
      const { Items: data } = await db.scan(params).promise();

      if (Object.keys(data).length === 0) {
        return res.status(404).json({
          error: `No traveller found with last name: ${lname}`,
          success: false,
        });
      }

      return res.json({
        success: true,
        travellers: data,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: `Failed to retrieve information for last name: ${lname}`,
      });
    }
  }));

// Validate JWT
app.get(`${apiBaseUrl}/validate`,
  passport.authenticate('jwt', { session: false }),
  (req, res) => res.json({}));

// Client app
if (process.env.NODE_ENV === 'production') {
  app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

app.use(errorHandler);

module.exports = app;
