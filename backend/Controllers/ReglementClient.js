const ReglementC = require("../Models/Ventes/ReglementClient");
const FactureC = require("../Models/Ventes/EnteteVentes");
const Caisse = require("../Models/Achat/Caisse");
const BonLivraison = require("../Models/Ventes/EnteteVentes"); 

const mongoose = require("mongoose");
/*const calculerMontantRestant = async (facturesIds, blIds) => {
  try {
    // Récupérer tous les paiements associés aux factures
    const paiementsFactures = await ReglementC.find({ facturesIds: { $in: facturesIds } })
      .select("montantPaye facturesIds")
      .lean();

    // Récupérer tous les paiements associés aux BL
    const paiementsBL = await ReglementC.find({ blNonFactureesIds: { $in: blIds } })
      .select("montantPaye blNonFactureesIds")
      .lean();

    // Calculer le montant total payé pour chaque facture
    const montantPayeParFacture = {};
    paiementsFactures.forEach((paiement) => {
      paiement.facturesIds.forEach((factureId) => {
        if (!montantPayeParFacture[factureId]) {
          montantPayeParFacture[factureId] = 0;
        }
        montantPayeParFacture[factureId] += paiement.montantPaye;
      });
    });

    // Calculer le montant total payé pour chaque BL
    const montantPayeParBL = {};
    paiementsBL.forEach((paiement) => {
      paiement.blNonFactureesIds.forEach((blId) => {
        if (!montantPayeParBL[blId]) {
          montantPayeParBL[blId] = 0;
        }
        montantPayeParBL[blId] += paiement.montantPaye;
      });
    });

    // Récupérer les factures pour obtenir leur montant TTC
    const factures = await FactureC.find({ _id: { $in: facturesIds } })
      .select("montantTTC")
      .lean();

    // Récupérer les BL pour obtenir leur montant TTC
    const bls = await BonLivraison.find({ _id: { $in: blIds } })
      .select("montantTTC estFacture")
      .lean();

    // Calculer le montant restant total
    let montantRestantTotal = 0;
    
    // Pour les factures
    factures.forEach((facture) => {
      const montantPaye = montantPayeParFacture[facture._id] || 0;
      montantRestantTotal += facture.montantTTC - montantPaye;
    });
    
    // Pour les BL non facturés
    bls.forEach((bl) => {
      if (!bl.estFacture) {
        const montantPaye = montantPayeParBL[bl._id] || 0;
        montantRestantTotal += bl.montantTTC - montantPaye;
      }
    });

    return montantRestantTotal;
  } catch (error) {
    console.error("Erreur dans calculerMontantRestant :", error);
    throw error;
  }
};*/
/*const calculerMontantRestant = async (facturesIds, blIds, paiementsEnAttente = []) => {
  try {
    // Convertir les IDs en ObjectId pour éviter les erreurs
    const facturesIdsObjectId = facturesIds.map(id => new mongoose.Types.ObjectId(id));
    const blIdsObjectId = blIds.map(id => new mongoose.Types.ObjectId(id));

    // Récupérer tous les paiements associés aux factures
    const paiementsFactures = await ReglementC.find({ facturesIds: { $in: facturesIdsObjectId } })
      .select("montantPaye facturesIds")
      .lean();

    // Récupérer tous les paiements associés aux BL
    const paiementsBL = await ReglementC.find({ blNonFactureesIds: { $in: blIdsObjectId } })
      .select("montantPaye blNonFactureesIds")
      .lean();

    // Récupérer les factures pour obtenir leur montant TTC
    const factures = await FactureC.find({ _id: { $in: facturesIdsObjectId } })
      .select("montantTTC montantPaye")
      .lean();

    // Récupérer les BL pour obtenir leur montant TTC et statut
    const bls = await BonLivraison.find({ _id: { $in: blIdsObjectId } })
      .select("montantTTC montantPaye estFacture")
      .lean();

    // Vérifier que tous les IDs fournis existent
    if (factures.length !== facturesIds.length || bls.length !== blIds.length) {
      console.error(
        "Certains documents n'existent pas. Factures demandées:", facturesIds,
        "BL demandés:", blIds,
        "Factures trouvées:", factures.map(f => f._id.toString()),
        "BL trouvés:", bls.map(b => b._id.toString())
      );
      throw new Error("Certains documents (factures ou BL) n'existent pas");
    }

    // Calculer le montant total payé pour chaque facture
    const montantPayeParFacture = {};
    facturesIds.forEach(id => { montantPayeParFacture[id] = 0; });

    paiementsFactures.forEach(paiement => {
      const totalMontantFactures = paiement.facturesIds.reduce((sum, factureId) => {
        const facture = factures.find(f => f._id.toString() === factureId.toString());
        return sum + (facture ? facture.montantTTC : 0);
      }, 0);

      paiement.facturesIds.forEach(factureId => {
        if (facturesIds.includes(factureId.toString())) {
          const facture = factures.find(f => f._id.toString() === factureId.toString());
          if (facture && totalMontantFactures > 0) {
            // Répartir proportionnellement selon le montant TTC
            const proportion = facture.montantTTC / totalMontantFactures;
            montantPayeParFacture[factureId.toString()] += paiement.montantPaye * proportion;
          }
        }
      });
    });

    // Calculer le montant total payé pour chaque BL
    const montantPayeParBL = {};
    blIds.forEach(id => { montantPayeParBL[id] = 0; });

    paiementsBL.forEach(paiement => {
      const totalMontantBLs = paiement.blNonFactureesIds.reduce((sum, blId) => {
        const bl = bls.find(b => b._id.toString() === blId.toString());
        return sum + (bl && !bl.estFacture ? bl.montantTTC : 0);
      }, 0);

      paiement.blNonFactureesIds.forEach(blId => {
        if (blIds.includes(blId.toString())) {
          const bl = bls.find(b => b._id.toString() === blId.toString());
          if (bl && !bl.estFacture && totalMontantBLs > 0) {
            // Répartir proportionnellement selon le montant TTC
            const proportion = bl.montantTTC / totalMontantBLs;
            montantPayeParBL[blId.toString()] += paiement.montantPaye * proportion;
          }
        }
      });
    });

    // Calculer le montant restant total
    let montantRestantTotal = 0;

    // Pour les factures
    factures.forEach(facture => {
      const montantPaye = montantPayeParFacture[facture._id.toString()] || 0;
      const montantRestantFacture = facture.montantTTC - montantPaye;
      montantRestantTotal += Math.max(montantRestantFacture, 0);
    });

    // Pour les BL non facturés
    bls.forEach(bl => {
      if (!bl.estFacture) {
        const montantPaye = montantPayeParBL[bl._id.toString()] || 0;
        const montantRestantBL = bl.montantTTC - montantPaye;
        montantRestantTotal += Math.max(montantRestantBL, 0);
      }
    });

    // Prendre en compte les paiements en attente (si fournis)
    if (paiementsEnAttente.length > 0) {
      const montantPayeEnAttente = paiementsEnAttente.reduce(
        (sum, paiement) => sum + parseFloat(paiement.montantChiffres || 0),
        0
      );
      montantRestantTotal = Math.max(montantRestantTotal - montantPayeEnAttente, 0);
    }

    console.log("Calcul montantRestant:", {
      facturesIds,
      blIds,
      montantPayeParFacture,
      montantPayeParBL,
      montantRestantTotal,
      paiementsEnAttente
    });

    return montantRestantTotal;
  } catch (error) {
    console.error("Erreur dans calculerMontantRestant:", error);
    throw error;
  }
};*/



