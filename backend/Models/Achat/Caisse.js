const mongoose = require('mongoose');

const caisseSchema = new mongoose.Schema({
  libelle: {
    type: String,
    required: true,
    unique: true
  },
}, { timestamps: true });

module.exports = mongoose.model('Caisse', caisseSchema); 