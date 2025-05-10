// app.js
//
// Purpose: The backend component of the blog, created for
//          DSS. To run the project, use server.js.
//
// Authors: Jake Dolan
// Date: 08/05/2025

const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const fileUpload = require('express-fileupload');
require('dotenv').config();

app.use(express.json());
app.use(fileUpload());

// Use routes
app.use('/', authRoutes);
app.use('/posts', postRoutes);
app.use('/posts', commentRoutes);
app.use('/upload', uploadRoutes);

module.exports = app;
