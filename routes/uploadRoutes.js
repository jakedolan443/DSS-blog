// uploadRoutes.js
//
// Purpose: upload manage routes
//
// Authors: Jake Dolan
// Date: 10/05/2025


const express = require('express');
const { uploadImage } = require('../controllers/uploadController');
const authenticateToken = require('../middlewares/authenticateToken');
const router = express.Router();
const path = require('path');
const fs = require('fs');

router.post('/', authenticateToken, uploadImage);
router.get('/:filename', (req, res) => {
    const filename = path.basename(req.params.filename); // avoid path traversal
    const filePath = path.join(__dirname, '../uploads/', filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) return res.status(404).json({ message: 'Image not found' });

        res.sendFile(filePath);
    });
});

module.exports = router;
