const { required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//schema fournisseur 
const FournisseurSchema = new Schema({
    code: {
        type: Number,
        required: true,
        unique: true
    },
    raison_sociale: {
        type: String,
        required:true,
    },
    matricule_fiscale: {
        type: String,
        unique: true
    },
    adresse: {
        type: String,
    },
    telephone: {
        type: [String],
    },
    fax: {
        type: String,
    },
    register_commerce: {
        type: String,
    },
    solde_initial: {
        type: String,
    },
    montant_rapprochement: {
        type: String,
    },
    code_rapprochement: {
        type: String,
    },
    rapebe: {
        type: String,
    },
    solde_initial_ebe: {
        type: String,
    },
    montant_paie_ebe: {
        type: String,
    },
    taux_retenu: {
        type: String,
    }
});
const FournisseurModel = mongoose.model('fournisseur', FournisseurSchema);
module.exports = FournisseurModel;