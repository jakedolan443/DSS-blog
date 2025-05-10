// uploadPolicy.js
//
// Purpose: Policy control for uploading files
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

// Validate image upload based on policy
function validateImageUpload(file) {
    if (!file) {
        return { valid: false, message: 'No file uploaded.' };
    }

    if (file.size === 0) {
        return { valid: false, message: 'File is empty.' };
    }

    const allowedTypes = policies.image.allowed_types || [];
    if (!allowedTypes.includes(file.mimetype)) {
        return { valid: false, message: 'Only JPEG, PNG, or GIF images are allowed.' };
    }

    const maxSize = policies.image.max_size || 0;
    if (file.size > maxSize) {
        return { valid: false, message: `File size exceeds ${maxSize / 1024 / 1024} MB.` };
    }

    return { valid: true };
}


module.exports = {
    validateImageUpload,
};