/*const calculerMontantRestant = async (facturesIds, blNonFactureesIds) => {
  let montantRestant = 0;

  if (facturesIds && facturesIds.length > 0) {
    // Calcul pour les factures
    const factures = await FactureC.find({ _id: { $in: facturesIds } });
    for (const facture of factures) {
      const montantPaye = facture.montantPaye || 0;
      const montantRestantFacture = facture.total_ttc - montantPaye;
      if (montantRestantFacture > 0) {
        montantRestant += montantRestantFacture;
      }
    }
  } else if (blNonFactureesIds && blNonFactureesIds.length > 0) {
    // Calcul pour les bons de livraison
    const bonsLivraison = await BonLivraison.find({ _id: { $in: blNonFactureesIds } });
    for (const bon of bonsLivraison) {
      if (!bon.estFacture) {
        const montantPaye = bon.montantPaye || 0;
        const montantRestantBon = bon.total_ttc - montantPaye;
        if (montantRestantBon > 0) {
          montantRestant += montantRestantBon;
        }
      }
    }
  }

  return montantRestant;
};*/

const calculerMontantRestant = async (facturesIds, blNonFactureesIds) => {
  try {
    let montantRestant = 0;

    if (facturesIds && facturesIds.length > 0) {
      const factures = await FactureC.find({ _id: { $in: facturesIds } });
      for (const facture of factures) {
        const montantTTC = parseFloat(facture.total_ttc) || 0;
        const montantPaye = parseFloat(facture.montantPaye) || 0;
        const restant = Math.max(montantTTC - montantPaye, 0);
        montantRestant += restant;
      }
    }

    if (blNonFactureesIds && blNonFactureesIds.length > 0) {
      const bonsLivraison = await BonLivraison.find({ _id: { $in: blNonFactureesIds } });
      for (const bon of bonsLivraison) {
        if (!bon.estFacture) {
          const montantTTC = parseFloat(bon.total_ttc) || 0;
          const montantPaye = parseFloat(bon.montantPaye) || 0;
          const restant = Math.max(montantTTC - montantPaye, 0);
          montantRestant += restant;
        }
      }
    }

    // Arrondir à 3 décimales pour éviter les problèmes de précision
    return parseFloat(montantRestant.toFixed(3));
  } catch (error) {
    console.error("Erreur dans calculerMontantRestant:", error);
    throw error;
  }
};

