const mongoose = require("mongoose");

const reglementCSchema = new mongoose.Schema(
  {
    clientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "client",
      required: true,
    },
    facturesIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "EnteteVentes",
      required: true,
    }],
    blNonFactureesIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "EnteteVentes",
      required: true,
    }],
    montantTotal: {
      type: Number,
      required: true,
    },
    montantRestant: {
      type: Number,
      required: true,
    },
    montantPaye: {
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
        numeroCheque: {  
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
          ref: "BanqueClient", 
          required: function() { return this.modePaiement === "CHEQUE" || this.modePaiement === "MULTIPLE"; }
        },
        rib: {  // Ajout du RIB pour correspondre aux infos du client
          type: String,
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
          ref: "BanqueClient",  // Changé pour correspondre au modèle Client
          required: function() { return this.modePaiement === "EFFET" || this.modePaiement === "MULTIPLE"; }
        },
        rib: {  // Ajout du RIB pour correspondre aux infos du client
          type: String,
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

module.exports = mongoose.model("Reglement", reglementCSchema);