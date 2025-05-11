// postRoutes.js
//
// Purpose: post management routes
//
// Authors: Jake Dolan, Kaleb Suter
// Date: 08/05/2025

const express = require('express');
const { createPost, updatePost, getPosts, getPostById, deletePost } = require('../controllers/postController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

router.post('/', authenticateToken, createPost);
router.put('/:id', authenticateToken, updatePost);
router.delete('/:id', authenticateToken, deletePost);
router.get('/', getPosts);
router.get('/:id', getPostById); 


module.exports = router;
