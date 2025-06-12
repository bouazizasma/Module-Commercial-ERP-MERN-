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
     famillearticle: {
        type: Schema.Types.ObjectId,
        ref: 'familleArticle',
        required: true
    },
    famillearticleInfo: {
        code: Number,
        designationFamille: String
    }
    });
    const CategorieArticleModel = mongoose.model('categorieArticle', CategorieArticleSchema);
    module.exports = CategorieArticleModel;