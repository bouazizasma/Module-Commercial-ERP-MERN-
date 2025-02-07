const { required } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//schema Categorie 
const CategorieArticleSchema = new Schema({
    code: {
        type: Number,
        required: true,
        unique: true
    },
   
    designationCategorie : {
        type: String,
        required: true,
    },
    });
    const CategorieArticleModel = mongoose.model('categorieArticle', CategorieArticleSchema);
    module.exports = CategorieArticleModel;