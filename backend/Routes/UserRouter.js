const express =require ("express");
const router = express.Router();
const { createUser, getuserBYEmail} = require('../Controllers/UserController');

 
 
router.post('/create', createUser); 
 
router.post('/login', getuserBYEmail);

module.exports = router;