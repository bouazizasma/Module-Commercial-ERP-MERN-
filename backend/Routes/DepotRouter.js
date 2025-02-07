const express =require ("express");
const router = express.Router();
const { createDepot,getDepots, getDepotByID, deleteDepot} = require('../Controllers/DepotController');

/**
 * @route   
 * @desc    
 * @access  
 */
router.get('/depots', getDepots);

/**
 * @route   
 * @desc   
 * @access  
 */
router.post('/newD', createDepot);

/**
 * @route   
 * @desc    
 * @access  
 */
router.get('/:id', getDepotByID);


/**
 * @route   
 * @desc    
 * @access  
 */
// router.put('/:id', updateClient);

/**
 * @route  
 * @desc    
 * @access  
 */
router.delete('/:id', deleteDepot);

module.exports = router;
