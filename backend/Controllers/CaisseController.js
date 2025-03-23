const Caisse = require('../Models/Achat/Caisse');

// Créer une nouvelle caisse
const createCaisse = async (req, res) => {
  try {
    const { libelle } = req.body;

    const caisse = new Caisse({
      libelle,
     
    });
    const nouvelleCaisse = await caisse.save();
    res.status(201).json(nouvelleCaisse);
  } catch (error) {
    if (error.code === 11000) { // Code d'erreur MongoDB pour violation d'unicité
      return res.status(400).json({ message: "Une caisse avec ce libellé existe déjà" });
    }
    res.status(500).json({ message: error.message });
  }
};
// Récupérer toutes les caisses
const getAllCaisses = async (req, res) => {
  try {
    const caisses = await Caisse.find().sort({ date_creation: -1 });
    res.status(200).json(caisses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer une caisse par ID
const getCaisseById = async (req, res) => {
  try {
    const caisse = await Caisse.findById(req.params.id);
    if (!caisse) {
      return res.status(404).json({ message: "Caisse non trouvée" });
    }
    res.status(200).json(caisse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Mettre à jour une caisse
const updateCaisse = async (req, res) => {
  try {
    const { libelle, statut } = req.body;
    const caisse = await Caisse.findById(req.params.id);
    
    if (!caisse) {
      return res.status(404).json({ message: "Caisse non trouvée" });
    }

    caisse.libelle = libelle || caisse.libelle;

    const caisseModifiee = await caisse.save();
    res.status(200).json(caisseModifiee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "Une caisse avec ce libellé existe déjà" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une caisse
const deleteCaisse = async (req, res) => {
  try {
    const caisse = await Caisse.findById(req.params.id);
    if (!caisse) {
      return res.status(404).json({ message: "Caisse non trouvée" });
    }

    if (caisse.solde !== 0) {
      return res.status(400).json({ 
        message: "Impossible de supprimer une caisse avec un solde non nul" 
      });
    }

    await Caisse.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Caisse supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createCaisse,
  getAllCaisses,
  getCaisseById,
  updateCaisse,
  deleteCaisse,
};
