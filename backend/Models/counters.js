const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Modèle pour le compteur
const CounterSchema = new Schema({
    model: {
        type: String,
        required: true
    },
    seq: {
        type: Number,
        default: 1
    },
    year: { 
        type: Number, 
        required: true ,
        validate: {
            validator: (value) => value !== null && value >= 2000 && value <= 2100,
            message: "L'année de référence est invalide."
        }
    }
});

// Ajouter l'index composé ici
//CounterSchema.index({ model: 1, anneeReference: 1 }, { unique: true });
CounterSchema.index({ model: 1, year: 1 }, { unique: true });

const CounterModel = mongoose.model('counter', CounterSchema);
module.exports = CounterModel;