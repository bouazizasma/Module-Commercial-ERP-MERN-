// stockCheckMiddleware.js
const Article = require('../Models/Article/article');
const Notification = require('../Models/notification');

const checkStockLevels = async (req, res, next) => {
    try {
        const lowStockArticles = await Article.find({
            $expr: { $lte: ["$Nombre_unite", "$quantiteMin"] }
        });

        // Créer des notifications pour les articles en rupture
        await Promise.all(lowStockArticles.map(async (article) => {
            const existingNotification = await Notification.findOne({
                articleId: article._id,
                read: false
            });

            if (!existingNotification) {
                await Notification.create({
                    message: `Stock faible pour l'article ${article.code} - ${article.libelle}. Stock actuel: ${article.Nombre_unite}, Minimum: ${article.quantiteMin}`,
                    articleId: article._id,
                    type: 'stock'
                });
            }
        }));

        next();
    } catch (error) {
        console.error("Erreur lors de la vérification des stocks:", error);
        next();
    }
};

module.exports = checkStockLevels;