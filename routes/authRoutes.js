// authRoutes.js
//
// Purpose: login and registration routes
//
// Authors: Jake Dolan
// Date: 08/05/2025

const express = require('express');
const { login, register } = require('../controllers/authController');
const router = express.Router();

router.post('/login', login);
router.post('/register', register);

module.exports = router;
