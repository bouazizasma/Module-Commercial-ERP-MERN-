const { number, required } = require("joi");
const mongoose = require("mongoose");
const FactureFournisseurSchema = new mongoose.Schema({
  numero_facture: { type: String, required: true, unique: true },
  date_facture: { type: Date, required: true },
  fournisseur: { type: mongoose.Schema.Types.ObjectId, ref: "fournisseur", required: true },
  numeroFactureFournisseur:{ type: Number},
  bonsReception: [{ type: mongoose.Schema.Types.ObjectId, ref: "EnteteAchat" }], // Tableau de bons de réception  fichierPdf: { type: Buffer, required: true }, // Stocker le fichier PDF en tant que Buffer
  contentType: { type: String, required: true },
  montantTTC: { type: Number, required: true }, 
  statut:{type: String, required: true},
  fichierPdf :{type: String , required :false },
  paiementEffectuee :{type: Number, required: true  },
});

module.exports = mongoose.model("FactureFournisseur", FactureFournisseurSchema);