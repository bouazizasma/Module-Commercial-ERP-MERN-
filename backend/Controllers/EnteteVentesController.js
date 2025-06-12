const EnteteVentes = require('../Models/Ventes/EnteteVentes');
const LigneVentes = require('../Models/Ventes/LigneVentes');
const Depot = require('../Models/depot');
const CounterModel=require ("../Models/counters");
const mongoose = require('mongoose');

/////////////////////////zone Devis /////////////////////////////////
//createDevis
const createDevis = async (req, res) => {
    try {
        console.log("Données reçues:", req.body); 
        const { client, depot, lignes, dateDevis } = req.body;
        // Vérification des champs obligatoires
        if (!client || !depot || !lignes || lignes.length === 0 || !dateDevis) {
            return res.status(400).json({ message: "Client, dépôt, lignes de Devis et date de Devis sont requis." });
        }

        // Convertir la date de devis en objet Date
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

        // Générer le numéro de devis
        const numero = `DV ${codeDepot} ${yearShort} ${sequence}`;

        // Calcul du total HT et TTC
        const total_hors_Taxe = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
       // Calcul du total TTC en tenant compte de la TVA pour chaque ligne
        const total_ttc = lignes.reduce((acc, ligne) => {
        const totalLigneHT = ligne.quantite * ligne.prix_unitaire;
        const totalLigneTTC = totalLigneHT * (1 + ligne.tva / 100); // Supposons que la TVA est en pourcentage
        return acc + totalLigneTTC;
        }, 0);
        // Création du devis
        const devis = new EnteteVentes({
            numero,
            client,
            type: "Devis",
            dateDevis: dateDevisObj,
            depot,
            anneeReference: year, 
            total_hors_Taxe ,
            total_ttc ,
            lignes: [],
        });

        // Sauvegarder le devis 
        const savedDevis = await devis.save();

        // Enregistrement des lignes de devis
        const lignesDevis = lignes.map(ligne => ({
            numeroEntete: savedDevis._id,
            article: ligne.article,
            quantite: ligne.quantite,
            prix_unitaire: ligne.prix_unitaire,
            remise: ligne.remise,
            dc: ligne.dc,
            fodec: ligne.fodec,
            tva: ligne.tva,
            prix_uTTC: ligne.prix_uTTC,
            total_ht: ligne.quantite * ligne.prix_unitaire,
            total_ttc: ligne.quantite * ligne.prix_unitaire * (1 + ligne.tva),
        }));

       // await LigneVentes.insertMany(lignesDevis);
       const insertedLignes = await LigneVentes.insertMany(lignesDevis);

       // Mettre à jour l'entête avec les IDs des lignes
       await EnteteVentes.findByIdAndUpdate(savedDevis._id, {
         $set: { lignes: insertedLignes.map(l => l._id) }
       });
       

        // Populate the fournisseur field after saving
        const populatedDevis = await EnteteVentes.findById(savedDevis._id).populate('client').populate({
            path: 'lignes',
            populate: { path: 'article' , model : 'article' } // Peupler les articles dans les lignes
        });

        res.status(201).json({ devis: populatedDevis, lignes: lignesDevis });
        console.log("Populated Devis:", populatedDevis);
    } catch (error) {
        console.error("Erreur lors de la création du DEVIS:", error);
        res.status(500).json({ message: error.message });
    }
};
//GetAll Devis
/*const getDevis = async (req, res) => {
    try {
        const lesdevis = await EnteteVentes.aggregate([
            // Étape 1 : Filtrer les documents où type = "devis"
            {
                $match: { type: "Devis" }
            },
            {
                $lookup: {
                    from: "LigneVentes", // Jointure avec la collection des lignes de devis
                    localField: "_id",
                    foreignField: "numeroEntete",
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
                    _id: "$_id", // Regroupe à nouveau par devis
                    numero: { $first: "$numero" },
                    dateDevis: { $first: "$dateDevis" },
                    client: { $first: "$client" },
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
                    from: "clients", // Jointure avec la collection des clients
                    localField: "client",
                    foreignField: "_id",
                    as: "clientDetails"
                }
            },
            {
                $unwind: "$clientDetails" // Décompose le tableau des clients
            },
            {
                $project: {
                    numero: 1,
                    dateDevis: 1,
                    client: "$clientDetails", // Remplace par les détails du client
                    depot: 1,
                    anneeReference: 1,
                    lignes: 1,
                    statut : 1,
                    total_hors_Taxe: 1,
                    total_ttc: 1
                }
            }
        ]);

        res.status(200).json(lesdevis);
    } catch (error) {
        console.error("Erreur lors de la récupération des devis:", error);
        res.status(500).json({ message: error.message });
    }
};
*/
/*const getDevis = async (req, res) => {
    try {
        // D'abord vérifier si des devis existent
        const count = await EnteteVentes.countDocuments({ type: "Devis" });
        console.log(`Nombre de devis trouvés: ${count}`);

        const lesdevis = await EnteteVentes.aggregate([
            // Étape 1 : Filtrer les devis
            { $match: { type: "Devis" } },
            
            // Étape 2 : Jointure avec les clients (plus efficace que lookup+unwind)
            {
                $lookup: {
                    from: "clients",
                    localField: "client",
                    foreignField: "_id",
                    as: "client"
                }
            },
            { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
            
            // Étape 3 : Jointure avec les lignes (en gardant les devis sans lignes)
            {
                $lookup: {
                    from: "LigneVentes",
                    localField: "_id",
                    foreignField: "numeroEntete",
                    as: "lignes"
                }
            },
            
            // Étape 4 : Calculer les totaux
            {
                $addFields: {
                    total_hors_Taxe: {
                        $sum: "$lignes.total_ht"
                    },
                    total_ttc: {
                        $sum: "$lignes.total_ttc"
                    }
                }
            },
            
            // Étape 5 : Peupler les articles dans les lignes
            {
                $addFields: {
                    lignes: {
                        $map: {
                            input: "$lignes",
                            as: "ligne",
                            in: {
                                $mergeObjects: [
                                    "$$ligne",
                                    {
                                        article: {
                                            $arrayElemAt: [
                                                {
                                                    $lookup: {
                                                        from: "articles",
                                                        localField: "$$ligne.article",
                                                        foreignField: "_id",
                                                        as: "articleDetails"
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            
            // Étape 6 : Projection finale
            {
                $project: {
                    numero: 1,
                    dateDevis: 1,
                    client: 1,
                    depot: 1,
                    statut: 1,
                    anneeReference: 1,
                    lignes: {
                        $map: {
                            input: "$lignes",
                            as: "ligne",
                            in: {
                                article: "$$ligne.article",
                                quantite: "$$ligne.quantite",
                                prix_unitaire: "$$ligne.prix_unitaire",
                                remise: "$$ligne.remise",
                                dc: "$$ligne.dc",
                                fodec: "$$ligne.fodec",
                                tva: "$$ligne.tva",
                                prix_uTTC: "$$ligne.prix_uTTC",
                                total_ht: "$$ligne.total_ht",
                                total_ttc: "$$ligne.total_ttc"
                            }
                        }
                    },
                    total_hors_Taxe: 1,
                    total_ttc: 1
                }
            }
        ]);

        console.log("Devis après agrégation:", JSON.stringify(lesdevis, null, 2));
        res.status(200).json(lesdevis);
    } catch (error) {
        console.error("Erreur lors de la récupération des devis:", error);
        res.status(500).json({ 
            message: error.message,
            stack: error.stack 
        });
    }
};

/*const getDevis = async (req, res) => {
    try {
        // D'abord, vérifiez simplement si des devis existent
        const count = await EnteteVentes.countDocuments({ type: "Devis" });
        console.log(`Nombre de devis trouvés: ${count}`);

        const devis = await EnteteVentes.aggregate([
            // Étape 1 : Filtrer les devis
            { $match: { type: "Devis" } },
            
            // Étape 2 : Peupler le client (plus efficace que lookup+unwind)
            {
                $lookup: {
                    from: "clients",
                    localField: "client",
                    foreignField: "_id",
                    as: "client"
                }
            },
            { $unwind: "$client" },
            
            // Étape 3 : Peupler les lignes (en gardant le tableau même si vide)
            {
                $lookup: {
                    from: "LigneVentes",
                    localField: "_id",
                    foreignField: "numeroEntete",
                    as: "lignes"
                }
            },
            
            // Étape 4 : Peupler les articles dans chaque ligne (sans unwind pour garder les devis sans lignes)
            {
                $addFields: {
                    "lignes": {
                        $map: {
                            input: "$lignes",
                            as: "ligne",
                            in: {
                                $mergeObjects: [
                                    "$$ligne",
                                    {
                                        article: {
                                            $arrayElemAt: [
                                                {
                                                    $lookup: {
                                                        from: "articles",
                                                        localField: "$$ligne.article",
                                                        foreignField: "_id",
                                                        as: "articleDetails"
                                                    }
                                                },
                                                0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            
            // Étape 5 : Calculer les totaux
            {
                $addFields: {
                    total_hors_Taxe: { $sum: "$lignes.total_ht" },
                    total_ttc: { $sum: "$lignes.total_ttc" }
                }
            },
            
            // Étape 6 : Projection finale
            {
                $project: {
                    numero: 1,
                    dateDevis: 1,
                    client: 1,
                    depot: 1,
                    statut: 1,
                    anneeReference: 1,
                    lignes: {
                        $map: {
                            input: "$lignes",
                            as: "ligne",
                            in: {
                                article: "$$ligne.article",
                                quantite: "$$ligne.quantite",
                                prix_unitaire: "$$ligne.prix_unitaire",
                                remise: "$$ligne.remise",
                                dc: "$$ligne.dc",
                                fodec: "$$ligne.fodec",
                                tva: "$$ligne.tva",
                                prix_uTTC: "$$ligne.prix_uTTC",
                                total_ht: "$$ligne.total_ht",
                                total_ttc: "$$ligne.total_ttc"
                            }
                        }
                    },
                    total_hors_Taxe: 1,
                    total_ttc: 1
                }
            },
            
            // Étape 7 : Trier par date récente
            { $sort: { dateDevis: -1 } }
        ]);

        console.log("Devis après agrégation:", JSON.stringify(devis, null, 2));
        res.status(200).json(devis);
    } catch (error) {
        console.error("Erreur lors de la récupération des devis:", error);
        res.status(500).json({ 
            message: error.message,
            stack: error.stack 
        });
    }
};*/

