// commentController.js
//
// Purpose: controller for comment management
//
// Authors: Jake Dolan
// Date: 08/05/2025

const db = require('../db');

async function createComment(req, res) {
    const { postId } = req.params;
    const { user_id, content } = req.body;

    if (!user_id || !content) {
        return res.status(400).json({ message: 'user_id and content are required' });
    }

    try {
        const [comment] = await db('comments')
            .insert({ post_id: postId, user_id, content })
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
            .where({ post_id: postId })
            .orderBy('created_at', 'asc');
        res.json(comments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching comments' });
    }
}

module.exports = { createComment, getComments };
