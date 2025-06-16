const BonFournisseur = require('../Models/Achat/EnteteAchat');
const LigneAchat = require('../Models/Achat/LignesAchat');
const ArticleModel =require('../Models/Article/article');
const Depot = require('../Models/depot');
const CounterModel=require ("../Models/counters");
//Zone BCF
//createBCF
const createBonCommande = async (req, res) => {
    try {
        console.log("Données reçues:", req.body); // Ajoutez ce log
        const { fournisseur, depot, lignes, dateCommande } = req.body;
        // Vérification des champs obligatoires
        if (!fournisseur || !depot || !lignes || lignes.length === 0 || !dateCommande) {
            return res.status(400).json({ message: "Fournisseur, dépôt, lignes de commande et date de commande sont requis." });
        }
        const dateCommandeObj = new Date(dateCommande);

        if (isNaN(dateCommandeObj.getTime())) {
            return res.status(400).json({ message: "Date de commande invalide." });
        }

        const year = dateCommandeObj.getFullYear();

        if (!year || year < 2000 || year > 2100) {
            return res.status(400).json({ message: "L'année de référence est invalide." });
        }

        // Récupérer le code du dépôt
        const foundDepot = await Depot.findById(depot);
        if (!foundDepot) {
            return res.status(404).json({ message: "Dépôt non trouvé" });
        }
        const codeDepot = foundDepot.codeDepot;

        const yearShort = year.toString().slice(-2);

        let counter;
        try {
            counter = await CounterModel.findOneAndUpdate(
                { model: 'bonCommande', year: year },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
        } catch (error) {
            console.error("Erreur lors de la création ou de la mise à jour du compteur:", error);
            if (error.code === 11000) {
                counter = await CounterModel.findOne({ model: 'bonCommande', year: year });
                if (!counter) {
                    counter = new CounterModel({ model: 'bonCommande', year: year, seq: 1 });
                    await counter.save();
                }
            } else {
                return res.status(500).json({ message: "Erreur lors de la création du compteur." });
            }
        }

        if (!counter) {
            return res.status(500).json({ message: "Erreur lors de la création du compteur." });
        }

        const sequence = String(counter.seq).padStart(5, '0');

        const numero_Bon = `BC ${codeDepot} ${yearShort} ${sequence}`;

        // Calcul du total HT et TTC
        const total_hors_Taxe = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
        const total_ttc = lignes.reduce((acc, ligne) => {
        const totalLigneHT = ligne.quantite * ligne.prix_unitaire;
        const totalLigneTTC = totalLigneHT * (1 + ligne.tva / 100); 
        return acc + totalLigneTTC;
        }, 0);

        // Création du bon de commande
        const bonCommande = new BonFournisseur({
            numero_Bon,
            fournisseur,
            type: "BonCommande",
            dateCommande: dateCommandeObj,
            depot,
            anneeReference: year, 
            total_hors_Taxe,
            total_ttc,
            lignes: [],
        });

        // Sauvegarder le bon de commande
        const savedBonCommande = await bonCommande.save();

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
            total_ttc: ligne.quantite * ligne.prix_unitaire * ligne.tva,
        }));

     // await LigneAchat.insertMany(lignesCommande);
     const savedLignes = await LigneAchat.insertMany(lignesCommande);
     savedBonCommande.lignes = savedLignes.map(ligne => ligne._id);
     await savedBonCommande.save();

     for (const ligne of lignes) {
        await ArticleModel.findByIdAndUpdate(
            ligne.article,
            { $inc: { Nombre_unite: ligne.quantite } },
            { new: true }
        );
    }
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


//Ancien  verison de Code :
//all
/*const getBCF = async (req, res) => { 
    try {
        const a = await BonCommandeFournisseur.find().populate('fournisseur');
        res.status(200).json(a);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}; */
