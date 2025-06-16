const request = require('supertest');
const app = require('../index');
describe('GET /ventes/facture/all', () => {
  it('il faut retourner la liste des Factures ', async () => {
    const res = await request(app).get('/ventes/facture/all');
    expect(res.statusCode).toBe(200);
  });
});