const getDevis = async (req, res) => {
    try {
        // 1. Récupérer les entêtes de devis
        const entetes = await EnteteVentes.find({ type: "Devis" })
            .populate('client')
            .lean();
        
        // 2. Récupérer toutes les lignes associées
        const ligneIds = entetes.flatMap(e => e.lignes);
        const lignes = await LigneVentes.find({ _id: { $in: ligneIds } })
            .populate('article')
            .lean();
        
        // 3. Reconstituer les devis avec leurs lignes
        const devisComplets = entetes.map(entete => {
            const lignesDevis = lignes.filter(l => 
                entete.lignes.some(id => id.equals(l._id))
            );
            
            // Calcul des totaux
            const totals = lignesDevis.reduce((acc, ligne) => ({
                totalHT: acc.totalHT + (ligne.total_ht || 0),
                totalTTC: acc.totalTTC + (ligne.total_ttc || 0)
            }), { totalHT: 0, totalTTC: 0 });
            
            return {
                ...entete,
                lignes: lignesDevis,
                total_hors_Taxe: totals.totalHT,
                total_ttc: totals.totalTTC
            };
        });
        
        res.status(200).json(devisComplets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
/*const getDevis = async (req, res) => {
    try {
        const devis = await EnteteVentes.find({ type: "Devis" })
            .populate('client')
            .populate({
                path: 'lignes',
                populate: { path: 'article' }
            });
        res.status(200).json(devis);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};
*/
/*const getDevis = async (req, res) => {
    try {
        const devis = await EnteteVentes.find({ type: "Devis" })
            .populate('client')
            .populate({
                path: 'lignes',
                populate: { path: 'article' }
            });

        // Calculer les totaux pour chaque devis si ils ne sont pas déjà présents
        const devisAvecTotaux = devis.map(devis => {
            // Si les totaux existent déjà, les utiliser
            if (devis.total_hors_Taxe && devis.total_ttc) {
                return devis;
            }

            // Sinon, calculer les totaux à partir des lignes
            const totals = devis.lignes.reduce((acc, ligne) => {
                const ligneHT = (ligne.quantite || 0) * (ligne.prix_unitaire || 0);
                const ligneTTC = ligneHT * (1 + (ligne.tva || 0) / 100);
                return {
                    totalHT: acc.totalHT + ligneHT,
                    totalTTC: acc.totalTTC + ligneTTC
                };
            }, { totalHT: 0, totalTTC: 0 });

            return {
                ...devis.toObject(),
                total_hors_Taxe: totals.totalHT,
                total_ttc: totals.totalTTC
            };
        });

        res.status(200).json(devisAvecTotaux);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};*/

//Get by ID devis
const getDevisByID = async (req, res) => {
    try {
        const devis = await EnteteVentes.findById(req.params.id).populate('client' , 'nom_prenom matricule_fiscale adresse telephone');
        const lignes = await LigneVentes.find({ numeroEntete: req.params.id }).populate('article');
        console.log("Lignes de devis:", lignes); // Ajoutez ce log pour vérifier les données
        res.status(200).json({ devis, lignes });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
//update BCdevisF
 const updateDevis = async (req, res) => {
    const { id } = req.params;
    const { lignes, ...devis } = req.body;
  
    try {
      // Vérifier si le bon de commande existe
      const devisC = await EnteteVentes.findById(id);
      if (!devisC) {
        return res.status(404).json({ message: "Devis non trouvé" });
      }
  
      // Mettre à jour les informations de base
      if (devis.dateDevis) {
        devisC.dateDevis = new Date(devis.dateDevis);
      }
      if (devis.client) {
        devisC.client = devis.client;
      }
      if (devis.depot) {
        devisC.depot = devis.depot;
      }
      if (devis.statut) {
        devisC.statut = devis.statut;
      }
  
      // Si des lignes sont fournies, les mettre à jour
      let nouvellesLignes = [];
      if (lignes && Array.isArray(lignes)) {
        // Supprimer les anciennes lignes associées à ce devis
        await LigneVentes.deleteMany({ numeroEntete: id });
  
        // Calculer les nouveaux totaux
        let total_hors_Taxe = 0;
        let total_ttc = 0;
  
        // Créer les nouvelles lignes de commande
        nouvellesLignes = lignes.map(ligne => {



          const total_ht = ligne.quantite * ligne.prix_unitaire; 

          const total_ligne_ttc = lignes.reduce((acc, ligne) => {
            const totalLigneHT = ligne.quantite * ligne.prix_unitaire;
            const totalLigneTTC = totalLigneHT * (1 + ligne.tva / 100); // Supposons que la TVA est en pourcentage
            return acc + totalLigneTTC;
            }, 0);
          total_hors_Taxe += total_ht;
          total_ttc += total_ligne_ttc;
  
          return {
            numeroEntete: id,
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
  
        // Enregistrer les nouvelles lignes de devis
        await LigneVentes.insertMany(nouvellesLignes);
  
        // Mettre à jour les totaux dans le devis
        devisC.total_hors_Taxe = total_hors_Taxe;
        devisC.total_ttc = total_ttc;
      }
  
      // Enregistrer le devis mis à jour
      const updatedDevis = await devisC.save();
  
      // Renvoyer une réponse JSON valide
      res.status(200).json({ devis: updatedDevis, lignes: nouvellesLignes });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du devis:", error);
      res.status(500).json({ message: error.message });
    }
  };

//delete devis
const deleteDevis = async (req, res) => {
    try {
        const { id } = req.params;
        // Vérification de l'existence du devis
        const devis = await EnteteVentes.findById(id);
        if (!devis) {
            return res.status(404).json({ message: "Devis non trouvé" });
        }

        // Supprimer le devis
        await EnteteVentes.findByIdAndDelete(id);

        // Supprimer les lignes associées
        await LigneVentes.deleteMany({ bon: id });

        res.status(200).json({ message: "Devis supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


////////////////////////////zone Bon commande /////////////////////////////////
// Générer un bon de commande client à partir d'un devis
/*const generateBonCommandeClient = async (req, res) => {
    try {
      const { devisId } = req.params;
      
      // Récupérer le devis
      const devis = await EnteteVentes.findById(devisId);
      if (!devis) {
        return res.status(404).json({ message: "Devis non trouvé" });
      }
  
      if (devis.type !== "Devis") {
        return res.status(400).json({ message: "Le document doit être un devis" });
      }
  
      // Générer le numéro du bon de commande client
      const lastBonCommande = await EnteteVentes.findOne({ type: "bonCommandeClient" })
        .sort({ numeroDocument: -1 });
      
      let nextNumber = 1;
      if (lastBonCommande) {
        const lastNumber = parseInt(lastBonCommande.numero.split("-")[1]);
        nextNumber = lastNumber + 1;
      }
      
      const bonCommandeNumber = `BCC-${String(nextNumber).padStart(6, "0")}`;
  
      // Créer le bon de commande client
      const bonCommande = new EnteteVentes({
        type: "BonCommandeClient",
        numero: bonCommandeNumber,
        dateCommande: new Date(),
        client: devis.client,
        total_hors_Taxe: devis.total_hors_Taxe,
        total_ttc: devis.total_ttc,
        statut: "En attente",
        devisReference: devis.numero,
        details: devis.details
      });
  
      await bonCommande.save();
  
      // Mettre à jour le statut du devis
      devis.statut = "Confirmée";
      devis.bonCommandeClientReference = bonCommandeNumber;
      await devis.save();
  
      res.status(201).json({
        message: "Bon de commande client créé avec succès",
        bonCommande
      });
    } catch (error) {
      console.error("Erreur lors de la création du bon de commande client:", error);
      res.status(500).json({
        message: "Erreur lors de la création du bon de commande client",
        error: error.message
      });
    }
  };*/
 
  

const generateBonCommandeClient = async (req, res) => {
    try {
        const { devisId } = req.params;
        
        // Récupérer le devis
        const devis = await EnteteVentes.findById(devisId).populate('depot');
        if (!devis) {
            return res.status(404).json({ message: "Devis non trouvé" });
        }

        if (devis.type !== "Devis") {
            return res.status(400).json({ message: "Le document doit être un devis" });
        }

        // Récupérer le code du dépôt
        const codeDepot = devis.depot?.codeDepot || "DPT"; // Valeur par défaut si pas de dépôt

        // Extraire l'année de la date du devis
        const year = new Date(devis.dateDevis).getFullYear();
        const yearShort = year.toString().slice(-2);

        // Trouver ou créer un compteur pour les bons de commande de cette année
        let counter;
        try {
            counter = await CounterModel.findOneAndUpdate(
                { model: 'bonCommandeClient', year: year },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
        } catch (error) {
            console.error("Erreur lors de la création ou de la mise à jour du compteur:", error);
            if (error.code === 11000) {
                // Si erreur de duplication de clé, récupérer le compteur existant
                counter = await CounterModel.findOne({ model: 'bonCommandeClient', year: year });
                if (!counter) {
                    counter = new CounterModel({ model: 'bonCommandeClient', year: year, seq: 1 });
                    await counter.save();
                }
            } else {
                throw error;
            }
        }

        // Formater la séquence sur 5 chiffres
        const sequence = String(counter.seq).padStart(5, '0');

        // Générer le numéro du bon de commande
        const bonCommandeNumber = `BCC ${codeDepot} ${yearShort} ${sequence}`;

        // Créer le bon de commande client
        const bonCommande = new EnteteVentes({
            type: "BonCommandeClient",
            numero: bonCommandeNumber,
            dateCommande: new Date(),
            client: devis.client,
            depot: devis.depot,
            total_hors_Taxe: devis.total_hors_Taxe,
            total_ttc: devis.total_ttc,
            statut: "En attente",
            devisReference: devis.numero,
            details: devis.details,
            anneeReference: year,
            lignes: devis.lignes
        });

        await bonCommande.save();

        // Mettre à jour le statut du devis
        devis.statut = "Confirmée";
        devis.bonCommandeClientReference = bonCommandeNumber;
        await devis.save();

        res.status(201).json({
            message: "Bon de commande client créé avec succès",
            bonCommande
        });
    } catch (error) {
        console.error("Erreur lors de la création du bon de commande client:", error);
        res.status(500).json({
            message: "Erreur lors de la création du bon de commande client",
            error: error.message
        });
    }
};

const getAllBonCommandes = async (req, res) => {
    try {
        // 1. Récupérer les entêtes de devis
        const entetes = await EnteteVentes.find({ type: "BonCommandeClient" })
            .populate('client')
            .lean();
        
        // 2. Récupérer toutes les lignes associées
        const ligneIds = entetes.flatMap(e => e.lignes);
        const lignes = await LigneVentes.find({ _id: { $in: ligneIds } })
            .populate('article')
            .lean();
        
        // 3. Reconstituer les devis avec leurs lignes
        const bonCommandeComplets = entetes.map(entete => {
            const lignesBonCommande = lignes.filter(l => 
                entete.lignes.some(id => id.equals(l._id))
            );
            
            // Calcul des totaux
            const totals = lignesBonCommande.reduce((acc, ligne) => ({
                totalHT: acc.totalHT + (ligne.total_ht || 0),
                totalTTC: acc.totalTTC + (ligne.total_ttc || 0)
            }), { totalHT: 0, totalTTC: 0 });
            
            return {
                ...entete,
                lignes: lignesBonCommande,
                total_hors_Taxe: totals.totalHT,
                total_ttc: totals.totalTTC
            };
        });
        
        res.status(200).json(bonCommandeComplets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


// creation bon commande client 

const createBCC = async (req, res) => {
    try {
        console.log("Données reçues:", req.body); 
        const { client, depot, lignes, dateCommande } = req.body;
        // Vérification des champs obligatoires
        if (!client || !depot || !lignes || lignes.length === 0 || !dateCommande) {
            return res.status(400).json({ message: "Client, dépôt, lignes de Bon Commande  et date de bon Commande sont requis." });
        }

        // Convertir la date de devis en objet Date
        const dateBCCObj = new Date(dateCommande);

        // Vérifier si la date est valide
        if (isNaN(dateBCCObj.getTime())) {
            return res.status(400).json({ message: "Date de BonCommande invalide." });
        }

        // Extraire l'année de référence à partir de la date
        const year = dateBCCObj.getFullYear();

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
                { model: 'bonCommandeClient', year: year },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
        } catch (error) {
            console.error("Erreur lors de la création ou de la mise à jour du compteur:", error);
            if (error.code === 11000) {
                // Si l'erreur est une duplication de clé, récupérez le compteur existant
                counter = await CounterModel.findOne({ model: 'bonCommandeClient', year: year });
                if (!counter) {
                    // Si aucun compteur existant n'est trouvé, créez-en un nouveau
                    counter = new CounterModel({ model: 'bonCommandeClient', year: year, seq: 1 });
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

        // Générer le numéro de devis
        const numero = `BCC ${codeDepot} ${yearShort} ${sequence}`;

        // Calcul du total HT et TTC
        const total_hors_Taxe = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
       // Calcul du total TTC en tenant compte de la TVA pour chaque ligne
        const total_ttc = lignes.reduce((acc, ligne) => {
        const totalLigneHT = ligne.quantite * ligne.prix_unitaire;
        const totalLigneTTC = totalLigneHT * (1 + ligne.tva / 100); // Supposons que la TVA est en pourcentage
        return acc + totalLigneTTC;
        }, 0);
        // Création du devis
        const bonCommande = new EnteteVentes({
            numero,
            client,
            type: "BonCommandeClient",
            dateCommande: dateBCCObj,
            depot,
            anneeReference: year, 
            total_hors_Taxe ,
            total_ttc ,
            lignes: [],
        });

        // Sauvegarder le devis 
        const savedBBC = await bonCommande.save();

        // Enregistrement des lignes de devis
        const lignesBonCommande = lignes.map(ligne => ({
            numeroEntete: savedBBC._id,
            article: ligne.article,
            quantite: ligne.quantite,
            prix_unitaire: ligne.prix_unitaire,
            remise: ligne.remise,
            dc: ligne.dc,
            fodec: ligne.fodec,
            tva: ligne.tva,
            prix_uTTC: ligne.prix_uTTC,
            total_ht: ligne.quantite * ligne.prix_unitaire,
            total_ttc: total_ht * (1 + tva),
        }));

       // await LigneVentes.insertMany(lignesDevis);
       const insertedLignes = await LigneVentes.insertMany(lignesBonCommande);

       // Mettre à jour l'entête avec les IDs des lignes
       await EnteteVentes.findByIdAndUpdate(savedBBC._id, {
         $set: { lignes: insertedLignes.map(l => l._id) }
       });
       

        // Populate the Client field after saving
        const populatedBCC = await EnteteVentes.findById(savedBBC._id).populate('client').populate({
            path: 'lignes',
            populate: { path: 'article' , model : 'article' } // Peupler les articles dans les lignes
        });

        res.status(201).json({ bonCommande: populatedBCC, lignes: lignesBonCommande });
        console.log("Populated bon commande:", populatedBCC);
    } catch (error) {
        console.error("Erreur lors de la création du Bon commande:", error);
        res.status(500).json({ message: error.message });
    }
};

/*const getBCCByID = async (req, res) => {
    try {
        const bonCommande = await EnteteVentes.findById(req.params.id).populate('client' , 'nom_prenom matricule_fiscale adresse telephone');
        const lignes = await LigneVentes.find({ numeroEntete: req.params.id }).populate('article');
        console.log("Lignes de bon commande:", lignes); // Ajoutez ce log pour vérifier les données
        res.status(200).json({ bonCommande, lignes });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};*/

//get Bon commande by id 
const getBCCByID = async (req, res) => {
    try {
        const bonCommande = await EnteteVentes.findById(req.params.id)
            .populate('client', 'nom_prenom matricule_fiscale adresse telephone email')
            .populate('depot', 'libelle');
        
        const lignes = await LigneVentes.find({ numeroEntete: req.params.id })
            .populate('article' , 'libelle , prix_unitaire , prix_uTTC , quantite ');
        
        // Renvoyer un objet unifié avec toutes les données
        res.status(200).json({
            ...bonCommande._doc, // Spread de toutes les propriétés du bon de commande
            lignes: lignes // Ajout des lignes directement dans l'objet principal
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//Delete Bon commande 

const deleteBCC = async (req, res) => {
    try {
        const { id } = req.params;
        // Vérification de l'existence du BCC
        const bcc = await EnteteVentes.findById(id);
        if (!bcc) {
            return res.status(404).json({ message: "Bon Commande non trouvé" });
        }

        // Supprimer le bcc
        await EnteteVentes.findByIdAndDelete(id);

        // Supprimer les lignes associées
        await LigneVentes.deleteMany({ bon: id });

        res.status(200).json({ message: "Bon commande supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


///////////////zone Bon Livraison /////////////////////////

///Génération de bon de livraison 
/*const generateBonLivraisonClient = async (req, res) => {
    try {
        const { docId } = req.params;
        
        // Récupérer le document source (devis ou bon de commande)
        const sourceDoc = await EnteteVentes.findById(docId).populate('depot');
        if (!sourceDoc) {
            return res.status(404).json({ message: "Document source non trouvé" });
        }

        // Vérifier que le document est un devis ou un bon de commande
        if (!['Devis', 'BonCommandeClient'].includes(sourceDoc.type)) {
            return res.status(400).json({ 
                message: "Le document source doit être un devis ou un bon de commande client" 
            });
        }

        // Récupérer le code du dépôt
        const codeDepot = sourceDoc.depot?.codeDepot || "DPT"; // Valeur par défaut si pas de dépôt

        // Extraire l'année de la date du document source
        const sourceDate = sourceDoc.dateDevis || sourceDoc.dateCommande || new Date();
        const year = new Date(sourceDate).getFullYear();
        const yearShort = year.toString().slice(-2);

        // Trouver ou créer un compteur pour les bons de livraison de cette année
        let counter;
        try {
            counter = await CounterModel.findOneAndUpdate(
                { model: 'bonLivraisonClient', year: year },
                { $inc: { seq: 1 } },
                { $setOnInsert: { seq: 1 } },
                { new: true, upsert: true }
            );
        } catch (error) {
            console.error("Erreur lors de la création ou de la mise à jour du compteur:", error);
            if (error.code === 11000) {
                // Si erreur de duplication de clé, récupérer le compteur existant
                counter = await CounterModel.findOne({ model: 'bonLivraisonClient', year: year });
                if (!counter) {
                    counter = new CounterModel({ model: 'bonLivraisonClient', year: year, seq: 1 });
                    await counter.save();
                }
            } else {
                throw error;
            }
        }

        // Formater la séquence sur 5 chiffres
        const sequence = String(counter.seq).padStart(5, '0');

        // Générer le numéro du bon de livraison
        const bonLivraisonNumber = `BL ${codeDepot} ${yearShort} ${sequence}`;

        // Créer le bon de livraison
        const bonLivraison = new EnteteVentes({
            type: "BonLivraison",
            numero: bonLivraisonNumber,
            dateLivraison: new Date(),
            client: sourceDoc.client,
            depot: sourceDoc.depot,
            total_hors_Taxe: sourceDoc.total_hors_Taxe,
            total_ttc: sourceDoc.total_ttc,
            statut: "En attente",
            devisReference: sourceDoc.type === "Devis" ? sourceDoc.numero : sourceDoc.devisReference,
            bonCommandeClientReference: sourceDoc.type === "BonCommandeClient" ? sourceDoc.numero : sourceDoc.bonCommandeClientReference,
            details: sourceDoc.details,
            anneeReference: year,
            lignes: sourceDoc.lignes
        });

        await bonLivraison.save();

        // Mettre à jour le statut du document source
        if (sourceDoc.type === "Devis") {
            sourceDoc.statut = "Livrée";
            sourceDoc.bonLivraisonClientReference = bonLivraisonNumber;
        } else if (sourceDoc.type === "BonCommandeClient") {
            sourceDoc.statut = "Livrée";
            sourceDoc.bonLivraisonClientReference = bonLivraisonNumber;
        }
        
        await sourceDoc.save();

        res.status(201).json({
            message: "Bon de livraison client créé avec succès",
            bonLivraison
        });
    } catch (error) {
        console.error("Erreur lors de la création du bon de livraison client:", error);
        res.status(500).json({
            message: "Erreur lors de la création du bon de livraison client",
            error: error.message
        });
    }
};*/


/*const generateBonLivraisonClient = async (req, res) => {
    try {
        const { docId } = req.params;
        
        // Récupérer le document source (devis ou bon de commande)
        const sourceDoc = await EnteteVentes.findById(docId).populate('depot');
        if (!sourceDoc) {
            return res.status(404).json({ message: "Document source non trouvé" });
        }

        // Vérifier que le document est un devis ou un bon de commande
        if (!['Devis', 'BonCommandeClient'].includes(sourceDoc.type)) {
            return res.status(400).json({ 
                message: "Le document source doit être un devis ou un bon de commande client" 
            });
        }

        // Récupérer le code du dépôt avec une valeur par défaut plus robuste
        const codeDepot = sourceDoc.depot?.codeDepot || "DPT";
        
        // Gestion de la date source
        const sourceDate = sourceDoc.dateDevis || sourceDoc.dateCommande || new Date();
        const year = new Date(sourceDate).getFullYear();
        const yearShort = year.toString().slice(-2);

        // Gestion du compteur avec plus de robustesse
        let counter;
        try {
            counter = await CounterModel.findOneAndUpdate(
                { model: 'bonLivraisonClient', year: year },
                { $inc: { seq: 1 } },
                { 
                    new: true,
                    upsert: true,
                    setDefaultsOnInsert: true
                }
            );
            
            // Si le compteur est toujours null après l'opération, en créer un nouveau
            if (!counter) {
                counter = new CounterModel({
                    model: 'bonLivraisonClient',
                    year: year,
                    seq: 1
                });
                await counter.save();
            }
        } catch (error) {
            console.error("Erreur lors de la gestion du compteur:", error);
            // En cas d'erreur, créer un nouveau compteur
            counter = new CounterModel({
                model: 'bonLivraisonClient',
                year: year,
                seq: 1
            });
            await counter.save();
        }

        // Vérification finale que le compteur existe et a une séquence
        if (!counter || typeof counter.seq !== 'number') {
            throw new Error("Échec de l'initialisation du compteur de bons de livraison");
        }

        // Formater la séquence sur 5 chiffres
        const sequence = String(counter.seq).padStart(5, '0');

        // Générer le numéro du bon de livraison
        const bonLivraisonNumber = `BL ${codeDepot} ${yearShort} ${sequence}`;

        // Créer le bon de livraison
        const bonLivraison = new EnteteVentes({
            type: "BonLivraison",
            numero: bonLivraisonNumber,
            dateLivraison: new Date(),
            client: sourceDoc.client,
            depot: sourceDoc.depot,
            total_hors_Taxe: sourceDoc.total_hors_Taxe,
            total_ttc: sourceDoc.total_ttc,
            statut: "Livrée",
            devisReference: sourceDoc.type === "Devis" ? sourceDoc.numero : sourceDoc.devisReference,
            bonCommandeClientReference: sourceDoc.type === "BonCommandeClient" ? sourceDoc.numero : sourceDoc.bonCommandeClientReference,
            details: sourceDoc.details,
            anneeReference: year,
            lignes: sourceDoc.lignes
        });

        await bonLivraison.save();

        // Mettre à jour le statut du document source
        if (sourceDoc.type === "Devis") {
            sourceDoc.statut = "Livrée";
            sourceDoc.bonLivraisonClientReference = bonLivraisonNumber;
        } else if (sourceDoc.type === "BonCommandeClient") {
            sourceDoc.statut = "Livrée";
            sourceDoc.bonLivraisonClientReference = bonLivraisonNumber;
        }
        
        await sourceDoc.save();

        res.status(201).json({
            message: "Bon de livraison client créé avec succès",
            bonLivraison
        });
    } catch (error) {
        console.error("Erreur lors de la création du bon de livraison client:", error);
        res.status(500).json({
            message: "Erreur lors de la création du bon de livraison client",
            error: error.message
        });
    }
};*/

/*const generateBonLivraisonClient = async (req, res) => {
    try {
        const { docId } = req.params;
        
        // Récupérer le document source (devis ou bon de commande) avec toutes les références
        const sourceDoc = await EnteteVentes.findById(docId)
            .populate('depot')
            .populate('client');
        
        if (!sourceDoc) {
            return res.status(404).json({ message: "Document source non trouvé" });
        }

        // Vérifier que le document est un devis ou un bon de commande
        if (!['Devis', 'BonCommandeClient'].includes(sourceDoc.type)) {
            return res.status(400).json({ 
                message: "Le document source doit être un devis ou un bon de commande client" 
            });
        }

        // Récupérer le code du dépôt avec une valeur par défaut
        const codeDepot = sourceDoc.depot?.codeDepot || "DPT";
        
        // Gestion de la date source
        const sourceDate = sourceDoc.dateDevis || sourceDoc.dateCommande || new Date();
        const year = new Date(sourceDate).getFullYear();
        const yearShort = year.toString().slice(-2);

        // Gestion du compteur
        let counter = await CounterModel.findOneAndUpdate(
            { model: 'bonLivraisonClient', year: year },
            { $inc: { seq: 1 } },
            { 
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        );
        
        // Formater la séquence sur 5 chiffres
        const sequence = String(counter.seq).padStart(5, '0');

        // Générer le numéro du bon de livraison
        const bonLivraisonNumber = `BL ${codeDepot} ${yearShort} ${sequence}`;

        // Créer le bon de livraison
        const bonLivraison = new EnteteVentes({
            type: "BonLivraison",
            numero: bonLivraisonNumber,
            dateLivraison: new Date(),
            client: sourceDoc.client,
            depot: sourceDoc.depot,
            total_hors_Taxe: sourceDoc.total_hors_Taxe,
            total_ttc: sourceDoc.total_ttc,
            statut: "Livrée",
            devisReference: sourceDoc.type === "Devis" ? sourceDoc.numero : sourceDoc.devisReference,
            bonCommandeClientReference: sourceDoc.type === "BonCommandeClient" ? sourceDoc.numero : sourceDoc.bonCommandeClientReference,
            details: sourceDoc.details,
            anneeReference: year,
            lignes: sourceDoc.lignes.map(l => ({
                ...l.toObject(),
                _id: new mongoose.Types.ObjectId() // Générer un nouvel ID pour chaque ligne
            }))
        });

        await bonLivraison.save();

        // Mettre à jour le statut du document source et des documents liés
        if (sourceDoc.type === "Devis") {
            sourceDoc.statut = "Livrée";
            sourceDoc.bonLivraisonClientReference = bonLivraisonNumber;
            
            // Si ce devis a un bon de commande associé, le mettre à jour aussi
            if (sourceDoc.bonCommandeClientReference) {
                await EnteteVentes.updateOne(
                    { numero: sourceDoc.bonCommandeClientReference },
                    { 
                        statut: "Livrée",
                        bonLivraisonClientReference: bonLivraisonNumber
                    }
                );
            }
        } 
        else if (sourceDoc.type === "BonCommandeClient") {
            sourceDoc.statut = "Livrée";
            sourceDoc.bonLivraisonClientReference = bonLivraisonNumber;
            
            // Si ce bon de commande a un devis associé, le mettre à jour aussi
            if (sourceDoc.devisReference) {
                await EnteteVentes.updateOne(
                    { numero: sourceDoc.devisReference },
                    { 
                        statut: "Livrée",
                        bonLivraisonClientReference: bonLivraisonNumber
                    }
                );
            }
        }
        
        await sourceDoc.save();

        res.status(201).json({
            message: "Bon de livraison client créé avec succès",
            bonLivraison,
            updatedSourceDocument: sourceDoc
        });
    } catch (error) {
        console.error("Erreur lors de la création du bon de livraison client:", error);
        res.status(500).json({
            message: "Erreur lors de la création du bon de livraison client",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};*/

const generateBonLivraisonClient = async (req, res) => {
    try {
        const { docId } = req.params;
        
        // Récupérer le document source avec toutes les données nécessaires
        const sourceDoc = await EnteteVentes.findById(docId)
            .populate('depot')
            .populate('client')
            .populate('lignes.article'); // Si vos lignes ont des articles référencés

        if (!sourceDoc) {
            return res.status(404).json({ message: "Document source non trouvé" });
        }

        // Vérification du type de document
        if (!['Devis', 'BonCommandeClient'].includes(sourceDoc.type)) {
            return res.status(400).json({ 
                message: "Le document source doit être un devis ou un bon de commande client" 
            });
        }

        // Code du dépôt (avec valeur par défaut)
        const codeDepot = sourceDoc.depot?.codeDepot || "DPT";
        
        // Gestion de la date et de l'année
       // const sourceDate = sourceDoc.dateDevis || sourceDoc.dateCommande || new Date();
        const year = new Date().getFullYear();
        const yearShort = year.toString().slice(-2);

        // Gestion du compteur
        let counter = await CounterModel.findOneAndUpdate(
            { model: 'bonLivraisonClient', year: year },
            { $inc: { seq: 1 } },
            { 
                new: true,
                upsert: true,
                setDefaultsOnInsert: true
            }
        );

        // Formatage du numéro de séquence
        const sequence = String(counter.seq).padStart(5, '0');
        const bonLivraisonNumber = `BL ${codeDepot} ${yearShort} ${sequence}`;

        // Préparation des lignes pour la copie
        const lignesCopy = sourceDoc.lignes.map(ligne => {
            // Création d'un nouvel objet en supprimant les propriétés Mongoose internes
            const newLigne = {
                ...ligne.toObject ? ligne.toObject() : ligne,
                _id: new mongoose.Types.ObjectId() // Nouvel ID unique
            };
            delete newLigne.__v; // Supprimer les champs inutiles
            return newLigne;
        });

        // Création du bon de livraison
        const bonLivraison = new EnteteVentes({
            type: "bonLivraisonClient",
            numero: bonLivraisonNumber,
            dateLivraison: new Date(),
            client: sourceDoc.client,
            depot: sourceDoc.depot,
            total_hors_Taxe: sourceDoc.total_hors_Taxe,
            total_ttc: sourceDoc.total_ttc,
            statut: "Livrée",
            devisReference: sourceDoc.type === "Devis" ? sourceDoc.numero : sourceDoc.devisReference,
            bonCommandeClientReference: sourceDoc.type === "BonCommandeClient" ? sourceDoc.numero : sourceDoc.bonCommandeClientReference,
            details: sourceDoc.details,
            anneeReference: year,
            lignes: lignesCopy
        });

        await bonLivraison.save();

        // Mise à jour du document source et des documents liés
        if (sourceDoc.type === "Devis") {
            sourceDoc.statut = "Livrée";
            sourceDoc.bonLivraisonClientReference = bonLivraisonNumber;
            
            // Mise à jour du bon de commande associé s'il existe
            if (sourceDoc.bonCommandeClientReference) {
                await EnteteVentes.updateOne(
                    { numero: sourceDoc.bonCommandeClientReference },
                    { 
                        statut: "Livrée",
                        bonLivraisonClientReference: bonLivraisonNumber
                    }
                );
            }
        } 
        else if (sourceDoc.type === "BonCommandeClient") {
            sourceDoc.statut = "Livrée";
            sourceDoc.bonLivraisonClientReference = bonLivraisonNumber;
            
            // Mise à jour du devis associé s'il existe
            if (sourceDoc.devisReference) {
                await EnteteVentes.updateOne(
                    { numero: sourceDoc.devisReference },
                    { 
                        statut: "Livrée",
                        bonLivraisonClientReference: bonLivraisonNumber
                    }
                );
            }
        }
        
        await sourceDoc.save();

        res.status(201).json({
            message: "Bon de livraison client créé avec succès",
            bonLivraison,
            updatedSourceDocument: sourceDoc
        });

    } catch (error) {
        console.error("Erreur lors de la création du bon de livraison client:", error);
        res.status(500).json({
            message: "Erreur lors de la création du bon de livraison client",
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

//creation de bon livraison 

const createBL = async (req, res) => {
    try {
        console.log("Données reçues:", req.body); 
        const { client, depot, lignes, dateLivraison , vehicule,secteur,modePaiement, notation ,chauffeur ,timbre} = req.body;
        // Vérification des champs obligatoires
        if (!client || !depot || !lignes || lignes.length === 0 || !dateLivraison || !modePaiement ) {
            return res.status(400).json({ message: "Client, dépôt, lignes de Bon Livraison , date de bon livraison et mode de paiement   sont requis." });
        }

        // Convertir la date de devis en objet Date
        const dateBLObj = new Date(dateLivraison);

        // Vérifier si la date est valide
        if (isNaN(dateBLObj.getTime())) {
            return res.status(400).json({ message: "Date de BonLivraison invalide." });
        }

        // Extraire l'année de référence à partir de la date
        const year = dateBLObj.getFullYear();

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
                { model: 'bonLivraisonClient', year: year },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
        } catch (error) {
            console.error("Erreur lors de la création ou de la mise à jour du compteur:", error);
            if (error.code === 11000) {
                // Si l'erreur est une duplication de clé, récupérez le compteur existant
                counter = await CounterModel.findOne({ model: 'bonLivraisonClient', year: year });
                if (!counter) {
                    // Si aucun compteur existant n'est trouvé, créez-en un nouveau
                    counter = new CounterModel({ model: 'bonLivraisonClient', year: year, seq: 1 });
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

        // Générer le numéro de devis
        const numero = `BL ${codeDepot} ${yearShort} ${sequence}`;

        // Calcul du total HT et TTC
        const total_hors_Taxe = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
       // Calcul du total TTC en tenant compte de la TVA pour chaque ligne
        const total_ttc = lignes.reduce((acc, ligne) => {
        const totalLigneHT = ligne.quantite * ligne.prix_unitaire;
        const totalLigneTTC = totalLigneHT * (1 + ligne.tva / 100); // Supposons que la TVA est en pourcentage
        return acc + totalLigneTTC;
        }, 0);
        const netapayer = total_ttc + (timbre || 0); // Ajout d'une valeur par défaut pour timbre
        // Création du bonLivraison
        const bonLivraison = new EnteteVentes({
            numero,
            client,
            type: "bonLivraisonClient",
            dateLivraison: dateBLObj,
            depot,
            modePaiement,
            vehicule,
            secteur,
            chauffeur,
            notation,
            statut :"Livrée",
            anneeReference: year, 
            total_hors_Taxe ,
            total_ttc ,
            netapayer,
            lignes: [],
        });

        // Sauvegarder le BL 
        const savedBL = await bonLivraison.save();

        // Enregistrement des lignes de devis
        const lignesBonLivraison = lignes.map(ligne => ({
            numeroEntete: savedBL._id,
            article: ligne.article,
            quantite: ligne.quantite,
            prix_unitaire: ligne.prix_unitaire,
            remise: ligne.remise,
            dc: ligne.dc,
            fodec: ligne.fodec,
            tva: ligne.tva,
            prix_uTTC: ligne.prix_uTTC,
            total_ht: ligne.quantite * ligne.prix_unitaire,
            total_ttc:  (ligne.quantite * ligne.prix_unitaire) * (1 + (ligne.tva || 0) / 100) 
        }));

       // await LigneVentes.insertMany(lignesDevis);
       const insertedLignes = await LigneVentes.insertMany(lignesBonLivraison);

       // Mettre à jour l'entête avec les IDs des lignes
       await EnteteVentes.findByIdAndUpdate(savedBL._id, {
         $set: { lignes: insertedLignes.map(l => l._id) }
       });
       

        // Populate the Client field after saving
        const populatedBL = await EnteteVentes.findById(savedBL._id).populate('client').populate({
            path: 'lignes',
            populate: { path: 'article' , model : 'article' } // Peupler les articles dans les lignes
        });

        res.status(201).json({ bonLivraison: populatedBL, lignes: lignesBonLivraison });
        console.log("Populated bon Livraison:", populatedBL);
    } catch (error) {
        console.error("Erreur lors de la création du Bon Livraison:", error);
        res.status(500).json({ message: error.message });
    }
};

//get all bon Livraison 
const getAllBonLivraisons = async (req, res) => {
    try {
        // 1. Récupérer les entêtes de BonLivraison
        const entetes = await EnteteVentes.find({ type: "bonLivraisonClient" })
            .populate('client')
            .lean();
        
        // 2. Récupérer toutes les lignes associées
        const ligneIds = entetes.flatMap(e => e.lignes);
        const lignes = await LigneVentes.find({ _id: { $in: ligneIds } })
            .populate('article')
            .lean();
        
        // 3. Reconstituer les BonLivraison avec leurs lignes
        const bonLivraisonComplets = entetes.map(entete => {
            const lignesBonLivraison = lignes.filter(l => 
                entete.lignes.some(id => id.equals(l._id))
            );
            
            // Calcul des totaux
            const totals = lignesBonLivraison.reduce((acc, ligne) => ({
                totalHT: acc.totalHT + (ligne.total_ht || 0),
                totalTTC: acc.totalTTC + (ligne.total_ttc || 0)
            }), { totalHT: 0, totalTTC: 0 });
            
            return {
                ...entete,
                lignes: lignesBonLivraison,
                total_hors_Taxe: totals.totalHT,
                total_ttc: totals.totalTTC
            };
        });
        
        res.status(200).json(bonLivraisonComplets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};


//Génération de FActure  d'apres les BL

const generateFactureClient = async (req, res) => {
    try {
        const { bonLivraisonID } = req.params;
        // Récupérer le bl
        const bl = await EnteteVentes.findById(bonLivraisonID).populate('depot').populate('client')
        .populate('lignes.article');
        if (!bl) {
            return res.status(404).json({ message: "BL non trouvé" });
        }

        if (bl.type !== "bonLivraisonClient") {
            return res.status(400).json({ message: "Le document doit être un BL" });
        }

        // Récupérer le code du dépôt
        const codeDepot = bl.depot?.codeDepot || "DPT"; // Valeur par défaut si pas de dépôt

       // Extraire l'année de la date actuelle
        const year = new Date().getFullYear();

        const yearShort = year.toString().slice(-2);

        // Trouver ou créer un compteur pour les Factures de cette année
        let counter;
        try {
            counter = await CounterModel.findOneAndUpdate(
                { model: 'FactureClient', year: year },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
        } catch (error) {
            console.error("Erreur lors de la création ou de la mise à jour du compteur:", error);
            if (error.code === 11000) {
                // Si erreur de duplication de clé, récupérer le compteur existant
                counter = await CounterModel.findOne({ model: 'FactureClient', year: year });
                if (!counter) {
                    counter = new CounterModel({ model: 'FactureClient', year: year, seq: 1 });
                    await counter.save();
                }
            } else {
                throw error;
            }
        }

        // Formater la séquence sur 5 chiffres
        const sequence = String(counter.seq).padStart(5, '0');

        // Générer le numéro du facture
        const factureClientNumber = `FC ${codeDepot} ${yearShort} ${sequence}`;

        // Créer le bon de Facture client
        const factureClient = new EnteteVentes({
            type: "FactureClient",
            numero: factureClientNumber,
            dateFacture: new Date(),
            client: new mongoose.Types.ObjectId(bl.client._id),
            depot: bl.depot,
            total_hors_Taxe: bl.total_hors_Taxe,
            total_ttc: bl.total_ttc,
            bonLivraisonClientReference: bl.numero,
            details: bl.details,
            anneeReference: year,
            lignes: bl.lignes
        });

        await factureClient.save();

        // Mettre à jour le statut du Bl
        bl.statut = "Facturée";
        bl.bonLivraisonClientReference = factureClientNumber;
        await bl.save();

        res.status(201).json({
            message: "LA facture client créé avec succès",
            factureClient
        });
    } catch (error) {
        console.error("Erreur lors de la création du facture client:", error);
        res.status(500).json({
            message: "Erreur lors de la création du facture client",
            error: error.message
        });
    }
};

//get all Factures 
const getAllFacture = async (req, res) => {
    try {
        // 1. Récupérer les entêtes de Facture
        const entetes = await EnteteVentes.find({ type: "FactureClient" })
            .populate('client')
            .lean();
        
        // 2. Récupérer toutes les lignes associées
        const ligneIds = entetes.flatMap(e => e.lignes);
        const lignes = await LigneVentes.find({ _id: { $in: ligneIds } })
            .populate('article')
            .lean();
        
        // 3. Reconstituer les Factures avec leurs lignes
        const factureComplets = entetes.map(entete => {
            const lignesFacture = lignes.filter(l => 
                entete.lignes.some(id => id.equals(l._id))
            );
            
            // Calcul des totaux
            const totals = lignesFacture.reduce((acc, ligne) => ({
                totalHT: acc.totalHT + (ligne.total_ht || 0),
                totalTTC: acc.totalTTC + (ligne.total_ttc || 0)
            }), { totalHT: 0, totalTTC: 0 });
            
            return {
                ...entete,
                lignes: lignesFacture,
                total_hors_Taxe: totals.totalHT,
                total_ttc: totals.totalTTC
            };
        });
        
        res.status(200).json(factureComplets);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

//Delete Facture 

const deleteFacture = async (req, res) => {
    try {
        const { id } = req.params;
        // Vérification de l'existence du facture
        const facture = await EnteteVentes.findById(id);
        if (!facture) {
            return res.status(404).json({ message: "facture non trouvé" });
        }

        // Supprimer le facture
        await EnteteVentes.findByIdAndDelete(id);

        // Supprimer les lignes associées
        await LigneVentes.deleteMany({ bon: id });

        res.status(200).json({ message: "facture supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
//Facture groupées pour +iers BL

const generateFacturesClientsGroupes = async (req, res) => {
    try {
        const { bonLivraisonIDs } = req.body; // Tableau d'IDs de BLs
        
        // Vérifier si des IDs ont été fournis
        if (!bonLivraisonIDs || !Array.isArray(bonLivraisonIDs) || bonLivraisonIDs.length === 0) {
            return res.status(400).json({ message: "Veuillez fournir un tableau d'IDs de bons de livraison" });
        }

        // Récupérer tous les BLs
        const bls = await EnteteVentes.find({
            _id: { $in: bonLivraisonIDs },
            type: "bonLivraisonClient",
            statut: { $ne: "Facturée" } // Ne prendre que les BLs non encore facturés
        })
        .populate('depot')
        .populate('client')
        .populate('lignes.article');

        // Vérifications
        if (bls.length === 0) {
            return res.status(404).json({ message: "Aucun bon de livraison valide trouvé" });
        }

        // Vérifier que tous les BLs concernent le même client et le même dépôt
        const clientId = bls[0].client._id;
        const depotId = bls[0].depot._id;
        
        const hasDifferentClientOrDepot = bls.some(bl => 
            !bl.client._id.equals(clientId) || !bl.depot._id.equals(depotId)
        );
        
        if (hasDifferentClientOrDepot) {
            return res.status(400).json({ 
                message: "Tous les bons de livraison doivent concerner le même client et le même dépôt" 
            });
        }

        // Récupérer le code du dépôt
        const codeDepot = bls[0].depot?.codeDepot || "DPT";

        // Extraire l'année de la date actuelle
        const year = new Date().getFullYear();
        const yearShort = year.toString().slice(-2);

        // Trouver ou créer un compteur pour les Factures de cette année
        let counter;
        try {
            counter = await CounterModel.findOneAndUpdate(
                { model: 'FactureClient', year: year },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
        } catch (error) {
            console.error("Erreur lors de la création ou de la mise à jour du compteur:", error);
            if (error.code === 11000) {
                counter = await CounterModel.findOne({ model: 'FactureClient', year: year });
                if (!counter) {
                    counter = new CounterModel({ model: 'FactureClient', year: year, seq: 1 });
                    await counter.save();
                }
            } else {
                throw error;
            }
        }

        // Formater la séquence sur 5 chiffres
        const sequence = String(counter.seq).padStart(5, '0');

        // Générer le numéro de la facture
        const factureClientNumber = `FC ${codeDepot} ${yearShort} ${sequence}`;

        // Calculer les totaux groupés
        const total_hors_Taxe = bls.reduce((sum, bl) => sum + (bl.total_hors_Taxe || 0), 0);
        const total_ttc = bls.reduce((sum, bl) => sum + (bl.total_ttc || 0), 0);

        // Fusionner toutes les lignes des BLs
        const allLignes = bls.flatMap(bl => bl.lignes);

        // Créer la facture client groupée
        const factureClient = new EnteteVentes({
            type: "FactureClient",
            numero: factureClientNumber,
            dateFacture: new Date(),
            client: new mongoose.Types.ObjectId(clientId),
            depot: bls[0].depot,
            total_hors_Taxe,
            total_ttc,
            details: `Facture groupée pour ${bls.length} bon(s) de livraison`,
            anneeReference: year,
            lignes: allLignes,
            bonLivraisonReferences: bls.map(bl => bl.numero) // Stocker les références des BLs
        });

        await factureClient.save();

        // Mettre à jour le statut de tous les BLs
        await EnteteVentes.updateMany(
            { _id: { $in: bls.map(bl => bl._id) } },
            { 
                statut: "Facturée",
                factureClientReference: factureClientNumber 
            }
        );

        res.status(201).json({
            message: `Facture client groupée créée avec succès pour ${bls.length} bon(s) de livraison`,
            factureClient,
            nombreBLsFactures: bls.length
        });
    } catch (error) {
        console.error("Erreur lors de la création de la facture client groupée:", error);
        res.status(500).json({
            message: "Erreur lors de la création de la facture client groupée",
            error: error.message
        });
    }
};


/*const getFacturesParClient = async (req, res) => {
  const { clientID } = req.params;

  if (!clientID) {
    return res.status(400).json({ message: "L'ID du client est requis." });
  }

  try {
    console.log("Recherche des factures pour le client:", clientID);

    const factures = await EnteteVentes.find({
        $or: [{ type: "FactureClient" }, { type: "Facture" }],
        client: clientID
      }).populate("client");

    if (!factures || factures.length === 0) {
      return res.status(404).json({ message: "Aucune facture trouvée pour cet client." });
    }

    res.status(200).json(factures);
  } catch (error) {
    console.error("Erreur lors de la récupération des factures par client :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des factures par client" });
  }
};*/
const getFacturesParClient = async (req, res) => {
    const { clientID } = req.params;
  
    if (!clientID) {
      return res.status(400).json({ message: "L'ID du client est requis." });
    }
  
    try {
      const factures = await EnteteVentes.find({ 
        type: "FactureClient",
        client: clientID 
      }).populate("client");
  
      // Return empty array instead of 404
      res.status(200).json(factures || []);
      
    } catch (error) {
      console.error("Erreur lors de la récupération des factures par client :", error);
      res.status(500).json({ message: "Erreur lors de la récupération des factures par client" });
    }
  };

 /* const getFacturesParClient = async (req, res) => {
    try {
      const { clientId } = req.params;
      if (!mongoose.Types.ObjectId.isValid(clientId)) {
        return res.status(400).json({ message: "ID de client invalide" });
      }
      const factures = await FactureC.find({ clientId }).lean();
      res.json(factures);
    } catch (error) {
      console.error("Erreur lors de la récupération des factures:", error);
      res.status(500).json({ message: "Erreur serveur" });
    }
  };*/
  
  //get bon de livraison non facturée 
  const getBonLivraisonNonFactures = async (req, res) => {
    const { clientID } = req.params;

    if (!clientID) {
        return res.status(400).json({ message: "L'ID du client est requis." });
    }

    try {
        // Récupérer tous les BL du client
        const bonsLivraison = await EnteteVentes.find({
            type: "bonLivraisonClient",
            client: clientID,
            statut: "Livrée" 
        }).populate("client depot");

        // Filtrer ceux qui n'ont pas de référence de facture
        const bonsNonFactures = bonsLivraison.filter(bl => 
            !bl.bonLivraisonClientReference && bl.statut !== "Facturée"
        );

        // Alternative: vérifier s'il existe une facture liée à ce BL
        // Cette méthode est plus fiable si vous voulez être absolument sûr
        const result = [];
        for (const bl of bonsLivraison) {
            const factureLiee = await EnteteVentes.findOne({
                type: "FactureClient",
                bonLivraisonClientReference: bl.numero
            });
            
            if (!factureLiee) {
                result.push(bl);
            }
        }

        res.status(200).json(result);
        
    } catch (error) {
        console.error("Erreur lors de la récupération des BL non facturés:", error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération des BL non facturés",
            error: error.message 
        });
    }
};

/*const getBonLivraisonNonFacturesAll = async (req, res) => {

   
    try {
        // Récupérer tous les BL du client
        const bonsLivraison = await EnteteVentes.find({
            type: "bonLivraisonClient",
            statut: "Livrée" 
        }).populate("client depot");

        // Filtrer ceux qui n'ont pas de référence de facture
        const bonsNonFactures = bonsLivraison.filter(bl => 
            !bl.bonLivraisonClientReference && bl.statut !== "Facturée"
        );

        // Alternative: vérifier s'il existe une facture liée à ce BL
        // Cette méthode est plus fiable si vous voulez être absolument sûr
        const result = [];
        for (const bl of bonsLivraison) {
            const factureLiee = await EnteteVentes.findOne({
                type: "FactureClient",
                bonLivraisonClientReference: bl.numero
            });
            
            if (!factureLiee) {
                result.push(bl);
            }
        }

        res.status(200).json(result);
        
    } catch (error) {
        console.error("Erreur lors de la récupération des BL non facturés:", error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération des BL non facturés",
            error: error.message 
        });
    }
};
*/

const getBonLivraisonNonFacturesAll = async (req, res) => {
    try {
        // Récupérer tous les BL du client avec statut "Livrée"
        const bonsLivraison = await EnteteVentes.find({
            type: "bonLivraisonClient",
            statut: "Livrée" 
        }).populate("client depot");

        // Vérifier pour chaque BL s'il existe une facture liée
        const result = [];
        for (const bl of bonsLivraison) {
            const factureLiee = await EnteteVentes.findOne({
                type: "FactureClient",
                bonLivraisonClientReference: bl.numero
            });
            
            if (!factureLiee) {
                result.push(bl);
            }
        }

        res.status(200).json(result);
        
    } catch (error) {
        console.error("Erreur lors de la récupération des BL non facturés:", error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération des BL non facturés",
            error: error.message 
        });
    }
};

module.exports={createDevis,getDevis,getDevisByID,deleteDevis,updateDevis, generateBonCommandeClient, getAllBonCommandes, generateBonLivraisonClient, getAllBonLivraisons, createBCC, getBCCByID, deleteBCC , createBL,generateFactureClient,getAllFacture,deleteFacture,getFacturesParClient,getBonLivraisonNonFactures,getBonLivraisonNonFacturesAll,generateFacturesClientsGroupes};

