// routes/factureRoutes.js

const express = require("express");
const router = express.Router();
const {genererFacture,downloadFacture,getAll,deleteFac , genererFactureGroupée, getFacturesParFournisseur,getArticles} = require("../../Controllers/FactureFournisseurController");

// Route pour générer une facture
router.post("/generer", genererFacture);

// Récupérer toutes les factures
router.get("/factures", getAll);
//get factures by fournisseur 
router.get("/factures/fournisseur/:fournisseurId", getFacturesParFournisseur);
//generer +ieurs en une fac
router.post("/plusieurs/generer", genererFactureGroupée);


// Route pour télécharger une facture
router.get("/download/:id",downloadFacture);

// Route pour récupérer les articles d'une facture
router.get("/articles/:id", getArticles);


  // Supprimer une facture
router.delete("/:id" , deleteFac);

module.exports = router;