/*const createPaiement = async (req, res) => {
  try {
    const {
      clientId,
      facturesIds = [],
      blNonFactureesIds = [],
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

    // Vérifier les documents (factures et BL)
    const factures = await FactureC.find({ _id: { $in: facturesIds } });
    const bls = await BonLivraison.find({ _id: { $in: blNonFactureesIds } });
    
    if (factures.length !== facturesIds.length || bls.length !== blNonFactureesIds.length) {
      console.log("Certains documents n'existent pas");
      return res.status(404).json({ message: "Certains documents n'existent pas" });
    }

    // Vérifier que les BL ne sont pas déjà facturés
    const blsFactures = bls.filter(bl => bl.estFacture);
    if (blsFactures.length > 0) {
      return res.status(400).json({ 
        message: `Certains BL sont déjà facturés: ${blsFactures.map(bl => bl.numero).join(', ')}` 
      });
    }

    // Calculer le montant restant des documents
    const montantRestant = await calculerMontantRestant(facturesIds, blNonFactureesIds);

    // Vérifier si le montant payé est valide
    if (montantPaye > montantRestant) {
      return res.status(400).json({ 
        message: `Le montant payé (${montantPaye}) ne peut pas dépasser le montant restant (${montantRestant})` 
      });
    }

    // Traiter chaque document
    let montantRestantAPayer = montantPaye;
    const documentsMiseAJour = [];

    // Pour les factures
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
        documentsMiseAJour.push(facture);
      }
    }

    // Pour les BL non facturés (seulement si il reste du montant à payer)
    for (const bl of bls) {
      if (montantRestantAPayer <= 0) break;
      if (bl.estFacture) continue; // On ne devrait pas en avoir car déjà vérifié

      const montantBL = bl.montantTTC;
      const montantDejaPaye = bl.montantPaye || 0;
      const montantAPayer = montantBL - montantDejaPaye;

      if (montantAPayer > 0) {
        if (montantRestantAPayer >= montantAPayer) {
          bl.montantPaye = montantBL;
          bl.statut = "paye";
          montantRestantAPayer -= montantAPayer;
        } else {
          bl.montantPaye = montantDejaPaye + montantRestantAPayer;
          bl.statut = "partiellement_paye";
          montantRestantAPayer = 0;
        }
        documentsMiseAJour.push(bl);
      }
    }

    // Mettre à jour les documents
    await Promise.all(documentsMiseAJour.map(doc => doc.save()));

    // Mettre à jour le solde de la caisse
    caisse.solde -= montantPaye;
    await caisse.save();

    // Créer le paiement
    const paiement = new ReglementC({
      clientId,
      facturesIds,
      blNonFactureesIds,
      montantTotal: montantRestant,
      montantPaye,
      modePaiement: "MULTIPLE",
      caisseId,
      details: {
        cheques: details.cheques || [],
        effets: details.effets || [],
        especes: details.especes || []
      },
    });

    const savedPaiement = await paiement.save();
    console.log("Paiement créé avec succès :", savedPaiement);
    
    res.status(201).json({
      message: "Paiement enregistré avec succès",
      paiement: savedPaiement
    });
    
  } catch (error) {
    console.error("Erreur dans createPaiement :", error);
    res.status(500).json({
      message: "Erreur lors de la création du paiement",
      error: error.message,
    });
  }
};*/
/*const createPaiement = async (req, res) => {
  try {
    const {
      clientId,
      facturesIds,
      blNonFactureesIds,
      montantTotal,
      montantPaye,
      modePaiement,
      caisseId,
      details,
      paiementsEnAttente = [],
    } = req.body;

    console.log("Données reçues:", req.body);

    // Vérifier si la caisse existe
    const caisse = await Caisse.findById(caisseId);
    if (!caisse) {
      console.log("Caisse non trouvée:", caisseId);
      return res.status(404).json({ message: "Caisse non trouvée" });
    }

    // Vérifier les documents (factures et BL)
    const factures = await FactureC.find({ _id: { $in: facturesIds } });
    const bls = await BonLivraison.find({ _id: { $in: blNonFactureesIds } });
    
    console.log("Factures trouvées:", factures.map(f => f._id));
    console.log("BL trouvés:", bls.map(b => b._id));

    if (factures.length !== facturesIds.length || bls.length !== blNonFactureesIds.length) {
      console.log("Documents manquants - facturesIds:", facturesIds, "blNonFactureesIds:", blNonFactureesIds);
      return res.status(404).json({ message: "Certains documents n'existent pas" });
    }

    // Vérifier que les BL ne sont pas déjà facturés
    const blsFactures = bls.filter(bl => bl.estFacture);
    if (blsFactures.length > 0) {
      console.log("BL facturés:", blsFactures.map(bl => bl.numero));
      return res.status(400).json({ 
        message: `Certains BL sont déjà facturés: ${blsFactures.map(bl => bl.numero).join(', ')}` 
      });
    }

    // Calculer le montant total TTC (vérification avec les données de la base)
    const calculatedMontantTotal = factures.reduce((sum, facture) => {
      const montantTTC = !isNaN(parseFloat(facture.montantTTC)) ? parseFloat(facture.montantTTC) : 0;
      return sum + montantTTC;
    }, 0) + bls.reduce((sum, bl) => {
      const montantTTC = !bl.estFacture && !isNaN(parseFloat(bl.montantTTC)) ? parseFloat(bl.montantTTC) : 0;
      return sum + montantTTC;
    }, 0);

    // Vérifier que montantTotal correspond aux données
    if (montantTotal && Math.abs(calculatedMontantTotal - parseFloat(montantTotal)) > 0.01) {
      console.log("Erreur: montantTotal incohérent", {
        frontendMontantTotal: montantTotal,
        calculatedMontantTotal
      });
      return res.status(400).json({
        message: `Le montant total (${montantTotal}) ne correspond pas au total calculé (${calculatedMontantTotal})`
      });
    }

    // Calculer le montant restant des documents

  //  const montantRestant = await calculerMontantRestant(facturesIds, blNonFactureesIds);
  
  const montantRestant = await calculerMontantRestant(facturesIds, blNonFactureesIds);  
  console.log("montantRestant (backend):", montantRestant, "montantPaye:", montantPaye);

    // Vérifier si le montant payé est valide
    if (montantPaye > montantTotal) {
      console.log("Erreur: montantPaye dépasse montant Total");
      return res.status(400).json({ 
        message: `Le montant payé (${montantPaye}) ne peut pas dépasser le montant restant (${montantTotal})` 
      });
    }


      // Traiter chaque document
      let montantRestantAPayer = montantPaye;
      const documentsMiseAJour = [];
  
      // Pour les factures
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
          documentsMiseAJour.push(facture);
        }
      }
  
      // Pour les BL non facturés (seulement si il reste du montant à payer)
      for (const bl of bls) {
        if (montantRestantAPayer <= 0) break;
        if (bl.estFacture) continue; // On ne devrait pas en avoir car déjà vérifié
  
        const montantBL = bl.montantTTC;
        const montantDejaPaye = bl.montantPaye || 0;
        const montantAPayer = montantBL - montantDejaPaye;
  
        if (montantAPayer > 0) {
          if (montantRestantAPayer >= montantAPayer) {
            bl.montantPaye = montantBL;
            bl.statut = "paye";
            montantRestantAPayer -= montantAPayer;
          } else {
            bl.montantPaye = montantDejaPaye + montantRestantAPayer;
            bl.statut = "partiellement_paye";
            montantRestantAPayer = 0;
          }
          documentsMiseAJour.push(bl);
        }
      }
  
      // Mettre à jour les documents
      await Promise.all(documentsMiseAJour.map(doc => doc.save()));
  
      // Mettre à jour le solde de la caisse
      caisse.solde -= montantPaye;
      await caisse.save();
  
      // Créer le paiement
      const paiement = new ReglementC({
        clientId,
        facturesIds,
        blNonFactureesIds,
        montantTotal,
        montantRestant,
        montantPaye,
        modePaiement: "MULTIPLE",
        caisseId,
        details: {
          cheques: details.cheques || [],
          effets: details.effets || [],
          especes: details.especes || []
        },
      });
  
      const savedPaiement = await paiement.save();
      console.log("Paiement créé avec succès :", savedPaiement);
      
      res.status(201).json({
        message: "Paiement enregistré avec succès",
        paiement: savedPaiement
      });
  } catch (error) {
    console.error("Erreur dans createPaiement:", error);
    res.status(500).json({
      message: "Erreur lors de la création du paiement",
      error: error.message,
    });
  }
};*/

