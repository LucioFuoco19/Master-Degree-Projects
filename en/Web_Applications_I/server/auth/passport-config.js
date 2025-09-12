import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import userDAO, { verifyPassword } from '../models/DAO/UserDAO.js';

// Save the Id user for the current session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Rebuld the user object on every request
passport.deserializeUser(async (id, done) => {
  try {
    const user = await userDAO.getUserById(id);
    if (!user) return done(null, false);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// local login strategy
passport.use(new LocalStrategy(async (username, password, done) => {
  const user = await userDAO.getUserByUsername(username);
  if (!user) {
    return done(null, false, { message: 'Incorrect username.' });
  }

  const match = verifyPassword(password, user.password);
  if (!match) {
    return done(null, false, { message: 'Incorrect password.' });
  }
  return done(null, user);
}));

export default passport;
