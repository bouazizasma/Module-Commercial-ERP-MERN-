const request = require('supertest');
const app = require('../index');

///put 
describe('PUT /achat/BCF/67c6de89aa3913aad110bd8d', () => {
  it('il faut mettre à jour le status de en attente à Confirmée de bon de commande fournisseur', async () => {
    const idExistant = '67c6de89aa3913aad110bd8d'; 

    const miseAJour = {
      statut: 'Confirmée',
    };

    const res = await request(app)
      .put(`/achat//BCF/${idExistant}`)
      .send(miseAJour)
      .set('Accept', 'application/json');

    expect(res.statusCode).toBe(200); 
    expect(res.body).toHaveProperty('bonCommande._id');
    expect(res.body.bonCommande.statut).toBe('Confirmée');
  });
});
