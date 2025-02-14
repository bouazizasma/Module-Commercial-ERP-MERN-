const express = require('express');
const router = express.Router();
const {getLignesByBonCommande,
    createLigneCommande,
    updateLigneCommande,
    deleteLigneCommande} = require('../../Controllers/LignesCommandeFournisseur');

router.post('/create', createLigneCommande);
router.put('/update', updateLigneCommande);
router.delete('/:id', deleteLigneCommande);
router.get('/LignesByBonCommande', getLignesByBonCommande);


module.exports = router;