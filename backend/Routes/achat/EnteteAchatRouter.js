const express = require('express');
const router = express.Router();
const {createBonCommande,getBonCommandeByID, getBCF, deleteBCF, updateBCF , createBonReception, getBEF, deleteBEF, deleteMultipleBEF, getBonReceptionByID} = require('../../Controllers/EnteteAchatControlleur');

////////////////////
//all BCF
router.get('/BCF/all', getBCF);

//post BCF
router.post('/BCF/create', createBonCommande);

//getById BCF
router.get('/BCF/:id', getBonCommandeByID);

//modification BCF
router.put('/BCF/:id', updateBCF);

//delete  BCF
router.delete('/BCF/:id', deleteBCF);


//get All BEF
router.get('/BEF/all', getBEF);

router.get('/BEF/:id', getBonReceptionByID);

//post BEF
router.post('/BEF/create', createBonReception);

//delete BEF
router.delete('/BEF/:id', deleteBEF);

//delete Multiple 
router.post('/BEF/deleteMultiple', deleteMultipleBEF);


module.exports = router;

////////////////////////////
//all BEF
//router.get('BEF/all', getBEF);


//getById BCF
//router.get('BEF/:id', getBEFByID);

//modification BCF
//router.put('BEF/:id', updateBEF);

//delete  BCF
//router.delete('BEF/:id', deleteBEF);



