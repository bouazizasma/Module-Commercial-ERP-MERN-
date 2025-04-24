const mongoose = require('mongoose');
const banqueClientSchema = new mongoose.Schema({
    code_banque: {
        type: String,
        required: true,
        unique: true
    },
    libelle: {
        type: String,
        required: true,
        unique: true
    },
    
});

module.exports = mongoose.model('BanqueClient', banqueClientSchema); 