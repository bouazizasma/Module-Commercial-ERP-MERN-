const mongoose = require('mongoose');
const Schema = mongoose.Schema;
//schema Famille 
const FamilleArticleSchema = new Schema({
    code: {
        type: Number,
        required: true,
        unique: true
    },
    designationFamille : {
        type: String,
        required: [true,],
        unique: true

    },
    });
    const FamilleArticleModel = mongoose.model('familleArticle', FamilleArticleSchema);
    module.exports = FamilleArticleModel;