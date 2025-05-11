// server.js
//
// Purpose: The runnable component of the DSS blog. Use 'npm start'.
//          This script also setups and cleans seeds (see below).
//
// Authors: Jake Dolan
// Date: 08/05/2025


const app = require('./app');
const PORT = process.env.PORT || 3000;
const knex = require('knex');
const cors = require('cors');




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

async function setupDatabase() {
    try {
        // Apply all migrations
        await db.migrate.latest();
        console.log('Migrations completed or already existing');

        // Check if posts and comments tables exist
        const postsExists = await db.schema.hasTable('posts');
        const commentsExists = await db.schema.hasTable('comments');

        if (!postsExists || !commentsExists) {
            console.log('Missing tables after migrations');
            return;
        }

        // Check if the 'liked_by' column exists in both tables
        const postsColumns = await db('posts').columnInfo();
        const commentsColumns = await db('comments').columnInfo();

        if (!postsColumns.liked_by || !commentsColumns.liked_by) {
            console.log('Liked_by column missing, adding column to tables');
            // Add the liked_by column if it doesn't exist
            await db.schema.table('posts', table => {
                table.jsonb('liked_by').defaultTo('[]');
            });

            await db.schema.table('comments', table => {
                table.jsonb('liked_by').defaultTo('[]');
            });

            console.log('Liked_by column added to posts and comments tables');
        }

        // Only seed if posts and users tables are empty
        const [{ userCount }] = await db('users').count('id as userCount');
        const [{ postCount }] = await db('posts').count('id as postCount');

        if (parseInt(userCount) === 0 || parseInt(postCount) === 0) {
            await db.seed.run();
            console.log('Seeding complete');
        } else {
            console.log('Tables already have data. Skipping seeding');
        }

    } catch (err) {
        console.error('Error setting up database:', err);
    }
}





async function cleanupDatabase() {
    try {
        console.log('\nCleaning up seed data...');

        // Delete in reverse order to respect foreign key constraints
        await db('comments').del();
        await db('posts').del();
        await db('users').del();

        console.log('Seed data removed');
        process.exit(0);
    } catch (err) {
        console.error('Error during cleanup:', err);
        process.exit(1);
    }
}

// clean on exit
process.on('SIGINT', cleanupDatabase);
process.on('SIGTERM', cleanupDatabase);

setupDatabase();
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
