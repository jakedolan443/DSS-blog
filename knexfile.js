const path = require('path');
require('dotenv').config();

module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 5432
    },
    migrations: {
      directory: path.join(__dirname, 'migrations')  // not just 'migrations'
    },
    seeds: {
      directory: path.join(__dirname, 'seeds')       // if used
    }
  }
};
