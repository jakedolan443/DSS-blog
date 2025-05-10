// postPolicy.js
//
// Purpose: Policy control for posts e.g. validate their length
//
// Authors: Jake Dolan
// Date: 10/05/2025


function validatePostContent(content) {

    if (content.length > 5000) {
        return { valid: false, message: 'Content exceeds the maximum length of 5000 characters.' };
    }

    return { valid: true };
}

module.exports = {
    validatePostContent
};
