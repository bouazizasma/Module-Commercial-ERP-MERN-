const Fournisseur = require("../Models/Fournisseur");
const CounterModel=require ("../Models/counters");
const mongoose = require('mongoose');

const getFournisseurs = async (req, res) => { 
    try {
        const f = await Fournisseur.find();
                
        res.status(200).json(f);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}
const check_fournisseur = async (req, res) => {
    const { matricule_fiscale } = req.query;

    try {
        const fournisseurExist = await Fournisseur.findOne({ where: { matricule_fiscale } });
        if (fournisseurExist) {
            return res.status(409).json({ message: 'Le fournisseur avec ce matricule fiscal existe déjà.' });
        }
        return res.status(200).json({ message: 'Le fournisseur n\'existe pas.' });
    } catch (error) {
        console.error("Erreur lors de la vérification du fournisseur:", error);
        res.status(500).json({ message: 'Erreur du serveur.' });
    }
}
const createFournisseur = async (req, res) => {
    const { 
        raison_sociale, matricule_fiscale, adresse, telephone, fax, 
        register_commerce, solde_initial, montant_rapprochement, code_rapprochement, 
        rapebe, solde_initial_ebe, montant_paie_ebe, taux_retenu 
    } = req.body;

    try {
        console.log("Données reçues :", req.body);

        // Vérifiez si un fournisseur existe déjà avec le même matricule_fiscale
        const existingFournisseur = await Fournisseur.findOne({ matricule_fiscale });
        if (existingFournisseur) {
            return res.status(409).json({ message: 'Le fournisseur avec ce matricule fiscal existe déjà.' });
        }

        // Récupérez et incrémentez le compteur pour générer le champ `code`
        const counter = await CounterModel.findOneAndUpdate(
            { model: 'fournisseur' }, // Rechercher le compteur pour le modèle fournisseur
            { $inc: { seq: 1 } }, // Incrémenter la séquence
            { new: true, upsert: true } // Créer le compteur s'il n'existe pas
        );

        if (!counter || !counter.seq) {
            return res.status(500).json({ message: 'Erreur lors de la génération du code fournisseur.' });
        }

        const code = counter.seq; // Utilisez la séquence incrémentée comme code

        // Créez un nouveau fournisseur avec le code généré
        const newFournisseur = await Fournisseur.create({
            code, // Ajoutez le code ici
            raison_sociale, matricule_fiscale, adresse, telephone, fax, 
            register_commerce, solde_initial, montant_rapprochement, code_rapprochement, 
            rapebe, solde_initial_ebe, montant_paie_ebe, taux_retenu
        });

        console.log("Fournisseur créé avec succès :", newFournisseur);
        res.status(201).json(newFournisseur);

    } catch (error) {
        console.error("Erreur lors de la création du fournisseur :", error);
        res.status(500).json({ message: 'Erreur lors de la création du fournisseur.', error: error.message });
    }
};
 const getFournisseurByID = async (req, res) => { 
    try {
        const f = await Fournisseur.findById(req.params.id);
        
        res.status(200).json(f);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const updateFournisseur= async (req, res) => {
    const { id } = req.params;
    const {raison_sociale, matricule_fiscale ,adresse,telephone,fax,register_commerce,solde_initial,montant_rapprochement,code_rapprochement,rap_ebe,solde_initial_ebe,montant_paie_ebe,taux_retenu} = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`pas de Fournisseur avec un id: ${id}`);
    const f1 = {  raison_sociale:raison_sociale, matricule_fiscale:matricule_fiscale ,adresse:adresse,telephone:telephone,fax:fax,register_commerce:register_commerce,solde_initial:solde_initial,montant_rapprochement:montant_rapprochement,code_rapprochement:code_rapprochement,rap_ebe:rap_ebe,solde_initial_ebe:solde_initial_ebe,montant_paie_ebe:montant_paie_ebe,taux_retenu:taux_retenu, _id: id };
    await Fournisseur.findByIdAndUpdate(id, f1);

    res.json(f1);
}


const deleteFournisseur = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Attempting to delete Fournisseur with ID: ${id}`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).send(`Pas de fournisseur avec l'ID: ${id}`);
        }

        const result = await Fournisseur.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).send(`Fournisseur non trouvé pour l'ID: ${id}`);
        }

        res.json({ message: 'Fournisseur supprimé avec succès.' });
    } catch (error) {
        console.error('Error deleting fournisseur:', error);
        res.status(500).json({ message: 'Erreur du serveur.', error });
    }
};

module.exports={getFournisseurs, getFournisseurByID, createFournisseur, updateFournisseur, deleteFournisseur,check_fournisseur};