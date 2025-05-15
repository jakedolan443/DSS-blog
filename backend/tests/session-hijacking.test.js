// session-hijacking.test.js
//
// Purpose: Test for session hijacking vulnerability (token-based, no cookies)
//
// Authors: Kaleb Suter
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

beforeAll(async () => {
  await db.seed.run();
});

afterAll(async () => {
  await db('comments').del();
  await db('posts').del();
  await db('users').del();
  await db.destroy();
  console.log("Session Hijacking test completed.");
});

describe('Security Tests: Session Hijacking', () => {

  // Test to simulate session hijacking attempt with a forged token
  test('Accessing protected route with forged token (should be allowed, route is unprotected)', async () => {
    // Simulate an invalid JWT token
    const fakeToken = 'Bearer faketoken.abc.def';

    // Attempt to access the posts route with the invalid token
    const res = await request(app)
      .get('/posts')
      .set('Authorization', fakeToken);

    // Expect access to be allowed since the route is not currently protected
    expect(res.status).toBe(200);
  });
});
