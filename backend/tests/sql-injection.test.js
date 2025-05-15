// sql-injection.test.js
//
// Purpose: Test for SQL Injection vulnerability
//
// Authors: Charlie Gaskin
// Date: 09/05/2025

const request = require('supertest');
const knex = require('knex');
require('dotenv').config();

const app = require('../app');

const db = knex({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  }
});

let authToken;
let createdPostId;
let testUserId;

beforeAll(async () => {
  await db.seed.run();

  const securityQuestions = [
    { index: 1, answer: 'answer' },
    { index: 2, answer: 'answer' },
    { index: 3, answer: 'answer' }
  ];

  // Register a new test user with all required fields
  const registerRes = await request(app)
    .post('/register')
    .send({
      username: 'testuser',
      password: 'testapplepassword',
      email: 'testuser@example.com',
      has_2fa_enabled: false,
      security_questions: securityQuestions
    });

  // login to get the JWT token
  const loginRes = await request(app)
    .post('/login')
    .send({ username: 'testuser', password: 'testapplepassword' });

  authToken = loginRes.headers['set-cookie'];
  const user = await db('users').where({ username: 'testuser' }).first();
  testUserId = user.id;
});


afterAll(async () => {
  await db('comments').del();
  await db('posts').del();
  await db('users').del();
  await db.destroy();
  console.log("SQL Injection test completed.")
});

describe('Security Tests: SQL Injection', () => {
  test('Valid Username with SQL in password', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        username: 'testuser',
        password: `' OR '1'='1`
      });

    expect(res.statusCode).toBe(401);
    expect(res.body.message).toBe('Invalid credentials');
  });



  test('Registration with SQL inside a valid username', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        username: `testuser '); DROP TABLE users; --`,
        password: 'testapplepassword'
      });

    expect([400, 201, 409]).toContain(res.statusCode);
    expect(typeof res.body.message).toBe('string');
  });

  test('Post with SQL in title', async () => {
    const res = await request(app)
      .post('/posts')
      .set('Cookie', authToken)
      .send({
        user_id: testUserId,
        title: `Dirty Dirty SQL Injection'); DROP TABLE comments; --`,
        content: 'Nothing to see here :)'
      });

    expect([201, 400]).toContain(res.statusCode);
    expect(res.body.message || res.body.post).toBeDefined();
    createdPostId = res.body.post?.id; 
  });



  test('Update with SQL in content', async () => {
    if (!createdPostId) return;

    const res = await request(app)
      .put(`/posts/${createdPostId}`)
      .set('Cookie', authToken)
      .send({
        title: 'Pls dont look at the content',
        content: `'); SELECT pg_sleep(5); --`
      });

    expect([200, 400, 403]).toContain(res.statusCode);
    expect(res.body.message || res.body.post).toBeDefined();
  });



  test('Create comment with SQL injection in content - Must create real post first', async () => {
    const postRes = await request(app)
      .post('/posts')
      .set('Cookie', authToken)
      .send({
        user_id: testUserId,
        title: 'Commented Post',
        content: 'SQL In Comments'
      });

    const postId = postRes.body.post.id;

    const res = await request(app)
      .post(`/posts/${postId}/comments`)
      .set('Cookie', authToken)
      .send({
        user_id: testUserId,
        content: `Nice post!'); DROP TABLE users; --`
      });

    expect([201, 400]).toContain(res.statusCode);
    expect(res.body.comment || res.body.message).toBeDefined();
  });
});
