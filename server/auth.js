const passport = require('passport');
const jwt = require('jsonwebtoken');
const { Strategy: LocalStrategy } = require('passport-local');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { scryptSync } = require('crypto');
const { dbClient, collections } = require('./db');

const jwtSecret = process.env.JWT_SECRET || 'secret'; // FIXME: Obviously not secure
const passwordSalt = process.env.PASSWORD_SALT || 'salt'; // FIXME: Obviously not secure

// Hash and salt password (static + dynamic salt)
const hashPassword = (password, salt) => (
  scryptSync(password, `${passwordSalt}${salt}`, 64).toString('hex')
);

// Create JWT for admin user or PDF generation
// PDF JWTs should only have access to form with ID matchin sub property
const generateJwt = (id, type = 'user') => jwt.sign({
  sub: id,
  type,
}, jwtSecret, { expiresIn: type === 'user' ? '24h' : '1h' });

// Fetch user item from credentials table of DB
// Returns user item (username and password)
// Could be refactored into database.js
const getUser = async (username) => {
  const usersCollection = dbClient.db.collection(collections.USERS);
  return usersCollection.findOne({ username: { $in: [username] } });
};

// Login method with username and password in POST request
// Creates JWT and sets as user.token
passport.use('login', new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await getUser(username);
      if (user && user.salt && user.password !== hashPassword(password, user.salt)) {
        return done(null, false); // Incorrect password
      }
      user.token = generateJwt(username);
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
    done(null, { id: payload.sub, type: payload.type }); // Success
  },
));

// Ensure token is of accepted type and limit to specific IDs
// Supply array or * to accept all IDs of a type
const restrictToken = (user, userIds, pdfIds) => {
  if (!user) return false; // No user object supplied
  switch (user.type) {
    case 'user':
      if (!userIds) return false; // No accepted user IDs
      if (userIds === '*' || userIds.includes(user.id)) return true; // User token ID not allowed
      break;
    case 'pdf':
      if (!pdfIds) return false; // No accepted user IDs
      if (pdfIds === '*' || pdfIds.includes(user.id)) return true; // PDF token ID not allowed
      break;
    default:
      return false; // Unaccepted token type
  }
  return false;
};

module.exports = {
  passport, hashPassword, generateJwt, restrictToken,
};
