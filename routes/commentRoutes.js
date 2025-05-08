// commentRoutes.js
//
// Purpose: comment management routes
//
// Authors: Jake Dolan
// Date: 08/05/2025


const express = require('express');
const { createComment, getComments } = require('../controllers/commentController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

router.post('/:postId/comments', authenticateToken, createComment);
router.get('/:postId/comments', getComments);

module.exports = router;
