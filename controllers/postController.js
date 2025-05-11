// postController.js
//
// Purpose: controller for Post management
//
// Authors: Jake Dolan, Charlie Gaskin, Kaleb Suter
// Date: 10/05/2025

const db = require('../db');
const sanitizeHtml = require('sanitize-html');
const { marked } = require('marked');
const { validatePostContent } = require('../policies/postPolicy');

// Sanitize config for Markdown, allowing safe markdown tags
const sanitizeConfig = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'br'],
  allowedAttributes: {
    a: ['href', 'name', 'target'],
    img: ['src', 'alt']
  },
  allowedSchemes: ['http', 'https', 'mailto'],
};

async function createPost(req, res) {
    const { title, content } = req.body;
    const user_id = req.user?.id;
    
    if (!user_id || !title || !content) { 
        return res.status(400).json({ message: 'user_id, title, and content are required' });
    }

    // Validate post content
    const validationResult = validatePostContent(content);
    if (!validationResult.valid) {
        return res.status(400).json({ message: validationResult.message });
    }

    try {

        const sanitizedTitle = sanitizeHtml(marked.parseInline(markdownTitle), sanitizeConfig);
        const sanitizedContent = sanitizeHtml(marked.parseInline(markdownContent), sanitizeConfig);

        const [post] = await db('posts')
            .insert({ user_id, title: sanitizedTitle, content: sanitizedContent })
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

    // Validate post content
    const validationResult = validatePostContent(content);
    if (!validationResult.valid) {
        return res.status(400).json({ message: validationResult.message });
    }

    try {
        const post = await db('posts').where({ id }).first();
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.user_id !== user_id) return res.status(403).json({ message: 'Not authorized' });


        const sanitizedTitle = sanitizeHtml(marked.parseInline(title), sanitizeConfig);
        const sanitizedContent = sanitizeHtml(marked.parseInline(content), sanitizeConfig);

        const [updatedPost] = await db('posts')
        .where({ id })
        .update({ title: sanitizedTitle, content: sanitizedContent, updated_at: db.fn.now() }) 
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
        const query = db('posts').select('posts.*', 'users.username').leftJoin('users', 'posts.user_id', 'users.id').orderBy('posts.created_at', 'desc');
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

async function getPostById(req, res) {
    const { id } = req.params;

    try {
        const post = await db('posts')
            .select('posts.*', 'users.username')
            .leftJoin('users', 'posts.user_id', 'users.id')
            .where('posts.id', id)
            .first();

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post);

    } catch (err) {
        console.error("Error fetching post:", err);
        res.status(500).json({ message: 'Error fetching post' });
    }
}

async function deletePost(req, res) {
    const { id } = req.params;
    const user_id = req.user.id;

    try {
        const post = await db('posts').where({ id }).first();
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.user_id !== user_id) return res.status(403).json({ message: 'Not authorized to delete this post' });

        await db('posts').where({ id }).del();
        res.status(200).json({ message: 'Post deleted' });
    } catch (err) {
        console.error("Error deleting post:", err);
        res.status(500).json({ message: 'Error deleting post' });
    }
}



module.exports = { createPost, updatePost, getPosts, getPostById, deletePost };
