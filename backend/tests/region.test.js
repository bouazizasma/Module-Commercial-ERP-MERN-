const request = require('supertest');
const app = require('../index');
describe('DELETE /region/684f0a069bb4fe6972491cab', () => {
  it('il faut supprimer la region par son id', async () => {
    const id = '684f0a069bb4fe6972491cab';  

    const res = await request(app)
      .delete(`/region/${id}`)
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(200); // ou 204 si tu renvoies pas de contenu
    expect(res.body).toHaveProperty('message');  // par ex. un message de confirmation
    expect(res.body.message).toBe("Region deleted successfully");  // adapte selon ta réponse API
  });
});
