// commentController.js
//
// Purpose: controller for comment management
//
// Authors: Jake Dolan, Charlie Gaskin, Kaleb Suter
// Date: 10/05/2025

const db = require('../db');
const sanitizeHtml = require('sanitize-html');
const sanitizeConfig = {
  allowedTags: [],
  allowedAttributes: {}
};

async function createComment(req, res) {
    const { postId } = req.params;
    const { user_id, content } = req.body;

    if (!user_id || !content) {
        return res.status(400).json({ message: 'user_id and content are required' });
    }

    try {
        const cleanContent = sanitizeHtml(content, sanitizeConfig);
        const [comment] = await db('comments')
            .insert({ post_id: postId, user_id, content: cleanContent })
            .returning(['id', 'post_id', 'user_id', 'content', 'created_at']);
        res.status(201).json({ comment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating comment' });
    }
}

async function getComments(req, res) {
    const { postId } = req.params;

    try {
        const comments = await db('comments')
            .join('users', 'comments.user_id', '=', 'users.id')
            .select('comments.id', 'comments.content', 'comments.created_at', 'users.username')
            .where('comments.post_id', postId )
            .orderBy('comments.created_at', 'asc');
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching comments' });
    }
}

module.exports = { createComment, getComments };
