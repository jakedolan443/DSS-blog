const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  // Clear existing data in the correct order to avoid FK errors
  await knex('comments').del();
  await knex('posts').del();
  await knex('users').del();

  await knex.raw('ALTER SEQUENCE users_id_seq RESTART WITH 1');
  await knex.raw('ALTER SEQUENCE posts_id_seq RESTART WITH 1');
  await knex.raw('ALTER SEQUENCE comments_id_seq RESTART WITH 1');

  const hashedPassword1 = await bcrypt.hash('password123', 10);
  const hashedPassword2 = await bcrypt.hash('password456', 10);

  await knex('users').insert([
    { username: 'jake', password: hashedPassword1 },
    { username: 'bob', password: hashedPassword2 }
  ]);

  await knex('posts').insert([
    {
      title: 'Welcome to the blog',
      content: 'This is the first post on this app',
      user_id: 1
    }
  ]);

  await knex('comments').insert([
    {
      content: 'boom boom boom',
      user_id: 2,
      post_id: 1
    }
  ]);
};
