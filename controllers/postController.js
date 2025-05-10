// postController.js
//
// Purpose: controller for Post management
//
// Authors: Jake Dolan, Charlie Gaskin
// Date: 10/05/2025

const db = require('../db');
const sanitizeHtml = require('sanitize-html');
const sanitizeConfig = {
  allowedTags: [],
  allowedAttributes: {}
};


async function createPost(req, res) {
    const { user_id, title, content } = req.body;
    if (!user_id || !title || !content) {
        return res.status(400).json({ message: 'user_id, title, and content are required' });
    }

    try {
        const sanitizedTitle = sanitizeHtml(title, sanitizeConfig);
        const sanitizedContent = sanitizeHtml(content, sanitizeConfig);
        const [post] = await db('posts')
            .insert({ user_id, title: sanitizedTitle, content: sanitizedContent})
            .returning(['id', 'user_id', 'title', 'content', 'created_at']);
        res.status(201).json({ post });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating post' });
    }
}

async function updatePost(req, res) {
    const { title, content } = req.body;
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const post = await db('posts').where({ id }).first();
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.user_id !== user_id) return res.status(403).json({ message: 'Not authorized' });

        const sanitizedTitle = sanitizeHtml(title, sanitizeConfig);
        const sanitizedContent = sanitizeHtml(content, sanitizeConfig);
        const [updatedPost] = await db('posts')
            .where({ id })
            .update({title: sanitizedTitle, content: sanitizedContent, updated_at: db.fn.now() })
            .returning(['id', 'title', 'content', 'updated_at']);

        res.json({ post: updatedPost });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating post' });
    }
}

async function getPosts(req, res) {
    const { q } = req.query;
    try {
        const query = db('posts').select('*').orderBy('created_at', 'desc');
        if (q) {
            query.whereILike('title', `%${q}%`).orWhereILike('content', `%${q}%`);
        }
        const posts = await query;
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching posts' });
    }
}

module.exports = { createPost, updatePost, getPosts };
