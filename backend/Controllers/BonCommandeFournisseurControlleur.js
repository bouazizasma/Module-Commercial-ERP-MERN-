const BonCommandeFournisseur = require('../Models/Achat/BonCommandeFournisseur');
const LigneCommandeFournisseur = require('../Models/Achat/LigneCommandeFournisseur');

const createBonCommande = async (req, res) => {
    try {
        const { fournisseur, lignes } = req.body;
        const total_hors_Taxe = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
        const total_ttc = total_ht * 1.2; // Exemple de calcul de TTC

        const bonCommande = new BonCommandeFournisseur({
            fournisseur,
            total_hors_Taxe,
            total_Toutes_Taxes_Comprises,
            date_commande: new Date()
        });
        const savedBonCommande = await bonCommande.save();

        for (const ligne of lignes) {
            const ligneCommande = new LigneCommandeFournisseur({
                bon_commande: savedBonCommande._id,
                article: ligne.article,
                quantite: ligne.quantite,
                prix_unitaire: ligne.prix_unitaire,
                total_ligne: ligne.quantite * ligne.prix_unitaire
            });
            await ligneCommande.save();
        }
        res.status(201).json(savedBonCommande);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const getBonCommandeByID = async (req, res) => {
    try {
        const bonCommande = await BonCommandeFournisseur.findById(req.params.id).populate('fournisseur');
        const lignes = await LigneCommandeFournisseur.find({ bon_commande: req.params.id }).populate('article');
        res.status(200).json({ bonCommande, lignes });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
module.exports={createBonCommande,getBonCommandeByID};