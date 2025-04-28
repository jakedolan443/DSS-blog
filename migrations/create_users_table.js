const db = require('../db');

async function createUsersTable() {
    const exists = await db.schema.hasTable('users');
    if (!exists) {
        await db.schema.createTable('users', (table) => {
            table.increments('id').primary();
            table.string('username').unique().notNullable();
            table.string('password').notNullable(); // hashed password
            table.timestamp('created_at').defaultTo(db.fn.now());
        });
    } else {
        console.log('Users table already exists');
    }
}

createUsersTable()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
