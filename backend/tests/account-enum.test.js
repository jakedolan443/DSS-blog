// account-enum.test.js
//
// Purpose: Test for account enumeration vulnerability
//
// Authors: Jake Dolan
// Date: 08/05/2025

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
  console.log("Account Enumeration test completed.")
});

describe('Security Tests: Account Enumeration', () => {

  test('Login response should not differentiate between incorrect username and password', async () => {
    const incorrectUsername = 'nonexistentuser';
    const incorrectPassword = 'wrongpassword';

    // attempt login with incorrect username
    const usernameRes = await request(app)
      .post('/login')
      .send({ username: incorrectUsername, password: incorrectPassword });
    expect(usernameRes.statusCode).toBe(401);
    expect(usernameRes.body.message).toBe('Invalid credentials');

    // attempt login with correct username but incorrect password
    const passwordRes = await request(app)
      .post('/login')
      .send({ username: 'testuser', password: incorrectPassword });
    expect(passwordRes.statusCode).toBe(401);
    expect(passwordRes.body.message).toBe('Invalid credentials');
  });

});

