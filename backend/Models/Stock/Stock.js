const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  reference: {
    type: String,
    required: true,
    unique: true
  },
  nom: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  quantite: {
    type: Number,
    required: true,
    default: 0
  },
  prixUnitaire: {
    type: Number,
    required: true
  },
  categorie: {
    type: String
  },
  dateAjout: {
    type: Date,
    default: Date.now
  },
  dateModification: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Stock', stockSchema); 