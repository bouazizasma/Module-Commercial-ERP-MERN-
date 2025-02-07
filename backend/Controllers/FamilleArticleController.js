const FamilleArticle = require('../Models/Article/FamilleArticle');
const mongoose = require('mongoose');
const CounterModel=require ("../Models/counters");

// Create a new FamilleArticle
const createFamilleArticle = async (req, res) => {
  const {  code, designationFamille } = req.body;

  try {
    const counter = await CounterModel.findOneAndUpdate(
        { model: 'familleArticle' }, // Rechercher le compteur pour le modèle 
        { $inc: { seq: 1 } }, // Incrémenter la séquence
        { new: true, upsert: true } // Créer le compteur s'il n'existe pas
    );

    if (!counter || !counter.seq) {
        return res.status(500).json({ message: 'Erreur lors de la génération du code Article.' });
    }
    const code = counter.seq; 
    const newFamilleArticle = await FamilleArticle.create({
      code,
      designationFamille,
    });

    res.status(201).json(newFamilleArticle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all FamilleArticles
const getFamilleArticles = async (req, res) => {
  try {
    const familleArticles = await FamilleArticle.find();
    res.status(200).json(familleArticles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single FamilleArticle by ID
const getFamilleArticleByID = async (req, res) => {
  const { id } = req.params;

  try {
    const familleArticle = await FamilleArticle.findById(id);

    if (!familleArticle) {
      return res.status(404).json({ message: 'FamilleArticle not found' });
    }

    res.status(200).json(familleArticle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a FamilleArticle
const updateFamilleArticle = async (req, res) => {
  const { id } = req.params;
  const {  designationFamille } = req.body;

  try {
    const updatedFamilleArticle = await FamilleArticle.findByIdAndUpdate(
      id,
      {   designationFamille },
      { new: true }
    );

    if (!updatedFamilleArticle) {
      return res.status(404).json({ message: 'FamilleArticle not found' });
    }

    res.status(200).json(updatedFamilleArticle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a FamilleArticle
const deleteFamilleArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedFamilleArticle = await FamilleArticle.findByIdAndDelete(id);

    if (!deletedFamilleArticle) {
      return res.status(404).json({ message: 'FamilleArticle not found' });
    }

    res.status(200).json({ message: 'FamilleArticle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createFamilleArticle,
  getFamilleArticles,
  getFamilleArticleByID,
  updateFamilleArticle,
  deleteFamilleArticle,
};