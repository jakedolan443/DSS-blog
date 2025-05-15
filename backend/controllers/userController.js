// userController.js
//
// Purpose: controller for users and their posts
//
// Authors: Jake Dolan
// Date: 11/05/2025

const db = require('../db');

async function getUsernameById(req, res) {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const user = await db('users').select('username').where({ id }).first();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ username: user.username });
    } catch (err) {
        console.error('Error fetching username:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

async function findUserByUsername(username) {
    if (!username) {
        throw new Error('Username is required');
    }

    try {
        const user = await db('users').where({ username }).first();
        return user || null;
    } catch (err) {
        console.error('Error finding user by username:', err);
        throw err;
    }
}


module.exports = { getUsernameById, findUserByUsername };
