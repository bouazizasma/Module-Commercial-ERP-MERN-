const CategorieArticle = require('../Models/Article/CategorieArticle');
const mongoose = require('mongoose');
const CounterModel=require ("../Models/counters");

// Create a new CategorieArticle
const createCategorieArticle = async (req, res) => {
  const { code, designationCategorie } = req.body;

  try {
    const counter = await CounterModel.findOneAndUpdate(
        { model: 'categorieArticle' }, // Rechercher le compteur pour le modèle 
        { $inc: { seq: 1 } }, // Incrémenter la séquence
        { new: true, upsert: true } // Créer le compteur s'il n'existe pas
    );

    if (!counter || !counter.seq) {
        return res.status(500).json({ message: 'Erreur lors de la génération du code Article.' });
    }

    const code = counter.seq; // Utilisez la séquence incrémentée comme code
    const newCategorieArticle = await CategorieArticle.create({
      code,
      designationCategorie,
    });

    res.status(201).json(newCategorieArticle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all CategorieArticles
const getCategorieArticles = async (req, res) => {
  try {
    const categorieArticles = await CategorieArticle.find();
    res.status(200).json(categorieArticles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single CategorieArticle by ID
const getCategorieArticleByID = async (req, res) => {
  const { id } = req.params;

  try {
    const categorieArticle = await CategorieArticle.findById(id);

    if (!categorieArticle) {
      return res.status(404).json({ message: 'CategorieArticle not found' });
    }

    res.status(200).json(categorieArticle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a CategorieArticle
const updateCategorieArticle = async (req, res) => {
  const { id } = req.params;
  const {   designationCategorie } = req.body;

  try {
    const updatedCategorieArticle = await CategorieArticle.findByIdAndUpdate(
      id,
      {   designationCategorie },
      { new: true }
    );

    if (!updatedCategorieArticle) {
      return res.status(404).json({ message: 'CategorieArticle not found' });
    }

    res.status(200).json(updatedCategorieArticle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a CategorieArticle
const deleteCategorieArticle = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategorieArticle = await CategorieArticle.findByIdAndDelete(id);

    if (!deletedCategorieArticle) {
      return res.status(404).json({ message: 'CategorieArticle not found' });
    }

    res.status(200).json({ message: 'CategorieArticle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCategorieArticle,
  getCategorieArticles,
  getCategorieArticleByID,
  updateCategorieArticle,
  deleteCategorieArticle,
};