exports.up = function(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary(); // auto-incrementing primary key
    table.string('username').notNullable(); // username column
    table.string('password').notNullable(); // password column
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('users');
};
