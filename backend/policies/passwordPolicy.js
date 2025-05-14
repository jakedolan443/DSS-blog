// passwordPolicy.js
//
// Purpose: Policy control for creating a password
//
// Authors: Charlie Gaskin
// Date: 10/05/2025

const fs = require('fs');
const path = require('path');

const BlacklistPath = path.join(__dirname, 'blacklistedPasswords.txt');
let blacklist = [];

try {
    const fileContent = fs.readFileSync(BlacklistPath, 'utf8');
    blacklist = fileContent.split(/\r?\n/).map(p => p.trim().toLowerCase());
} catch (e) {
    console.error('Failed to load blacklist:', e);
}

function validatePassword(password) {
    if (typeof password !== 'string') {
        return { valid: false, message: 'Password must be a string.' };
    }

    const trimmed = password.trim();

    if (trimmed.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters long.' };
    }
    if (blacklist.includes(trimmed.toLowerCase())) {
        return { valid: false, message: 'Password is commonly used, try something more complex.' };
    }

    return { valid: true };
}

module.exports = {
    validatePassword
};