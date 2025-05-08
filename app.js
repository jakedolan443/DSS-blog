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
