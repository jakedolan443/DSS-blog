const express = require('express');
const app = express();
const knex = require('knex');
const bcrypt = require('bcrypt');
const saltRounds = 10;
require('dotenv').config();

app.use(express.json());


const db = knex({
    client: 'pg',
    connection: {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
});

const PORT = process.env.PORT || 3000;

async function setupDatabase() {
    try {
        // Check if users table exists before running migrations

        const tables = await db('pg_catalog.pg_tables')
            .select('tablename')
            .where('schemaname', 'public');

        const hasUsersTable = tables.some(table => table.tablename === 'users');

        if (!hasUsersTable) {
            // Run migrations only if the users table doesn't exist
            await db.migrate.latest();
            console.log('Migrations completed.');
        } else {
            console.log('Users table already exists. Skipping migrations.');
        }

        // Check if the users table already has data
        const userCount = await db('users').count('id as total');

        if (parseInt(userCount[0].total) === 0) {
            // Run seeds only if the users table is empty
            await db.seed.run();
            console.log('Seeding completed.');
        } else {
            console.log('Users table already has data. Skipping seeding.');
        }
    } catch (err) {
        console.error('Error setting up database:', err);
    }
}

setupDatabase();

// For testing
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
    res.send('Hello world');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Check if username already exists
        const existingUser = await db('users').where({ username }).first();
        if (existingUser) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user
        const [newUser] = await db('users')
            .insert({ username, password: hashedPassword })
            .returning(['id', 'username', 'created_at']);

        res.status(201).json({ user: newUser, message: 'User registered successfully' });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

