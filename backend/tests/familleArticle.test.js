const request = require('supertest');
const app = require('../index');
describe('POST /familleArticle/NewFA', () => {
  it('il faut créer une nouvelle famille des articles ', async () => {
    const nouvellefamille = {
      designationFamille: 'Accessoires PC',
    };
    const res = await request(app)
      .post('/familleArticle/NewFA')
      .send(nouvellefamille) 
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(201); // 201 Created
    expect(res.body).toHaveProperty('_id'); 
    expect(res.body.designationFamille).toBe('Accessoires PC'); 
  });
});
