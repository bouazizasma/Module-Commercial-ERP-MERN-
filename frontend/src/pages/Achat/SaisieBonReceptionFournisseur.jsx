import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Paper, Grid, TextField, IconButton, Card, CardContent, Typography, Dialog, DialogTitle, DialogContent, DialogActions,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Autocomplete } from "@mui/material";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import DeleteIcon from "@mui/icons-material/Delete";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
// Configurez le worker avec un CDN

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
export default function BonReceptionFournisseur() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [depots, setDepots] = useState([]);
  const [selectedFournisseur, setSelectedFournisseur] = useState('');
  const [selectedArticle, setSelectedArticle] = useState('');
  const [selectedDepot, setSelectedDepot] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [prixUnitaire, setPrixUnitaire] = useState(0);
  const [lignes, setLignes] = useState([]);
  const [dateReception, setDateReception] = useState(new Date());
  const [adresse, setAdresse] = useState('');
  const [matriculeFiscale, setMatriculeFiscale] = useState('');
  const [totalHT, setTotalHT] = useState(0);
  const [totalTTC, setTotalTTC] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [bonRception, setBonRception] = useState(null); // Nouvel état pour stocker le bon de réception

  useEffect(() => {
    axios.get("http://localhost:5000/fournisseur/fournisseurs").then(response => setFournisseurs(response.data));
    axios.get("http://localhost:5000/article/articles").then(response => setArticles(response.data));
    axios.get("http://localhost:5000/depot/depots").then(response => setDepots(response.data));
  }, []);

  useEffect(() => {
    const totalHT = lignes.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2;
    setTotalHT(totalHT);
    setTotalTTC(totalTTC);
  }, [lignes]);

  const handleAddLigne = () => {
    if (!selectedArticle || quantite <= 0) {
      alert("Veuillez remplir tous les champs correctement !");
      return;
    }
    const article = articles.find(a => a._id === selectedArticle);
    setLignes([...lignes, { article: selectedArticle, libelle: article.libelle, quantite, prix_unitaire: article.prix_net }]);
    setQuantite(1);
    setPrixUnitaire(0);
  };

  const handleRemoveLigne = (index) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!selectedFournisseur || lignes.length === 0 || !selectedDepot) {
    alert("Veuillez remplir tous les champs.");
    return;
  }
  const bonRception = {
    fournisseur: selectedFournisseur,
    lignes,
    total_ht: totalHT,
    total_ttc: totalTTC,
    depot: selectedDepot,
    dateReception: dateReception.toISOString(),
  };
  try {
    const response = await axios.post("http://localhost:5000/achat/BEF/create", bonRception);
    setBonRception(bonRception); // Stocker le bon de réception dans l'état
    setOpenSuccessModal(true); // Afficher la pop-up de succès
      } catch (error) {
    console.error("Erreur lors de la création du bon de réception:", error);
    alert("Erreur lors de la création du bon de réception.");
  }
};

