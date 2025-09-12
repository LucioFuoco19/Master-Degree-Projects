import express from 'express';
import passport from '../auth/passport-config.js';
const router = express.Router();

// LOGIN
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Invalid credentials' });

    req.logIn(user, (err) => {
      if (err) return next(err);
      return res.json({ id: user.id, username: user.username, role: user.role });
    });
  })(req, res, next);
});


// CHECK SESSION
router.get('/check', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({ id: req.user.id, username: req.user.username, role: req.user.role });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});
//LOGOUT
router.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    req.session.destroy(() => {
      res.clearCookie('connect.sid'); // Remove the cookie session
      res.status(200).json({ message: 'Logout successful' });
    });
  });
});


export default router;
