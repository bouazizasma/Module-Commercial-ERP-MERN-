const express = require('express');
const router = express.Router();
const {createBonCommande,getBonCommandeByID, getBCF, deleteBCF, updateBCF} = require('../../Controllers/BonCommandeFournisseurControlleur');


//all
router.get('/all', getBCF);

//post
router.post('/create', createBonCommande);

//getById
router.get('/:id', getBonCommandeByID);

//modification
router.put('/:id', updateBCF);
//delete 
router.delete('/:id', deleteBCF);


module.exports = router;