const { string, required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PointVenteSchema = new Schema({
    code: {type: String,required: true,unique: true},
    Libelle : {type: String , required : true },
   } );
    const PointVenteModel = mongoose.model('PointVente', PointVenteSchema);
    module.exports = PointVenteModel;