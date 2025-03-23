const mongoose = require('mongoose');
const banqueSchema = new mongoose.Schema({
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
    adresse: {
        type: String,
        required: true
    },
    numero_Compte: {
        type: String,
        required: true,
        unique: true
    },
});

module.exports = mongoose.model('Banque', banqueSchema); 