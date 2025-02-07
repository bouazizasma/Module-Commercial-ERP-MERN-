const express = require('express');
const router = express.Router();
const {createBonCommande,getBonCommandeByID} = require('../Controllers/BonCommandeFournisseurControlleur');

router.post('/create', createBonCommande);
router.get('/:id', getBonCommandeByID);

module.exports = router;