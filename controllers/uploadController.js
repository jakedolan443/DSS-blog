// uploadController.js
//
// Purpose: controller for uploading
//
// Authors: Jake Dolan
// Date: 10/05/2025

const expressFileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const { validateImageUpload } = require('../policies/uploadPolicy');


const uploadImage = (req, res) => {
    if (!req.files || !req.files.image) {
        return res.status(400).json({ message: 'No image file uploaded' });
    }

    const image = req.files.image;

    // validate the uploaded image
    const validationResult = validateImageUpload(image);
    if (!validationResult.valid) {
        return res.status(400).json({ message: validationResult.message });
    }

    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir);
    }

    const imageName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(image.name)}`; // always unique name
    const imagePath = path.join(uploadDir, imageName);

    image.mv(imagePath, (err) => {
        if (err) {
            return res.status(500).json({ message: 'Error while uploading image.' });
        }

        // respond with the image path, needed in frontend
        res.status(200).json({
            message: 'Image uploaded successfully!',
            imagePath: `/uploads/${imageName}`,
        });
    });
};

module.exports = {
    uploadImage,
};