//create
/*const createBonCommande = async (req, res) => {
    try {
        const { fournisseur, depot, lignes, anneeReference } = req.body;

        // Vérification des champs obligatoires
        if (!fournisseur || !depot || !lignes || lignes.length === 0 || !anneeReference) {
            return res.status(400).json({ message: "Fournisseur, dépôt, lignes de commande et année de référence sont requis." });
        }
        // Vérifier que `anneeReference` est une année valide
        if (!anneeReference || typeof anneeReference !== 'number' || anneeReference < 2000 || anneeReference > 2100) {
            return res.status(400).json({ message: "L'année de référence est invalide ou manquante." });
        }
        // Récupérer le code du dépôt
        const foundDepot = await Depot.findById(depot);
        if (!foundDepot) {
            return res.status(404).json({ message: "Dépôt non trouvé" });
        }
        const codeDepot = foundDepot.codeDepot;
        // Extraire les deux derniers chiffres de l'année de référence
        
        const year = anneeReference.toString().slice(-2);

        console.log("Avant findOneAndUpdate - model:", 'bonCommande', "year:", anneeReference);
        // Trouver ou créer un compteur pour l'année de référence
        const counter = await CounterModel.findOneAndUpdate(
            { model: 'bonCommande',  year:anneeReference }, // Compteur spécifique à l'année
            { $inc: { seq: 1 } }, // Incrémenter la séquence
            { new: true, upsert: true ,  } // Créer le compteur s'il n'existe pas
        ).catch((error) => {
            if (error.code === 11000){
                console.error("Duplicate key error:", error);
                return CounterModel.findOne({ model: 'bonCommande', year: anneeReference });
            }
            console.error("Erreur lors de la mise à jour du compteur:", error);
            throw new Error("Erreur lors de la gestion du compteur.");
        });
        if (!counter) {
            return res.status(500).json({ message: "Erreur lors de la création du compteur." });
        }
        console.log("Après findOneAndUpdate - counter:", counter);

        // Formater la séquence sur 5 chiffres

        const sequence = String(counter.seq).padStart(5, '0');

        // Générer le numéro de commande
        const numero_commande = `BC ${codeDepot}|${year}|${sequence}`;

        // Calcul du total HT et TTC
        const total_hors_Taxe = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
        const total_ttc = total_hors_Taxe * 1.2; // TVA 20%
        let { dateCommande } = req.body;
        dateCommande = new Date(dateCommande); // Convertir en objet Date

        // Vérifier si la conversion a fonctionné
        if (isNaN(dateCommande.getTime())) {
            return res.status(400).json({ message: "Date de commande invalide" });
        }

        // Création du bon de commande
        const bonCommande = new BonCommandeFournisseur({
            numero_commande,
            fournisseur,
            dateCommande : dateCommande,
            depot,
            anneeReference, // Ajouter l'année de référence
            total_hors_Taxe,
            total_ttc,
        });

        const savedBonCommande = await bonCommande.save();

        // Enregistrement des lignes de commande
        const lignesCommande = lignes.map(ligne => ({
            bon_commande: savedBonCommande._id,
            article: ligne.article,
            quantite: ligne.quantite,
            prix_unitaire: ligne.prix_unitaire,
            total_ht: ligne.quantite * ligne.prix_unitaire,
            total_ttc: ligne.quantite * ligne.prix_unitaire * 1.2,
        }));

        await LigneCommandeFournisseur.insertMany(lignesCommande);

        res.status(201).json({ bonCommande: savedBonCommande, lignes: lignesCommande });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; */
//getAll
/*const getBCF = async (req, res) => { 
    try {
        const bonsCommande = await BonCommandeFournisseur.aggregate([
            {
                $lookup: {
                    from: "lignecommandefournisseurs", // Nom de la collection des lignes
                    localField: "_id",
                    foreignField: "bon_commande",
                    as: "lignes"
                }
            },
            {
                $addFields: {
                    total_hors_Taxe: { $sum: "$lignes.total_ht" }, // Calcule le total HT
                    total_ttc: { $sum: "$lignes.total_ttc" } // Calcule le total TTC
                }
            },
            {
                $lookup: {
                    from: "fournisseurs", // Nom de la collection des fournisseurs
                    localField: "fournisseur",
                    foreignField: "_id",
                    as: "fournisseur"
                }
            },
            {
                $unwind: "$fournisseur" // Décompose le tableau fournisseur en un objet
            }
        ]);

        res.status(200).json(bonsCommande);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; */

//GetBy
/*const getBonCommandeByID = async (req, res) => {
    try {
        const bonCommande = await BonCommandeFournisseur.findById(req.params.id).populate('fournisseur');
        const lignes = await LigneCommandeFournisseur.find({ bon_commande: req.params.id }).populate('article');
        res.status(200).json({ bonCommande, lignes });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}; */

