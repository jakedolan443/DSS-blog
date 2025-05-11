// authRoutes.js
//
// Purpose: login and registration routes
//
// Authors: Jake Dolan
// Date: 08/05/2025

const express = require('express');
const { login, register, logout, getUsernameById } = require('../controllers/authController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);

router.get('/authenticate', authenticateToken, (req, res) => {
  res.json({ id: req.user.id, username: req.user.username });
});

router.post('/logout', logout);

module.exports = router;
