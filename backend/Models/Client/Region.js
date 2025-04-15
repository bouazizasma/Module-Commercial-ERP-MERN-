const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//schema Region 
const RegionSchema = new Schema({
    code: {
        type: Number,
        required: true,
        unique: true
    },
    libelle : {
        type: String,
        required: [true,],
        unique: true

    },
    });
    const RegionModel = mongoose.model('region', RegionSchema);
    module.exports = RegionModel;