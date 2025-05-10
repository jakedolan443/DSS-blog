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
          .set('Authorization', `Bearer ${authToken}`)
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

  test('GET /upload/:filename retrieves the first uploaded image', async () => {
    const firstUploaded = uploadedFilenames[0];
    const res = await request(app).get(`/upload/${firstUploaded}`);

    console.log('Get image response:', res.statusCode, res.headers['content-type']);

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toMatch(/^image\//);
  });

  afterAll(() => {
    uploadedFilenames.forEach(filename => {
      const filepath = path.join(__dirname, '../uploads', filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath); // Clean up
      }
    });
  });
});
