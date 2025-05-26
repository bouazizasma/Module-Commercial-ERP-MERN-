const mongoose = require('mongoose');
const { required, ref } = require('joi');
const Schema = mongoose.Schema;
//schema Client 
const ClientSchema = new Schema({
    code: {
        type: Number,   
        required: true,
        unique: true
    },
    nom_prenom: {   
        type: String,
        required: true,
        //unique: true
    },
    codeSecteur :{
        type: String, 
        ref: 'secteur',       
    },
    libelleSecteur :{
         type: String, 
        ref: 'secteur',       

    },
    matricule_fiscale: {
        type: String,
        unique: true
    },
    adresse: {
        type: String,
    },
    bankAccounts: [{
        banque: {
            type: Schema.Types.ObjectId,
            ref: 'BanqueClient',
            required: true
        },
        numeroCompte: {  
            type: String,
            required: true
        },
        RIB: {
            type: String,
            required: true,
            unique: true
        },
        adresseBanque: {
            type: String
        },
        isPrimary: {
            type: Boolean,
            default: false
        }
    }],
    
    telephone: {
        type: [String],         
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
    rapBl: {
        type: String,
    },
    solde_initial_bl: {
        type: String,
    },
    montant_reglement_bl: {
        type: String,
    },
    taux_retenu: {
        type: String,
    }
});
const ClientModel = mongoose.model('client', ClientSchema);
module.exports = ClientModel;