// jwt.js
//
// Purpose: web token boilerplate
//
// Authors: Jake Dolan
// Date: 08/05/2025

const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'default_secret_key';

function generateToken(user) {
    return jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });
}

function verifyToken(token) {
    return jwt.verify(token, SECRET);
}

module.exports = { generateToken, verifyToken };
