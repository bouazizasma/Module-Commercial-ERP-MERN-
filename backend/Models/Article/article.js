const { required, ref } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//schema Article 
const ArticleSchema = new Schema({
    code: {
        type: Number,   
        required: true,
        unique: true
    },
    libelle	: {    
        type: String,
        required: true,
    },

    libelleFamille: { // clé etrangère de table FamilleArticle( champ dans la table FamilleArticle designationFamille) 
                      // liste déroulante qui affiche les designationFamille dans la table FamilleArticle
        type: Schema.Types.ObjectId,
        ref: 'familleArticle',       
       required: true,
    },
    libeleCategorie:{// clé etrangère de table CategorieArticle(champ dans la table CategorieArticle designationCategorie)
                    // liste déroulante qui affiche les designationCategorie dans la table CategorieArticle
        type: Schema.Types.ObjectId,
        ref: 'categorieArticle',
        required: true 
    },
    Nombre_unite: { //quantité
        type: Number,
    },
    tva: {
        type: Number,
    },
    type: {
        type: String,
    },
    prix_brut: {
        type: Number,
    },
    remise: { //pourcentage 
        type:Number, 
    },
    //droit de consommation
    dc :{
        type :Number,
    },
    //fodec
    fodec:{
        type:Number,
    },
    
    prix_net: {    
        type: Number,
    },
    marge: {
        type: String,
    },
    prixht: {
        type: Number,
    },
    prix_totale_concre: {
        type: Number,
    },
    gestion_configuration: { 
        type: String,
    },
    configuration: {//zone de texte area ( comme commentaire sur cet article )
        type: String,
    },
    serie: { 
        //zone checkbox "si est cochée " un champ s'ouvre ou on ecrit la numero de serie pour chaque article (exemple j'ai ecris Nombre_unite =3 il me donne 3 champs chaqu'un pour un article  ) 
        type: Number,
        },
    lib_fournisseur: {  // clé etrangère de table fournisseur(champ dans la table fournisseur raison_sociale)
                        // liste déroulante qui affiche les raison_sociale dans la table fournisseur
        type: Schema.Types.ObjectId,
        ref: 'fournisseur',
        required: true 
 
    },
    Nature: {   //Matiere 1ere - divers - 
        type: String,
    },
    image_article: {   //uplod image 
        type: Buffer,
    },
    prixmin: {   
        type: Number,
    },
    prixmax: {   
        type: Number,
    },

    user_Connectée: {   //user connecté maintenant il me récupère dans cet champ le nom de user connecté  et on peut pas le modifié comme un champ clos 
        type: String,
    },
    action_user_connecté: {   //ajout/modification/supprission 
        type: String,
    },
    date_modif: {     //date de modification de user connecté 
        type: Date,
    },
    prix_achat_initiale: {     //prix achat initial
        type: Number,
    },
    tva_achat: {   
        type: Number,
    },

    dimension_article: {//zone checkbox "si est cochée "  il affiche les champs(longueur,largeur,hauteur) si non ces champs ne s'affiche pas 
        type: Number,  
    },
    longueur: {    //s'affiche uniquement si dimension_article est coché 
        type: Number,
    },
    largeur: {   //s'affiche uniquement si dimension_article est coché 
        type: Number,
      
    },
    hauteur: {   //s'affiche uniquement si dimension_article est coché 
        type: Number,
      
    },
    movement_article: {   //bon sortie ( depot --->depot maghir facture o bon de livraison )
        type: String,
      
    },
    
});
const ArticleModel = mongoose.model('article', ArticleSchema);
module.exports = ArticleModel;