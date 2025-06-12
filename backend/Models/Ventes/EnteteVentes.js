const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EnteteVentesSchema = new Schema({
    numero: { type: String, required: true, unique: true }, 
    type: { type: String, required: true, enum: ['Devis', 'BonCommandeClient', 'bonLivraisonClient', 'FactureClient'],default: 'Devis' },
    devisReference: { type: String }, 
    bonCommandeClientReference: { type: String }, 
    dateDevis:{type :Date},
    bonLivraisonClientReference: { type: String }, 
    dateLivraison: { type: Date }, 
    dateCommande: { type: Date },
    dateFacture: { type: Date },
    factureReference:{type:String},
    anneeReference: { type: Number },
    client: { type: Schema.Types.ObjectId, ref: 'client', required: true },
    total_hors_Taxe:{type: Number,},
    total_ttc:{type: Number,},
    montantPaye: { type: Number, default: 0 },
    datePaiement: { type: Date },
    estFacture: { type: Boolean, default: false },
    statut: {type: String,enum: ['En attente', 'Confirmée', 'Livrée', 'Facturée','Annulée' , 'Non Facturée', 'paye','partiellement_paye', 'non_paye' ],default: 'En attente'},
    depot: { type: Schema.Types.ObjectId, ref: 'depot' }, 
    modePaiement: {
        type: String,
        enum: ["Espèce", "Chèque", "Effet"],
      },
      secteur :{
        type: Schema.Types.ObjectId, ref: 'secteur',
      },
      vehicule:{
        type: Schema.Types.ObjectId, ref: 'vehicule',
      },
      netapayer:{
        type: Number,
      },
      notation :{
        type: String
      },
      chauffeur:{
        type: String
      },
      timbre:{
        type:Number,
      },
    lignes: [{ type: Schema.Types.ObjectId, ref: "LigneVentes" }], 
}, {
    timestamps: true, 
});

const EnteteVentesModel = mongoose.model('EnteteVentes', EnteteVentesSchema);
module.exports = EnteteVentesModel;