// postController.js
//
// Purpose: controller for Post management
//
// Authors: Jake Dolan, Charlie Gaskin
// Date: 10/05/2025

const db = require('../db');
const sanitizeHtml = require('sanitize-html');
const { marked } = require('marked');
const { validatePostContent } = require('../policies/postPolicy');

// Sanitize config for Markdown, allowing safe markdown tags
const sanitizeConfig = {
  allowedTags: [ 'b', 'i', 'em', 'strong', 'a', 'img', 'ul', 'ol', 'li', 'p', 'br', 'blockquote', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ],
  allowedAttributes: {
    '*': [ 'class', 'style', 'id' ],
    'a': [ 'href', 'target', 'rel' ],
    'img': [ 'src', 'alt', 'title' ]
  }
};

async function likePost(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    let postId = id;

    try {
        const post = await db('posts').where({ id: postId }).first();
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (post.liked_by && post.liked_by.includes(userId)) {
            return res.status(400).json({ message: 'You have already liked this post' });
        }

        const updatedLikes = [...(post.liked_by || []), userId];

        await db('posts')
            .where({ id: postId })
            .update({
                liked_by: JSON.stringify(updatedLikes),
                updated_at: db.fn.now()
            });

        const updatedPost = await db('posts').where({ id: postId }).first();

        res.status(200).json({ message: 'Post liked successfully', post: updatedPost });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error liking post' });
    }
}




async function removeLike(req, res) {
    const { id } = req.params;
    const userId = req.user.id;

    let postId = id;

    console.log(req.params);
    try {
        const post = await db('posts').where({ id: postId }).first();
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (!post.liked_by || !post.liked_by.includes(userId)) {
            return res.status(400).json({ message: 'You have not liked this post' });
        }

        const updatedLikes = post.liked_by.filter(id => id !== userId);

        await db('posts')
        .where({ id: postId })
        .update({
            liked_by: JSON.stringify(updatedLikes),
            updated_at: db.fn.now()
        });

        const updatedPost = await db('posts').where({ id: postId }).first();

        res.status(200).json({ message: 'Like removed successfully', post: updatedPost });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error removing like' });
    }
}




async function createPost(req, res) {
    const { user_id, title, content } = req.body;

    if (!user_id || !title || !content) {
        return res.status(400).json({ message: 'user_id, title, and content are required' });
    }

    const validationResult = validatePostContent(content);
    if (!validationResult.valid) {
        return res.status(400).json({ message: validationResult.message });
    }

    try {
        const markdownTitle = marked.parseInline(title);
        const markdownContent = marked.parse(content);

        const sanitizedTitle = sanitizeHtml(markdownTitle, sanitizeConfig);
        const sanitizedContent = sanitizeHtml(markdownContent, sanitizeConfig);

        const now = new Date();

        const [post] = await db('posts')
            .insert({
                user_id,
                title: sanitizedTitle,
                content: sanitizedContent,
                created_at: now,
                updated_at: now,
                liked_by: JSON.stringify([])
            })
            .returning(['id', 'user_id', 'title', 'content', 'created_at', 'updated_at', 'liked_by']);

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

    const validationResult = validatePostContent(content);
    if (!validationResult.valid) {
        return res.status(400).json({ message: validationResult.message });
    }

    try {
        const post = await db('posts').where({ id }).first();
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.user_id !== user_id) return res.status(403).json({ message: 'Not authorized' });

        const markdownTitle = marked.parseInline(title);
        const markdownContent = marked.parse(content);

        const sanitizedTitle = sanitizeHtml(markdownTitle, sanitizeConfig);
        const sanitizedContent = sanitizeHtml(markdownContent, sanitizeConfig);

        const [updatedPost] = await db('posts')
            .where({ id })
            .update({
                title: sanitizedTitle,
                content: sanitizedContent,
                updated_at: db.fn.now()
            })
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

async function getPostById(req, res) {
  const { id } = req.params;

  try {
    const post = await db('posts').where({ id }).first();

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (err) {
    console.error('Error fetching post:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}



async function getPostsFromUser(req, res) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const posts = await db('posts')
            .where({ user_id: id })
            .orderBy('created_at', 'desc')
            .select('*');

        res.status(200).json(posts);
    } catch (err) {
        console.error('Error fetching user posts:', err);
        res.status(500).json({ message: 'Error fetching user posts' });
    }
}


module.exports = { createPost, updatePost, getPosts, getPostById, getPostsFromUser, likePost, removeLike };
