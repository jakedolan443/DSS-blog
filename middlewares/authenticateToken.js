// authenticateToken.js
//
// Purpose: authentication middleware
//
// Authors: Jake Dolan
// Date: 08/05/2025

const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'default_secret_key';

function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'Token missing' });

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

module.exports = authenticateToken;
