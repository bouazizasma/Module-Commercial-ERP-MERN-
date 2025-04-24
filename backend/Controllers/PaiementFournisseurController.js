const PaiementF = require("../Models/Achat/PaiementFournisseur");
const FactureF = require("../Models/Achat/FactureFournisseur");
const Caisse = require("../Models/Achat/Caisse");
const mongoose = require("mongoose");

// Créer un nouveau paiement
/*const createPaiement = async (req, res) => {
  try {
    const {
      fournisseurId,
      facturesIds,
      montantTotal,
      montantPaye,
      modePaiement,
      caisseId,
      details,
    } = req.body;

    // Vérifier si la caisse existe et a suffisamment de fonds
    const caisse = await Caisse.findById(caisseId);
    if (!caisse) {
      return res.status(404).json({ message: "Caisse non trouvée" });
    }

    // Récupérer les factures triées par date
    const factures = await FactureF.find({
      _id: { $in: facturesIds },
    }).sort({ date_facture: 1 });

    let montantRestant = montantPaye;
    const facturesMiseAJour = [];

    // Traiter chaque facture dans l'ordre chronologique
    for (const facture of factures) {
      if (montantRestant <= 0) break;

      const montantFacture = facture.montantTTC;
      const montantDejaPaye = facture.montantPaye || 0;
      const montantAPayer = montantFacture - montantDejaPaye;

      if (montantAPayer > 0) {
        if (montantRestant >= montantAPayer) {
          // Paiement complet de la facture
          facture.montantPaye = montantFacture;
          facture.statut = "paye";
          montantRestant -= montantAPayer;
        } else {
          // Paiement partiel de la facture
          facture.montantPaye = montantDejaPaye + montantRestant;
          facture.statut = "partiellement_paye";
          montantRestant = 0;
        }
        facturesMiseAJour.push(facture);
      }
    }

    // Mettre à jour toutes les factures
    await Promise.all(facturesMiseAJour.map(facture => facture.save()));

    // Mettre à jour le solde de la caisse
    caisse.solde -= montantPaye;
    await caisse.save();

    // Créer le paiement
    const paiement = new PaiementF({
      fournisseurId,
      facturesIds,
      montantTotal,
      montantPaye,
      modePaiement,
      caisseId,
      details,
      statut: "valide",
    });

    const savedPaiement = await paiement.save();
    res.status(201).json(savedPaiement);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la création du paiement",
      error: error.message,
    });
  }
}; 
*/

