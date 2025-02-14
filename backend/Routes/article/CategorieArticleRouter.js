const express = require('express');
const router = express.Router();
const {
  createCategorieArticle,
  getCategorieArticles,
  getCategorieArticleByID,
  updateCategorieArticle,
  deleteCategorieArticle,
} = require('../../Controllers/CategorieArticleController');

// Create a new CategorieArticle
router.post('/newCA', createCategorieArticle);

// Get all CategorieArticles
router.get('/CategorieArticles', getCategorieArticles);

// Get a single CategorieArticle by ID
router.get('/:id', getCategorieArticleByID);

// Update a CategorieArticle
router.put('/:id', updateCategorieArticle);

// Delete a CategorieArticle
router.delete('/:id', deleteCategorieArticle);

module.exports = router;