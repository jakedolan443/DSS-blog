// postRoutes.js
//
// Purpose: post management routes
//
// Authors: Jake Dolan
// Date: 08/05/2025

const express = require('express');
const { createPost, updatePost, getPosts, getPostById, getPostsFromUser, likePost, removeLike } = require('../controllers/postController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

router.post('/', authenticateToken, createPost);
router.put('/:id', authenticateToken, updatePost);
router.get('/', getPosts);
router.get('/:id', getPostById);
router.get('/user/:id', getPostsFromUser);
router.post('/:id/like', authenticateToken, likePost)
router.post('/:id/unlike', authenticateToken, removeLike)

module.exports = router;
