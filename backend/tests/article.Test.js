const request = require('supertest');
const app = require('../index');
describe('GET /article/articles', () => {
  it('il faut retourner la liste des articles ', async () => {
    const res = await request(app).get('/article/articles');
    expect(res.statusCode).toBe(200);
  });
});
