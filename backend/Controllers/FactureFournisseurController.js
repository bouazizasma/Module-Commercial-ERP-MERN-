//Controlleur FactureFournisseur 
const { jsPDF } = require("jspdf"); // Import correct de jsPDF
require("jspdf-autotable"); // Import de jspdf-autotable
const { Buffer } = require("buffer");
const EnteteAchat = require("../Models/Achat/EnteteAchat");
const LigneAchat = require("../Models/Achat/LignesAchat"); // Assurez-vous que le chemin est correct
const FactureFournisseur = require("../Models/Achat/FactureFournisseur");
const  Fournisseur = require("../Models/Fournisseur"); // Chemin correct vers votre modèle
const CounterModel=require ("../Models/counters");

// Générer une facture et la stocker en tant que PDF

const genererFacture = async (req, res) => {
  const { enteteAchatId , numeroFactureFournisseur} = req.body;
  console.log("enteteAchatId reçu:", enteteAchatId);

  if (!enteteAchatId) {
      return res.status(400).json({ message: "L'ID de l'entête d'achat est requis." });
  }

  let enteteAchat;
  try {
      // Récupérer l'entête d'achat (bon de réception)
      enteteAchat = await EnteteAchat.findById(enteteAchatId)
          .populate("fournisseur")
          .populate("depot");

      console.log("enteteAchat trouvé:", enteteAchat);
      if (!enteteAchat) {
          return res.status(404).json({ message: "Entête d'achat non trouvé" });
      }

      // Vérifier que l'entête d'achat est un bon de réception
      if (enteteAchat.type !== "BonReception") {
          return res.status(400).json({ message: "Seuls les bons de réception peuvent être facturés" });
      }

      // Vérifier si le bon de réception a déjà été facturé
      if (enteteAchat.facture) {
          return res.status(400).json({ message: "Ce bon de réception a déjà été facturé." });
      }

      // Récupérer les lignes de commande associées à cet entête d'achat
      const lignes = await LigneAchat.find({ bon: enteteAchatId }).populate("article");

      if (!lignes || lignes.length === 0) {
          return res.status(404).json({ message: "Aucune ligne de commande trouvée pour ce bon de réception" });
      }

      // Générer le numéro de facture
      const currentYear = new Date().getFullYear();
      const yearShort = currentYear.toString().slice(-2);

      // Trouver ou créer un compteur pour l'année en cours
      let counter = await CounterModel.findOneAndUpdate(
          { model: 'facture', year: currentYear },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
      );

      if (!counter) {
          return res.status(500).json({ message: "Erreur lors de la création du compteur." });
      }
      // Formater la séquence sur 5 chiffres
      const sequence = String(counter.seq).padStart(5, '0');
      // Générer le numéro de facture
      const numero_facture = `FF ${yearShort} ${sequence}`;
      // Générer le PDF
      const doc = new jsPDF();
      // Ajouter le contenu de la facture au PDF
      doc.setFontSize(18);
      doc.text("Nom de société", 10, 10);
      doc.text(`Facture N°: ${numero_facture}`, 10, 20);
      doc.text(`Date de facturation: ${new Date().toLocaleDateString()}`, 10, 30);
      doc.text(`Fournisseur: ${enteteAchat.fournisseur.raison_sociale}`, 10, 40);
      doc.text(`Adresse: ${enteteAchat.fournisseur.adresse || 'N/A'}`, 10, 50);
      doc.text(`Téléphone: ${enteteAchat.fournisseur.telephone || 'N/A'}`, 10, 60);
      // Tableau des articles
      doc.autoTable({
          startY: 70,
          head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
          body: lignes.map(ligne => [
              ligne.article.libelle,
              ligne.quantite,
              `${ligne.prix_unitaire.toFixed(2)} TND`,
              `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND`
          ]),
      });
      // Totaux
      const totalHT = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
      const totalTTC = totalHT * 1.2; // TVA 20%

      doc.text(`Total HT: ${totalHT.toFixed(2)} TND`, 10, doc.autoTable.previous.finalY + 10);
      doc.text(`Total TTC: ${totalTTC.toFixed(2)} TND`, 10, doc.autoTable.previous.finalY + 20);

      // Convertir le PDF en Buffer
      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
      const pdfDataUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

      // Créer la facture avec le fichier PDF
      const nouvelleFacture = new FactureFournisseur({
          numero_facture,
          date_facture: new Date(),
          fournisseur: enteteAchat.fournisseur._id,
          bonReception: enteteAchat._id,
          numeroFactureFournisseur,
          fichierPdf: pdfBuffer,
          contentType: "application/pdf",
          montantTTC: totalTTC, // Ajoutez le montant TTC ici
          statut: "non payé",
          paiementEffectuee : 0 ,

      });

      // Enregistrer la facture dans la base de données
      await nouvelleFacture.save();
      // Mettre à jour le bon de réception avec l'ID de la facture
      enteteAchat.facture = nouvelleFacture._id;
      enteteAchat.statut = "Facturé"; // Mettre à jour le statut du bon de réception
      await enteteAchat.save();
      // Générer l'URL du PDF pour la prévisualisation
      const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      // Envoyer une seule réponse
      return res.status(200).json({ message: "Facture générée et enregistrée avec succès", pdfUrl: pdfDataUrl });
  } catch (error) {
      console.error("Erreur lors de la génération de la facture :", error);
      return res.status(500).json({ message: "Erreur lors de la génération de la facture" });
  }
};
const downloadFacture = async (req, res) => {
  try {
    const facture = await FactureFournisseur.findById(req.params.id);
    if (!facture) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }

    // Définir les en-têtes de la réponse
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture_${facture.numero_facture}.pdf`);

    // Envoyer le fichier PDF
    res.send(facture.fichierPdf);
  } catch (error) {
    console.error("Erreur lors du téléchargement de la facture :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

/*const genererFactureGroupée = async (req, res) => {
  const { bonIds } = req.body; // IDs des bons de réception à facturer

  if (!bonIds || !Array.isArray(bonIds)) {
    return res.status(400).json({ message: "Les IDs des bons de réception sont requis sous forme de tableau." });
  }

  try {
    // Récupérer les bons de réception
    const bonsReception = await EnteteAchat.find({ _id: { $in: bonIds } })
      .populate("fournisseur")
      .populate("lignes.article");

    // Vérifier que tous les bons existent
    if (bonsReception.length !== bonIds.length) {
      return res.status(404).json({ message: "Un ou plusieurs bons de réception n'ont pas été trouvés." });
    }

    // Vérifier que tous les bons ont le même fournisseur
    const fournisseurId = bonsReception[0].fournisseur._id;
    if (!bonsReception.every((bon) => bon.fournisseur._id.toString() === fournisseurId.toString())) {
      return res.status(400).json({ message: "Tous les bons de réception doivent avoir le même fournisseur." });
    }

    // Vérifier que tous les bons sont "En attente"
    if (!bonsReception.every((bon) => bon.statut === "En attente")) {
      return res.status(400).json({ message: "Tous les bons de réception doivent avoir le statut 'En attente'." });
    }

    // Récupérer toutes les lignes des bons de réception
    const lignes = await LigneAchat.find({ bon: { $in: bonIds } }).populate("article");

    if (!lignes || lignes.length === 0) {
      return res.status(404).json({ message: "Aucune ligne de commande trouvée pour ces bons de réception." });
    }

    // Générer le numéro de facture
    const currentYear = new Date().getFullYear();
    const yearShort = currentYear.toString().slice(-2);

    // Trouver ou créer un compteur pour l'année en cours
    let counter = await CounterModel.findOneAndUpdate(
      { model: 'facture', year: currentYear },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (!counter) {
      return res.status(500).json({ message: "Erreur lors de la création du compteur." });
    }

    // Formater la séquence sur 5 chiffres
    const sequence = String(counter.seq).padStart(5, '0');
    const numero_facture = `FF ${yearShort} ${sequence}`;

    // Générer le PDF
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Nom de société", 10, 10);
    doc.text(`Facture N°: ${numero_facture}`, 10, 20);
    doc.text(`Date de facturation: ${new Date().toLocaleDateString()}`, 10, 30);
    doc.text(`Fournisseur: ${bonsReception[0].fournisseur.raison_sociale}`, 10, 40);
    doc.text(`Adresse: ${bonsReception[0].fournisseur.adresse || 'N/A'}`, 10, 50);
    doc.text(`Téléphone: ${bonsReception[0].fournisseur.telephone || 'N/A'}`, 10, 60);

    let startY = 70; // Position Y de départ pour le tableau

    // Parcourir chaque bon de réception
    bonsReception.forEach((bon) => {
      // Ajouter un titre pour le bon de réception
      doc.setFontSize(14);
      doc.text(`Bon de Réception N°: ${bon.numero_Bon}`, 10, startY);
      doc.text(`Date de Réception: ${new Date(bon.dateReception).toLocaleDateString()}`, 10, startY + 10);

      // Filtrer les lignes pour ce bon de réception
      const lignesBon = lignes.filter((ligne) => ligne.bon.toString() === bon._id.toString());

      // Ajouter un tableau pour les lignes de ce bon de réception
      doc.autoTable({
        startY: startY + 15,
        head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
        body: lignesBon.map((ligne) => [
          ligne.article.libelle,
          ligne.quantite,
          `${ligne.prix_unitaire.toFixed(2)} TND`,
          `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND`,
        ]),
      });

      // Mettre à jour la position Y pour le prochain bon de réception
      startY = doc.autoTable.previous.finalY + 20;
    });

    // Calculer les totaux globaux
    const totalHT = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2; // TVA 20%

    // Ajouter les totaux globaux
    doc.text(`Total HT: ${totalHT.toFixed(2)} TND`, 10, startY);
    doc.text(`Total TTC: ${totalTTC.toFixed(2)} TND`, 10, startY + 10);

    // Convertir le PDF en Buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const pdfDataUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

    // Créer la facture avec le fichier PDF
    const nouvelleFacture = new FactureFournisseur({
      numero_facture,
      date_facture: new Date(),
      fournisseur: fournisseurId,
      bonsReception: bonIds, // Liste des IDs des bons de réception
      fichierPdf: pdfBuffer,
      contentType: "application/pdf",
    });

    // Enregistrer la facture dans la base de données
    await nouvelleFacture.save();

    // Mettre à jour les bons de réception avec l'ID de la facture et leur statut
    await EnteteAchat.updateMany(
      { _id: { $in: bonIds } },
      { $set: { facture: nouvelleFacture._id, statut: "Facturé" } }
    );

    // Générer l'URL du PDF pour la prévisualisation
    const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    res.status(200).json({ message: "Facture groupée générée et enregistrée avec succès", pdfUrl: pdfDataUrl });
  } catch (error) {
    console.error("Erreur lors de la génération de la facture groupée :", error);
    res.status(500).json({ message: "Erreur lors de la génération de la facture groupée" });
  }
};*/
const genererFactureGroupée = async (req, res) => {
  const { bonIds, numeroFactureFournisseur } = req.body; // IDs des bons de réception à facturer

  if (!bonIds || !Array.isArray(bonIds)) {
    return res.status(400).json({ message: "Les IDs des bons de réception sont requis sous forme de tableau." });
  }

  try {
    // Récupérer les bons de réception
    const bonsReception = await EnteteAchat.find({ _id: { $in: bonIds } })
      .populate("fournisseur")
      .populate("lignes.article");

    // Vérifier que tous les bons existent
    if (bonsReception.length !== bonIds.length) {
      return res.status(404).json({ message: "Un ou plusieurs bons de réception n'ont pas été trouvés." });
    }

    // Vérifier que tous les bons ont le même fournisseur
    const fournisseurId = bonsReception[0].fournisseur._id;
    if (!bonsReception.every((bon) => bon.fournisseur._id.toString() === fournisseurId.toString())) {
      return res.status(400).json({ message: "Tous les bons de réception doivent avoir le même fournisseur." });
    }

    // Vérifier que tous les bons sont "En attente"
    if (!bonsReception.every((bon) => bon.statut === "En attente")) {
      return res.status(400).json({ message: "Tous les bons de réception doivent avoir le statut 'En attente'." });
    }

    // Récupérer toutes les lignes des bons de réception
    const lignes = await LigneAchat.find({ bon: { $in: bonIds } }).populate("article");

    if (!lignes || lignes.length === 0) {
      return res.status(404).json({ message: "Aucune ligne de commande trouvée pour ces bons de réception." });
    }

    // Générer le numéro de facture
    const currentYear = new Date().getFullYear();
    const yearShort = currentYear.toString().slice(-2);

    // Trouver ou créer un compteur pour l'année en cours
    let counter = await CounterModel.findOneAndUpdate(
      { model: 'facture', year: currentYear },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (!counter) {
      return res.status(500).json({ message: "Erreur lors de la création du compteur." });
    }

    // Formater la séquence sur 5 chiffres
    const sequence = String(counter.seq).padStart(5, '0');
    const numero_facture = `FF ${yearShort} ${sequence}`;

    // Générer le PDF
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Nom de société", 10, 10);
    doc.text(`Facture N°: ${numero_facture}`, 10, 20);
    doc.text(`Date de facturation: ${new Date().toLocaleDateString()}`, 10, 30);
    doc.text(`Fournisseur: ${bonsReception[0].fournisseur.raison_sociale}`, 10, 40);
    doc.text(`Adresse: ${bonsReception[0].fournisseur.adresse || 'N/A'}`, 10, 50);
    doc.text(`Téléphone: ${bonsReception[0].fournisseur.telephone || 'N/A'}`, 10, 60);

    let startY = 70; // Position Y de départ pour le tableau

    // Parcourir chaque bon de réception
    bonsReception.forEach((bon) => {
      // Ajouter un titre pour le bon de réception
      doc.setFontSize(14);
      doc.text(`Bon de Réception N°: ${bon.numero_Bon}`, 10, startY);
      doc.text(`Date de Réception: ${new Date(bon.dateReception).toLocaleDateString()}`, 10, startY + 10);

      // Filtrer les lignes pour ce bon de réception
      const lignesBon = lignes.filter((ligne) => ligne.bon.toString() === bon._id.toString());

      // Ajouter un tableau pour les lignes de ce bon de réception
      doc.autoTable({
        startY: startY + 15,
        head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
        body: lignesBon.map((ligne) => [
          ligne.article.libelle,
          ligne.quantite,
          `${ligne.prix_unitaire.toFixed(2)} TND`,
          `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND`,
        ]),
      });

      // Mettre à jour la position Y pour le prochain bon de réception
      startY = doc.autoTable.previous.finalY + 20;
    });

    // Calculer les totaux globaux
    const totalHT = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2; // TVA 20%

    // Ajouter les totaux globaux
    doc.text(`Total HT: ${totalHT.toFixed(2)} TND`, 10, startY);
    doc.text(`Total TTC: ${totalTTC.toFixed(2)} TND`, 10, startY + 10);

    // Convertir le PDF en Buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const pdfDataUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

    // Créer la facture avec le fichier PDF
    const nouvelleFacture = new FactureFournisseur({
      numero_facture,
      date_facture: new Date(),
      fournisseur: fournisseurId,
      bonsReception: bonIds, // Liste des IDs des bons de réception
      numeroFactureFournisseur,
      fichierPdf: pdfBuffer,
      contentType: "application/pdf",
      montantTTC: totalTTC, // Ajoutez le montant TTC ici
      statut: "non payé", // Statut initial de la facture
      paiementEffectuee :0 ,
    });

    // Enregistrer la facture dans la base de données
    await nouvelleFacture.save();

    // Mettre à jour les bons de réception avec l'ID de la facture et leur statut
    await EnteteAchat.updateMany(
      { _id: { $in: bonIds } },
      { $set: { facture: nouvelleFacture._id, statut: "Facturé" } }
    );

    // Générer l'URL du PDF pour la prévisualisation
    const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    res.status(200).json({ message: "Facture groupée générée et enregistrée avec succès", pdfUrl: pdfDataUrl });
  } catch (error) {
    console.error("Erreur lors de la génération de la facture groupée :", error);
    res.status(500).json({ message: "Erreur lors de la génération de la facture groupée" });
  }
};


// Controllers/FactureFournisseurController.js
const getAll = async (req, res) => {
  try {
    const factures = await FactureFournisseur.find().populate("fournisseur"); // Assurez-vous que "fournisseur" est correctement peuplé
    res.status(200).json(factures);
  } catch (error) {
    console.error("Erreur lors de la récupération des factures :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des factures" });
  }
};

const deleteFac =async (req , res ) => {
  try {
    const facture = await FactureFournisseur.findByIdAndDelete(req.params.id);
    if (!facture) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }
    res.status(200).json({ message: "Facture supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la facture :", error);
    res.status(500).json({ message: "Erreur lors de la suppression de la facture" });
  }
};
const getFacturesParFournisseur = async (req, res) => {
  const { fournisseurId } = req.params;

  if (!fournisseurId) {
    return res.status(400).json({ message: "L'ID du fournisseur est requis." });
  }

  try {
    console.log("Recherche des factures pour le fournisseur:", fournisseurId);

    const factures = await FactureFournisseur.find({ fournisseur: fournisseurId })
      .populate("fournisseur")
      .populate("bonsReception");

    console.log("Factures trouvées:", factures);

    if (!factures || factures.length === 0) {
      return res.status(404).json({ message: "Aucune facture trouvée pour ce fournisseur." });
    }

    res.status(200).json(factures);
  } catch (error) {
    console.error("Erreur lors de la récupération des factures par fournisseur :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des factures par fournisseur" });
  }
};



// Endpoint pour extraire les articles d'une facture
const getArticles = async (req, res) => {
  try {
    const facture = await FactureF.findById(req.params.id);
    if (!facture || !facture.pdf_path) {
      return res.status(404).json({ message: "Facture ou PDF non trouvé" });
    }

    const pdfPath = path.join(__dirname, '..', facture.pdf_path);
    const dataBuffer = fs.readFileSync(pdfPath);

    const data = await pdf(dataBuffer);
    const text = data.text;

    // Recherche de la section des articles dans le texte
    const articles = [];
    const lines = text.split('\n');
    let isArticleSection = false;
    let currentArticle = {};

    for (const line of lines) {
      // Logique pour détecter le début de la section des articles
      if (line.includes('Désignation') && line.includes('Quantité')) {
        isArticleSection = true;
        continue;
      }

      // Logique pour détecter la fin de la section des articles
      if (isArticleSection && (line.includes('Total') || line.includes('Montant'))) {
        isArticleSection = false;
        continue;
      }

      // Extraction des données des articles
      if (isArticleSection && line.trim()) {
        const parts = line.split(/\s+/);
        if (parts.length >= 6) {
          articles.push({
            designation: parts.slice(0, -5).join(' '),
            quantite: parseFloat(parts[parts.length - 5]),
            prix_unitaire: parseFloat(parts[parts.length - 4]),
            total_ht: parseFloat(parts[parts.length - 3]),
            tva: parseFloat(parts[parts.length - 2]),
            total_ttc: parseFloat(parts[parts.length - 1])
          });
        }
      }
    }

    // Si aucun article n'est trouvé, utiliser les articles stockés dans la base de données
    if (articles.length === 0 && facture.articles) {
      return res.json(facture.articles);
    }

    res.json(articles);

  } catch (error) {
    console.error('Erreur lors de l\'extraction des articles:', error);
    res.status(500).json({ 
      message: "Erreur lors de l'extraction des articles",
      error: error.message 
    });
  }
};





module.exports = { genererFacture, downloadFacture , getAll ,deleteFac , genererFactureGroupée , getFacturesParFournisseur,getArticles};

/*const downloadFacture = async (req, res) => {
  try {
    const facture = await FactureFournisseur.findById(req.params.id);
    if (!facture) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }

    // Définir les en-têtes de la réponse
    res.setHeader('Content-Type', facture.contentType);
    res.setHeader('Content-Disposition', `attachment; filename=facture_${facture.numero_facture}.pdf`);

    // Envoyer le fichier PDF
    res.send(facture.fichierPdf);
  } catch (error) {
    console.error("Erreur lors du téléchargement de la facture :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
*/

/*const downloadFacture = async (req, res) => {
  try {
    const facture = await FactureFournisseur.findById(req.params.id);
    if (!facture) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }

    // Définir les en-têtes de la réponse
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture_${facture.numero_facture}.pdf`);

    // Envoyer le fichier PDF
    res.send(facture.fichierPdf);
  } catch (error) {
    console.error("Erreur lors du téléchargement de la facture :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
*/



/*const downloadFacture = async (req, res) => {
}; */


//generer +ieurs BEF en une seule  facture

/*const genererFactureGroupée = async (req, res) => {
  const { bonIds } = req.body; // IDs des bons de réception à facturer

  if (!bonIds || !Array.isArray(bonIds)) {
    return res.status(400).json({ message: "Les IDs des bons de réception sont requis sous forme de tableau." });
  }

  try {
    // Récupérer les bons de réception
    const bonsReception = await EnteteAchat.find({ _id: { $in: bonIds } })
      .populate("fournisseur")
      .populate("lignes.article");

    // Vérifier que tous les bons existent
    if (bonsReception.length !== bonIds.length) {
      return res.status(404).json({ message: "Un ou plusieurs bons de réception n'ont pas été trouvés." });
    }

    // Vérifier que tous les bons ont le même fournisseur
    const fournisseurId = bonsReception[0].fournisseur._id;
    if (!bonsReception.every((bon) => bon.fournisseur._id.toString() === fournisseurId.toString())) {
      return res.status(400).json({ message: "Tous les bons de réception doivent avoir le même fournisseur." });
    }

    // Vérifier que tous les bons sont "En attente"
    if (!bonsReception.every((bon) => bon.statut === "En attente")) {
      return res.status(400).json({ message: "Tous les bons de réception doivent avoir le statut 'En attente'." });
    }

    // Récupérer toutes les lignes des bons de réception
    const lignes = await LigneAchat.find({ bon: { $in: bonIds } }).populate("article");

    if (!lignes || lignes.length === 0) {
      return res.status(404).json({ message: "Aucune ligne de commande trouvée pour ces bons de réception." });
    }

    // Générer le numéro de facture
    const currentYear = new Date().getFullYear();
    const yearShort = currentYear.toString().slice(-2);

    // Trouver ou créer un compteur pour l'année en cours
    let counter = await CounterModel.findOneAndUpdate(
      { model: 'facture', year: currentYear },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (!counter) {
      return res.status(500).json({ message: "Erreur lors de la création du compteur." });
    }

    // Formater la séquence sur 5 chiffres
    const sequence = String(counter.seq).padStart(5, '0');
    const numero_facture = `FF ${yearShort} ${sequence}`;

    // Générer le PDF
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Nom de société", 10, 10);
    doc.text(`Facture N°: ${numero_facture}`, 10, 20);
    doc.text(`Date de facturation: ${new Date().toLocaleDateString()}`, 10, 30);
    doc.text(`Fournisseur: ${bonsReception[0].fournisseur.raison_sociale}`, 10, 40);
    doc.text(`Adresse: ${bonsReception[0].fournisseur.adresse || 'N/A'}`, 10, 50);
    doc.text(`Téléphone: ${bonsReception[0].fournisseur.telephone || 'N/A'}`, 10, 60);

    let startY = 70; // Position Y de départ pour le tableau

    // Parcourir chaque bon de réception
    bonsReception.forEach((bon) => {
      // Ajouter un titre pour le bon de réception
      doc.setFontSize(14);
      doc.text(`Bon de Réception N°: ${bon.numero_Bon}`, 10, startY);
      doc.text(`Date de Réception: ${new Date(bon.dateReception).toLocaleDateString()}`, 10, startY + 10);

      // Filtrer les lignes pour ce bon de réception
      const lignesBon = lignes.filter((ligne) => ligne.bon.toString() === bon._id.toString());

      // Ajouter un tableau pour les lignes de ce bon de réception
      doc.autoTable({
        startY: startY + 15,
        head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
        body: lignesBon.map((ligne) => [
          ligne.article.libelle,
          ligne.quantite,
          `${ligne.prix_unitaire.toFixed(2)} TND`,
          `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND`,
        ]),
      });

      // Mettre à jour la position Y pour le prochain bon de réception
      startY = doc.autoTable.previous.finalY + 20;
    });

    // Calculer les totaux globaux
    const totalHT = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2; // TVA 20%

    // Ajouter les totaux globaux
    doc.text(`Total HT: ${totalHT.toFixed(2)} TND`, 10, startY);
    doc.text(`Total TTC: ${totalTTC.toFixed(2)} TND`, 10, startY + 10);

    // Convertir le PDF en Buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const pdfDataUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

    // Créer la facture avec le fichier PDF
    const nouvelleFacture = new FactureFournisseur({
      numero_facture,
      date_facture: new Date(),
      fournisseur: fournisseurId,
      bonsReception: bonIds, // Liste des IDs des bons de réception
      fichierPdf: pdfBuffer,
      contentType: "application/pdf",
    });

    // Enregistrer la facture dans la base de données
    await nouvelleFacture.save();

    // Mettre à jour les bons de réception avec l'ID de la facture et leur statut
    await EnteteAchat.updateMany(
      { _id: { $in: bonIds } },
      { $set: { facture: nouvelleFacture._id, statut: "Facturé" } }
    );

    // Générer l'URL du PDF pour la prévisualisation
    const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    res.status(200).json({ message: "Facture groupée générée et enregistrée avec succès", pdfUrl: pdfDataUrl });
  } catch (error) {
    console.error("Erreur lors de la génération de la facture groupée :", error);
    res.status(500).json({ message: "Erreur lors de la génération de la facture groupée" });
  }
};

*/

// Télécharger une facture
/*const downloadFacture = async (req, res) => {
  try {
    const facture = await FactureFournisseur.findById(req.params.id);

    if (!facture || !facture.fichierPdf) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }

    // Définir les en-têtes pour le téléchargement du fichier
    res.setHeader("Content-Type", facture.contentType);
    res.setHeader("Content-Disposition", `attachment; filename=facture_${facture.numero_facture}.pdf`);

    // Envoyer le fichier PDF
    res.send(facture.fichierPdf);
  } catch (error) {
    console.error("Erreur lors du téléchargement de la facture :", error);
    res.status(500).json({ message: "Erreur lors du téléchargement de la facture" });
  }
}; 
*/
/*const downloadFacture = async (req, res) => {
  try {
    const facture = await FactureFournisseur.findById(req.params.id);

    if (!facture || !facture.fichierPdf) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }

    // Définir les en-têtes pour le téléchargement du fichier
    res.setHeader("Content-Type", facture.contentType);
    res.setHeader("Content-Disposition", `attachment; filename=facture_${facture.numero_facture}.pdf`);

    // Envoyer le fichier PDF
    res.send(facture.fichierPdf);
  } catch (error) {
    console.error("Erreur lors du téléchargement de la facture :", error);
    res.status(500).json({ message: "Erreur lors du téléchargement de la facture" });
  }
};
*/

/*const downloadFacture = async (req, res) => {
  try {
    const facture = await FactureFournisseur.findById(req.params.id);

    if (!facture || !facture.fileData) { // Remplacez fichierPdf par fileData ou le champ approprié
      return res.status(404).json({ message: "Facture non trouvée" });
    }

    // Définir les en-têtes pour le téléchargement du fichier
    res.setHeader("Content-Type", facture.contentType);
    res.setHeader("Content-Disposition", `attachment; filename=facture_${facture.numero_facture}.pdf`);

    // Envoyer le fichier PDF
    res.send(facture.fileData); // Remplacez fichierPdf par fileData ou le champ approprié
  } catch (error) {
    console.error("Erreur lors du téléchargement de la facture :", error);
    res.status(500).json({ message: "Erreur lors du téléchargement de la facture" });
  }
};
*/
 /*const fs = require('fs');
const path = require('path');

const downloadFacture = async (req, res) => {
  try {
    const facture = await FactureFournisseur.findById(req.params.id);

    if (!facture) {
      return res.status(404).json({ message: "Facture non trouvée" });
    }

    // Chemin du fichier PDF sur le système de fichiers
    const filePath = path.join(__dirname, 'uploads', facture._id + '.pdf');

    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Fichier PDF non trouvé" });
    }

    // Définir les en-têtes pour le téléchargement du fichier
    res.setHeader("Content-Type", facture.contentType);
    res.setHeader("Content-Disposition", `attachment; filename=facture_${facture.numero_facture}.pdf`);

    // Envoyer le fichier PDF
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("Erreur lors du téléchargement de la facture :", error);
    res.status(500).json({ message: "Erreur lors du téléchargement de la facture" });
  }
};
*/

/*const genererFacture = async (req, res) => {
  const { enteteAchatId } = req.body;
  console.log("enteteAchatId reçu:", enteteAchatId); // Debug
  if (!enteteAchatId) {
    return res.status(400).json({ message: "L'ID de l'entête d'achat est requis." });
  }
  let enteteAchat;
  try {
    // Récupérer l'entête d'achat (bon de réception)
    const enteteAchat = await EnteteAchat.findById(enteteAchatId)
      .populate("fournisseur")
      .populate("depot");
      console.log("enteteAchat trouvé:", enteteAchat); // Debug

    if (!enteteAchat) {
      return res.status(404).json({ message: "Entête d'achat non trouvé" });
    }

    // Vérifier que l'entête d'achat est un bon de réception
    if (enteteAchat.type !== "BonReception") {
      return res.status(400).json({ message: "Seuls les bons de réception peuvent être facturés" });
    }

    // Récupérer les lignes de commande associées à cet entête d'achat
    const lignes = await LigneAchat.find({ bon: enteteAchatId }).populate("article");

    if (!lignes || lignes.length === 0) {
      return res.status(404).json({ message: "Aucune ligne de commande trouvée pour ce bon de réception" });
    }

    // Générer le PDF
    const doc = new jsPDF(); // Initialisation correcte de jsPDF

    // Ajouter le contenu de la facture au PDF
    doc.setFontSize(18);
    doc.text("Nom de société", 10, 10);
    doc.text(`Facture N°: FAC-${Date.now()}`, 10, 20);
    doc.text(`Date de facturation: ${new Date().toLocaleDateString()}`, 10, 30);
    doc.text(`Fournisseur: ${enteteAchat.fournisseur.raison_sociale}`, 10, 40);
    doc.text(`Adresse: ${enteteAchat.fournisseur.adresse || 'N/A'}`, 10, 50);
    doc.text(`Téléphone: ${enteteAchat.fournisseur.telephone || 'N/A'}`, 10, 60);

    // Tableau des articles
    doc.autoTable({
      startY: 70,
      head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
      body: lignes.map(ligne => [
        ligne.article.libelle,
        ligne.quantite,
        `${ligne.prix_unitaire.toFixed(2)} TND`,
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND`
      ]),
    });

    // Totaux
    const totalHT = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2; // TVA 20%

    doc.text(`Total HT: ${totalHT.toFixed(2)} TND`, 10, doc.autoTable.previous.finalY + 10);
    doc.text(`Total TTC: ${totalTTC.toFixed(2)} TND`, 10, doc.autoTable.previous.finalY + 20);
    // Convertir le PDF en Buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const pdfDataUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
    
    res.status(200).json({ message: "Facture générée et enregistrée avec succès", pdfUrl: pdfDataUrl });
    // Créer la facture avec le fichier PDF
    const nouvelleFacture = new FactureFournisseur({
      numero_facture: `FAC-${Date.now()}`,
      date_facture: new Date(),
      fournisseur: enteteAchat.fournisseur._id,
      bonReception: enteteAchat._id,
      fichierPdf: pdfBuffer,
      contentType: "application/pdf",
    });

    // Enregistrer la facture dans la base de données
    await nouvelleFacture.save();

    // Générer l'URL du PDF pour la prévisualisation
    const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    res.status(200).json({ message: "Facture générée et enregistrée avec succès", pdfUrl });
    console.log("enteteAchat:", enteteAchat);
    console.log("enteteAchat.type:", enteteAchat.type);
  } 
  
  catch (error) {
    console.error("Erreur lors de la génération de la facture :", error);
    res.status(500).json({ message: "Erreur lors de la génération de la facture" });
    console.log("enteteAchat:", enteteAchat);
    console.log("enteteAchat.type:", enteteAchat.type);
  }
};

*/

/*const genererFacture = async (req, res) => {
  const { enteteAchatId } = req.body;
  console.log("enteteAchatId reçu:", enteteAchatId); // Debug

  if (!enteteAchatId) {
    return res.status(400).json({ message: "L'ID de l'entête d'achat est requis." });
  }

  let enteteAchat;
  try {
    // Récupérer l'entête d'achat (bon de réception)
    enteteAchat = await EnteteAchat.findById(enteteAchatId)
      .populate("fournisseur")
      .populate("depot");

    console.log("enteteAchat trouvé:", enteteAchat); // Debug

    if (!enteteAchat) {
      return res.status(404).json({ message: "Entête d'achat non trouvé" });
    }

    // Vérifier que l'entête d'achat est un bon de réception
    if (enteteAchat.type !== "BonReception") {
      return res.status(400).json({ message: "Seuls les bons de réception peuvent être facturés" });
    }

    // Récupérer les lignes de commande associées à cet entête d'achat
    const lignes = await LigneAchat.find({ bon: enteteAchatId }).populate("article");

    if (!lignes || lignes.length === 0) {
      return res.status(404).json({ message: "Aucune ligne de commande trouvée pour ce bon de réception" });
    }

    // Générer le PDF
    const doc = new jsPDF();

    // Ajouter le contenu de la facture au PDF
    doc.setFontSize(18);
    doc.text("Nom de société", 10, 10);
    doc.text(`Facture N°: FF-${Date.now()}`, 10, 20);
    doc.text(`Date de facturation: ${new Date().toLocaleDateString()}`, 10, 30);
    doc.text(`Fournisseur: ${enteteAchat.fournisseur.raison_sociale}`, 10, 40);
    doc.text(`Adresse: ${enteteAchat.fournisseur.adresse || 'N/A'}`, 10, 50);
    doc.text(`Téléphone: ${enteteAchat.fournisseur.telephone || 'N/A'}`, 10, 60);

    // Tableau des articles
    doc.autoTable({
      startY: 70,
      head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
      body: lignes.map(ligne => [
        ligne.article.libelle,
        ligne.quantite,
        `${ligne.prix_unitaire.toFixed(2)} TND`,
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND`
      ]),
    });

    // Totaux
    const totalHT = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2; // TVA 20%

    doc.text(`Total HT: ${totalHT.toFixed(2)} TND`, 10, doc.autoTable.previous.finalY + 10);
    doc.text(`Total TTC: ${totalTTC.toFixed(2)} TND`, 10, doc.autoTable.previous.finalY + 20);

    // Convertir le PDF en Buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // Créer la facture avec le fichier PDF
    const nouvelleFacture = new FactureFournisseur({
      numero_facture: `FAC-${Date.now()}`,
      date_facture: new Date(),
      fournisseur: enteteAchat.fournisseur._id,
      bonReception: enteteAchat._id,
      fichierPdf: pdfBuffer,
      contentType: "application/pdf",
    });

    // Enregistrer la facture dans la base de données
    await nouvelleFacture.save();

    // Générer l'URL du PDF pour la prévisualisation
    const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Envoyer une seule réponse
    return res.status(200).json({ message: "Facture générée et enregistrée avec succès", pdfUrl });
  } catch (error) {
    console.error("Erreur lors de la génération de la facture :", error);
    return res.status(500).json({ message: "Erreur lors de la génération de la facture" });
  }
}; */

/*const genererFacture = async (req, res) => {
  const { enteteAchatId } = req.body;
  console.log("enteteAchatId reçu:", enteteAchatId);

  if (!enteteAchatId) {
    return res.status(400).json({ message: "L'ID de l'entête d'achat est requis." });
  }

  let enteteAchat;
  try {
    // Récupérer l'entête d'achat (bon de réception)
    enteteAchat = await EnteteAchat.findById(enteteAchatId)
      .populate("fournisseur")
      .populate("depot");

    console.log("enteteAchat trouvé:", enteteAchat);

    if (!enteteAchat) {
      return res.status(404).json({ message: "Entête d'achat non trouvé" });
    }

    // Vérifier que l'entête d'achat est un bon de réception
    if (enteteAchat.type !== "BonReception") {
      return res.status(400).json({ message: "Seuls les bons de réception peuvent être facturés" });
    }

    // Récupérer les lignes de commande associées à cet entête d'achat
    const lignes = await LigneAchat.find({ bon: enteteAchatId }).populate("article");

    if (!lignes || lignes.length === 0) {
      return res.status(404).json({ message: "Aucune ligne de commande trouvée pour ce bon de réception" });
    }

    // Générer le numéro de facture
    const currentYear = new Date().getFullYear();
    const yearShort = currentYear.toString().slice(-2);

    // Trouver ou créer un compteur pour l'année en cours
    let counter = await CounterModel.findOneAndUpdate(
      { model: 'facture', year: currentYear },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (!counter) {
      return res.status(500).json({ message: "Erreur lors de la création du compteur." });
    }

    // Formater la séquence sur 5 chiffres
    const sequence = String(counter.seq).padStart(5, '0');

    // Générer le numéro de facture
    const numero_facture = `FF ${yearShort} ${sequence}`;

    // Générer le PDF
    const doc = new jsPDF();

    // Ajouter le contenu de la facture au PDF
    doc.setFontSize(18);
    doc.text("Nom de société", 10, 10);
    doc.text(`Facture N°: ${numero_facture}`, 10, 20);
    doc.text(`Date de facturation: ${new Date().toLocaleDateString()}`, 10, 30);
    doc.text(`Fournisseur: ${enteteAchat.fournisseur.raison_sociale}`, 10, 40);
    doc.text(`Adresse: ${enteteAchat.fournisseur.adresse || 'N/A'}`, 10, 50);
    doc.text(`Téléphone: ${enteteAchat.fournisseur.telephone || 'N/A'}`, 10, 60);

    // Tableau des articles
    doc.autoTable({
      startY: 70,
      head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
      body: lignes.map(ligne => [
        ligne.article.libelle,
        ligne.quantite,
        `${ligne.prix_unitaire.toFixed(2)} TND`,
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND`
      ]),
    });

    // Totaux
    const totalHT = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2; // TVA 20%

    doc.text(`Total HT: ${totalHT.toFixed(2)} TND`, 10, doc.autoTable.previous.finalY + 10);
    doc.text(`Total TTC: ${totalTTC.toFixed(2)} TND`, 10, doc.autoTable.previous.finalY + 20);

    // Convertir le PDF en Buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const pdfDataUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;
    // Créer la facture avec le fichier PDF
    const nouvelleFacture = new FactureFournisseur({
      numero_facture,
      date_facture: new Date(),
      fournisseur: enteteAchat.fournisseur._id,
      bonReception: enteteAchat._id,
      fichierPdf: pdfBuffer,
      contentType: "application/pdf",
    });

    // Enregistrer la facture dans la base de données
    await nouvelleFacture.save();

    // Générer l'URL du PDF pour la prévisualisation
    const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    // Envoyer une seule réponse
    return res.status(200).json({ message: "Facture générée et enregistrée avec succès", pdfUrl: pdfDataUrl  });
  } catch (error) {
    console.error("Erreur lors de la génération de la facture :", error);
    return res.status(500).json({ message: "Erreur lors de la génération de la facture" });
  }
};
*/
/*const genererFactureGroupée = async (req, res) => {
  const { bonIds } = req.body; // IDs des bons de réception à facturer

  if (!bonIds || !Array.isArray(bonIds)) {
      return res.status(400).json({ message: "Les IDs des bons de réception sont requis sous forme de tableau." });
  }

  try {
      // Récupérer les bons de réception
      const bonsReception = await EnteteAchat.find({ _id: { $in: bonIds } })
          .populate("fournisseur")
          .populate("lignes.article");

      // Vérifier que tous les bons existent
      if (bonsReception.length !== bonIds.length) {
          return res.status(404).json({ message: "Un ou plusieurs bons de réception n'ont pas été trouvés." });
      }

      // Vérifier que tous les bons ont le même fournisseur
      const fournisseurId = bonsReception[0].fournisseur._id;
      if (!bonsReception.every((bon) => bon.fournisseur._id.toString() === fournisseurId.toString())) {
          return res.status(400).json({ message: "Tous les bons de réception doivent avoir le même fournisseur." });
      }

      // Vérifier que tous les bons sont "En attente"
      if (!bonsReception.every((bon) => bon.statut === "En attente")) {
          return res.status(400).json({ message: "Tous les bons de réception doivent avoir le statut 'En attente'." });
      }

      // Récupérer toutes les lignes des bons de réception
      const lignes = await LigneAchat.find({ bon: { $in: bonIds } }).populate("article");

      if (!lignes || lignes.length === 0) {
          return res.status(404).json({ message: "Aucune ligne de commande trouvée pour ces bons de réception." });
      }

      // Générer le numéro de facture
      const currentYear = new Date().getFullYear();
      const yearShort = currentYear.toString().slice(-2);

      // Trouver ou créer un compteur pour l'année en cours
      let counter = await CounterModel.findOneAndUpdate(
          { model: 'facture', year: currentYear },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
      );

      if (!counter) {
          return res.status(500).json({ message: "Erreur lors de la création du compteur." });
      }

      // Formater la séquence sur 5 chiffres
      const sequence = String(counter.seq).padStart(5, '0');
      const numero_facture = `FF ${yearShort} ${sequence}`;

      // Générer le PDF
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Nom de société", 10, 10);
      doc.text(`Facture N°: ${numero_facture}`, 10, 20);
      doc.text(`Date de facturation: ${new Date().toLocaleDateString()}`, 10, 30);
      doc.text(`Fournisseur: ${bonsReception[0].fournisseur.raison_sociale}`, 10, 40);
      doc.text(`Adresse: ${bonsReception[0].fournisseur.adresse || 'N/A'}`, 10, 50);
      doc.text(`Téléphone: ${bonsReception[0].fournisseur.telephone || 'N/A'}`, 10, 60);

      // Tableau des articles
      doc.autoTable({
          startY: 70,
          head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
          body: lignes.map(ligne => [
              ligne.article.libelle,
              ligne.quantite,
              `${ligne.prix_unitaire.toFixed(2)} TND`,
              `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND`
          ]),
      });

      // Totaux
      const totalHT = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
      const totalTTC = totalHT * 1.2; // TVA 20%

      doc.text(`Total HT: ${totalHT.toFixed(2)} TND`, 10, doc.autoTable.previous.finalY + 10);
      doc.text(`Total TTC: ${totalTTC.toFixed(2)} TND`, 10, doc.autoTable.previous.finalY + 20);

      // Convertir le PDF en Buffer
      const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
      const pdfDataUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

      // Créer la facture avec le fichier PDF
      const nouvelleFacture = new FactureFournisseur({
          numero_facture,
          date_facture: new Date(),
          fournisseur: fournisseurId,
          bonsReception: bonIds, // Liste des IDs des bons de réception
          fichierPdf: pdfBuffer,
          contentType: "application/pdf",
      });

      // Enregistrer la facture dans la base de données
      await nouvelleFacture.save();

      // Mettre à jour les bons de réception avec l'ID de la facture et leur statut
      await EnteteAchat.updateMany(
          { _id: { $in: bonIds } },
          { $set: { facture: nouvelleFacture._id, statut: "Facturé" } }
      );

      // Générer l'URL du PDF pour la prévisualisation
      const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(pdfBlob);

      res.status(200).json({ message: "Facture groupée générée et enregistrée avec succès", pdfUrl: pdfDataUrl });
  } catch (error) {
      console.error("Erreur lors de la génération de la facture groupée :", error);
      res.status(500).json({ message: "Erreur lors de la génération de la facture groupée" });
  }
};
*/


/*const genererFactureGroupe = async (req, res) => {
  const { bonIds } = req.body; // IDs des bons de réception à facturer

  if (!bonIds || !Array.isArray(bonIds)) {
    return res.status(400).json({ message: "Les IDs des bons de réception sont requis sous forme de tableau." });
  }

  try {
    // Récupérer les bons de réception
    const bonsReception = await EnteteAchat.find({ _id: { $in: bonIds } })
      .populate("fournisseur")
      .populate("lignes.article");

    // Vérifier que tous les bons existent
    if (bonsReception.length !== bonIds.length) {
      return res.status(404).json({ message: "Un ou plusieurs bons de réception n'ont pas été trouvés." });
    }

    // Vérifier que tous les bons ont le même fournisseur
    const fournisseurId = bonsReception[0].fournisseur._id;
    if (!bonsReception.every((bon) => bon.fournisseur._id.toString() === fournisseurId.toString())) {
      return res.status(400).json({ message: "Tous les bons de réception doivent avoir le même fournisseur." });
    }

    // Vérifier que tous les bons sont "En attente"
    if (!bonsReception.every((bon) => bon.statut === "En attente")) {
      return res.status(400).json({ message: "Tous les bons de réception doivent avoir le statut 'En attente'." });
    }

    // Récupérer toutes les lignes des bons de réception
    const lignes = await LigneAchat.find({ bon: { $in: bonIds } }).populate("article");

    if (!lignes || lignes.length === 0) {
      return res.status(404).json({ message: "Aucune ligne de commande trouvée pour ces bons de réception." });
    }

    // Générer le numéro de facture
    const currentYear = new Date().getFullYear();
    const yearShort = currentYear.toString().slice(-2);

    // Trouver ou créer un compteur pour l'année en cours
    let counter = await CounterModel.findOneAndUpdate(
      { model: 'facture', year: currentYear },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    if (!counter) {
      return res.status(500).json({ message: "Erreur lors de la création du compteur." });
    }

    // Formater la séquence sur 5 chiffres
    const sequence = String(counter.seq).padStart(5, '0');
    const numero_facture = `FF ${yearShort} ${sequence}`;

    // Générer le PDF
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Nom de société", 10, 10);
    doc.text(`Facture N°: ${numero_facture}`, 10, 20);
    doc.text(`Date de facturation: ${new Date().toLocaleDateString()}`, 10, 30);
    doc.text(`Fournisseur: ${bonsReception[0].fournisseur.raison_sociale}`, 10, 40);
    doc.text(`Adresse: ${bonsReception[0].fournisseur.adresse || 'N/A'}`, 10, 50);
    doc.text(`Téléphone: ${bonsReception[0].fournisseur.telephone || 'N/A'}`, 10, 60);

    let startY = 70; // Position Y de départ pour le tableau

    // Parcourir chaque bon de réception
    bonsReception.forEach((bon) => {
      // Ajouter un titre pour le bon de réception
      doc.setFontSize(14);
      doc.text(`Bon de Réception N°: ${bon.numero_Bon}`, 10, startY);
      doc.text(`Date de Réception: ${new Date(bon.dateReception).toLocaleDateString()}`, 10, startY + 10);

      // Filtrer les lignes pour ce bon de réception
      const lignesBon = lignes.filter((ligne) => ligne.bon.toString() === bon._id.toString());

      // Ajouter un tableau pour les lignes de ce bon de réception
      doc.autoTable({
        startY: startY + 15,
        head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
        body: lignesBon.map((ligne) => [
          ligne.article.libelle,
          ligne.quantite,
          `${ligne.prix_unitaire.toFixed(2)} TND`,
          `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND`,
        ]),
      });

      // Mettre à jour la position Y pour le prochain bon de réception
      startY = doc.autoTable.previous.finalY + 20;
    });

    // Calculer les totaux globaux
    const totalHT = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2; // TVA 20%

    // Ajouter les totaux globaux
    doc.text(`Total HT: ${totalHT.toFixed(2)} TND`, 10, startY);
    doc.text(`Total TTC: ${totalTTC.toFixed(2)} TND`, 10, startY + 10);

    // Convertir le PDF en Buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
    const pdfDataUrl = `data:application/pdf;base64,${pdfBuffer.toString("base64")}`;

    // Créer la facture avec le fichier PDF
    const nouvelleFacture = new FactureFournisseur({
      numero_facture,
      date_facture: new Date(),
      fournisseur: fournisseurId,
      bonsReception: bonIds, // Liste des IDs des bons de réception
      fichierPdf: pdfBuffer,
      contentType: "application/pdf",
    });

    // Enregistrer la facture dans la base de données
    await nouvelleFacture.save();

    // Mettre à jour les bons de réception avec l'ID de la facture et leur statut
    await EnteteAchat.updateMany(
      { _id: { $in: bonIds } },
      { $set: { facture: nouvelleFacture._id, statut: "Facturé" } }
    );

    // Générer l'URL du PDF pour la prévisualisation
    const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    res.status(200).json({ message: "Facture groupée générée et enregistrée avec succès", pdfUrl: pdfDataUrl });
  } catch (error) {
    console.error("Erreur lors de la génération de la facture groupée :", error);
    res.status(500).json({ message: "Erreur lors de la génération de la facture groupée" });
  }
};

*/

