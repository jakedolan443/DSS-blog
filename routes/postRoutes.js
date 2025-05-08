const express = require('express');
const { createPost, updatePost, getPosts } = require('../controllers/postController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();

router.post('/', authenticateToken, createPost);
router.put('/:id', authenticateToken, updatePost);
router.get('/', getPosts);

module.exports = router;
