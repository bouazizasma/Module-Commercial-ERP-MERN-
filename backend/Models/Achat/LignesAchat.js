const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LigneAchatSchema = new Schema({
    bon: {type: Schema.Types.ObjectId,ref: 'EnteteAchat',required: true},
    article: {type: Schema.Types.ObjectId,ref: 'article',required: true},
    quantite: {type: Number,required: true, min: 1 },
    prix_unitaire: {type: Number,required: true},
    total_ht: { type: Number, required: true }, // Assurez-vous que ce champ est défini
    total_ttc: { type: Number, required: true },
});
const LigneAchatModel = mongoose.model('LigneAchat', LigneAchatSchema);
module.exports = LigneAchatModel;