const Vehicule = require('../Models/Ventes/Vehicule');
const mongoose = require('mongoose');
const CounterModel=require ("../Models/counters");

// Create a new Vehicule
const createVehicule = async (req, res) => {
  const { code, codeVehicule,libelle,matricule } = req.body;

  try {
    const counter = await CounterModel.findOneAndUpdate(
        { model: 'vehicule' }, // Rechercher le compteur pour le modèle 
        { $inc: { seq: 1 } }, // Incrémenter la séquence
        { new: true, upsert: true } // Créer le compteur s'il n'existe pas
    );

    if (!counter || !counter.seq) {
        return res.status(500).json({ message: 'Erreur lors de la génération du code vehicule.' });
    }

    const code = counter.seq; // Utilisez la séquence incrémentée comme code
    const newVehicule = await Vehicule.create({
      code,
      codeVehicule,
      libelle,
      matricule
    });

    res.status(201).json(newVehicule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all Vehicules
const getVehicules = async (req, res) => {
  try {
    const vehicules = await Vehicule.find();
    res.status(200).json(vehicules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single Vehicule by ID
const getVehiculeByID = async (req, res) => {
  const { id } = req.params;

  try {
    const vehicule = await Vehicule.findById(id);

    if (!vehicule) {
      return res.status(404).json({ message: 'Vehicule not found' });
    }

    res.status(200).json(vehicule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a Vehicule
const updateVehicule = async (req, res) => {
  const { id } = req.params;
  const {    codeVehicule,libelle,matricule } = req.body;

  try {
    const updatedVehicule = await Secteur.findByIdAndUpdate(
      id,
      {  codeVehicule,libelle,matricule },
      { new: true }
    );

    if (!updatedVehicule) {
      return res.status(404).json({ message: 'Vehicule not found' });
    }

    res.status(200).json(updatedVehicule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a Vehicule
const deleteVehicule = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedVehicule = await Vehicule.findByIdAndDelete(id);

    if (!deletedVehicule) {
      return res.status(404).json({ message: 'Vehicule not found' });
    }

    res.status(200).json({ message: 'Vehicule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    createVehicule,
    getVehicules,
    getVehiculeByID,
    updateVehicule,
    deleteVehicule,
};