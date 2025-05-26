const express = require('express');
const router = express.Router();
const stockController = require('../../Controllers/stockController');

// Routes pour la gestion du stock
router.get('/', stockController.getAllArticles);
router.get('/:id', stockController.getArticleById);
router.post('/', stockController.createArticle);
router.put('/:id', stockController.updateArticle);
router.delete('/:id', stockController.deleteArticle);

module.exports = router; 