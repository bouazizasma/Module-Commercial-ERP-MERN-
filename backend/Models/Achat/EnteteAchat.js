const { string, required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const EnteteAchatSchema = new Schema({
    numero_Bon: {type: String,required: true,unique: true},
    dateCommande: {type: Date},
    dateReception: {type: Date},
    anneeReference: { type: Number,required: true,},
    fournisseur: {type: Schema.Types.ObjectId,ref: 'fournisseur',required: true},
    adresse_Fournisseur :{type: String,},
    matriculeFiscale_Fournisseur :{type: String,},
    statut: {type: String,enum: ['En attente', 'Confirmée', 'Livrée', 'Facturé' ,'Annulée'],default: 'En attente'},
    depot :{type : Schema.Types.ObjectId,ref: 'depot',required: true, },       
    facture: { type: Schema.Types.ObjectId, ref: "FactureFournisseur" } ,
    type :{type :String,},
    lignes: [{ type: Schema.Types.ObjectId, ref: "LigneAchat" }], 
},
{
  timestamps:true ,
}
);
const EnteteAchatModel = mongoose.model('EnteteAchat', EnteteAchatSchema);
module.exports = EnteteAchatModel;