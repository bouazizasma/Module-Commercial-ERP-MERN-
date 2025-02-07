const Client = require("../Models/Client");
const CounterModel=require ("../Models/counters");
const mongoose = require('mongoose');

const getClients = async (req, res) => { 
    try {
        const f = await Client.find();
                
        res.status(200).json(f);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

const createClient = async (req, res) => {
    const { 
        nom_prenom,matricule_fiscale,adresse,telephone,register_commerce,solde_initial,
        montant_rapprochement,code_rapprochement,rapBl,solde_initial_bl,
        montant_reglement_bl,taux_retenu} = req.body;

    try {
        console.log("Données reçues :", req.body);

        // Récupérez et incrémentez le compteur pour générer le champ `code`
        const counter = await CounterModel.findOneAndUpdate(
            { model: 'client' }, // Rechercher le compteur pour le modèle fournisseur
            { $inc: { seq: 1 } }, // Incrémenter la séquence
            { new: true, upsert: true } // Créer le compteur s'il n'existe pas
        );

        if (!counter || !counter.seq) {
            return res.status(500).json({ message: 'Erreur lors de la génération du code Client.' });
        }

        const code = counter.seq; // Utilisez la séquence incrémentée comme code

        // Créez un nouveau Client avec le code généré
        const newClient = await Client.create({
            code, // Ajoutez le code ici
            nom_prenom,matricule_fiscale,adresse,telephone,register_commerce,solde_initial,montant_rapprochement,code_rapprochement,rapBl,solde_initial_bl,montant_reglement_bl,taux_retenu        });

        console.log("Client créé avec succès :", newClient);
        res.status(201).json(newClient);

    } catch (error) {
        console.error("Erreur lors de la création du Client :", error);
        res.status(500).json({ message: 'Erreur lors de la création du Client.', error: error.message });
    }
};
 const getClientByID = async (req, res) => { 
    try {
        const f = await Client.findById(req.params.id);
        
        res.status(200).json(f);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}

 const updateClient= async (req, res) => {
    const { id } = req.params;
    const {  nom_prenom,matricule_fiscale,adresse,telephone,register_commerce,solde_initial,montant_rapprochement,code_rapprochement,rapBl,solde_initial_bl,montant_reglement_bl,taux_retenu} = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`pas de Client avec un id: ${id}`);

    const c1 = {  nom_prenom:nom_prenom,matricule_fiscale:matricule_fiscale,adresse:adresse,telephone:telephone,register_commerce:register_commerce,solde_initial:solde_initial,montant_rapprochement:montant_rapprochement,code_rapprochement:code_rapprochement,rapBl:rapBl,solde_initial_bl:solde_initial_bl,montant_reglement_bl:montant_reglement_bl,taux_retenu:taux_retenu, _id: id };

    await Client.findByIdAndUpdate(id, c1);

    res.json(c1);
}

const deleteClient = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Attempting to delete Client with ID: ${id}`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).send(`Pas de Client avec l'ID: ${id}`);
        }

        const result = await Client.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).send(`Client non trouvé pour l'ID: ${id}`);
        }

        res.json({ message: 'Client supprimé avec succès.' });
    } catch (error) {
        console.error('Error deleting Client:', error);
        res.status(500).json({ message: 'Erreur du serveur.', error });
    }
};

module.exports={getClients, getClientByID, createClient, updateClient, deleteClient};