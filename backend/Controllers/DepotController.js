const Depot = require('../Models/depot');
const CounterModel = require('../Models/counters');
const mongoose = require('mongoose');


//create
const createDepot = async (req, res) => {
    const { libelle } = req.body;
    try {
        // 1. Extraire les deux premiers chiffres en fonction de la libelle
        let codeDepot;

        // Vérifier que libelle est bien fourni
        if (!libelle) {
            return res.status(400).json({ message: "Le champ 'libelle' est requis." });
        }
        // Assigner le codeDepot selon le libellé
        if (libelle.toLowerCase().includes("depot pr")) { //principal
            codeDepot = "01";
        } else if (libelle.toLowerCase().includes("depot aff")) {// affiliée
            codeDepot = "02";
        } else {
            codeDepot = "01"; // Par défaut
        }
        // 2. Extraire les deux chiffres de l'année en cours
      /*  const year = new Date().getFullYear().toString().slice(-2); // "25" pour 2025

        // 3. Générer les cinq derniers chiffres en incrémentant un compteur
        const counter = await CounterModel.findOneAndUpdate(
            { model: 'depot' }, // Rechercher le compteur pour le modèle depot
            { $inc: { seq: 1 } }, // Incrémenter la séquence
            { new: true, upsert: true } // Créer le compteur s'il n'existe pas
        );

        if (!counter || !counter.seq) {
            return res.status(500).json({ message: 'Erreur lors de la génération du code Depot.' });
        }

        // Formater les cinq derniers chiffres avec des zéros à gauche
        const sequence = String(counter.seq).padStart(5, '0'); // "00001", "00002", etc.

        // 4. Construire le code final
        const code = `${prefix}${year}${sequence}`; // Exemple : "012500001" */
       // const codeDepot = `${prefix}`; // Exemple : "012500001"

        const counter = await CounterModel.findOneAndUpdate(
            { model: 'depot' }, // Rechercher le compteur pour le modèle fournisseur
            { $inc: { seq: 1 } }, // Incrémenter la séquence
            { new: true, upsert: true } // Créer le compteur s'il n'existe pas
        );

        if (!counter || !counter.seq) {
            return res.status(500).json({ message: 'Erreur lors de la génération du code Depot.' });
        }

        const code = counter.seq; // Utilisez la séquence incrémentée comme code

        // 5. Créer le nouveau dépôt
        const newDepot = await Depot.create({
            code,
            codeDepot,
            libelle,
        });

        res.status(201).json(newDepot);
    } catch (error) {
        console.error("Erreur lors de la création du Depot :", error);
        res.status(500).json({ message: 'Erreur lors de la création du Depot.', error: error.message });
    }
};
//getAll
const getDepots = async (req, res) => { 
    try {
        const d = await Depot.find();
                
        res.status(200).json(d);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

//Get Depot By ID
const getDepotByID = async (req, res) => { 
    try {
        const d = await Depot.findById(req.params.id);
        
        res.status(200).json(d);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}
const deleteDepot = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Attempting to delete Depot with ID: ${id}`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).send(`Pas de Depot avec l'ID: ${id}`);
        }

        const result = await Depot.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).send(`Depot non trouvé pour l'ID: ${id}`);
        }

        res.json({ message: 'Depot supprimé avec succès.' });
    } catch (error) {
        console.error('Error deleting Depot:', error);
        res.status(500).json({ message: 'Erreur du serveur.', error });
    }
};
/*const updateDepot= async (req, res) => {
    const { id } = req.params;
    const { codeDepot,libelle} = req.body;

    
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`pas de Depot avec un id: ${id}`);

    const d1 = { libelle  };

    await Depot.findByIdAndUpdate(id, d1);

    res.json(d1);
} */


module.exports = { createDepot,getDepots ,getDepotByID,deleteDepot};