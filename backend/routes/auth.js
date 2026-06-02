const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const requireAuth = require('../middleware/auth');

const router = express.Router();


router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });

    
    req.session.userId = user._id.toString();
    // the above line basically do the same work as the serlizer function do 

    res.status(201).json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    next(err);
  }
});


router.post('/login', async (req, res, next) => {

  try {

    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    
     const user = await User.findOne({ email: email.toLowerCase() });
     if (!user) return res.status(401).json({ error: 'Invalid credentials' });
         
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    req.session.userId = user._id.toString();
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    next(err);
  }
});


router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('mh.sid');
    res.json({ ok: true });
  });
});

// in the logout we change the server state so we use the post and it is a good practice 

router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.session.userId).select('_id name email');
    if (!user) return res.status(401).json({ error: 'Not authenticated' });
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (err) {
    next(err);
  }
});

module.exports = router;


