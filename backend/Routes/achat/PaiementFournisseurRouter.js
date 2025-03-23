const express = require("express");
const router = express.Router();
const {createPaiement, getTousLesPaiements, getAllPaiements, getPaiementById,getPaiementsByFactureId, cancelPaiement} = require("../../Controllers/PaiementFournisseurController");

// Créer un nouveau paiement
router.post("/create", createPaiement);

router.get("/tous", getTousLesPaiements);
// Récupérer tous les paiements
router.get("/fournisseur/:fournisseurId", getAllPaiements);

router.get("/paiements/facture/:factureId", getPaiementsByFactureId);

// Récupérer un paiement par son ID
router.get("/:id", getPaiementById);

// Annuler un paiement
router.put("/:id/cancel", cancelPaiement);

module.exports = router; 