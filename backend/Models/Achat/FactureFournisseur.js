const mongoose = require("mongoose");

const FactureFournisseurSchema = new mongoose.Schema({
  numero_facture: { type: String, required: true, unique: true },
  date_facture: { type: Date, required: true },
  fournisseur: { type: mongoose.Schema.Types.ObjectId, ref: "fournisseur", required: true },
  bonReception: { type: mongoose.Schema.Types.ObjectId, ref: "EnteteAchat", required: true },
  fichierPdf: { type: Buffer, required: true }, // Stocker le fichier PDF en tant que Buffer
  contentType: { type: String, required: true }, // Type de contenu (application/pdf)
});

module.exports = mongoose.model("FactureFournisseur", FactureFournisseurSchema);