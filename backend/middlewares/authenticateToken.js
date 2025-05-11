// authenticateToken.js
//
// Purpose: authentication middleware
//
// Authors: Jake Dolan
// Date: 08/05/2025

const { verifyToken } = require('../utils/jwt');

function authenticateToken(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: 'No token, not authenticated' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // contains { id, username }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}

module.exports = authenticateToken;
