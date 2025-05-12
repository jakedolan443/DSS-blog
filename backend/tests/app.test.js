// app.test.js
//
// Purpose: Test for basic API functions with and without authentication
//
// Authors: Jake Dolan
// Date: 08/05/2025

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

  // Register and log in test user
  await request(app)
    .post('/register')
    .send({ username: 'testuser', password: 'testpass' });

  const loginRes = await request(app)
    .post('/login')
    .send({ username: 'testuser', password: 'testpass' });

  authToken = loginRes.headers['set-cookie'];
  const user = await db('users').where({ username: 'testuser' }).first();
  testUserId = user.id;
});

afterAll(async () => {
  await db('comments').del();
  await db('posts').del();
  await db('users').del();
  await db.destroy();
  console.log("App test completed.");
});


describe('Post Routes', () => {
  test('GET /posts returns list of posts', async () => {
    const res = await request(app).get('/posts');
    expect(res.statusCode).toBe(200);
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('title');
    }
  });

  test('POST /posts creates a new post (auth required)', async () => {
    const res = await request(app)
      .post('/posts')
      .set('Cookie', authToken)
      .send({ user_id: testUserId, title: 'New Post', content: 'test content' });

    expect(res.statusCode).toBe(201);
    expect(res.body.post).toHaveProperty('title', 'New Post');
  });

  test('PUT /posts/:id updates a post (auth required)', async () => {
    const post = await db('posts').where({ user_id: testUserId }).first();

    const res = await request(app)
      .put(`/posts/${post.id}`)
      .set('Cookie', authToken)
      .send({ title: 'Updated Title', content: 'Updated content' });

    expect(res.statusCode).toBe(200);
    expect(res.body.post).toHaveProperty('title', 'Updated Title');
  });
});

describe('Comment Routes', () => {
  test('GET /posts/:postId/comments returns comments for a post', async () => {
    const post = await db('posts').first();
    const res = await request(app).get(`/posts/${post.id}/comments`);
    expect(res.statusCode).toBe(200);
  });

  test('POST /posts/:postId/comments creates a new comment (auth required)', async () => {
    const post = await db('posts').first();

    const res = await request(app)
      .post(`/posts/${post.id}/comments`)
      .set('Cookie', authToken)
      .send({ user_id: testUserId, content: 'Another test comment' });

    expect(res.statusCode).toBe(201);
    expect(res.body.comment).toHaveProperty('content', 'Another test comment');
  });
});

describe('Authorisation Failures', () => {
  let otherUserToken;
  let otherUserId;
  let otherUserPostId;

  beforeAll(async () => {
    // Register and log in second user
    await request(app)
      .post('/register')
      .send({ username: 'otheruser', password: 'otherpass' });

    const loginRes = await request(app)
      .post('/login')
      .send({ username: 'otheruser', password: 'otherpass' });

    otherUserToken = loginRes.headers['set-cookie'];
    const user = await db('users').where({ username: 'otheruser' }).first();
    otherUserId = user.id;

    // Create a post with this other user
    const postRes = await request(app)
      .post('/posts')
      .set('Cookie', otherUserToken)
      .send({ user_id: otherUserId, title: 'other Post', content: 'Not yours' });

    otherUserPostId = postRes.body.post.id;
  });

  test('Cannot create post without being logged in', async () => {
    const res = await request(app)
      .post('/posts')
      .send({ user_id: testUserId, title: 'No auth?', content: 'no post!' });

    expect(res.statusCode).toBe(401);
  });

  test('Cannot update someone else’s post', async () => {
    const res = await request(app)
      .put(`/posts/${otherUserPostId}`)
      .set('Cookie', authToken)
      .send({ title: 'shouldnt work', content: 'nope' });

    expect(res.statusCode).toBe(403);
  });

  test('Cannot create comment without login', async () => {
    const post = await db('posts').first();

    const res = await request(app)
      .post(`/posts/${post.id}/comments`)
      .send({ user_id: testUserId, content: 'unauthenticated comment' });

    expect(res.statusCode).toBe(401);
  });
});
