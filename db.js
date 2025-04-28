// db.js
const knex = require('knex');

const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'bloguser',
        password: 'password',
        database: 'blogdb'
    }
});

module.exports = db;
