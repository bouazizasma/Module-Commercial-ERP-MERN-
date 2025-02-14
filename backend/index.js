const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const AuthRouter = require('./Routes/AuthRouter');
const ProductRouter = require('./Routes/ProductRouter');
const userRouter =require ('./Routes/UserRouter');
const FournisseurRouter =require ('./Routes/FournisseurRouter');
const ClientRouter =require('./Routes/ClientRouter');
const ArticleRouter = require ('./Routes/article/ArticleRouter');
const CategorieArticleRouter = require ('./Routes/article/CategorieArticleRouter');
const FamilleArticleRouter=require ('./Routes/article/FamilleArticleRouter');
const BonCommandeFournisseur  =require('./Routes/achat/BonCommandeRouter');
const Depot = require('./Routes/DepotRouter');
const LigneCommandeFournisseur = require ('./Routes/achat/LignesCommandeFournisseurRouter');
require('dotenv').config();
require('./Models/db');
const PORT = process.env.PORT || 5000;

app.get('/ping', (req, res) => {
    res.send('PONG');
});

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
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
app.use('/ligneCommandeF', LigneCommandeFournisseur);
app.use('/depot', Depot);






app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`)
})