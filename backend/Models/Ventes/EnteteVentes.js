const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EnteteVentesSchema = new Schema({
    numero: { type: String, required: true, unique: true }, 
    type: { type: String, required: true, enum: ['Devis', 'BonCommandeClient', 'BonLivraison'],default: 'Devis' },
    devisReference: { type: String }, 
    bonCommandeClientReference: { type: String }, 
    dateDevis:{type :Date},
    dateLivraison: { type: Date }, 
    dateCommande: { type: Date },
    anneeReference: { type: Number, required: true },
    Client: { type: Schema.Types.ObjectId, ref: 'client', required: true },
    adresse_Client: { type: String },
    matriculeFiscale_Client: { type: String },
    telephone_client: { type: [String] },
    statut: { 
        type: String, 
        enum: ['En attente', 'Confirmée', 'Livrée', 'Facturé', 'Annulée'], 
        default: 'En attente' 
    },
    depot: { type: Schema.Types.ObjectId, ref: 'depot', required: true }, 
    lignes: [{ type: Schema.Types.ObjectId, ref: "LigneVentes" }], // Référence aux lignes de vente
}, {
    timestamps: true, // Ajoute automatiquement `createdAt` et `updatedAt`
});

const EnteteVentesModel = mongoose.model('EnteteVentes', EnteteVentesSchema);
module.exports = EnteteVentesModel;