const EnteteVentes = require('../Models/Ventes/EnteteVentes');
const LigneVentes = require('../Models/Ventes/LigneVentes');

const Depot = require('../Models/depot');
const CounterModel=require ("../Models/counters");
//Zone Devis
//createDevis
const createDevis = async (req, res) => {
    try {
        console.log("Données reçues:", req.body); 
        const { client, depot, lignes, dateDevis } = req.body;
        // Vérification des champs obligatoires
        if (!client || !depot || !lignes || lignes.length === 0 || !dateDevis) {
            return res.status(400).json({ message: "Client, dépôt, lignes de Devis et date de Devis sont requis." });
        }

        // Convertir la date de commande en objet Date
        const dateDevisObj = new Date(dateDevis);

        // Vérifier si la date est valide
        if (isNaN(dateDevisObj.getTime())) {
            return res.status(400).json({ message: "Date de Devis invalide." });
        }

        // Extraire l'année de référence à partir de la date
        const year = dateDevisObj.getFullYear();

        // Vérifier que l'année de référence est valide
        if (!year || year < 2000 || year > 2100) {
            return res.status(400).json({ message: "L'année de référence est invalide." });
        }

        // Récupérer le code du dépôt
        const foundDepot = await Depot.findById(depot);
        if (!foundDepot) {
            return res.status(404).json({ message: "Dépôt non trouvé" });
        }
        const codeDepot = foundDepot.codeDepot;

        // Extraire les deux derniers chiffres de l'année de référence
        const yearShort = year.toString().slice(-2);

        // Trouver ou créer un compteur pour l'année de référence
        let counter;
        try {
            counter = await CounterModel.findOneAndUpdate(
                { model: 'devis', year: year },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
        } catch (error) {
            console.error("Erreur lors de la création ou de la mise à jour du compteur:", error);
            if (error.code === 11000) {
                // Si l'erreur est une duplication de clé, récupérez le compteur existant
                counter = await CounterModel.findOne({ model: 'devis', year: year });
                if (!counter) {
                    // Si aucun compteur existant n'est trouvé, créez-en un nouveau
                    counter = new CounterModel({ model: 'devis', year: year, seq: 1 });
                    await counter.save();
                }
            } else {
                return res.status(500).json({ message: "Erreur lors de la création du compteur." });
            }
        }

        if (!counter) {
            return res.status(500).json({ message: "Erreur lors de la création du compteur." });
        }

        // Formater la séquence sur 5 chiffres
        const sequence = String(counter.seq).padStart(5, '0');

        // Générer le numéro de commande
        const numero_Bon = `DV ${codeDepot} ${yearShort} ${sequence}`;

        // Calcul du total HT et TTC
        const total_hors_Taxe = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
        const total_ttc = total_hors_Taxe * ligne.tva; 

        // Création du bon de commande
        const devis = new EnteteVentes({
            numero,
            client,
            type: "Devis",
            dateDevis: dateDevisObj,
            depot,
            anneeReference: year, 
            total_hors_Taxe,
            total_ttc,
        });

        // Sauvegarder le bon de commande
        const savedBonCommande = await bonCommande.save();

        // Enregistrement des lignes de commande
        const lignesCommande = lignes.map(ligne => ({
            bon: savedBonCommande._id,
            article: ligne.article,
            quantite: ligne.quantite,
            prix_unitaire: ligne.prix_unitaire,
            remise: ligne.remise,
            dc: ligne.dc,
            fodec: ligne.fodec,
            tva: ligne.tva,
            prix_uTTC: ligne.prix_uTTC,
            total_ht: ligne.quantite * ligne.prix_unitaire,
            total_ttc: ligne.quantite * ligne.prix_unitaire * 1.2,
        }));

        await LigneAchat.insertMany(lignesCommande);

        // Populate the fournisseur field after saving
        const populatedBonCommande = await BonFournisseur.findById(savedBonCommande._id).populate('fournisseur').populate({
            path: 'lignes',
            populate: { path: 'article' , model : 'article' } // Peupler les articles dans les lignes
        });

        res.status(201).json({ bonCommande: populatedBonCommande, lignes: lignesCommande });
        console.log("Populated BonCommande:", populatedBonCommande);
    } catch (error) {
        console.error("Erreur lors de la création du bon de commande:", error);
        res.status(500).json({ message: error.message });
    }
};
//GetAll BCF
const getBCF = async (req, res) => {
    try {
        const bonsCommande = await BonFournisseur.aggregate([
            // Étape 1 : Filtrer les documents où type = "bonCommande"
            {
                $match: { type: "BonCommande" }
            },
            {
                $lookup: {
                    from: "ligneachats", // Jointure avec la collection des lignes de commande
                    localField: "_id",
                    foreignField: "bon",
                    as: "lignes"
                }
            },
            {
                $unwind: "$lignes" // Décompose le tableau des lignes pour peupler les articles
            },
            {
                $lookup: {
                    from: "articles", // Jointure avec la collection des articles
                    localField: "lignes.article",
                    foreignField: "_id",
                    as: "lignes.articleDetails"
                }
            },
            {
                $unwind: "$lignes.articleDetails" // Décompose le tableau des articles
            },
            {
                $group: {
                    _id: "$_id", // Regroupe à nouveau par bon de commande
                    numero_Bon: { $first: "$numero_Bon" },
                    dateCommande: { $first: "$dateCommande" },
                    fournisseur: { $first: "$fournisseur" },
                    depot: { $first: "$depot" },
                    statut: { $first: "$statut" },

                    anneeReference: { $first: "$anneeReference" },
                    lignes: {
                        $push: {
                            article: "$lignes.articleDetails", // Inclut les détails de l'article
                            quantite: "$lignes.quantite",
                            prix_unitaire: "$lignes.prix_unitaire",
                            remise: "$lignes.remise",
                            dc: "$lignes.dc",
                            fodec: "$lignes.fodec",
                            tva: "$lignes.tva",
                            prix_uTTC: "$ligne.prix_uTTC",
                            total_ht: "$lignes.total_ht",
                            total_ttc: "$lignes.total_ttc"
                        }
                    },
                    total_hors_Taxe: { $sum: "$lignes.total_ht" }, // Calcule le total HT
                    total_ttc: { $sum: "$lignes.total_ttc" } // Calcule le total TTC
                }
            },
            {
                $lookup: {
                    from: "fournisseurs", // Jointure avec la collection des fournisseurs
                    localField: "fournisseur",
                    foreignField: "_id",
                    as: "fournisseurDetails"
                }
            },
            {
                $unwind: "$fournisseurDetails" // Décompose le tableau des fournisseurs
            },
            {
                $project: {
                    numero_Bon: 1,
                    dateCommande: 1,
                    fournisseur: "$fournisseurDetails", // Remplace par les détails du fournisseur
                    depot: 1,
                    anneeReference: 1,
                    lignes: 1,
                    statut : 1,
                    total_hors_Taxe: 1,
                    total_ttc: 1
                }
            }
        ]);

        res.status(200).json(bonsCommande);
    } catch (error) {
        console.error("Erreur lors de la récupération des bons de commande:", error);
        res.status(500).json({ message: error.message });
    }
};
//Get by ID BCF
const getBonCommandeByID = async (req, res) => {
    try {
        const bonCommande = await BonFournisseur.findById(req.params.id).populate('fournisseur' , 'raison_sociale adresse telephone');
        const lignes = await LigneAchat.find({ bon: req.params.id }).populate('article');
        console.log("Lignes de commande:", lignes); // Ajoutez ce log pour vérifier les données
        res.status(200).json({ bonCommande, lignes });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
//update BCF
 const updateBCF = async (req, res) => {
    const { id } = req.params;
    const { lignes, ...bonCommande } = req.body;
  
    try {
      // Vérifier si le bon de commande existe
      const bonCommandeF = await BonFournisseur.findById(id);
      if (!bonCommandeF) {
        return res.status(404).json({ message: "Bon de commande non trouvé" });
      }
  
      // Mettre à jour les informations de base
      if (bonCommande.dateCommande) {
        bonCommandeF.dateCommande = new Date(bonCommande.dateCommande);
      }
      if (bonCommande.fournisseur) {
        bonCommandeF.fournisseur = bonCommande.fournisseur;
      }
      if (bonCommande.depot) {
        bonCommandeF.depot = bonCommande.depot;
      }
      if (bonCommande.statut) {
        bonCommandeF.statut = bonCommande.statut;
      }
  
      // Si des lignes sont fournies, les mettre à jour
      let nouvellesLignes = [];
      if (lignes && Array.isArray(lignes)) {
        // Supprimer les anciennes lignes associées à ce bon de commande
        await LigneAchat.deleteMany({ bon: id });
  
        // Calculer les nouveaux totaux
        let total_hors_Taxe = 0;
        let total_ttc = 0;
  
        // Créer les nouvelles lignes de commande
        nouvellesLignes = lignes.map(ligne => {
          const total_ht = ligne.quantite * ligne.prix_unitaire;
          const total_ligne_ttc = total_ht * 1.2; // TVA 20%
          total_hors_Taxe += total_ht;
          total_ttc += total_ligne_ttc;
  
          return {
            bon: id,
            article: ligne.article,
            quantite: ligne.quantite,
            prix_unitaire: ligne.prix_unitaire,
            remise: ligne.remise,
            dc: ligne.dc,
            tva: ligne.tva,
            fodec: ligne.fodec,
            prix_uTTC: ligne.prix_uTTC,
            total_ht,
            total_ttc: total_ligne_ttc
          };
        });
  
        // Enregistrer les nouvelles lignes de commande
        await LigneAchat.insertMany(nouvellesLignes);
  
        // Mettre à jour les totaux dans le bon de commande
        bonCommandeF.total_hors_Taxe = total_hors_Taxe;
        bonCommandeF.total_ttc = total_ttc;
      }
  
      // Enregistrer le bon de commande mis à jour
      const updatedBonCommande = await bonCommandeF.save();
  
      // Renvoyer une réponse JSON valide
      res.status(200).json({ bonCommande: updatedBonCommande, lignes: nouvellesLignes });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du bon de commande:", error);
      res.status(500).json({ message: error.message });
    }
  };

//delete BCF
const deleteBCF = async (req, res) => {
    try {
        const { id } = req.params;
        // Vérification de l'existence du bon de commande
        const bonCommande = await BonFournisseur.findById(id);
        if (!bonCommande) {
            return res.status(404).json({ message: "Bon de commande non trouvé" });
        }

        // Supprimer le bon de commande
        await BonFournisseur.findByIdAndDelete(id);

        // Supprimer les lignes associées
        await LigneAchat.deleteMany({ bon: id });

        res.status(200).json({ message: "Bon de commande supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//zone BEF (bon entrée/reception fournisseur )
//create
const createBonReception = async (req, res) => {
    try {
        const { fournisseur, depot, lignes, dateReception } = req.body;

        // Vérification des champs obligatoires
        if (!fournisseur || !depot || !lignes || lignes.length === 0 || !dateReception) {
            return res.status(400).json({ message: "Fournisseur, dépôt, lignes de commande et date de Réception sont requis." });
        }

        // Convertir la date de commande en objet Date
        const dateReceptionObj = new Date(dateReception);

        // Vérifier si la date est valide
        if (isNaN(dateReceptionObj.getTime())) {
            return res.status(400).json({ message: "Date de Réception invalide." });
        }

        // Extraire l'année de référence à partir de la date
        const year = dateReceptionObj.getFullYear();

        // Vérifier que l'année de référence est valide
        if (!year || year < 2000 || year > 2100) {
            return res.status(400).json({ message: "L'année de référence est invalide." });
        }

        // Récupérer le code du dépôt
        const foundDepot = await Depot.findById(depot);
        if (!foundDepot) {
            return res.status(404).json({ message: "Dépôt non trouvé" });
        }
        const codeDepot = foundDepot.codeDepot;

        // Extraire les deux derniers chiffres de l'année de référence
        const yearShort = year.toString().slice(-2);

        // Trouver ou créer un compteur pour l'année de référence
        let counter;
        try {
            counter = await CounterModel.findOneAndUpdate(
                { model: 'bonReception', year: year },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
        } catch (error) {
            console.error("Erreur lors de la création ou de la mise à jour du compteur:", error);
            if (error.code === 11000) {
                // Si l'erreur est une duplication de clé, récupérez le compteur existant
                counter = await CounterModel.findOne({ model: 'bonReception', year: year });
                if (!counter) {
                    // Si aucun compteur existant n'est trouvé, créez-en un nouveau
                    counter = new CounterModel({ model: 'bonReception', year: year, seq: 1 });
                    await counter.save();
                }
            } else {
                return res.status(500).json({ message: "Erreur lors de la création du compteur." });
            }
        }

        if (!counter) {
            return res.status(500).json({ message: "Erreur lors de la création du compteur." });
        }

        // Formater la séquence sur 5 chiffres
        const sequence = String(counter.seq).padStart(5, '0');

        // Générer le numéro de commande
        const numero_Bon = `BE ${codeDepot} ${yearShort} ${sequence}`;

        // Calcul du total HT et TTC
        const total_hors_Taxe = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
        const total_ttc = total_hors_Taxe * 1.2; // TVA 20%

        // Création du bon de commande
        const BonReception = new BonFournisseur({
            numero_Bon,
            fournisseur,
            type :"BonReception",
            dateReception: dateReceptionObj,
            depot,
            statut : "En attente",
            anneeReference: year, // Utiliser `year` au lieu de `anneeReference`
            total_hors_Taxe,
            total_ttc,
        });

        const savedBonReception = await BonReception.save();

        // Enregistrement des lignes de commande
        const lignesReception = lignes.map(ligne => ({
            bon: savedBonReception._id,
            article: ligne.article,
            quantite: ligne.quantite,
            prix_unitaire: ligne.prix_unitaire,
            remise: ligne.remise || 0,
            tva: ligne.tva || 0,
            dc: ligne.dc || 0,
            fodec: ligne.fodec || 0,
            prix_uTTC: ligne.prix_uTTC || 0,
            total_ht: ligne.quantite * ligne.prix_unitaire,
            total_ttc: ligne.quantite * ligne.prix_uTTC,
        }));

        await LigneAchat.insertMany(lignesReception);

        res.status(201).json({ BonReception: savedBonReception, lignes: lignesReception });
    } catch (error) {
        console.error("Erreur lors de la création du bon de commande:", error);
        res.status(500).json({ message: error.message });
    }
};
//getAll

//GetAll BEF
const getBEF = async (req, res) => {
    try {
        const bonsReceptions = await BonFournisseur.aggregate([
            {
                $match: { type: "BonReception" }
            },
            {
                $lookup: {
                    from: "ligneachats",
                    localField: "_id",
                    foreignField: "bon",
                    as: "lignes"
                }
            },
            {
                $unwind: "$lignes"
            },
            {
                $lookup: {
                    from: "articles",
                    localField: "lignes.article",
                    foreignField: "_id",
                    as: "lignes.articleDetails"
                }
            },
            {
                $unwind: "$lignes.articleDetails"
            },
            {
                $group: {
                    _id: "$_id",
                    numero_Bon: { $first: "$numero_Bon" },
                    dateReception: { $first: "$dateReception" },
                    fournisseur: { $first: "$fournisseur" },
                    depot: { $first: "$depot" },
                    statut: { $first: "$statut" },
                    anneeReference: { $first: "$anneeReference" },
                    lignes: {
                        $push: {
                            article: "$lignes.articleDetails",
                            quantite: "$lignes.quantite",
                            prix_unitaire: "$lignes.prix_unitaire",
                            remise: "$lignes.remise",
                            tva: "$lignes.tva",
                            dc: "$lignes.dc",
                            fodec: "$lignes.fodec",
                            prix_uTTC: "$lignes.prix_uTTC",
                            total_ht: "$lignes.total_ht",
                            total_ttc: "$lignes.total_ttc"
                        }
                    },
                    total_hors_Taxe: { $sum: "$lignes.total_ht" },
                    total_ttc: { $sum: "$lignes.total_ttc" }
                }
            },
            {
                $lookup: {
                    from: "fournisseurs",
                    localField: "fournisseur",
                    foreignField: "_id",
                    as: "fournisseurDetails"
                }
            },
            {
                $unwind: "$fournisseurDetails"
            },
            {
                $project: {
                    numero_Bon: 1,
                    dateReception: 1,
                    fournisseur: "$fournisseurDetails",
                    depot: 1,
                    statut: 1,
                    anneeReference: 1,
                    lignes: 1,
                    total_hors_Taxe: 1,
                    total_ttc: 1
                }
            }
        ]);

        res.status(200).json(bonsReceptions);
    } catch (error) {
        console.error("Erreur lors de la récupération des bons de réception:", error);
        res.status(500).json({ message: error.message });
    }
};
//getBonReceptionByID
const getBonReceptionByID = async (req, res) => {
    try {
        const bonReception = await BonFournisseur.findById(req.params.id).populate('fournisseur' , 'raison_sociale adresse telephone');
        const lignes = await LigneAchat.find({ bon: req.params.id }).populate('article');
        console.log("Lignes de commande:", lignes); // Ajoutez ce log pour vérifier les données
        res.status(200).json({ bonCommande, lignes });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//update BEF
const updateBEF = async (req, res) => {
    const { id } = req.params;
    const { lignes, ...bonReception } = req.body;
  
    try {
      // Vérifier si le bon de commande existe
      const bonReceptionF = await BonFournisseur.findById(id);
      if (!bonReceptionF) {
        return res.status(404).json({ message: "Bon de Réception non trouvé" });
      }
  
      // Mettre à jour les informations de base
      if (bonReception.dateReception) {
        bonReceptionF.dateReception = new Date(bonReception.dateReception);
      }
      if (bonReception.fournisseur) {
        bonReceptionF.fournisseur = bonReception.fournisseur;
      }
      if (bonReception.depot) {
        bonReceptionF.depot = bonReception.depot;
      }
      if (bonReception.statut) {
        bonReceptionF.statut = bonReception.statut;
      }
  
      // Si des lignes sont fournies, les mettre à jour
      let nouvellesLignes = [];
      if (lignes && Array.isArray(lignes)) {
        // Supprimer les anciennes lignes associées à ce bon de reception
        await LigneAchat.deleteMany({ bon: id });
  
        // Calculer les nouveaux totaux
        let total_hors_Taxe = 0;
        let total_ttc = 0;
  
        // Créer les nouvelles lignes de commande
        nouvellesLignes = lignes.map(ligne => {
          const total_ht = ligne.quantite * ligne.prix_unitaire;
          const total_ligne_ttc = total_ht * 1.2; // TVA 20%
          total_hors_Taxe += total_ht;
          total_ttc += total_ligne_ttc;
  
          return {
            bon: id,
            article: ligne.article,
            quantite: ligne.quantite,
            prix_unitaire: ligne.prix_unitaire,
            remise: ligne.remise,
            dc: ligne.dc,
            tva: ligne.tva,
            fodec: ligne.fodec,
            prix_uTTC: ligne.prix_uTTC,
            total_ht,
            total_ttc: total_ligne_ttc
          };
        });
  
        // Enregistrer les nouvelles lignes de commande
        await LigneAchat.insertMany(nouvellesLignes);
  
        // Mettre à jour les totaux dans le bon de commande
        bonReceptionF.total_hors_Taxe = total_hors_Taxe;
        bonReceptionF.total_ttc = total_ttc;
      }
  
      // Enregistrer le bon de commande mis à jour
      const updatedBonReception = await bonReceptionF.save();
  
      // Renvoyer une réponse JSON valide
      res.status(200).json({ bonReception: updatedBonReception, lignes: nouvellesLignes });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du bon de Reception:", error);
      res.status(500).json({ message: error.message });
    }
  };

//delete BEF
const deleteBEF = async (req, res) => {
    try {
        const { id } = req.params;
        // Vérification de l'existence du bon de commande
        const bonReception = await BonFournisseur.findById(id);
        if (!bonReception) {
            return res.status(404).json({ message: "Bon de Reception non trouvé" });
        }

        // Supprimer le bon de Reception
        await BonFournisseur.findByIdAndDelete(id);

        // Supprimer les lignes associées
        await LigneAchat.deleteMany({ bon: id });

        res.status(200).json({ message: "Bon de Reception supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// delete multiple BEF
const deleteMultipleBEF = async (req, res) => {
    try {
        const { ids } = req.body; // IDs des bons de réception à supprimer

        // Vérifier si des IDs sont fournis
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: "Les IDs des bons de réception sont requis sous forme de tableau." });
        }

        // Supprimer les bons de réception
        await BonFournisseur.deleteMany({ _id: { $in: ids } });

        // Supprimer les lignes associées
        await LigneAchat.deleteMany({ bon: { $in: ids } });

        res.status(200).json({ message: "Bons de réception supprimés avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports={createBonCommande,getBonCommandeByID,updateBCF,getBCF, deleteBCF , createBonReception , getBEF, deleteBEF, deleteMultipleBEF, getBonReceptionByID};

