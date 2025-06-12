const express =require ("express");
const router = express.Router();
const { getClients, getClientByID, createClient, updateClient, deleteClient, addBankAccount,removeBankAccount,getBanqueParClient,getComptesParBanqueClient,getRegionsBySecteur} = require('../../Controllers/ClientController');

/**
 * @route   
 * @desc    
 * @access  
 */
router.get('/clients', getClients);

/**
 * @route   
 * @desc   
 * @access  
 */
router.post('/newC', createClient);

/**
 * @route   
 * @desc    
 * @access  
 */
router.get('/:id', getClientByID);

router.post('/:clientId/bank-accounts', addBankAccount);

router.delete('/:clientId/bank-accounts/:accountId', removeBankAccount);


router.put('/:id', updateClient);


router.delete('/:id', deleteClient);

router.get('/:clientId/banques', getBanqueParClient);


router.get('/:clientId/banque/:banqueId/comptes', getComptesParBanqueClient);

router.get('/secteur/:secteurId/regions', getRegionsBySecteur);




module.exports = router;
