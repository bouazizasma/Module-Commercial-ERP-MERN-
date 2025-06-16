const request = require('supertest');
const app = require('../index');
describe('GET /fournisseur/fournisseurs', () => {
  it('il faut retourner la liste des fournisseurs ', async () => {
    const res = await request(app).get('/fournisseur/fournisseurs');
    expect(res.statusCode).toBe(200);
  });
});

////GeT by id 

describe('GET /fournisseur/679896f7ee5e57090992a110', () => {
  it("il faut retourner le fournisseur ayant l'id  679896f7ee5e57090992a110  ", async () => {
    const res = await request(app).get('/fournisseur/679896f7ee5e57090992a110');
    expect(res.statusCode).toBe(200);
  });
});