{/*
const update = async (req, res) => {
    try {
        const { id } = req.params; // Récupérer l'ID de l'Epcom à modifier
        const { bonCommande, lignes } = req.body;

        if (!lignes || !Array.isArray(lignes)) {
            return res.status(400).json({ message: "Un tableau de lignes est requis." });
        }

        // Mettre à jour l'Epcom
        const BCF = await Epcom.findByIdAndUpdate(id, bonCommande, { new: true, runValidators: true });
        if (!BCF) {
            return res.status(404).json({ message: 'Epcom non trouvé' });
        }

        // Supprimer les anciens Lpcom associés
        await lignes.deleteMany({ nump: updatedEpcom.nump, code: updatedEpcom.code });

        // Ajouter les nouveaux Lpcom
        const newlignes = lignes.map(lignes => ({
            ...lignes,
            nump: BCF.nump,
            code: BCF.code
        }));
        const updatedLpcoms = await Lpcom.insertMany(newLpcoms);

        res.json({ message: 'Epcom et ses Lpcom mis à jour avec succès', epcom: updatedEpcom, lpcoms: updatedLpcoms });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour', error: error.message });
    }
};
*/}
//update
/*const updateBCF = async (req, res) => {
    const { id } = req.params;
    const { lignes, dateCommande, fournisseur, depot, statut } = req.body;

    try {
        // Vérifier si le bon de commande existe
        const bonCommande = await BonCommandeFournisseur.findById(id);
        if (!bonCommande) {
            return res.status(404).json({ message: "Bon de commande non trouvé" });
        }

        // Mettre à jour les informations de base
        bonCommande.dateCommande = dateCommande ? new Date(dateCommande) : bonCommande.dateCommande;
        bonCommande.fournisseur = fournisseur || bonCommande.fournisseur;
        bonCommande.depot = depot || bonCommande.depot;
        bonCommande.statut = statut || bonCommande.statut;

        // Supprimer les anciennes lignes associées à ce bon de commande
        await LigneCommandeFournisseur.deleteMany({ bon_commande: id });

        // Calculer les nouveaux totaux
        let total_hors_Taxe = 0;
        let total_ttc = 0;

        // Créer les nouvelles lignes de commande
        const nouvellesLignes = lignes.map(ligne => {
            const total_ht = ligne.quantite * ligne.prix_unitaire;
            const total_ligne_ttc = total_ht * 1.2; // TVA 20%
            total_hors_Taxe += total_ht;
            total_ttc += total_ligne_ttc;
            
            return {
                bon_commande: id,
                article: ligne.article,
                quantite: ligne.quantite,
                prix_unitaire: ligne.prix_unitaire,
                total_ht,
                total_ttc: total_ligne_ttc
            };
        });

        // Enregistrer les nouvelles lignes de commande
        await LigneCommandeFournisseur.insertMany(nouvellesLignes);

        // Mettre à jour les totaux dans le bon de commande
        bonCommande.total_hors_Taxe = total_hors_Taxe;
        bonCommande.total_ttc = total_ttc;

        // Enregistrer le bon de commande mis à jour
        const updatedBonCommande = await bonCommande.save();

        res.status(200).json({ bonCommande: updatedBonCommande, lignes: nouvellesLignes });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du bon de commande:", error);
        res.status(500).json({ message: error.message });
    }
};*/
//update 
/*
const updateBCF = async (req, res) => {
    const { id } = req.params;
    const { lignes, bonCommande } = req.body;

    try {
        // Vérifier si le bon de commande existe
        const bonCommandeF = await BonCommandeFournisseur.findById(id);
        if (!bonCommandeF) {
            return res.status(404).json({ message: "Bon de commande non trouvé" });
        }

        // Mettre à jour les informations de base
        bonCommande.dateCommande = dateCommande ? new Date(dateCommande) : bonCommande.dateCommande;
        bonCommande.fournisseur = fournisseur || bonCommande.fournisseur;
        bonCommande.depot = depot || bonCommande.depot;
        bonCommande.statut = statut || bonCommande.statut; 

        // Si des lignes sont fournies, les mettre à jour
        if (lignes && Array.isArray(lignes)) {
            // Supprimer les anciennes lignes associées à ce bon de commande
            await LigneCommandeFournisseur.deleteMany({ bon_commande: id });

            // Calculer les nouveaux totaux
            let total_hors_Taxe = 0;
            let total_ttc = 0;

            // Créer les nouvelles lignes de commande
            const nouvellesLignes = lignes.map(ligne => {
                const total_ht = ligne.quantite * ligne.prix_unitaire;
                const total_ligne_ttc = total_ht * 1.2; // TVA 20%
                total_hors_Taxe += total_ht;
                total_ttc += total_ligne_ttc;

                return {
                    bon_commande: id,
                    article: ligne.article,
                    quantite: ligne.quantite,
                    prix_unitaire: ligne.prix_unitaire,
                    total_ht,
                    total_ttc: total_ligne_ttc
                };
            });

            // Enregistrer les nouvelles lignes de commande
            await LigneCommandeFournisseur.insertMany(nouvellesLignes);

            // Mettre à jour les totaux dans le bon de commande
            bonCommande.total_hors_Taxe = total_hors_Taxe;
            bonCommande.total_ttc = total_ttc;
        }

        // Enregistrer le bon de commande mis à jour
        const updatedBonCommande = await bonCommande.save();

        res.status(200).json({ bonCommande: updatedBonCommande, lignes: nouvellesLignes || [] });
    } catch (error) {
        console.error("Erreur lors de la mise à jour du bon de commande:", error);
        res.status(500).json({ message: error.message });
    }
};
*/

//update 
{/*
const updateBCF = async (req, res) => {
    const { id } = req.params;
    const { lignes, bonCommande } = req.body;

    try {
        // Vérifier si le bon de commande existe
        const bonCommandeF = await BonCommandeFournisseur.findById(id);
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
            await LigneCommandeFournisseur.deleteMany({ bon_commande: id });

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
                    bon_commande: id,
                    article: ligne.article,
                    quantite: ligne.quantite,
                    prix_unitaire: ligne.prix_unitaire,
                    total_ht,
                    total_ttc: total_ligne_ttc
                };
            });

            // Enregistrer les nouvelles lignes de commande
            await LigneCommandeFournisseur.insertMany(nouvellesLignes);

            // Mettre à jour les totaux dans le bon de commande
            bonCommande.total_hors_Taxe = total_hors_Taxe;
            bonCommande.total_ttc = total_ttc;
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
 */}