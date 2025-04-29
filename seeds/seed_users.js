

exports.seed = function(knex) {
  return knex('users')
    .del()
    .then(function() {
      return knex('users').insert([
        { username: 'jake', password: 'hashed_password_1' },
        { username: 'bob', password: 'hashed_password_2' },
      ]);
    });
};
