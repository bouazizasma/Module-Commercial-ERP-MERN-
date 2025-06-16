const CategorieArticle = require('../Models/Article/CategorieArticle');
const mongoose = require('mongoose');
const FamilleArticle = require('../Models/Article/FamilleArticle')
const CounterModel=require ("../Models/counters");

// Create a new CategorieArticle
const createCategorieArticle = async (req, res) => {
  const { code, designationCategorie , famillearticle} = req.body;
 const FamilleExists = await FamilleArticle.findById(famillearticle);
    if (!FamilleExists) {
      return res.status(400).json({ message: 'famille non trouvé' });
    }
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
      famillearticle,
      famillearticleInfo:{
         code: FamilleExists.code,
        designationFamille: FamilleExists.designationFamille
      }
    });

    const populatedCategorie = await CategorieArticle.findById(newCategorieArticle._id).populate('famillearticle');

    res.status(201).json(populatedCategorie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all CategorieArticles
const getCategorieArticles = async (req, res) => {
  try {
    const categorieArticles = await CategorieArticle.find().populate('famillearticle');
    res.status(200).json(categorieArticles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get a single CategorieArticle by ID
const getCategorieArticleByID = async (req, res) => {
  const { id } = req.params;

  try {
    const categorieArticle = await CategorieArticle.findById(id).populate('famillearticle');

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
  try {
    const { id } = req.params;
    const { designationCategorie, familleArticle } = req.body;

    console.log('Updating category:', id, req.body); // Debug log

    const updateData = { designationCategorie };
    
    if (familleArticle) {
      const familleExists = await FamilleArticle.findById(familleArticle);
      if (!familleExists) {
        return res.status(400).json({ 
          message: 'Famille Article non trouvée',
          details: `ID ${familleArticle} introuvable`
        });
      }

      updateData.familleArticle = familleArticle;
      updateData.familleArticleInfo = {
        designationFamille: familleExists.designationFamille,
        code: familleExists.code
      };
    }

    const updatedCategorie = await CategorieArticle.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('familleArticle');

    if (!updatedCategorie) {
      return res.status(404).json({ message: 'Catégorie non trouvée' });
    }

    res.status(200).json(updatedCategorie);
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({
      message: 'Erreur serveur',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
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