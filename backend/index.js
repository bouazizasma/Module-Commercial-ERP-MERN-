const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const ProductRouter = require('./Routes/ProductRouter');
const userRouter =require ('./Routes/UserRouter');
const FournisseurRouter =require ('./Routes/FournisseurRouter');
const ClientRouter =require('./Routes/ClientRouter');
const ArticleRouter = require ('./Routes/ArticleRouter');
const CategorieArticleRouter = require ('./Routes/CategorieArticleRouter');
const FamilleArticleRouter=require ('./Routes/FamilleArticleRouter');
const BonCommandeFournisseur  =require('./Routes/BonCommandeRouter');
const Depot = require('./Routes/DepotRouter');
require('dotenv').config();
require('./Models/db');
const PORT = process.env.PORT || 5000;

app.get('/ping', (req, res) => {
    res.send('PONG');
});

app.use(bodyParser.json());
app.use(cors());
app.use('/users',userRouter);
app.use('/auth', AuthRouter);
app.use('/products', ProductRouter);
app.use('/fournisseur', FournisseurRouter);
app.use('/client', ClientRouter);
app.use('/article', ArticleRouter);
app.use('/categorieArticle', CategorieArticleRouter);
app.use('/familleArticle', FamilleArticleRouter);
app.use('/boncommandeF', BonCommandeFournisseur);
app.use('/depot', Depot);






app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})