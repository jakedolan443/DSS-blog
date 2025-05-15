// seed_all.js
//
// Purpose: Creates database entries
//
// Authors: Jake Dolan
// Date: 08/05/2025

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

  // Security questions for bob
  const securityQuestionsBob = [
    { index: 1, answer: 'answer' },
    { index: 3, answer: 'answer' },
    { index: 5, answer: 'answer' }
  ];

  const hashedAnswers = await Promise.all(
    securityQuestionsBob.map(q => bcrypt.hash(q.answer, 10))
  );

  await knex('users').insert([
    {
      username: 'jake',
      password: hashedPassword1,
      has_2fa_enabled: false,
    },
    {
      username: 'bob',
      password: hashedPassword2,
      security_question_1_index: securityQuestionsBob[0].index,
      security_answer_1_hash: hashedAnswers[0],
      security_question_2_index: securityQuestionsBob[1].index,
      security_answer_2_hash: hashedAnswers[1],
      security_question_3_index: securityQuestionsBob[2].index,
      security_answer_3_hash: hashedAnswers[2],
      last_login_location: '1.1.1.1',
      has_2fa_enabled: false
    }
  ]);


  await knex('posts').insert([
    {
      title: 'My breakfast this morning',
      content: 'I had the most healthy breakfast this morning. ![Yorkie](https://png.pngtree.com/png-clipart/20231106/original/pngtree-yorkie-chocolate-bar-white-picture-image_13236859.png)',
      user_id: 2,
      liked_by: JSON.stringify([1, 2])
    }
  ]);

  await knex('posts').insert([
    {
      title: 'Does mouse cheese exist?',
      content: 'Does the cheese eaten by mice in cartoons actually exist?<br> ![Cheese](https://www.freeiconspng.com/uploads/cheese-picture-transparent-background-1.png) My verdict: No',
      user_id: 2,
      liked_by: JSON.stringify([1, 2])
    }
  ]);

  await knex('posts').insert([
    {
      title: 'Are some foods dangerous?',
      content: 'Some foods are dangerous to eat. We should not eat sharp foods or anything on fire. We should also beware of radioactive foods. Here are some radioactive foods: Brazil nuts, Carrots, Potatoes, Red meat, Beer, Peanut butter, Avocados, Spinach, Brazil nut oil. <br><br> Since foods can get hot, here are 25 foods that are dangerous to eat: Pizza, Hot soup, Coffee, Tea, Hot chocolate, Baked potatoes, Mozzarella sticks, Lasagna, Hot cheese dip, Apple pie, Ramen, Fried dumplings, Burritos, Quesadillas, Hot oil-fried chicken, Toasted sandwiches, Grilled cheese, Meat pies, French fries, Egg rolls, Stuffed peppers, Curry, Fondue, Oatmeal, Molten lava cake.',
      user_id: 1,
      liked_by: JSON.stringify([1, 2])
    }
  ]);

  await knex('posts').insert([
    {
      title: 'Bananas are radioactive!',
      content: 'I have made a chilling discovery. Bananas are killing us. ![Banana](https://www.freeiconspng.com/thumbs/banana-png/banana-png-28.png)',
      user_id: 1,
      liked_by: JSON.stringify([1])
    }
  ]);

  await knex('comments').insert([
    {
      content: 'boom boom boom',
      user_id: 2,
      post_id: 1,
      liked_by: JSON.stringify([1])
    },
    {
      content: 'cheese cheese cheese',
      user_id: 1,
      post_id: 2,
      liked_by: JSON.stringify([1])
    },
    {
      content: 'mice like cheese?',
      user_id: 2,
      post_id: 2,
      liked_by: JSON.stringify([2])
    },
    {
      content: 'dangerous noodles everywhere',
      user_id: 1,
      post_id: 3,
      liked_by: JSON.stringify([1, 2])
    },
    {
      content: 'bananas make me radioactive',
      user_id: 1,
      post_id: 4,
      liked_by: JSON.stringify([1])
    },
    {
      content: 'bananas turn into lasers',
      user_id: 2,
      post_id: 4,
      liked_by: JSON.stringify([2])
    }
  ]);
};