const handleSuccessModalClose = () => {
  setOpenSuccessModal(false); // Fermer la pop-up de succès
  if (bonRception) {
    const pdfBlob = generatePDF(bonRception); // Générer le PDF
    const pdfUrl = URL.createObjectURL(pdfBlob); // Créer l'URL du PDF
    setPdfUrl(pdfUrl); // Mettre à jour l'état avec l'URL du PDF
    setOpenModal(true); // Ouvrir la modal de prévisualisation du PDF
  }
};

  const generatePDF = (bonRception) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Bon de Reception", 10, 10);
    doc.setFontSize(12);
    doc.text(`bon de receptionn N°: ${bonRception.numero_Bon}`, 10, 20);
    doc.text(`Date Reception: ${new Date(bonRception.dateReception).toLocaleDateString()}`, 10, 30);
    const fournisseur = fournisseurs.find(f => f._id === bonRception.fournisseur);
    doc.text(`À l'intention de: ${fournisseur.raison_sociale}`, 10, 40);
    doc.text(`Adresse: ${fournisseur.adresse || 'N/A'}`, 10, 50);
    doc.text(`Téléphone: ${fournisseur.telephone || 'N/A'}`, 10, 60);
    doc.autoTable({
      startY: 70,
      head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
      body: bonRception.lignes.map(ligne => [
        ligne.libelle,
        ligne.quantite,
        `${ligne.prix_unitaire.toFixed(2)} TND`,
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND`
      ]),
    });
    const pdfBlob = doc.output('blob');
    console.log("PDF Blob:", pdfBlob); // Vérifiez le Blob dans la console
    return pdfBlob;
  };
  const handleCloseModal = () => {
    setOpenModal(false);
    URL.revokeObjectURL(pdfUrl);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'bon_de_Reception.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleCloseModal();
  };

  return (
    <>
      <Navbar />
      <Box height={20} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto", maxHeight: "100vh" }}>
          <Typography variant="h4" sx={{ mb: 3 }}>Créer un bon de Réception fournisseur</Typography>
          {/* Fournisseur*/}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ textAlign: 'left' }}>Informations Fournisseur</Typography>
              <Grid container spacing={2}>
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
                      } else {
                        setSelectedFournisseur('');
                        setAdresse('');
                        setMatriculeFiscale('');
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Fournisseur" fullWidth required />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField label="Adresse" value={adresse} fullWidth disabled />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField label="Matricule Fiscale" value={matriculeFiscale} fullWidth disabled />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Date de Reception"
                      value={dateReception}
                      onChange={(newValue) => setDateReception(newValue)}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </LocalizationProvider>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/*article */}
          <Card sx={{ p: 3, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ textAlign: 'left' }}>Informations Articles</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <Autocomplete
                    options={articles}
                    getOptionLabel={(option) => option.libelle}
                    value={articles.find(a => a._id === selectedArticle) || null}
                    onChange={(e, newValue) => {
                      if (newValue) {
                        setSelectedArticle(newValue._id);
                        setPrixUnitaire(newValue.prix_net || 0);
                      } else {
                        setSelectedArticle('');
                        setPrixUnitaire(0);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Article" fullWidth required />
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
                  <TextField
                    label="Prix unitaire"
                    type="number"
                    value={prixUnitaire}
                    fullWidth
                    required
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
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
                      <TextField {...params} label="Dépôt" fullWidth required />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={1}>
                  <IconButton color="primary" onClick={handleAddLigne}>
                    <AddCircleOutlineIcon fontSize="large" />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/*lignes */}
          {lignes.length > 0 && (
            <Card sx={{ p: 3, mb: 3 }}>
              <CardContent>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Article</TableCell>
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
                          <TableCell>{ligne.quantite}</TableCell>
                          <TableCell>{ligne.prix_unitaire} TND</TableCell>
                          <TableCell>{(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND</TableCell>
                          <TableCell>
                            <IconButton color="error" onClick={() => handleRemoveLigne(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

          {/* Partie fixe dans le footer */}
          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 300,
              right: 0,
              width: '70%',
              backgroundColor: 'background.paper',
              boxShadow: 3,
              zIndex: 1000,
              p: 2,
            }}
          >
            <Grid container alignItems="center" justifyContent="space-between">
              {/* Totaux HT et TTC au centre */}
              <Grid item>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="h6">Total HT: {totalHT.toFixed(2)} TND</Typography>
                  <Typography variant="h6">Total TTC: {totalTTC.toFixed(2)} TND</Typography>
                </Box>
              </Grid>

              {/* Bouton à droite */}
              <Grid item>
                <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
                  Créer le bon de Réception
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
      <Dialog open={openSuccessModal} onClose={handleSuccessModalClose}>
  <DialogTitle>Succès</DialogTitle>
  <DialogContent>
    <Typography>Le bon de réception a été créé avec succès.</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleSuccessModalClose} color="primary">
      OK
    </Button>
  </DialogActions>
</Dialog>

      {/* Modal pour afficher le PDF */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
        <DialogTitle>Prévisualisation du Bon de réception</DialogTitle>
        <DialogContent>
        <Document file={pdfUrl}
        onLoadSuccess={() => console.log("PDF loaded successfully")}
        onLoadError={(error) => console.error("Failed to load PDF:", error)}>
      <Page pageNumber={1} />
    </Document>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal}>Fermer</Button>
          <Button onClick={handleDownload} color="primary">Télécharger</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}