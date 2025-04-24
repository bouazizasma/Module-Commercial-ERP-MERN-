const Region = require('../Models/Client/Region');
const mongoose = require('mongoose');
const CounterModel=require ("../Models/counters");

// Create a new Region
const createRegion = async (req, res) => {
  const { code, codeRegion, libelle } = req.body;

  try {
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
    });

    res.status(201).json(newRegion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Regions
const getRegions = async (req, res) => {
  try {
    const regions = await Region.find();
    res.status(200).json(regions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single Region by ID
const getRegionByID = async (req, res) => {
  const { id } = req.params;

  try {
    const region = await Region.findById(id);

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
  const {   libelle, codeRegion } = req.body;

  try {
    const updatedRegion = await Region.findByIdAndUpdate(
      id,
      {   libelle, codeRegion },
      { new: true }
    );

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