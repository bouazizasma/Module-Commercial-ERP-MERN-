const express = require('express');
const router = express.Router();
const {getLignesByBon,createLigne,updateLigne,deleteLigne} = require('../../Controllers/LignesAchatController');

router.post('/create', createLigne);
router.put('/update', updateLigne);
router.delete('/:id', deleteLigne);
router.get('/LignesByBon', getLignesByBon);


module.exports = router;