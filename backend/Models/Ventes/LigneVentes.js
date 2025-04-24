const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const LigneVentesSchema = new Schema({
    numeroEntete: {type: Schema.Types.ObjectId,ref: 'EnteteVentes',required: true},
    article: {type: Schema.Types.ObjectId,ref: 'article',required: true},
    quantite: {type: Number,required: true, min: 1 },
    prix_unitaire: {type: Number,required: true},
    prix_uTTC: {type: Number,required: true},
    tva: {type: Number,required: true},
    remise: {type: Number},
    dc: {type: Number},
    fodec: {type: Number},
    total_ht: { type: Number, required: true },
    total_ttc: { type: Number, required: true },
});
const LigneVentesModel = mongoose.model('LigneVentes', LigneVentesSchema);
module.exports = LigneVentesModel;