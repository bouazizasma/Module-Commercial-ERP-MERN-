const express = require('express');
const router = express.Router();
const {
  createFamilleArticle,
  getFamilleArticles,
  getFamilleArticleByID,
  updateFamilleArticle,
  deleteFamilleArticle,
} = require('../../Controllers/FamilleArticleController');

// Create a new FamilleArticle
router.post('/NewFA', createFamilleArticle);

// Get all FamilleArticles
router.get('/familleArticle', getFamilleArticles);

// Get a single FamilleArticle by ID
router.get('/:id', getFamilleArticleByID);

// Update a FamilleArticle
router.put('/:id', updateFamilleArticle);

// Delete a FamilleArticle
router.delete('/:id', deleteFamilleArticle);

module.exports = router;