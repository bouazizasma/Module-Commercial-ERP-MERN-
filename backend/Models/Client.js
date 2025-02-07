const mongoose = require('mongoose');
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
    matricule_fiscale: {
        type: String,
      //  required: [true, 'Le champ matricule_fiscale est obligatoire.'],
        unique: true

    },
    adresse: {
        type: String,
      //  required: [true, 'Le champ matricule_fiscale est obligatoire.'],
       // unique: true
       required: true,
    },
    telephone: {
        type: [String], // Tableau de chaînes de caractères
        
    
       // required: [true, 'Le champ téléphone est obligatoire.'],
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
    rapBl: {
        type: String,
       // required: [true, 'Le champ rapebe est obligatoire.'],
    },
    solde_initial_bl: {
        type: String,
       // required: [true, 'Le champ solde_initial_ebe est obligatoire.'],
    },
    montant_reglement_bl: {
        type: String,
       // required: [true, 'Le champ montant_paie_ebe est obligatoire.'],
    },
    taux_retenu: {
        type: String,
       // required: [true, 'Le champ taux_retenu est obligatoire.'],
    }
    
    
   
});



const ClientModel = mongoose.model('client', ClientSchema);
module.exports = ClientModel;