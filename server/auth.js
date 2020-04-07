const passport = require('passport');
const jwt = require('jsonwebtoken');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const db = require('./database.js');

const secret = 'secret'; // FIXME: Obviously not secure

// Fetch user item from credentials table of DB
// Returns user item (username and password)
// Could be refactored into database.js
const getUser = async (id) => {
  const params = {
    TableName: 'credentials',
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
      if (user.password !== password) { // FIXME: Password should be hashed and salted
        return done(null, false); // Incorrect password
      }
      user.token = jwt.sign({
        sub: username,
      }, secret);
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
    secretOrKey: secret,
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

module.exports = passport;
