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
    table.string('password').notNullable(); // hashed and salted with username
    table.integer('security_question_1_index').notNullable();
    table.string('security_answer_1_hash').notNullable();
    table.integer('security_question_2_index').notNullable();
    table.string('security_answer_2_hash').notNullable();
    table.integer('security_question_3_index').notNullable();
    table.string('security_answer_3_hash').notNullable();
    table.string('last_login_location').notNullable();
    table.string('email').notNullable();
    table.boolean('has_2fa_enabled').defaultTo("true");
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};

