const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LigneCommandeFournisseurSchema = new Schema({
    bon_commande: {
        type: Schema.Types.ObjectId,
        ref: 'BonCommandeFournisseur',
        required: true
    },
    article: {
        type: Schema.Types.ObjectId,
        ref: 'article',
        required: true
    },
    quantite: {
        type: Number,
        required: true,
        min: 1

    },
    prix_unitaire: {
        type: Number,
        required: true},
     

    total_ligne: {
        type: Number,
        required: true
    }
});

const LigneCommandeFournisseurModel = mongoose.model('LigneCommandeFournisseur', LigneCommandeFournisseurSchema);
module.exports = LigneCommandeFournisseurModel;