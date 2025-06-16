const mongoose = require("mongoose");
const paiementFSchema = new mongoose.Schema(
  {
    fournisseurId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "fournisseur",
      required: true,
    },
    facturesIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "FactureFournisseur",
      required: true,
    }],
    montantTotal: {
      type: Number,
      required: true,
    },
    montantPaye: { //tt details
      type: Number,
      required: true,
    },
    montantRestantDePaiement: { //tt details
      type: Number,
      required: true,
    },
    modePaiement: {
      type: String,
      enum: ["ESPECE", "CHEQUE", "EFFET", "MULTIPLE"],
      required: true,
    },
    caisseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caisse",
      required: true,
    },
    details: {
      cheques: [{
        numeroChèque: {
          type: String,
          required: function() { return this.modePaiement === "CHEQUE" || this.modePaiement === "MULTIPLE"; }
        },
        montant: {
          type: Number,
          required: function() { return this.modePaiement === "CHEQUE" || this.modePaiement === "MULTIPLE"; }
        },
        dateEcheance: {
          type: Date,
          required: function() { return this.modePaiement === "CHEQUE" || this.modePaiement === "MULTIPLE"; }
        },
        banque: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Banque",
          required: function() { return this.modePaiement === "CHEQUE" || this.modePaiement === "MULTIPLE"; }
        }
      }],
      effets: [{
        titreDocument: {
          type: String,
          required: function() { return this.modePaiement === "EFFET" || this.modePaiement === "MULTIPLE"; }
        },
        montant: {
          type: Number,
          required: function() { return this.modePaiement === "EFFET" || this.modePaiement === "MULTIPLE"; }
        },
        dateEcheance: {
          type: Date,
          required: function() { return this.modePaiement === "EFFET" || this.modePaiement === "MULTIPLE"; }
        },
        banque: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Banque",
          required: function() { return this.modePaiement === "EFFET" || this.modePaiement === "MULTIPLE"; }
        }
      }],
      especes: [{
        montant: {
          type: Number,
          required: function() { return this.modePaiement === "ESPECE" || this.modePaiement === "MULTIPLE"; }
        }
      }]
    },
    dateCreation: {
      type: Date,
      default: Date.now,
    },
    
  },
  { timestamps: true }
);
module.exports = mongoose.model("PaiementFournisseur", paiementFSchema);