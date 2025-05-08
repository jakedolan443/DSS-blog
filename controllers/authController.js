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
        res.json({ token });
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
        console.error('Register error:', error);  // Log any error
        res.status(500).json({ message: 'Internal server error' });
    }
}


module.exports = { login, register };
