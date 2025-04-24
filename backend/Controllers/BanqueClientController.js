const BanqueClient = require('../Models/Client/BanqueClient');

// Créer une nouvelle banque
 const createBanque = async (req, res) => {
  try {
    const banque = new BanqueClient(req.body);
    const nouvelleBanque = await banque.save();
    res.status(201).json(nouvelleBanque);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/*const createBanque = async (req, res) => {
    try {
      // Validate required fields
      if (!req.body.code_banque || !req.body.libelle) {
        return res.status(400).json({ 
          message: 'Code banque and libelle are required',
          receivedData: req.body 
        });
      }
  
      const banque = new Banque(req.body);
      const nouvelleBanque = await banque.save();
      res.status(201).json(nouvelleBanque);
    } catch (error) {
      console.error('Error saving banque:', error);
      res.status(400).json({ 
        message: error.message,
        errors: error.errors // Include Mongoose validation errors if any
      });
    }
  }; */


// Récupérer toutes les banques
const getAllBanques = async (req, res) => {
  try {
    const banques = await BanqueClient.find();
    res.status(200).json(banques);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Récupérer une banque par ID
const getBanqueByID = async (req, res) => {
  try {
    const banque = await BanqueClient.findById(req.params.id);
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
    const banque = await BanqueClient.findByIdAndUpdate(
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
    const banque = await BanqueClient.findByIdAndDelete(req.params.id);
    if (!banque) {
      return res.status(404).json({ message: "Banque non trouvée" });
    }
    res.status(200).json({ message: "Banque supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Méthode pour récupérer les banques d'un client spécifique
const getBanqueParClient = async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Vérifier si l'ID du client est fourni
    if (!clientId) {
      return res.status(400).json({ message: "L'ID du client est requis" });
    }

    // Rechercher les banques associées à ce client
    const banques = await BanqueClient.find({ client: clientId })
      .populate('client', 'nom_prenom') // Optionnel: peupler les infos du client
      .populate('banque', 'nom code_banque'); // Optionnel: peupler les infos de la banque

    if (!banques || banques.length === 0) {
      return res.status(404).json({ message: "Aucune banque trouvée pour ce client" });
    }

    res.status(200).json(banques);
  } catch (error) {
    res.status(500).json({ 
      message: "Erreur lors de la récupération des banques du client",
      error: error.message 
    });
  }
};
module.exports={createBanque,getAllBanques,getBanqueByID,updateBanque,deleteBanque,getBanqueParClient};