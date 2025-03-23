const Banque = require('../Models/Achat/Banque');

// Créer une nouvelle banque
 const createBanque = async (req, res) => {
  try {
    const banque = new Banque(req.body);
    const nouvelleBanque = await banque.save();
    res.status(201).json(nouvelleBanque);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Récupérer toutes les banques
const getAllBanques = async (req, res) => {
  try {
    const banques = await Banque.find();
    res.status(200).json(banques);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Récupérer une banque par ID
const getBanqueByID = async (req, res) => {
  try {
    const banque = await Banque.findById(req.params.id);
    if (!banque) {
      return res.status(404).json({ message: "Banque non trouvée" });
    }
    res.status(200).json(banque);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Mettre à jour une banque
const  updateBanque = async (req, res) => {
  try {
    const banque = await Banque.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!banque) {
      return res.status(404).json({ message: "Banque non trouvée" });
    }
    res.status(200).json(banque);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une banque
const deleteBanque = async (req, res) => {
  try {
    const banque = await Banque.findByIdAndDelete(req.params.id);
    if (!banque) {
      return res.status(404).json({ message: "Banque non trouvée" });
    }
    res.status(200).json({ message: "Banque supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports={createBanque,getAllBanques,getBanqueByID,updateBanque,deleteBanque};