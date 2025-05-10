// postPolicy.js
//
// Purpose: Policy control for posts e.g. validate their length
//
// Authors: Jake Dolan
// Date: 10/05/2025

const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

// load the yaml config
const policiesPath = path.join(__dirname, 'policies.yaml');
let policies;

try {
    policies = yaml.load(fs.readFileSync(policiesPath, 'utf8'));
} catch (e) {
    console.error('Error reading config: ', e);
    policies = {};
}

// validate content length based on policy
function validatePostContent(content) {
    if (!policies.content || !policies.content.max_length) {
        return { valid: false, message: 'Content length validation rule not found in config.' };
    }

    const maxLength = policies.content.max_length;

    if (content.length > maxLength) {
        return { valid: false, message: `Content exceeds the maximum length of ${maxLength} chars.` };
    }

    return { valid: true };
}

module.exports = {
    validatePostContent
};