const calculerMontantRestant = async (facturesIds) => {
  try {
    // Récupérer tous les paiements associés aux factures
    const paiements = await PaiementF.find({ facturesIds: { $in: facturesIds } })
      .select("montantPaye facturesIds")
      .lean();

    // Calculer le montant total payé pour chaque facture
    const montantPayeParFacture = {};
    paiements.forEach((paiement) => {
      paiement.facturesIds.forEach((factureId) => {
        if (!montantPayeParFacture[factureId]) {
          montantPayeParFacture[factureId] = 0;
        }
        montantPayeParFacture[factureId] += paiement.montantPaye;
      });
    });

    // Récupérer les factures pour obtenir leur montant TTC
    const factures = await FactureF.find({ _id: { $in: facturesIds } })
      .select("montantTTC")
      .lean();

    // Calculer le montant restant total
    let montantRestantTotal = 0;
    factures.forEach((facture) => {
      const montantPaye = montantPayeParFacture[facture._id] || 0;
      montantRestantTotal += facture.montantTTC - montantPaye;
    });

    return montantRestantTotal;
  } catch (error) {
    console.error("Erreur dans calculerMontantRestant :", error);
    throw error;
  }
};
/*const createPaiement = async (req, res) => {
  try {
    const {
      fournisseurId,
      facturesIds,
      montantPaye,
      modePaiement,
      caisseId,
      details,
    } = req.body;

    console.log("Données reçues :", req.body);

    // Vérifier si la caisse existe
    const caisse = await Caisse.findById(caisseId);
    if (!caisse) {
      console.log("Caisse non trouvée :", caisseId);
      return res.status(404).json({ message: "Caisse non trouvée" });
    }

    // Vérifier les factures
    const factures = await FactureF.find({ _id: { $in: facturesIds } });
    if (factures.length !== facturesIds.length) {
      console.log("Certaines factures n'existent pas :", facturesIds);
      return res.status(404).json({ message: "Certaines factures n'existent pas" });
    }

    // Traiter chaque facture
    let montantRestant = montantPaye;
    const facturesMiseAJour = [];

    for (const facture of factures) {
      if (montantRestant <= 0) break;

      const montantFacture = facture.montantTTC;
      const montantDejaPaye = facture.montantPaye || 0;
      const montantAPayer = montantFacture - montantDejaPaye;

      if (montantAPayer > 0) {
        if (montantRestant >= montantAPayer) {
          facture.montantPaye = montantFacture;
          facture.statut = "paye";
          montantRestant -= montantAPayer;
        } else {
          facture.montantPaye = montantDejaPaye + montantRestant;
          facture.statut = "partiellement_paye";
          montantRestant = 0;
        }
        facturesMiseAJour.push(facture);
      }
    }

    // Mettre à jour les factures
    await Promise.all(facturesMiseAJour.map(facture => facture.save()));

    // Mettre à jour le solde de la caisse
    caisse.solde -= montantPaye;
    await caisse.save();

    // Créer le paiement
    const paiement = new PaiementF({
      fournisseurId,
      facturesIds,
      montantTotal: montantPaye, // Le montant total est égal au montant payé
      montantPaye,
      modePaiement,
      caisseId,
      details: {
        cheques: details.cheques || [],
        effets: details.effets || [],
        especes: details.especes || []
      },
      statut: "valide",
    });

    const savedPaiement = await paiement.save();
    console.log("Paiement créé avec succès :", savedPaiement);
    res.status(201).json(savedPaiement);
  } catch (error) {
    console.error("Erreur dans createPaiement :", error);
    res.status(500).json({
      message: "Erreur lors de la création du paiement",
      error: error.message,
    });
  }
};
*/
/*const createPaiement = async (req, res) => {
  try {
    const {
      fournisseurId,
      facturesIds,
      montantTotal,
      montantPaye,
      modePaiement,
      caisseId,
      details,
    } = req.body;

    console.log("Données reçues :", req.body);

    // Vérifier si la caisse existe
    const caisse = await Caisse.findById(caisseId);
    if (!caisse) {
      console.log("Caisse non trouvée :", caisseId);
      return res.status(404).json({ message: "Caisse non trouvée" });
    }

    // Vérifier les factures
    const factures = await FactureF.find({ _id: { $in: facturesIds } });
    if (factures.length !== facturesIds.length) {
      console.log("Certaines factures n'existent pas :", facturesIds);
      return res.status(404).json({ message: "Certaines factures n'existent pas" });
    }

    // Traiter chaque facture
    let montantRestant = montantPaye;
    const facturesMiseAJour = [];

    for (const facture of factures) {
      if (montantRestant <= 0) break;

      const montantFacture = facture.montantTTC;
      const montantDejaPaye = facture.montantPaye || 0;
      const montantAPayer = montantFacture - montantDejaPaye;

      if (montantAPayer > 0) {
        if (montantRestant >= montantAPayer) {
          facture.montantPaye = montantFacture;
          facture.statut = "paye";
          montantRestant -= montantAPayer;
        } else {
          facture.montantPaye = montantDejaPaye + montantRestant;
          facture.statut = "partiellement_paye";
          montantRestant = 0;
        }
        facturesMiseAJour.push(facture);
      }
    }

    // Mettre à jour les factures
    await Promise.all(facturesMiseAJour.map(facture => facture.save()));

    // Mettre à jour le solde de la caisse
    caisse.solde -= montantPaye;
    await caisse.save();

    // Créer le paiement
    const paiement = new PaiementF({
      fournisseurId,
      facturesIds,
      montantTotal: montantPaye, // Le montant total est égal au montant payé
      montantPaye,
      modePaiement: "MULTIPLE", // Mode de paiement multiple
      caisseId,
      details: {
        cheques: details.cheques || [],
        effets: details.effets || [],
        especes: details.especes || []
      },
    });

    const savedPaiement = await paiement.save();
    console.log("Paiement créé avec succès :", savedPaiement);
    res.status(201).json(savedPaiement);
  } catch (error) {
    console.error("Erreur dans createPaiement :", error);
    res.status(500).json({
      message: "Erreur lors de la création du paiement",
      error: error.message,
    });
  }
};*/

