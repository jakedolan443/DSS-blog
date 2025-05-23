// create_posts_and_comments.js
//
// Purpose: Creates the posts and comment tables
//
// Authors: Jake Dolan
// Date: 08/05/2025

exports.up = function(knex) {
  return knex.schema
    .createTable('posts', table => {
      table.increments('id').primary();
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('title').notNullable();
      table.text('content').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      table.jsonb('liked_by').defaultTo('[]');
    })
    .createTable('comments', table => {
      table.increments('id').primary();
      table.integer('post_id').references('id').inTable('posts').onDelete('CASCADE');
      table.integer('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.text('content').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.jsonb('liked_by').defaultTo('[]');
    });
};


exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('comments')
    .dropTableIfExists('posts');
};
