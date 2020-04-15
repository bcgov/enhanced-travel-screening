const app = require('./server')

const port = 80;

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`); // eslint-disable-line no-console
});

module.exports = server;
