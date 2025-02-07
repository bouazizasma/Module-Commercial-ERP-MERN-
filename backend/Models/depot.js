const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//schema Depot  
const DepotSchema = new Schema({
    code: {
        type: Number,   
        required: true,
        unique: true
    },
    codeDepot :{
        type: String,   
        required: true,
    },
    libelle	: {    
        type: String,
        required: true,
    },
  
});
const DepotModel = mongoose.model('depot', DepotSchema);
module.exports = DepotModel;