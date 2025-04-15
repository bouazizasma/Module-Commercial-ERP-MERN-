const Secteur = require('../Models/Client/Secteur');
const mongoose = require('mongoose');
const CounterModel=require ("../Models/counters");

// Create a new secteur
const createSecteur = async (req, res) => {
  const { code, codeSecteur, libelle } = req.body;

  try {
    const counter = await CounterModel.findOneAndUpdate(
        { model: 'secteur' }, // Rechercher le compteur pour le modèle 
        { $inc: { seq: 1 } }, // Incrémenter la séquence
        { new: true, upsert: true } // Créer le compteur s'il n'existe pas
    );

    if (!counter || !counter.seq) {
        return res.status(500).json({ message: 'Erreur lors de la génération du code Secteur.' });
    }

    const code = counter.seq; // Utilisez la séquence incrémentée comme code
    const newSecteur = await Secteur.create({
      code,
      codeSecteur,
      libelle,
    });

    res.status(201).json(newSecteur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all secteurs
const getSecteurs = async (req, res) => {
  try {
    const secteurs = await Secteur.find();
    res.status(200).json(secteurs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single secteur by ID
const getSecteurByID = async (req, res) => {
  const { id } = req.params;

  try {
    const secteur = await Secteur.findById(id);

    if (!secteur) {
      return res.status(404).json({ message: 'secteur not found' });
    }

    res.status(200).json(secteur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a Secteur
const updateSecteur = async (req, res) => {
  const { id } = req.params;
  const {   libelle, codeSecteur } = req.body;

  try {
    const updatedSecteur = await Secteur.findByIdAndUpdate(
      id,
      {   libelle, codeSecteur },
      { new: true }
    );

    if (!updatedSecteur) {
      return res.status(404).json({ message: 'Secteur not found' });
    }

    res.status(200).json(updatedSecteur);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a Secteur
const deleteSecteur = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedSecteur = await Secteur.findByIdAndDelete(id);

    if (!deletedSecteur) {
      return res.status(404).json({ message: 'secteur not found' });
    }

    res.status(200).json({ message: 'secteur deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    createSecteur,
    getSecteurs,
    getSecteurByID,
    updateSecteur,
    deleteSecteur,
};