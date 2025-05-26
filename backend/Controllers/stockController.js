const Stock = require('../Models/Stock/Stock');

// Récupérer tous les articles
exports.getAllArticles = async (req, res) => {
  try {
    const articles = await Stock.find();
    res.status(200).json(articles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un article par son ID
exports.getArticleById = async (req, res) => {
  try {
    const article = await Stock.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }
    res.status(200).json(article);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Créer un nouvel article
exports.createArticle = async (req, res) => {
  const article = new Stock({
    reference: req.body.reference,
    nom: req.body.nom,
    description: req.body.description,
    quantite: req.body.quantite,
    prixUnitaire: req.body.prixUnitaire,
    categorie: req.body.categorie
  });

  try {
    const newArticle = await article.save();
    res.status(201).json(newArticle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Mettre à jour un article
exports.updateArticle = async (req, res) => {
  try {
    const article = await Stock.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    article.reference = req.body.reference || article.reference;
    article.nom = req.body.nom || article.nom;
    article.description = req.body.description || article.description;
    article.quantite = req.body.quantite || article.quantite;
    article.prixUnitaire = req.body.prixUnitaire || article.prixUnitaire;
    article.categorie = req.body.categorie || article.categorie;
    article.dateModification = Date.now();

    const updatedArticle = await article.save();
    res.status(200).json(updatedArticle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un article
exports.deleteArticle = async (req, res) => {
  try {
    const article = await Stock.findById(req.params.id);
    if (!article) {
      return res.status(404).json({ message: 'Article non trouvé' });
    }

    await article.remove();
    res.status(200).json({ message: 'Article supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 