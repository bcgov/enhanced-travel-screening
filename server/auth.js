const passport = require('passport');
const jwt = require('jsonwebtoken');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { scryptSync } = require('crypto');
const { db, usersTable } = require('./database.js');

const jwtSecret = process.env.JWT_SECRET || 'secret'; // FIXME: Obviously not secure
const passwordSalt = process.env.PASSWORD_SALT || 'salt'; // FIXME: Obviously not secure

// Hash and salt password (static + dynamic salt)
const hashPassword = (password, salt) => (
  scryptSync(password, `${passwordSalt}${salt}`, 64).toString('hex')
);

// Fetch user item from credentials table of DB
// Returns user item (username and password)
// Could be refactored into database.js
const getUser = async (id) => {
  const params = {
    TableName: usersTable,
    Key: { id },
  };
  const item = await db.get(params).promise();
  return item.Item;
};

// Login method with username and password in POST request
// Creates JWT and sets as user.token
// TODO: Add expiry date to JWT
passport.use('login', new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await getUser(username);
      if (user.salt && user.password !== hashPassword(password, user.salt)) {
        return done(null, false); // Incorrect password
      }
      user.token = jwt.sign({
        sub: username,
      }, jwtSecret);
      return done(null, user); // Success
    } catch (error) {
      return done(null, false); // Invalid user ID
    }
  },
));

// JWT auth method using Bearer token
// TODO: Should we check DB if user exists
passport.use('jwt', new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtSecret,
  },
  async (payload, done) => {
    try {
      // const user = await getUser(payload.sub);
      done(null, payload.sub); // Success
    } catch (error) {
      done(null, false); // Invalid user ID
    }
  },
));

module.exports = { passport, hashPassword };
