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
require('dotenv').config();

app.use(express.json());

// Use routes
app.use('/', authRoutes);
app.use('/posts', postRoutes);
app.use('/posts', commentRoutes);

module.exports = app;
