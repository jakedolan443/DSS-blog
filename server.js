const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;

const db = require('./db');

app.get('/users', async (req, res) => {
    try {
        const users = await db('users').select('id', 'username', 'created_at');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});


app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