/*const createPaiement = async (req, res) => {
  try {
    const {
      clientId,
      facturesIds,
      blNonFactureesIds,
      montantTotal,
      montantRestant,
      montantPaye,
      modePaiement,
      caisseId,
      dateCreation,
      details
    } = req.body;

    // Vérifier qu'on a soit des factures, soit des bons de livraison, mais pas les deux
    if ((!facturesIds || facturesIds.length === 0) && (!blNonFactureesIds || blNonFactureesIds.length === 0)) {
      return res.status(400).json({ message: "Veuillez sélectionner au moins une facture ou un bon de livraison" });
    }

    if (facturesIds && facturesIds.length > 0 && blNonFactureesIds && blNonFactureesIds.length > 0) {
      return res.status(400).json({ message: "Vous ne pouvez pas sélectionner des factures et des bons de livraison en même temps" });
    }

    // Vérifier que le montant payé est correct
    if (montantPaye !== montantTotal - montantRestant) {
      return res.status(400).json({ message: "Le montant payé ne correspond pas à la différence entre le total et le montant restant" });
    }

    // Vérifier que le montant restant est correct
    const montantRestantCalcule = await calculerMontantRestant(facturesIds, blNonFactureesIds);
    if (Math.abs(montantRestantCalcule - montantRestant) > 0.001) {
      return res.status(400).json({ message: "Le montant restant ne correspond pas au calcul" });
    }

    // Créer le règlement
    const reglement = new ReglementC({
      clientId,
      facturesIds,
      blNonFactureesIds,
      montantTotal,
      montantRestant,
      montantPaye,
      modePaiement,
      caisseId,
      dateCreation,
      details
    });

    await reglement.save();

    // Mettre à jour les factures ou les bons de livraison
    if (facturesIds && facturesIds.length > 0) {
      await FactureC.updateMany(
        { _id: { $in: facturesIds } },
        { $inc: { montantPaye: montantPaye } }
      );
    } else if (blNonFactureesIds && blNonFactureesIds.length > 0) {
      await BonLivraison.updateMany(
        { _id: { $in: blNonFactureesIds } },
        { estFacture: true }
      );
    }

    // Mettre à jour la caisse
    if (modePaiement === "ESPECE" || modePaiement === "MULTIPLE") {
      await Caisse.findByIdAndUpdate(
        caisseId,
        { $inc: { solde: montantPaye } }
      );
    }

    res.status(201).json({ message: "Règlement créé avec succès", reglement });
  } catch (error) {
    console.error("Erreur lors de la création du règlement:", error);
    res.status(500).json({ message: "Erreur lors de la création du règlement", error });
  }
};*/

