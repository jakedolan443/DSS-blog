// userRoutes.js
//
// Purpose: user management routes
//
// Authors: Jake Dolan
// Date: 11/05/2025


const express = require('express');
const { getUsernameById } = require('../controllers/userController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

router.get('/:id', getUsernameById)

module.exports = router;
