const express = require('express');
const router = express.Router();
const {createDevis,getDevis, deleteDevis,updateDevis,getDevisByID,generateBonCommandeClient, getAllBonCommandes, generateBonLivraisonClient,getAllBonLivraisons, createBCC,getBCCByID, deleteBCC , createBL,generateFactureClient,getAllFacture,deleteFacture,getFacturesParClient,getBonLivraisonNonFactures,getBonLivraisonNonFacturesAll,generateFacturesClientsGroupes} = require('../../Controllers/EnteteVentesController');
const { checkStockLevels } = require('../../Middlewares/StockCheckMiddleware');

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
//creation de BL d'apres saisie
router.post ("/BL/create", checkStockLevels, createBL);

//all bon de livraison 
router.get("/bons-Livraison", getAllBonLivraisons); 


///////////////////////////////FACTURE///////////////////////////////////////////

//Generer la facture d'apres les bl 

router.post("/:bonLivraisonID/generate-Facture",generateFactureClient);

//get all Facture 
router.get("/facture/all", getAllFacture);

//delete facture 
router.delete('/facture/:id',deleteFacture);

//Get Facture by client :
router.get("/factures/client/:clientID", getFacturesParClient);

//get Bl non facturées 
router.get('/bonslivraison/non-factures/:clientID', getBonLivraisonNonFactures);
router.get('/bonslivraison/nonfactures/all', getBonLivraisonNonFacturesAll);

//Generer les factures groupées 
router.post('/factures/groupes', generateFacturesClientsGroupes);


module.exports = router;