/*const createPaiement = async (req, res) => {
  try {
    const {
      clientId,
      facturesIds,
      blNonFactureesIds,
      montantTotal,
      montantRestant,
      montantPaye,
      modePaiement,
      caisseId,
      dateCreation,
      details
    } = req.body;

    // Vérifier qu'on a soit des factures, soit des bons de livraison, mais pas les deux
    if ((!facturesIds || facturesIds.length === 0) && (!blNonFactureesIds || blNonFactureesIds.length === 0)) {
      return res.status(400).json({ message: "Veuillez sélectionner au moins une facture ou un bon de livraison" });
    }

    if (facturesIds && facturesIds.length > 0 && blNonFactureesIds && blNonFactureesIds.length > 0) {
      return res.status(400).json({ message: "Vous ne pouvez pas sélectionner des factures et des bons de livraison en même temps" });
    }

    // Vérifier que le montant payé est correct
    if (montantPaye !== montantTotal - montantRestant) {
      return res.status(400).json({ message: "Le montant payé ne correspond pas à la différence entre le total et le montant restant" });
    }

    // Créer le règlement
    const reglement = new ReglementC({
      clientId,
      facturesIds,
      blNonFactureesIds,
      montantTotal,
      montantRestant,
      montantPaye,
      modePaiement,
      caisseId,
      dateCreation,
      details
    });

    await reglement.save();

    // Mettre à jour les factures ou les bons de livraison
    if (facturesIds && facturesIds.length > 0) {
      const factures = await FactureC.find({ _id: { $in: facturesIds } });
      const montantParFacture = montantPaye / factures.length;

      for (const facture of factures) {
        const montantPayeActuel = parseFloat(facture.montantPaye || 0);
        const nouveauMontantPaye = montantPayeActuel + montantParFacture;
        const montantRestant = parseFloat(facture.total_ttc) - nouveauMontantPaye;
        
        let statut = "non_paye";
        if (Math.abs(nouveauMontantPaye - parseFloat(facture.total_ttc)) < 0.001) {
          statut = "paye";
        } else if (nouveauMontantPaye > 0) {
          statut = "partiellement_paye";
        }

        const updateData = {
          montantPaye: parseFloat(nouveauMontantPaye.toFixed(3)),
          statut: statut,
          datePaiement: new Date()
        };

        await FactureC.updateOne(
          { _id: facture._id },
          { $set: updateData }
        );
      }
    } else if (blNonFactureesIds && blNonFactureesIds.length > 0) {
      const bonsLivraison = await BonLivraison.find({ _id: { $in: blNonFactureesIds } });
      const montantParBon = montantPaye / bonsLivraison.length;

      for (const bon of bonsLivraison) {
        if (!bon.estFacture) {
          const montantPayeActuel = parseFloat(bon.montantPaye || 0);
          const nouveauMontantPaye = montantPayeActuel + montantParBon;
          const montantRestant = parseFloat(bon.total_ttc) - nouveauMontantPaye;
          
          let statut = "non_paye";
          if (Math.abs(nouveauMontantPaye - parseFloat(bon.total_ttc)) < 0.001) {
            statut = "paye";
          } else if (nouveauMontantPaye > 0) {
            statut = "partiellement_paye";
          }

          const updateData = {
            montantPaye: parseFloat(nouveauMontantPaye.toFixed(3)),
            statut: statut,
            estFacture: true,
            datePaiement: new Date()
          };

          await BonLivraison.updateOne(
            { _id: bon._id },
            { $set: updateData }
          );
        }
      }
    }

    // Mettre à jour la caisse
    if (modePaiement === "ESPECE" || modePaiement === "MULTIPLE") {
      await Caisse.updateOne(
        { _id: caisseId },
        { $inc: { solde: montantPaye } }
      );
    }

    res.status(201).json({ message: "Règlement créé avec succès", reglement });
  } catch (error) {
    console.error("Erreur lors de la création du règlement:", error);
    res.status(500).json({ message: "Erreur lors de la création du règlement", error });
  }
};*/

