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

  // Register a new test user
  const registerRes = await request(app)
    .post('/register')
    .send({ username: 'testuser', password: 'testapplepassword' });

  // Get user ID for testing
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

  test('Registration response should not differentiate between existing or non-existing usernames', async () => {
    const existingUsername = 'testuser';
    const newUsername = 'newuser';
    const password = 'testapplepassword';

    // Try to register with an existing username
    const existingUsernameRes = await request(app)
      .post('/register')
      .send({ username: existingUsername, password });
    expect(existingUsernameRes.statusCode).toBe(409);
    expect(existingUsernameRes.body.message).toBe('Username already exists');

    // New username should work
    const newUsernameRes = await request(app)
      .post('/register')
      .send({ username: newUsername, password });
    expect(newUsernameRes.statusCode).toBe(201);
    expect(newUsernameRes.body.message).toBe('User registered successfully');
  });

});

