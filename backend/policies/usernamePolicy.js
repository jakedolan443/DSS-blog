// usernamePolicy.js
//
// Purpose: Policy control for creating a username
//
// Authors: Charlie Gaskin
// Date: 10/05/2025

function validateUsername(username) {
    if (typeof username !== 'string') {
        return { valid: false, message: 'Username must be a string.' };
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3 || trimmedUsername.length > 25) {
        return { valid: false, message: 'Username must be between 3 and 15 characters long.' };
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(trimmedUsername)) {
        return { valid: false, message: 'Username must only contain alphanumerical characters' };
    }

    return { valid: true };
}

module.exports = {
    validateUsername
};