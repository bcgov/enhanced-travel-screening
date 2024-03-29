import passport from 'passport';
import jwt from 'jsonwebtoken';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { scryptSync } from 'crypto';
import { dbClient, collections } from './db';
import logger from './logger';
import { User } from './types';

const jwtSecret = process.env.JWT_SECRET || 'secret'; // FIXME: Obviously not secure
const passwordSalt = process.env.PASSWORD_SALT || 'salt'; // FIXME: Obviously not secure

const USER_TYPE_PHAC = 'phac';

// Hash and salt password (static + dynamic salt)
const hashPassword = (password: string, salt: string) =>
  scryptSync(password, `${passwordSalt}${salt}`, 64).toString('hex');

// Create JWT for admin user or PDF generation
// PDF JWTs should only have access to form with ID matchin sub property
const generateJwt = (id: string, type: string) =>
  jwt.sign(
    {
      sub: id,
      type,
    },
    jwtSecret,
    { expiresIn: type === USER_TYPE_PHAC ? '4h' : '24h' }
  );

// Fetch user item from credentials table of DB
// Returns user item (username and password)
// Could be refactored into database.js
const getUser = async (username: string) => {
  const usersCollection = dbClient.db.collection<User>(collections.USERS);
  return usersCollection.findOne({ username: { $in: [username] } });
};

// Login method with username and password in POST request
// Creates JWT and sets as user.token
passport.use(
  'login',
  new LocalStrategy(async (username, password, done) => {
    try {
      await dbClient.connect();
      const user = await getUser(username);
      if (user && user.salt && user.password !== hashPassword(password, user.salt)) {
        return done(null, false); // Incorrect password
      }
      user.token = generateJwt(username, user.type);
      return done(null, user); // Success
    } catch (error) {
      return done(null, false); // Invalid user ID
    }
  })
);

const strategyOpt = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret,
};

// JWT auth methods using Bearer token

// General ETS endpoints strategy (for users without specific type)
passport.use(
  'jwt',
  new JwtStrategy(strategyOpt, async (payload, done) => {
    if (!payload.type) {
      done(null, { id: payload.sub, type: null }); // Success
    } else {
      done(null, false); // Invalid user type
    }
  })
);

// PHAC strategy for phac endpoint only (only users with type === 'phac' can access)
passport.use(
  'jwt-phac',
  new JwtStrategy(strategyOpt, async (payload, done) => {
    logger.info('Trying to authenticate User');
    if (payload.type === USER_TYPE_PHAC) {
      done(null, { id: payload.sub, type: payload.type }); // Success
    } else {
      logger.info(`Attempted login failed ${payload.type}`);
      done(null, false); // Invalid user type
    }
  })
);

export { passport, hashPassword };
