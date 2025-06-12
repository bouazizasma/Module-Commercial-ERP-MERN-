const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//schema Region
const RegionSchema = new Schema({
    code: {
        type: Number,
        required: true,
        unique: true
    },
    codeRegion:{
        type: String,
        required: true,
        unique: true
    },
    libelle : {
        type: String,
        required: [true,],
        unique: true
    },
    secteur: {
        type: Schema.Types.ObjectId,
        ref: 'secteur',
        required: true
    },
    secteurInfo: {
        code: Number,
        codeSecteur: String,
        libelle: String
    }
    });
    const RegionModel = mongoose.model('region', RegionSchema);
    module.exports = RegionModel;