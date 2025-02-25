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
        prix_totale_concre,
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
{/*} const getArticleByID = async (req, res) => { 
    try {
        const article = await Article.findById(req.params.id).populate('libelleFamille').populate('libeleCategorie');
        if (!article) {
            return res.status(404).json({ message: 'Article not found' });
          }
        
        res.status(200).json(article);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}; */}

const getArticleByID = async (req, res) => {
    try {
      const article = await Article.findById(req.params.id)
        .populate('libelleFamille', '_id') // Renvoie uniquement l'ID de la famille
        .populate('libeleCategorie', '_id'); // Renvoie uniquement l'ID de la catégorie
  
      if (!article) {
        return res.status(404).json({ message: 'Article not found' });
      }
  
      res.status(200).json(article);
    } catch (error) {
      res.status(404).json({ message: error.message });
    }
  };
//update
{/*const updateArticle = async (req, res) => {
    const { id } = req.params;
    const { libelle, libelleFamille, libeleCategorie, lib_fournisseur, Nombre_unite, tva, type, prix_brut, remise, prix_net, marge, prixht, prix_totale_concre, gestion_configuration, configuration, serie, Nature, prixmin, prixmax, prix_achat_initiale, tva_achat, dimension_article, longueur, largeur, hauteur, movement_article } = req.body;

    // Log incoming data for debugging
    console.log("Incoming data:", req.body);

    // Validate Article ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid Article ID" });
    }

    // Validate FamilleArticle ID
    if (libelleFamille && !mongoose.Types.ObjectId.isValid(libelleFamille)) {
        return res.status(400).json({ message: "Invalid FamilleArticle ID" });
    }

    // Validate CategorieArticle ID
    if (libeleCategorie && !mongoose.Types.ObjectId.isValid(libeleCategorie)) {
        return res.status(400).json({ message: "Invalid CategorieArticle ID" });
    }

    // Validate Fournisseur ID
    if (lib_fournisseur && !mongoose.Types.ObjectId.isValid(lib_fournisseur)) {
        return res.status(400).json({ message: "Invalid Fournisseur ID" });
    }

    // Check references
    if (libelleFamille) {
        const familleArticle = await FamilleArticleModel.findById(libelleFamille);
        if (!familleArticle) {
            return res.status(404).json({ message: "FamilleArticle non trouvée" });
        }
    }
    if (libeleCategorie) {
        const categorieArticle = await CategorieArticleModel.findById(libeleCategorie);
        if (!categorieArticle) {
            return res.status(404).json({ message: "CategorieArticle non trouvée" });
        }
    }
    if (lib_fournisseur) {
        const fournisseur = await FournisseurModel.findById(lib_fournisseur);
        if (!fournisseur) {
            return res.status(404).json({ message: "Fournisseur non trouvé" });
        }
    }

    // Handle image upload
    const image_article = req.file ? req.file.buffer : null;

    // Update the article
    const updatedArticle = await Article.findByIdAndUpdate(
        id,
        { libelle, libelleFamille, libeleCategorie, lib_fournisseur, image_article, Nombre_unite, tva, type, prix_brut, remise, prix_net, marge, prixht, prix_totale_concre, gestion_configuration, configuration, serie, Nature, prixmin, prixmax, prix_achat_initiale, tva_achat, dimension_article, longueur, largeur, hauteur, movement_article },
        { new: true }
    );

    res.json(updatedArticle);
};  */}