const createPaiement = async (req, res) => {
  try {
    const {
      clientId,
      facturesIds,
      blNonFactureesIds,
      montantTotal,
      montantRestant,
      montantPaye,
      modePaiement,
      caisseId,
      dateCreation,
      details
    } = req.body;

    // Vérification des données requises
    if (!clientId) {
      return res.status(400).json({ message: "Client ID est requis" });
    }
    if ((!facturesIds || facturesIds.length === 0) && (!blNonFactureesIds || blNonFactureesIds.length === 0)) {
      return res.status(400).json({ message: "Veuillez sélectionner au moins une facture ou un bon de livraison" });
    }
    if (!montantPaye || montantPaye <= 0) {
      return res.status(400).json({ message: "Montant payé doit être positif" });
    }
    if (!caisseId) {
      return res.status(400).json({ message: "Caisse ID est requis" });
    }

    // Récupérer les factures triées par date (plus ancienne en premier)
    let factures = [];
    if (facturesIds && facturesIds.length > 0) {
      factures = await FactureC.find({ _id: { $in: facturesIds } })
        .sort({ dateFacture: 1 }); // Tri par date croissante
    }

    // Récupérer les BL triés par date (plus ancienne en premier)
    let bonsLivraison = [];
    if (blNonFactureesIds && blNonFactureesIds.length > 0) {
      bonsLivraison = await BonLivraison.find({ 
        _id: { $in: blNonFactureesIds },
        estFacture: false 
      }).sort({ dateLivraison: 1 }); // Tri par date croissante
    }

    // Vérifier que tous les documents existent
    if (factures.length !== facturesIds.length || bonsLivraison.length !== blNonFactureesIds.length) {
      return res.status(404).json({ message: "Certains documents n'existent pas ou sont déjà facturés" });
    }

    let montantDisponible = montantPaye;
    const documentsAMettreAJour = [];

    // Traitement des factures par ordre chronologique
    for (const facture of factures) {
      if (montantDisponible <= 0) break;

      const montantTTC = parseFloat(facture.total_ttc) || 0;
      const montantDejaPaye = parseFloat(facture.montantPaye) || 0;
      const montantRestantFacture = montantTTC - montantDejaPaye;

      if (montantRestantFacture > 0) {
        const montantAPayer = Math.min(montantRestantFacture, montantDisponible);
        
        facture.montantPaye = montantDejaPaye + montantAPayer;
        facture.statut = facture.montantPaye >= montantTTC ? "paye" : "partiellement_paye";
        facture.datePaiement = new Date();
        
        documentsAMettreAJour.push(facture);
        montantDisponible -= montantAPayer;
      }
    }

    // Si il reste du montant et qu'il y a des BL non facturés
    if (montantDisponible > 0 && bonsLivraison.length > 0) {
      for (const bon of bonsLivraison) {
        if (montantDisponible <= 0) break;

        const montantTTC = parseFloat(bon.total_ttc) || 0;
        const montantDejaPaye = parseFloat(bon.montantPaye) || 0;
        const montantRestantBon = montantTTC - montantDejaPaye;

        if (montantRestantBon > 0) {
          const montantAPayer = Math.min(montantRestantBon, montantDisponible);
          
          bon.montantPaye = montantDejaPaye + montantAPayer;
          bon.statut = bon.montantPaye >= montantTTC ? "paye" : "partiellement_paye";
          bon.datePaiement = new Date();
          
          documentsAMettreAJour.push(bon);
          montantDisponible -= montantAPayer;
        }
      }
    }

    // Mettre à jour tous les documents
    await Promise.all(documentsAMettreAJour.map(doc => doc.save()));

    // Créer le règlement
    const reglement = new ReglementC({
      clientId,
      facturesIds,
      blNonFactureesIds,
      montantTotal,
      montantRestant: montantTotal - montantPaye,
      montantPaye,
      modePaiement,
      caisseId,
      dateCreation,
      details
    });

    const savedReglement = await reglement.save();

    // Mettre à jour la caisse si paiement en espèces
    if (modePaiement === "ESPECE" || modePaiement === "MULTIPLE") {
      await Caisse.findByIdAndUpdate(
        caisseId,
        { $inc: { solde: montantPaye } }
      );
    }

    res.status(201).json({ 
      message: "Règlement créé avec succès", 
      reglement: savedReglement 
    });

  } catch (error) {
    console.error("Erreur lors de la création du règlement:", error);
    res.status(500).json({ 
      message: "Erreur lors de la création du règlement", 
      error: error.message 
    });
  }
};


