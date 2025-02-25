//Controlleur FactureFournisseur 
const { jsPDF } = require("jspdf"); // Import correct de jsPDF
require("jspdf-autotable"); // Import de jspdf-autotable
const { Buffer } = require("buffer");
const EnteteAchat = require("../Models/Achat/EnteteAchat");
const LigneAchat = require("../Models/Achat/LignesAchat"); // Assurez-vous que le chemin est correct
const FactureFournisseur = require("../Models/Achat/FactureFournisseur");
const  Fournisseur = require("../Models/Fournisseur"); // Chemin correct vers votre modèle

// Générer une facture et la stocker en tant que PDF
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

const genererFacture = async (req, res) => {
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
};
// Télécharger une facture
const downloadFacture = async (req, res) => {
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


module.exports = { genererFacture, downloadFacture , getAll ,deleteFac};