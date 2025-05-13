// malicious-upload.test.js
//
// Purpose: Test for uploading malicious files via image upload
//
// Authors: Jake Dolan
// Date: 10/05/2025

const request = require('supertest');
const knex = require('knex');
const path = require('path');
const fs = require('fs');
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
let testUserId;

beforeAll(async () => {
  await db.seed.run();

  // Register a new test user
  const registerRes = await request(app)
    .post('/register')
    .send({ username: 'testuser', password: 'testapplepassword' });

  // login to get the JWT token
  const loginRes = await request(app)
    .post('/login')
    .send({ username: 'testuser', password: 'testapplepassword' });



  const cookies = loginRes.headers['set-cookie'];
  authToken = cookies && cookies[0];


  // get user ID
  const user = await db('users').where({ username: 'testuser' }).first();
  testUserId = user.id;
});

afterAll(async () => {
  await db('comments').del();
  await db('posts').del();
  await db('users').del();
  await db.destroy();
  console.log("App test completed.")
});

describe('Image Upload and Retrieval', () => {
  const testFiles = [
    { name: 'sample.jpg', shouldPass: true },
    { name: 'sample.png', shouldPass: true },
    { name: 'large.jpg', shouldPass: false, reason: 'File size exceeds limit' },
    { name: 'unsupported.bmp', shouldPass: false, reason: 'Only JPEG, PNG, or GIF images are allowed.' },
    { name: 'empty.jpg', shouldPass: false, reason: 'File is empty.' },
    { name: 'not-an-image.txt', shouldPass: false, reason: 'Only JPEG, PNG, or GIF images are allowed.' },
  ];

  let uploadedFilenames = [];

  testFiles.forEach(({ name, shouldPass, reason }) => {
    test(`POST /upload with ${name} (${shouldPass ? 'valid' : 'invalid'})`, async () => {
      const imagePath = path.join(__dirname, 'test-files', name);

      let res;
      try {
        res = await request(app)
          .post('/upload')
          .set('Cookie', authToken)
          .attach('image', imagePath);
      } catch (error) {
        if (name === 'large.jpg') {
          // Handle aborted error for large file upload gracefully (aborted by another package/OS-level)
          console.log(`Upload aborted for ${name}:`, error.message);
          expect(error.message).toMatch('Aborted');
          return;
        }
        throw error;
      }

      console.log(`Upload response (${name}):`, res.statusCode, res.body);

      if (shouldPass) {
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('imagePath');
        const filename = res.body.imagePath.split('/').pop();
        uploadedFilenames.push(filename);
      } else {
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        if (reason) {
          expect(res.body.message).toBe(reason);
        }
      }
    });
  });
});