// Récupérer tous les paiements

const getTousLesPaiements = async (req, res) => {
  try {
    const paiements = await ReglementC.find()
      .populate("clientId", "nom_prenom") // Peupler le client
      .populate("facturesIds", "numero total_ttc") // Peupler les factures
      .populate("caisseId", "libelle") // Peupler la caisse
      .populate("details.cheques.banque", "libelle ") // Peupler la banque dans les chèques
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

// Récupérer tous les paiements d'un client
const getAllPaiements = async (req, res) => {
  try {
    const { clientId } = req.params; // Récupérer l'ID du client depuis les paramètres de la route

    // Valider l'ID du client
    if (!mongoose.Types.ObjectId.isValid(clientId)) {
      return res.status(400).json({ message: "ID de client invalide" });
    }

    // Récupérer les paiements pour le client spécifié
    const paiements = await ReglementC.find({ clientId })
  .populate("clientId", "nom_prenom")
  .populate("facturesIds", "numero  total_ttc")
  .populate("caisseId", "libelle")
  .populate("details.cheques.banque", "libelle") 
  .populate("details.effets.banque", "libelle") 
  .populate("details.cheques" , "numeroCheque dateEcheance") 
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
    const paiement = await ReglementC.findById(req.params.id)
      .populate("clientId", "nom_prenom")
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
    const paiements = await ReglementC.find({ facturesIds: factureId })
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
    const paiement = await ReglementC.findById(req.params.id);
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
    const factures = await FactureC.find({
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