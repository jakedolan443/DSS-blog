// authRoutes.js
//
// Purpose: login and registration routes
//
// Authors: Jake Dolan, Charlie Gaskin
// Date: 11/05/2025

const express = require('express');
const { login, register, logout, getUsernameById } = require('../controllers/authController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min for testing/demo purposes, would increase for actual use
  max: 5,
  message: { message: 'Login attempts exceeded try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, login);
router.post('/register', register);

router.get('/authenticate', authenticateToken, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username });
});

router.post('/logout', logout);

module.exports = router;
