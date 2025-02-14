// controllers/ligneCommandeFournisseur.js
const LigneCommandeFournisseur = require('../Models/Achat/LigneCommandeFournisseur');
const getLignesByBonCommande = async (req, res) => {
    try {
        const lignes = await LigneCommandeFournisseur.find({ bon_commande: req.params.bonCommandeId }).populate('article');
        res.status(200).json(lignes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const createLigneCommande = async (req, res) => {
    try {
        const ligneCommande = new LigneCommandeFournisseur(req.body);
        const savedLigneCommande = await ligneCommande.save();
        res.status(201).json(savedLigneCommande);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const updateLigneCommande = async (req, res) => {
    try {
        const updatedLigneCommande = await LigneCommandeFournisseur.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedLigneCommande);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const deleteLigneCommande = async (req, res) => {
    try {
        await LigneCommandeFournisseur.findByIdAndDelete(req.params.id);
        res.status(204).json(); // Pas de contenu en cas de succès (204 No Content)
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
module.exports = {
    getLignesByBonCommande,
    createLigneCommande,
    updateLigneCommande,
    deleteLigneCommande
};