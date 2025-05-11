// authController.js
//
// Purpose: controller for login, registration
//
// Authors: Jake Dolan
// Date: 08/05/2025


const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/jwt');
const db = require('../db');

async function login(req, res) {
    const { username, password } = req.body;
    try {
        const user = await db('users').where({ username }).first();
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

        const token = generateToken(user);

        // Set token in HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true, // Make cookie inaccessible to JavaScript
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict', // Protects against CSRF
            maxAge: 1000 * 60 * 60 * 24, // Cookie expires after 1 day
        });

        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}


async function register(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        const existingUser = await db('users').where({ username }).first();
        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [newUser] = await db('users')
            .insert({ username, password: hashedPassword })
            .returning(['id', 'username', 'created_at']);

        res.status(201).json({ user: newUser, message: 'User registered successfully' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


async function logout(req, res) {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: 'Strict',
            path: '/',
        });

        res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Logout error:', err);
        res.status(500).json({ message: 'Server error during logout' });
    }
}

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


module.exports = { login, register, logout };
