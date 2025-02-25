// routes/factureRoutes.js

const express = require("express");
const router = express.Router();
const {genererFacture,downloadFacture,getAll,deleteFac} = require("../../Controllers/FactureFournisseurController");

// Route pour générer une facture
router.post("/generer", genererFacture);

// Récupérer toutes les factures
router.get("/factures", getAll);

// Route pour télécharger une facture
router.get("/facture/:id/pdf",downloadFacture);


  // Supprimer une facture
router.delete("/:id" , deleteFac);

module.exports = router;