const express = require('express');
const router = express.Router();
const {createBanque,getAllBanques,getBanqueByID,updateBanque,deleteBanque} = require('../../Controllers/BanqueController');

// Routes CRUD de base pour les banques
router.post('/createBanque', createBanque);
router.get('/AllBanques', getAllBanques);
router.get('/:id', getBanqueByID);
router.put('/:id', updateBanque);
router.delete('/:id', deleteBanque);


module.exports = router; 