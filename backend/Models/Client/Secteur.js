const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//schema Secteur 
const SecteurSchema = new Schema({
    code: {
        type: Number,
        required: true,
        unique: true
    },
    codeSecteur :{
        type: String,
        required: true,
        unique: true
    },
    libelle : {
        type: String,
        required: [true,],
        unique: true
    },
    });
    const SecteurModel = mongoose.model('secteur', SecteurSchema);
    module.exports = SecteurModel;