const createPaiement = async (req, res) => {
  try {
    const {
      fournisseurId,
      facturesIds,
      montantPaye,
      modePaiement,
      caisseId,
      details,
    } = req.body;

    console.log("Données reçues :", req.body);

    // Vérifier si la caisse existe
    const caisse = await Caisse.findById(caisseId);
    if (!caisse) {
      console.log("Caisse non trouvée :", caisseId);
      return res.status(404).json({ message: "Caisse non trouvée" });
    }

    // Vérifier les factures
    const factures = await FactureF.find({ _id: { $in: facturesIds } });
    if (factures.length !== facturesIds.length) {
      console.log("Certaines factures n'existent pas :", facturesIds);
      return res.status(404).json({ message: "Certaines factures n'existent pas" });
    }

    // Calculer le montant restant des factures
    const montantRestant = await calculerMontantRestant(facturesIds);

    // Vérifier si le montant payé est valide
    if (montantPaye > montantRestant) {
      return res.status(400).json({ message: "Le montant payé ne peut pas dépasser le montant restant" });
    }

    // Traiter chaque facture
    let montantRestantAPayer = montantPaye;
    const facturesMiseAJour = [];

    for (const facture of factures) {
      if (montantRestantAPayer <= 0) break;

      const montantFacture = facture.montantTTC;
      const montantDejaPaye = facture.montantPaye || 0;
      const montantAPayer = montantFacture - montantDejaPaye;

      if (montantAPayer > 0) {
        if (montantRestantAPayer >= montantAPayer) {
          facture.montantPaye = montantFacture;
          facture.statut = "paye";
          montantRestantAPayer -= montantAPayer;
        } else {
          facture.montantPaye = montantDejaPaye + montantRestantAPayer;
          facture.statut = "partiellement_paye";
          montantRestantAPayer = 0;
        }
        facturesMiseAJour.push(facture);
      }
    }

    // Mettre à jour les factures
    await Promise.all(facturesMiseAJour.map(facture => facture.save()));

    // Mettre à jour le solde de la caisse
    caisse.solde -= montantPaye;
    await caisse.save();

    // Créer le paiement
    const paiement = new PaiementF({
      fournisseurId,
      facturesIds,
      montantTotal: montantRestant, // Utiliser le montant restant comme Montant Total
      montantPaye,
      modePaiement: "MULTIPLE", // Mode de paiement multiple
      caisseId,
      details: {
        cheques: details.cheques || [],
        effets: details.effets || [],
        especes: details.especes || []
      },
    });

    const savedPaiement = await paiement.save();
    console.log("Paiement créé avec succès :", savedPaiement);
    res.status(201).json(savedPaiement);
  } catch (error) {
    console.error("Erreur dans createPaiement :", error);
    res.status(500).json({
      message: "Erreur lors de la création du paiement",
      error: error.message,
    });
  }
};
// Récupérer tous les paiements
/*const getTousLesPaiements = async (req, res) => {
  try {
    const paiements = await PaiementF.find()
      .populate("fournisseurId", "raison_sociale")
      .populate("facturesIds", "numero_facture montantTTC")
      .populate("caisseId", "libelle")
      .populate("details.banque", "libelle")
      .sort({ dateCreation: -1 });
    res.json(paiements);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des paiements",
      error: error.message,
    });
  }
};
*/

const getTousLesPaiements = async (req, res) => {
  try {
    const paiements = await PaiementF.find()
      .populate("fournisseurId", "raison_sociale") // Peupler le fournisseur
      .populate("facturesIds", "numero_facture montantTTC") // Peupler les factures
      .populate("caisseId", "libelle") // Peupler la caisse
      .populate("details.cheques.banque", "libelle") // Peupler la banque dans les chèques
      .populate("details.effets.banque", "libelle") // Peupler la banque dans les effets
      .sort({ dateCreation: -1 }); // Trier par date de création décroissante

    res.json(paiements);
  } catch (error) {
    console.error("Erreur dans getTousLesPaiements :", error);
    res.status(500).json({
      message: "Erreur lors de la récupération des paiements",
      error: error.message,
    });
  }
};

