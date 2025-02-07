const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BonCommandeFournisseurSchema = new Schema({
    numero_commande: {
        type: String,
        required: true,
        unique: true
    },
    date_commande: {
        type: Date,
        required: true
    },
    fournisseur: {
        type: Schema.Types.ObjectId,
        ref: 'fournisseur',
        required: true
    },
    statut: {
        type: String,
        enum: ['En attente', 'Confirmée', 'Livrée', 'Annulée'],
        default: 'En attente'
    },
    total_ht: {
        type: Number,
        required: true
    },
    total_ttc: {
        type: Number,
        required: true
    }
});

const BonCommandeFournisseurModel = mongoose.model('BonCommandeFournisseur', BonCommandeFournisseurSchema);
module.exports = BonCommandeFournisseurModel;