const updateArticle = async (req, res) => {
    const { id } = req.params;
    const { libelle, libelleFamille, libeleCategorie, lib_fournisseur, Nombre_unite, tva, type, prix_brut, remise, prix_net, marge, prixht, prix_totale_concre, gestion_configuration, configuration, serie, Nature, prixmin, prixmax, prix_achat_initiale, tva_achat, dimension_article, longueur, largeur, hauteur, movement_article } = req.body;
  
    // Log incoming data for debugging
    console.log("Incoming data:", req.body);
  
    // Validate Article ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Article ID" });
    }
  
    // Validate FamilleArticle ID
    if (libelleFamille && !mongoose.Types.ObjectId.isValid(libelleFamille)) {
      return res.status(400).json({ message: "Invalid FamilleArticle ID" });
    }
  
    // Validate CategorieArticle ID
    if (libeleCategorie && !mongoose.Types.ObjectId.isValid(libeleCategorie)) {
      return res.status(400).json({ message: "Invalid CategorieArticle ID" });
    }
  
    // Validate Fournisseur ID
    if (lib_fournisseur && !mongoose.Types.ObjectId.isValid(lib_fournisseur)) {
      return res.status(400).json({ message: "Invalid Fournisseur ID" });
    }
  
    // Check references
    if (libelleFamille) {
      const familleArticle = await FamilleArticleModel.findById(libelleFamille);
      if (!familleArticle) {
        return res.status(404).json({ message: "FamilleArticle non trouvée" });
      }
    }
    if (libeleCategorie) {
      const categorieArticle = await CategorieArticleModel.findById(libeleCategorie);
      if (!categorieArticle) {
        return res.status(404).json({ message: "CategorieArticle non trouvée" });
      }
    }
    if (lib_fournisseur) {
      const fournisseur = await FournisseurModel.findById(lib_fournisseur);
      if (!fournisseur) {
        return res.status(404).json({ message: "Fournisseur non trouvé" });
      }
    }
  
    // Handle image upload
    const image_article = req.file ? req.file.buffer : null;
  
    // Update the article
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { 
        libelle, 
        libelleFamille, 
        libeleCategorie, 
        lib_fournisseur, 
        image_article: image_article || undefined, // Conserve l'image existante si aucune nouvelle image n'est fournie
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
        serie, 
        Nature, 
        prixmin, 
        prixmax, 
        prix_achat_initiale, 
        tva_achat, 
        dimension_article, 
        longueur, 
        largeur, 
        hauteur, 
        movement_article 
      },
      { new: true }
    );
  
    res.json(updatedArticle);
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
//update
{/*const updateArticle = async (req, res) => {
    const { id } = req.params;
    const { libelle, libelleFamille, libeleCategorie, lib_fournisseur, ...rest } = req.body;
  
    // Vérifier que les ObjectId sont valides
    if (libelleFamille && !mongoose.Types.ObjectId.isValid(libelleFamille)) {
      return res.status(400).json({ message: "libelleFamille n'est pas un ObjectId valide" });
    }
    if (libeleCategorie && !mongoose.Types.ObjectId.isValid(libeleCategorie)) {
      return res.status(400).json({ message: "libeleCategorie n'est pas un ObjectId valide" });
    }
    if (lib_fournisseur && !mongoose.Types.ObjectId.isValid(lib_fournisseur)) {
      return res.status(400).json({ message: "lib_fournisseur n'est pas un ObjectId valide" });
    }
  
    // Vérifier les références
    if (libelleFamille) {
      const familleArticle = await FamilleArticleModel.findById(libelleFamille);
      if (!familleArticle) {
        return res.status(404).json({ message: "FamilleArticle non trouvée" });
      }
    }
    if (libeleCategorie) {
      const categorieArticle = await CategorieArticleModel.findById(libeleCategorie);
      if (!categorieArticle) {
        return res.status(404).json({ message: "CategorieArticle non trouvée" });
      }
    }
    if (lib_fournisseur) {
      const fournisseur = await FournisseurModel.findById(lib_fournisseur);
      if (!fournisseur) {
        return res.status(404).json({ message: "Fournisseur non trouvé" });
      }
    }
  
    // Mettre à jour l'article
    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      { libelle, libelleFamille, libeleCategorie, lib_fournisseur, ...rest },
      { new: true }
    );
  
    res.json(updatedArticle);
  }; */}

//update 
{/*}
  const updateArticle = async (req, res) => {
    const { id } = req.params;
    const { libelle, libelleFamille, libeleCategorie, lib_fournisseur, ...rest } = req.body;

    // Vérifier que les ObjectId sont valides
    if (libelleFamille && !mongoose.Types.ObjectId.isValid(libelleFamille)) {
        return res.status(400).json({ message: "libelleFamille n'est pas un ObjectId valide" });
    }
    if (libeleCategorie && !mongoose.Types.ObjectId.isValid(libeleCategorie)) {
        return res.status(400).json({ message: "libeleCategorie n'est pas un ObjectId valide" });
    }
    if (lib_fournisseur && !mongoose.Types.ObjectId.isValid(lib_fournisseur)) {
        return res.status(400).json({ message: "lib_fournisseur n'est pas un ObjectId valide" });
    }

    // Vérifier les références
    if (libelleFamille) {
        const familleArticle = await FamilleArticleModel.findById(libelleFamille);
        if (!familleArticle) {
            return res.status(404).json({ message: "FamilleArticle non trouvée" });
        }
    }
    if (libeleCategorie) {
        const categorieArticle = await CategorieArticleModel.findById(libeleCategorie);
        if (!categorieArticle) {
            return res.status(404).json({ message: "CategorieArticle non trouvée" });
        }
    }
    if (lib_fournisseur) {
        const fournisseur = await FournisseurModel.findById(lib_fournisseur);
        if (!fournisseur) {
            return res.status(404).json({ message: "Fournisseur non trouvé" });
        }
    }

    // Récupérer l'image si elle est fournie
    const image_article = req.file ? req.file.buffer : null;

    // Mettre à jour l'article
    const updatedArticle = await Article.findByIdAndUpdate(
        id,
        { libelle, libelleFamille, libeleCategorie, lib_fournisseur, image_article,Nombre_unite,tva,type,prix_brut,remise,prix_net,marge,prixht,prix_totale_concre,gestion_configuration,configuration,serie,Nature, prixmin,prixmax,prix_achat_initiale,tva_achat,dimension_article,longueur,largeur,hauteur,movement_article  },
        { new: true }
    );

    res.json(updatedArticle);
}; 
*/}
module.exports={getArticles, getArticleByID, createArticle, updateArticle, deleteArticle};