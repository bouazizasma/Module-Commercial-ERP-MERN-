const express = require('express');
const router = express.Router();
    const {createCaisse,getAllCaisses,getCaisseById,updateCaisse,deleteCaisse} = require('../../Controllers/CaisseController');

// Routes principales
router.post('/createCaisse', createCaisse);
router.get('/AllCaisses', getAllCaisses);
router.get('/:id', getCaisseById);
router.put('/:id', updateCaisse);
router.delete('/:id', deleteCaisse);


module.exports = router; 