// Récupérer tous les paiements d'un fournisseur
/*const getAllPaiements = async (req, res) => {
  try {
    const { fournisseurId } = req.params; // Récupérer l'ID du fournisseur depuis les paramètres de la route

    // Valider l'ID du fournisseur
    if (!mongoose.Types.ObjectId.isValid(fournisseurId)) {
      return res.status(400).json({ message: "ID de fournisseur invalide" });
    }

    // Récupérer les paiements pour le fournisseur spécifié
    const paiements = await PaiementF.find({ fournisseurId })
  .populate("fournisseurId", "raison_sociale")
  .populate("facturesIds", "numero_facture montantTTC")
  .populate("caisseId", "libelle")
  .populate("details.cheques.banque", "libelle") // Correction ici
  .populate("details.effets.banque", "libelle") // Correction ici
  .sort({ dateCreation: -1 });
    res.json(paiements);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des paiements",
      error: error.message,
    });
  }
};*/

const getAllPaiements = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Validation de l'ID
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: "ID client invalide" });
    }

    const paiements = await ReglementC.find({ clientId })
      .populate("clientId", "nom_prenom")
      .populate("facturesIds", "numero_facture montantTTC")
      .populate("blNonFactureesIds", "numero_bon_livraison montantTTC")
      .populate("caisseId", "libelle")
      .sort({ dateCreation: -1 });

    res.json(paiements);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des paiements",
      error: error.message,
    });
  }
};

// Récupérer un paiement par son ID
const getPaiementById = async (req, res) => {
  try {
    const paiement = await PaiementF.findById(req.params.id)
      .populate("fournisseurId", "raison_sociale")
      .populate("facturesIds", "numero_facture montantTTC")
      .populate("caisseId", "libelle")
      .populate("details.banque", "libelle")

    if (!paiement) {
      return res.status(404).json({ message: "Paiement non trouvé" });
    }
    res.json(paiement);
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération du paiement",
      error: error.message,
    });
  }
};


// Récupérer les paiements associés à une facture
const getPaiementsByFactureId = async (req, res) => {
  try {
    const { factureId } = req.params;

    // Valider l'ID de la facture
    if (!mongoose.Types.ObjectId.isValid(factureId)) {
      return res.status(400).json({ message: "ID de facture invalide" });
    }

    // Récupérer les paiements associés à la facture
    const paiements = await PaiementF.find({ facturesIds: factureId })
      .select("montantPaye") // Sélectionner uniquement le montant payé
      .lean();

    // Calculer le montant total payé pour cette facture
    const montantTotalPaye = paiements.reduce((total, paiement) => total + paiement.montantPaye, 0);

    res.json({ montantTotalPaye });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la récupération des paiements",
      error: error.message,
    });
  }
};

// Annuler un paiement
const cancelPaiement = async (req, res) => {
  try {
    const paiement = await PaiementF.findById(req.params.id);
    if (!paiement) {
      return res.status(404).json({ message: "Paiement non trouvé" });
    }

    if (paiement.statut === "annule") {
      return res.status(400).json({ message: "Le paiement est déjà annulé" });
    }

    // Récupérer la caisse
    const caisse = await Caisse.findById(paiement.caisseId);
    if (!caisse) {
      return res.status(404).json({ message: "Caisse non trouvée" });
    }

    // Récupérer les factures
    const factures = await FactureF.find({
      _id: { $in: paiement.facturesIds },
    });

    // Annuler les paiements des factures
    for (const facture of factures) {
      facture.montantPaye = 0;
      facture.statut = "non_paye";
      await facture.save();
    }

    // Restaurer le solde de la caisse
    caisse.solde += paiement.montantPaye;
    await caisse.save();

    // Mettre à jour le statut du paiement
    paiement.statut = "annule";
    await paiement.save();

    res.json({ message: "Paiement annulé avec succès" });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de l'annulation du paiement",
      error: error.message,
    });
  }
}; 
module.exports={createPaiement, getTousLesPaiements,getAllPaiements, getPaiementById,getPaiementsByFactureId, cancelPaiement};