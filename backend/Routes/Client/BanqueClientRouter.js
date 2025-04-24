const express = require('express');
const router = express.Router();
const {createBanque,getAllBanques,getBanqueByID,updateBanque,deleteBanque,getBanqueParClient} = require('../../Controllers/BanqueClientController');

// Routes CRUD de base pour les banques
router.post('/createBanque', createBanque);
router.get('/AllBanques', getAllBanques);
router.get('/:id', getBanqueByID);
router.put('/:id', updateBanque);
router.delete('/:id', deleteBanque);
//router.get('/client/:clientId', getBanqueParClient);


router.get('/:clientId/banques', getBanqueParClient); // Plus clair et cohérent



module.exports = router; 