
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import {  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Paper, Grid, TextField, IconButton,} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"; // Icône pour le bouton Ajouter
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Autocomplete } from "@mui/material";
import jsPDF from "jspdf";
import 'jspdf-autotable';
export default function BonCommandeFournisseur() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [depots, setDepots] = useState([]);
  const [selectedFournisseur, setSelectedFournisseur] = useState('');
  const [selectedArticle, setSelectedArticle] = useState('');
  const [selectedDepot, setSelectedDepot] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [prixUnitaire, setPrixUnitaire] = useState(0);
  const [lignes, setLignes] = useState([]);
  const [isFournisseurSelected, setIsFournisseurSelected] = useState(false);
  const [isArticleSelected, setIsArticleSelected] = useState(false);
  const [dateCommande, setDateCommande] = useState(new Date());
  const [adresse, setAdresse] = useState(''); // État pour l'adresse
  const [matriculeFiscale, setMatriculeFiscale] = useState(''); // État pour le matricule fiscal
  useEffect(() => {
    axios.get("http://localhost:5000/fournisseur/fournisseurs").then(response => setFournisseurs(response.data));
    axios.get("http://localhost:5000/article/articles").then(response => setArticles(response.data));
    axios.get("http://localhost:5000/depot/depots").then(response => setDepots(response.data));

  }, []);

  {/*  Fournisseur Change */}
  const handleFournisseurChange = (e) => {
    const selectedId = e.target.value;
    setSelectedFournisseur(selectedId);
    setIsFournisseurSelected(true);
    // Récupérer les informations du fournisseur sélectionné
    const selectedFournisseurData = fournisseurs.find(f => f._id === selectedId);
    if (selectedFournisseurData) {
      setAdresse(selectedFournisseurData.adresse || ''); // Mettre à jour l'adresse
      setMatriculeFiscale(selectedFournisseurData.matricule_fiscale || ''); // Mettre à jour le matricule fiscal
    }
    setSelectedFournisseur(selectedId);
    setIsFournisseurSelected(true);

  };

  {/* Article */}
  const handleArticleChange = (e) => {
    const selectedId = e.target.value;
    setSelectedArticle(selectedId);
    setIsArticleSelected(true);
    // Récupérer les informations du fournisseur sélectionné
    const selectedArticleData = articles.find(a => a._id === selectedId);
    if (selectedArticleData) {
      const prixs = selectedArticleData.prix_net ; 

      const prix = Number(prixs) || 0; 
      console.log("prix dans handleArticleChange:", prix); // Debug
      setPrixUnitaire(prix || 0 ); // Mettre à jour le prix 
    }
    else {
      setPrixUnitaire(20);
    }
  };
  {/* Add Ligne*/}
  const handleAddLigne = () => {
    if (!selectedArticle || quantite <= 0 ) {
      alert("Veuillez remplir tous les champs correctement !");
      return;
    }
    const article = articles.find(a => a._id === selectedArticle);
    setLignes([...lignes, { article: selectedArticle, libelle: article.libelle, quantite, prix_unitaire: article.prix_net }]);
    //setSelectedArticle('');
    //setSelectedFournisseur('');
    setQuantite(1);
    setPrixUnitaire(0);
  };
  {/* Remove Ligne */ }
  const handleRemoveLigne = (index) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };
  { /* Géneration d'un PDF  */}
  const generatePDF = (bonCommande) => {
    const doc = new jsPDF();

    // Titre du document
    doc.setFontSize(18);
    doc.text("Bon de Commande", 10, 10);

    // Informations de base
    doc.setFontSize(12);
    doc.text(`Commande N°: ${bonCommande.numero_commande}`, 10, 20);
    doc.text(`Date Commande: ${new Date(bonCommande.dateCommande).toLocaleDateString()}`, 10, 30);

    // Informations du fournisseur
    const fournisseur = fournisseurs.find(f => f._id === bonCommande.fournisseur);
    doc.text(`À l'intention de:`, 10, 40);
    doc.text(`Nom: ${fournisseur.raison_sociale}`, 10, 50);
    doc.text(`Adresse: ${fournisseur.adresse || 'N/A'}`, 10, 70);
    doc.text(`Téléphone: ${fournisseur.telephone || 'N/A'}`, 10, 80);

    // Tableau des informations de contact sur site
    doc.autoTable({
        startY: 100,
        head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
        body: bonCommande.lignes.map(ligne => 
        {  const article = articles.find(a => a._id === ligne.article);
            const nomArticle = article ? article.libelle : 'Article inconnu';
          return[
            nomArticle, // Numéro d'article
            ligne.quantite, // Quantité
            `${ligne.prix_unitaire.toFixed(2)} TND`, // Prix unitaire
            `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND` // Total (quantité * prix unitaire)
        ];}),
    });
    // Titre de la section des articles
    doc.setFontSize(14);
   // doc.text("Articles commandés:", 10, doc.autoTable.previous.finalY + 10);

    // Tableau des articles commandés
  /* doc.autoTable({
        startY: doc.autoTable.previous.finalY + 20,
        head: [['# Item', 'Quantité', 'Prix Unitaire', 'Total']], // Ajout des colonnes "Quantité", "Prix Unitaire" et "Total"
        body: bonCommande.lignes.map(ligne => [
            ligne.article, // Numéro d'article
            ligne.quantite, // Quantité
            `${ligne.prix_unitaire.toFixed(2)} TND`, // Prix unitaire
            `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND` // Total (quantité * prix unitaire)
        ]),
        theme: 'grid'
    }); */

    // Instructions
    doc.setFontSize(12);
    //doc.text("Instructions:", 10, doc.autoTable.previous.finalY + 10);
   // doc.text("Inscrire vos commentaires, vous pouvez écrire sur plusieurs lignes en appuyant sur ENTRER.", 10, doc.autoTable.previous.finalY + 20);
    // Signature
    doc.text("Nom du signataire: ___________________________", 10, doc.autoTable.previous.finalY + 40);
    doc.text("Signature: ___________________________", 10, doc.autoTable.previous.finalY + 50);

    // Sauvegarder le PDF
    doc.save("bon_de_commande.pdf");
};
  {/* Submit */}
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFournisseur || lignes.length === 0 || !selectedDepot) {
      alert("Veuillez Remplir tout les champs.");
      return;
    }
    if (!dateCommande || isNaN(dateCommande.getTime())) {
      alert("Date de commande invalide.");
      return;
  }
    const total_ht = Number(lignes.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0));
    const total_ttc = total_ht * 1.2;
    const anneeReference = dateCommande.getFullYear();
    if (!anneeReference || anneeReference < 2000 || anneeReference > 2100) {
        alert("L'année de référence est invalide.");
        return;
    
      }
    const bonCommande = {
      fournisseur: selectedFournisseur,
      lignes,
      total_ht ,
      total_ttc,
      depot: selectedDepot,
      dateCommande: dateCommande.toISOString(), // Convertir la date en format ISO
      anneeReference,
    };
    console.log("Données envoyées au backend:", bonCommande);

    try {
      const response = await axios.post("http://localhost:5000/boncommandeF/create", bonCommande);
      console.log('Bon de commande créé:', response.data);
      alert('Bon de commande créé avec succès !');
      generatePDF(bonCommande);
      setSelectedFournisseur('');
      setSelectedArticle('');
      setIsFournisseurSelected(false);
      setLignes([]);
      setSelectedDepot('');
      setDateCommande(new Date());

    } catch (error) {
      console.error("Erreur lors de la création du bon de commande:", error); // Message d'erreur plus précis
            if (error.response) {
                console.error("Réponse du serveur:", error.response.data); // Afficher les détails de l'erreur du serveur
                alert(`Erreur lors de la création du bon de commande: ${error.response.data.message || "Une erreur est survenue"}`); // Afficher un message d'erreur plus convivial
            } else if (error.request) {
                console.error("Pas de réponse du serveur:", error.request);
                alert("Erreur lors de la création du bon de commande: Pas de réponse du serveur");
            } else {
                console.error("Erreur de configuration de la requête:", error.message);
                alert(`Erreur lors de la création du bon de commande: ${error.message}`);
            }}};
  return (
    <>
      <Navbar />
      <Box height={100} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: "auto",
            maxHeight: "100vh",
          }}
        >
          <h1>Créer un bon de commande fournisseur</h1>
          <form onSubmit={handleSubmit}>
 {/* Partie fournisseur */}
            <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
              {/* Sélection du fournisseur */}
              <Grid item xs={12} sm={6} md={4}>
              <Autocomplete
           options={fournisseurs}
           getOptionLabel={(option) => option.raison_sociale}
           value={fournisseurs.find(f => f._id === selectedFournisseur) || null}
           onChange={(e, newValue) => {
           if (newValue) {
          setSelectedFournisseur(newValue._id);
         setAdresse(newValue.adresse || '');
        setMatriculeFiscale(newValue.matricule_fiscale || '');
        setIsFournisseurSelected(true);
           } else {
        setSelectedFournisseur('');
        setAdresse('');
        setMatriculeFiscale('');
        setIsFournisseurSelected(false);
      }
    }}
    renderInput={(params) => (
      <TextField
       {...params}
        label="Fournisseur"
        fullWidth
        required
      />
    )} />
              </Grid>
              {/* Adresse du fournisseur */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Adresse"
                  type="string"
                  value={adresse}
                  fullWidth
                  required
                  disabled // Désactiver le champ pour empêcher la modification manuelle
                />
              </Grid>
              {/* Matricule Fiscale du fournisseur */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Matricule Fiscale"
                  type="string"
                  value={matriculeFiscale}
                  fullWidth
                  required
                  disabled // Désactiver le champ pour empêcher la modification manuelle
                />
              </Grid>
               {/* Champ DatePicker */}
               <Grid item xs={12} sm={6} md={4}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Date de commande"
                    value={dateCommande}
                    onChange={(newValue) => setDateCommande(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
            {/* Sélection des détails de la ligne */}
            <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Autocomplete
               options={articles}
               getOptionLabel={(option) => option.libelle}
               value={articles.find(a => a._id === selectedArticle) || null}
               onChange={(e, newValue) => {
                if (newValue) {
              setSelectedArticle(newValue._id);
               setPrixUnitaire(newValue.prix_net || 0);
               setIsArticleSelected(true);
             } else {
             setSelectedArticle('');
             setPrixUnitaire(0);
              setIsArticleSelected(false);
             }
           }}
            renderInput={(params) => (
            <TextField
              {...params}
              label="Article"
              fullWidth
              required
             />
            )}
               />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  label="Quantité"
                  type="number"
                  value={quantite}
                  onChange={(e) => setQuantite(parseInt(e.target.value))}
                  fullWidth
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
              {console.log("prixUnitaire avant affichage:", prixUnitaire)} {/* Debug */}

                <TextField
                  label="Prix unitaire"
                  type="number"
                  value={prixUnitaire}
                  fullWidth
                  required
                  disabled // Désactiver le champ pour empêcher la modification manuelle
                />
              </Grid>
              {/* Depot */}
              <Grid item xs={12} sm={6} md={4}>
            <Autocomplete
             options={depots}
             getOptionLabel={(option) => option.libelle}
             value={depots.find(d => d._id === selectedDepot) || null}
             onChange={(e, newValue) => {
             if (newValue) {
              setSelectedDepot(newValue._id);
            } else {
              setSelectedDepot('');
             }
    }}
    renderInput={(params) => (
      <TextField
        {...params}
        label="Dépôt"
        fullWidth
        required
      />
    )}
  />
        </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <IconButton color="primary" onClick={handleAddLigne}>
                  <AddCircleOutlineIcon fontSize="large" />
                </IconButton>
              </Grid>
            </Grid>
            {/* Tableau des lignes de commande */}
            {lignes.length > 0 && (
              <TableContainer component={Paper} sx={{ marginTop: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Article</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Quantité</TableCell>
                      <TableCell>Prix Unitaire</TableCell>
                      <TableCell>Total</TableCell>
                      <TableCell>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {lignes.map((ligne, index) => (
                      <TableRow key={index}>
                        <TableCell>{ligne.libelle}</TableCell>
                        <TableCell>{dateCommande && <h3>Date sélectionnée: {dateCommande.toLocaleDateString()}</h3>}</TableCell>
                        <TableCell>{ligne.quantite}</TableCell>
                        <TableCell>{ligne.prix_unitaire} TND</TableCell>
                        <TableCell>{(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND</TableCell>
                        <TableCell>
                          <Button variant="contained" color="error" onClick={() => handleRemoveLigne(index)}>Supprimer</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 3 }} >
              Créer le bon de commande
            </Button>
          </form>
        </Box>
      </Box>
    </>
  );
}