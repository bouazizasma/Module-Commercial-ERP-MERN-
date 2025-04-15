const express =require ("express");
const router = express.Router();
const { getClients, getClientByID, createClient, updateClient, deleteClient} = require('../../Controllers/ClientController');

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


/**
 * @route   
 * @desc    
 * @access  
 */
router.put('/:id', updateClient);

/**
 * @route  
 * @desc    
 * @access  
 */
router.delete('/:id', deleteClient);

module.exports = router;
