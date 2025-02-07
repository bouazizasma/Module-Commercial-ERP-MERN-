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
        //required:[true, 'Le champ raison_sociale est obligatoire.'],
    },
    matricule_fiscale: {
        type: String,
      //  required: [true, 'Le champ matricule_fiscale est obligatoire.'],
        unique: true

    },
    adresse: {
        type: String,
        //required:[true, 'Le champ adresse est obligatoire.'],
    },
    telephone: {
        type: [String], // Tableau de chaînes de caractères
       // required: [true, 'Le champ téléphone est obligatoire.'],
    },
    fax: {
        type: String,
        //required: true,
    },
    register_commerce: {
        type: String,
       // required: [true, 'Le champ register_commerce est obligatoire.'],
    },
    solde_initial: {
        type: String,
       // required: [true, 'Le champ solde_initial est obligatoire.'],
    },
    montant_rapprochement: {
        type: String,
       // required: [true, 'Le champ montant_rapprochement est obligatoire.'],
    },
    code_rapprochement: {
        type: String,
       // required: [true, 'Le champ code_rapprochement est obligatoire.'],
    },
    rapebe: {
        type: String,
       // required: [true, 'Le champ rapebe est obligatoire.'],
    },
    solde_initial_ebe: {
        type: String,
       // required: [true, 'Le champ solde_initial_ebe est obligatoire.'],
    },
    montant_paie_ebe: {
        type: String,
       // required: [true, 'Le champ montant_paie_ebe est obligatoire.'],
    },
    taux_retenu: {
        type: String,
       // required: [true, 'Le champ taux_retenu est obligatoire.'],
    }
});



const FournisseurModel = mongoose.model('fournisseur', FournisseurSchema);
module.exports = FournisseurModel;