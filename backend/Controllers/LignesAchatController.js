// controllers/ligneAchatFournisseur.js
const LigneFournisseur = require('../Models/Achat/LignesAchat');
const getLignesByBon = async (req, res) => {
    try {
        const lignes = await LigneFournisseur.find({ bon: req.params.bonId }).populate('article');
        res.status(200).json(lignes);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const createLigne = async (req, res) => {
    try {
        const ligne = new LigneFournisseur(req.body);
        const savedLigne = await ligne.save();
        res.status(201).json(savedLigne);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const updateLigne= async (req, res) => {
    try {
        const updatedLigne = await LigneFournisseur.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedLigne);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
const deleteLigne = async (req, res) => {
    try {
        await LigneFournisseur.findByIdAndDelete(req.params.id);
        res.status(204).json(); // Pas de contenu en cas de succès (204 No Content)
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
module.exports = {getLignesByBon,createLigne,updateLigne,deleteLigne};