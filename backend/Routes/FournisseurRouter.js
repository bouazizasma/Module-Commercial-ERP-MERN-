const express =require ("express");
const router = express.Router();
const { getFournisseurs, getFournisseurByID, createFournisseur, updateFournisseur, deleteFournisseur,check_fournisseur } = require('../Controllers/FournisseurController');

/**
 * @route   
 * @desc    
 * @access  
 */
router.get('/fournisseurs', getFournisseurs);

/**
 * @route   
 * @desc   
 * @access  
 */
router.post('/newF', createFournisseur);

/**
 * @route   
 * @desc    
 * @access  
 */
router.get('/:id', getFournisseurByID);

router.get('/check', check_fournisseur);

/**
 * @route   
 * @desc    
 * @access  
 */
router.put('/:id', updateFournisseur);

/**
 * @route  
 * @desc    
 * @access  
 */
router.delete('/:id', deleteFournisseur);

module.exports = router;
