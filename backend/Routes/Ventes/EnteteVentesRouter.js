const express = require('express');
const router = express.Router();
const {createDevis,getDevis, deleteDevis,updateDevis,getDevisByID,generateBonCommandeClient, getAllBonCommandes, generateBonLivraisonClient,getAllBonLivraisons, createBCC,getBCCByID, deleteBCC} = require('../../Controllers/EnteteVentesController');

////////////////////
//DEVIS
//all DEVIS
router.get('/devis/all', getDevis);
//post DEVIS
router.post('/devis/create', createDevis);
//get devis by id 
router.get('/devis/:id',getDevisByID);
//delete devis 
router.delete('/devis/:id',deleteDevis);
//modifier devis 
router.put('/devis/:id',updateDevis);

////////////////////
//Bon commande client 
// générer un bon de commande client à partir d'un devis
router.post("/:devisId/generate-bon-commande",generateBonCommandeClient);
//creation bon commande depuis saisie 
router.post ("/BCC/create", createBCC);

router.get('/bons-commande/:id',getBCCByID);


// all  bons de commande client
router.get("/bons-commande", getAllBonCommandes); 

//delete BCC
router.delete("/BCC/:id", deleteBCC);
///////////////////
//Bon livraison client 
// générer un bon de livraison client à partir d'un devis ou bon commande 

router.post("/:docId/generate-bon-livraison",generateBonLivraisonClient);


//all bon de livraison 
router.get("/bons-Livraison", getAllBonLivraisons); 




module.exports = router;



