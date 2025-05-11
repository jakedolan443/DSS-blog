// create_users_tables.js
//
// Purpose: Creates the users table
//
// Authors: Jake Dolan
// Date: 08/05/2025

exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary(); // auto-incrementing primary key
    table.string('username').notNullable();
    table.string('password').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};
