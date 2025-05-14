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
    // Run latest migrations
    await db.migrate.latest();
    console.log('Migrations completed or already existing');

    // Ensure required tables exist
    const requiredTables = ['users', 'posts', 'comments'];
    for (const table of requiredTables) {
      const exists = await db.schema.hasTable(table);
      if (!exists) {
        console.log(`Missing required table: ${table}`);
        return;
      }
    }

    // Check and add liked_by to posts/comments if missing
    const ensureLikedByColumn = async (tableName) => {
      const columns = await db(tableName).columnInfo();
      if (!columns.liked_by) {
        console.log(`Adding 'liked_by' column to ${tableName}`);
        await db.schema.table(tableName, table => {
          table.jsonb('liked_by').defaultTo('[]');
        });
        console.log(`'liked_by' column added to ${tableName}`);
      }
    };

    await ensureLikedByColumn('posts');
    await ensureLikedByColumn('comments');

    // Check for security question fields in 'users' table
    const usersColumns = await db('users').columnInfo();
    const requiredUserFields = [
      'security_question_1_index',
      'security_answer_1_hash',
      'security_question_2_index',
      'security_answer_2_hash',
      'security_question_3_index',
      'security_answer_3_hash',
      'last_login_location'
    ];

    const missingUserFields = requiredUserFields.filter(col => !usersColumns[col]);

    if (missingUserFields.length > 0) {
      await db.schema.table('users', table => {
        if (!usersColumns.security_question_1_index) table.integer('security_question_1_index');
        if (!usersColumns.security_answer_1_hash) table.string('security_answer_1_hash');
        if (!usersColumns.security_question_2_index) table.integer('security_question_2_index');
        if (!usersColumns.security_answer_2_hash) table.string('security_answer_2_hash');
        if (!usersColumns.security_question_3_index) table.integer('security_question_3_index');
        if (!usersColumns.security_answer_3_hash) table.string('security_answer_3_hash');
        if (!usersColumns.last_login_location) table.string('last_login_location');
      });
    }

    // Seed only if users or posts are empty
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
