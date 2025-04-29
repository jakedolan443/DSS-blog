const bcrypt = require('bcrypt');

exports.seed = function(knex) {

  return knex('users')
    .del()
    .then(async function() {
      // Insert hashed passwords into users table
      const hashedPassword1 = await bcrypt.hash('password123', 10);
      const hashedPassword2 = await bcrypt.hash('password456', 10);

      return knex('users').insert([
        { username: 'jake', password: hashedPassword1 },
        { username: 'bob', password: hashedPassword2 },
      ]);
    });
};
