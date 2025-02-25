const { string, required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TVASchema = new Schema({
    code: {type: String,required: true,unique: true},
    SommeTVA : {type: String , required : true ,enum: [0,7,13 ,19] },
   } );
    const TVAModel = mongoose.model('TVA', TVASchema);
    module.exports = TVAModel;