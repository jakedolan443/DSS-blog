// app.js
//
// Purpose: The backend component of the blog, created for
//          DSS. To run the project, use server.js.
//
// Authors: Jake Dolan
// Date: 08/05/2025

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const fileUpload = require('express-fileupload');
require('dotenv').config();

app.use(express.json());
app.use(fileUpload());
app.use(cookieParser());
app.use(cors({
  origin: ['http://127.0.0.1:5000', 'http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Use routes
app.use('/', authRoutes);
app.use('/posts', postRoutes);
app.use('/posts', commentRoutes);
app.use('/upload', uploadRoutes);
app.use('/users', userRoutes)

module.exports = app;
