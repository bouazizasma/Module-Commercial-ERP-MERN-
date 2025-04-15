const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EnteteVentesSchema = new Schema({
    numero: { type: String, required: true, unique: true }, 
    type: { type: String, required: true, enum: ['Devis', 'BonCommandeClient', 'BonLivraison'],default: 'Devis' },
    devisReference: { type: String }, 
    bonCommandeClientReference: { type: String }, 
    dateDevis:{type :Date},
    bonLivraisonClientReference: { type: String }, 
    dateLivraison: { type: Date }, 
    dateCommande: { type: Date },
    anneeReference: { type: Number },
    client: { type: Schema.Types.ObjectId, ref: 'client', required: true },
    adresse_Client: { type: String },
    nomPrenom_Client: { type: String },
    matriculeFiscale_Client: { type: String },
    telephone_client: { type: [String] },
    total_hors_Taxe:{type: Number,},
    total_ttc:{type: Number,},
    statut: {type: String,enum: ['En attente', 'Confirmée', 'Livrée','Annulée'],default: 'En attente'},
    depot: { type: Schema.Types.ObjectId, ref: 'depot' }, 
    lignes: [{ type: Schema.Types.ObjectId, ref: "LigneVentes" }], 
}, {
    timestamps: true, 
});

const EnteteVentesModel = mongoose.model('EnteteVentes', EnteteVentesSchema);
module.exports = EnteteVentesModel;