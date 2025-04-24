const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//schema Vehicule 
const VehiculeSchema = new Schema({
    code: {
        type: Number,
        required: true,
        unique: true
    },
    codeVehicule :{ 
        type: String,
        required: true,
        unique: true
    
    },
    libelle : {
        type: String,
        required: [true,],

    },
    matricule : {
        type: String,
        required: [true,],
        unique: true

    },
    });
    const VehiculeModel = mongoose.model('vehicule', VehiculeSchema);
    module.exports = VehiculeModel;