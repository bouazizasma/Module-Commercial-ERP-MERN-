const CounterModel=require ("../Models/counters");
const Article =require("../Models/Article/article");
const FamilleArticleModel =require("../Models/Article/FamilleArticle");
const CategorieArticleModel=require ("../Models/Article/CategorieArticle");
const FournisseurModel = require ("../Models/Fournisseur");
const mongoose = require('mongoose');
const upload = require("../Middlewares/multerConfig");
//all
const getArticles = async (req, res) => { 
    try {
        const a = await Article.find();
        res.status(200).json(a);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};
//Create
const createArticle = async (req, res) => {
    const {
        libelle,
        libelleFamille,
        Nombre_unite,
        tva,
        type,
        prix_brut,
        remise,
        prix_net,
        marge,
        prixht,
        prix_totale_concré,
        gestion_configuration,
        configuration,
        serie, // <- Ici
        libeleCategorie,
        lib_fournisseur,
        Nature,
        prixmin,
        prixmax,
        user_Connectée,
        action_user_connecté,
        date_modif,
        time_modif,
        prix_achat_initiale,
        tva_achat,
        dimension_article, // <- Ici
        longueur,
        largeur,
        hauteur,
        movement_article,
    } = req.body;

    try {
        // Vérifier si les références existent
        const familleArticle = await FamilleArticleModel.findById(libelleFamille);
        const categorieArticle = await CategorieArticleModel.findById(libeleCategorie);
        const fournisseur = await FournisseurModel.findById(lib_fournisseur);

        if (!familleArticle || !categorieArticle || !fournisseur) {
            return res.status(404).json({ message: "Référence non trouvée (Famille, Catégorie ou Fournisseur)" });
        }

        // Récupérer l'image depuis req.file (géré par multer)
        const image_article = req.file ? req.file.buffer : null;
        
        // Convertir les booléens en nombres
        const parsedSerie = serie === "true" || serie === true ? 1 : 0;
        const parsedDimension = dimension_article === "true" || dimension_article === true ? 1 : 0;

        // Récupérer et incrémenter le compteur pour générer le champ `code`
        const counter = await CounterModel.findOneAndUpdate(
            { model: "article" },
            { $inc: { seq: 1 } },
            { new: true, upsert: true }
        );

        if (!counter || !counter.seq) {
            return res.status(500).json({ message: "Erreur lors de la génération du code Article." });
        }

        const code = counter.seq;

        // Créer un nouvel article
        const newArticle = await Article.create({
            code,
            libelle,
            libelleFamille,
            Nombre_unite,
            tva,
            type,
            prix_brut,
            remise,
            prix_net,
            marge,
            prixht,
            prix_totale_concre,
            gestion_configuration,
            configuration,
            serie: parsedSerie, // <- Correction ici
            libeleCategorie,
            lib_fournisseur,
            Nature,
            image_article,
            prixmin,
            prixmax,
            user_Connectée,
            action_user_connecté,
            date_modif,
            time_modif,
            prix_achat_initiale,
            tva_achat,
            dimension_article: parsedDimension, // <- Correction ici
            longueur,
            largeur,
            hauteur,
            movement_article,
        });

        console.log("Article créé avec succès :", newArticle);
        res.status(201).json(newArticle);
    } catch (error) {
        console.error("Erreur lors de la création du Article :", error);
        res.status(500).json({ message: "Erreur lors de la création du Article.", error: error.message });
    }
};
//GetbyID
 const getArticleByID = async (req, res) => { 
    try {
        const article = await Article.findById(req.params.id)
        .populate('codeFamille')
        .populate('codeCategorie')
        ;
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
          }
        
        res.status(200).json(article);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};
//update
 const updateArticle= async (req, res) => {
    const { id } = req.params;
    const {  libelle,libelleFamille,Nombre_unite,tva,type,prix_brut,remise,prix_net,marge,prixht,prix_totale_concré,gestion_configuration,configuration,serie,libeleCategorie,lib_fournisseur,Nature,image_article,prixmin,prixmax,user_Connectée,action_user_connecté,date_modif,time_modif,prix_achat_initiale,tva_achat,dimension_article,longueur,largeur,hauteur,movement_article} = req.body;
    
    const familleArticle = await FamilleArticleModel.findById(codeFamile);
    const categorieArticle = await CategorieArticleModel.findById(codeCategorie);

    if (!familleArticle || !categorieArticle) {
      return res.status(404).json({ message: 'Referenced FamilleArticle or CategorieArticle not found' });
    }
    const a1 = { libelle,libelleFamille,Nombre_unite,tva,type,prix_brut,remise,prix_net,marge,prixht,prix_totale_concré,gestion_configuration,configuration,serie,libeleCategorie,lib_fournisseur,Nature,image_article,prixmin,prixmax,user_Connectée,action_user_connecté,date_modif,time_modif,prix_achat_initiale,tva_achat,dimension_article,longueur,largeur,hauteur,movement_article, _id: id };

    await Article.findByIdAndUpdate(id, a1);

    res.json(a1);
};
//delete
const deleteArticle = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Attempting to delete Article with ID: ${id}`);

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(404).send(`Pas de Article avec l'ID: ${id}`);
        }

        const result = await Article.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).send(`Article non trouvé pour l'ID: ${id}`);
        }

        res.json({ message: 'Article supprimé avec succès.' });
    } catch (error) {
        console.error('Error deleting Article:', error);
        res.status(500).json({ message: 'Erreur du serveur.', error });
    }
};

module.exports={getArticles, getArticleByID, createArticle, updateArticle, deleteArticle};