// session-hijacking.test.js
//
// Purpose: Test for session hijacking vulnerability
//
// Authors:
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

});

afterAll(async () => {
  await db('comments').del();
  await db('posts').del();
  await db('users').del();
  await db.destroy();
  console.log("Session Hijacking test completed.")
});

describe('Security Tests: Session Hijacking', () => {

  // refer to account enumeration test for example on how to complete tests
  // (or ask Jake if you're stuck)

});

