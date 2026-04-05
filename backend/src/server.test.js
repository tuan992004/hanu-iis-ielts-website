const request = require('supertest');
const app = require('./server');

describe('Server Initialization', () => {
  it('should allow simple requests through unrecognized routes (404)', async () => {
    const res = await request(app).get('/unknown-endpoint');
    expect(res.statusCode).toEqual(404);
  });
});
