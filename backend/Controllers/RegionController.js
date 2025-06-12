const Region = require('../Models/Client/Region');
const Secteur = require('../Models/Client/Secteur');
const mongoose = require('mongoose');
const CounterModel=require ("../Models/counters");

// Create a new Region
const createRegion = async (req, res) => {
  const { codeRegion, libelle, secteur } = req.body;

  try {
    // Vérifier que le secteur existe
    const secteurExists = await Secteur.findById(secteur);
    if (!secteurExists) {
      return res.status(400).json({ message: 'Secteur non trouvé' });
    }

    const counter = await CounterModel.findOneAndUpdate(
        { model: 'region' }, // Rechercher le compteur pour le modèle
        { $inc: { seq: 1 } }, // Incrémenter la séquence
        { new: true, upsert: true } // Créer le compteur s'il n'existe pas
    );

    if (!counter || !counter.seq) {
        return res.status(500).json({ message: 'Erreur lors de la génération du code Region.' });
    }

    const code = counter.seq; // Utilisez la séquence incrémentée comme code
    const newRegion = await Region.create({
      code,
      codeRegion,
      libelle,
      secteur,
      secteurInfo: {
        code: secteurExists.code,
        codeSecteur: secteurExists.codeSecteur,
        libelle: secteurExists.libelle
      }
    });

    // Populate le secteur pour la réponse
    const populatedRegion = await Region.findById(newRegion._id).populate('secteur');
    res.status(201).json(populatedRegion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Regions
const getRegions = async (req, res) => {
  try {
    const regions = await Region.find().populate('secteur');
    res.status(200).json(regions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single Region by ID
const getRegionByID = async (req, res) => {
  const { id } = req.params;

  try {
    const region = await Region.findById(id).populate('secteur');

    if (!region) {
      return res.status(404).json({ message: 'Region not found' });
    }

    res.status(200).json(region);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a Region
const updateRegion = async (req, res) => {
  const { id } = req.params;
  const { libelle, codeRegion, secteur } = req.body;

  try {
    let updateData = { libelle, codeRegion };

    // Si un nouveau secteur est fourni, vérifier qu'il existe et mettre à jour les infos
    if (secteur) {
      const secteurExists = await Secteur.findById(secteur);
      if (!secteurExists) {
        return res.status(400).json({ message: 'Secteur non trouvé' });
      }

      updateData.secteur = secteur;
      updateData.secteurInfo = {
        code: secteurExists.code,
        codeSecteur: secteurExists.codeSecteur,
        libelle: secteurExists.libelle
      };
    }

    const updatedRegion = await Region.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('secteur');

    if (!updatedRegion) {
      return res.status(404).json({ message: 'Region not found' });
    }

    res.status(200).json(updatedRegion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a Region
const deleteRegion = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedRegion = await Region.findByIdAndDelete(id);

    if (!deletedRegion) {
      return res.status(404).json({ message: 'Region not found' });
    }

    res.status(200).json({ message: 'Region deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    createRegion,
    getRegions,
    getRegionByID,
    updateRegion,
    deleteRegion,
};