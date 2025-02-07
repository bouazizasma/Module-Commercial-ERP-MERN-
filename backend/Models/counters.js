const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Modèle pour le compteur
const CounterSchema = new Schema({
    model: {
        type: String,
        required: true,
        unique: true // Chaque modèle a un compteur unique
    },
    seq: {
        type: Number,
        default: 1 // Commence à 1
    }
});

const CounterModel = mongoose.model('counter', CounterSchema);
module.exports = CounterModel;
