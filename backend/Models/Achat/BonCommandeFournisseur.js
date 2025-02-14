const { string, required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const BonCommandeFournisseurSchema = new Schema({
    numero_commande: {type: String,required: true,unique: true},
    dateCommande: {type: Date,required: true},
    anneeReference: { 
        type: Number,
        required: true,
      },
    fournisseur: {type: Schema.Types.ObjectId,ref: 'fournisseur',required: true},
    adresse_Fournisseur :{type: String,},
    matriculeFiscale_Fournisseur :{type: String,},
    statut: {type: String,enum: ['En attente', 'Confirmée', 'Livrée', 'Annulée'],default: 'En attente'
    },
    depot :{type : Schema.Types.ObjectId,ref: 'depot',required: true, },       
   // date_modification: { type: Date, default: Date.now }, // Date de modification

});
const BonCommandeFournisseurModel = mongoose.model('BonCommandeFournisseur', BonCommandeFournisseurSchema);
module.exports = BonCommandeFournisseurModel;