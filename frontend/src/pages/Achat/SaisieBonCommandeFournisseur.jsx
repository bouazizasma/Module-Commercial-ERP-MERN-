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
import { useNavigate } from "react-router-dom";
import 'jspdf-autotable';
import DeleteIcon from "@mui/icons-material/Delete";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
// Configurez le worker avec un CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
export default function BonCommandeFournisseur() {
  const navigate = useNavigate();
  const [fournisseurs, setFournisseurs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [depots, setDepots] = useState([]);
  const [selectedFournisseur, setSelectedFournisseur] = useState('');
  const [selectedArticle, setSelectedArticle] = useState('');
  const [selectedDepot, setSelectedDepot] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [prixUnitaire, setPrixUnitaire] = useState(0);
  const [tva, setTva] = useState(0);
  const [remise, setRemise] = useState(0);
  const [dc, setDc] = useState(0);
  const [fodec, setFodec] = useState(0);
  const [prix_uTTC, setPrix_uTTC] = useState(0);
  const [lignes, setLignes] = useState([]);
  const [dateCommande, setDateCommande] = useState(new Date());
  const [adresse, setAdresse] = useState('');
  const [matriculeFiscale, setMatriculeFiscale] = useState('');
  const [totalHT, setTotalHT] = useState(0);
  const [totalTTC, setTotalTTC] = useState(0);
  const [openModal, setOpenModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [bonCommande, setBonCommande] = useState(null); // Nouvel état pour stocker le bon de commande
  useEffect(() => {
    axios.get("http://localhost:5000/fournisseur/fournisseurs").then(response => setFournisseurs(response.data));
    axios.get("http://localhost:5000/article/articles").then(response => setArticles(response.data));
    axios.get("http://localhost:5000/depot/depots").then(response => setDepots(response.data));
  }, []);

  useEffect(() => {
    const totalHT = lignes.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_uTTC), 0);
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
    setLignes([...lignes, { article: selectedArticle, libelle: article.libelle, quantite,
    prix_unitaire: article.prixht , 
    tva : article.tva ,
    remise : article.remise,
    dc: article.dc , fodec: article.fodec ,
    prix_uTTC : article.prix_totale_concre
       }]);
    setQuantite(1);
    setPrixUnitaire(0);
    setTva(0);
    setRemise(0);
    setDc(0);
    setFodec(0);
    setPrix_uTTC(0);
  };

  const handleRemoveLigne = (index) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  {/*const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFournisseur || lignes.length === 0 || !selectedDepot) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    const bonCommande = {
      fournisseur: selectedFournisseur,
      lignes,
      total_ht: totalHT,
      total_ttc: totalTTC,
      depot: selectedDepot,
      dateCommande: dateCommande.toISOString(),
    };
    try {
      const response = await axios.post("http://localhost:5000/boncommandeF/create", bonCommande);
      alert('Bon de commande créé avec succès !');
      const pdfBlob = generatePDF(bonCommande);
      const pdfUrl = URL.createObjectURL(pdfBlob);
      console.log("PDF URL:", pdfUrl); // Ajoutez ce log pour vérifier l'URL
      setPdfUrl(pdfUrl);
      setOpenModal(true);
      setSelectedFournisseur('');
      setSelectedArticle('');
      setLignes([]);
      setSelectedDepot('');
      setDateCommande(new Date());
    } catch (error) {
      console.error("Erreur lors de la création du bon de commande:", error);
      alert("Erreur lors de la création du bon de commande.");
    }
  };
*/}

/*const handleSubmit = async (e) => {
  e.preventDefault();
  if (!selectedFournisseur || lignes.length === 0 || !selectedDepot) {
    alert("Veuillez remplir tous les champs.");
    return;
  }
    // Vérifiez que les lignes ne sont pas vides
    if (lignes.length === 0) {
      alert("Veuillez ajouter au moins une ligne de commande.");
      return;
    }
  
    // Vérifiez que la date est valide
    if (!dateCommande || isNaN(dateCommande.getTime())) {
      alert("Date de commande invalide.");
      return;
    }
  const bonCommande = {
    fournisseur: selectedFournisseur,
    lignes,
    total_ht: totalHT,
    total_ttc: totalTTC,
    depot: selectedDepot,
    dateCommande: dateCommande.toISOString(),
  };
  try {
    const response = await axios.post("http://localhost:5000/achat/BCF/create", bonCommande);
    console.log("Réponse API:", response.data); // Vérifiez si numero_commande est bien présent
    console.log("Bon de Commande:", response.data.bonCommande); // Log the bonCommande object

    // setBonCommande(response.data); // Stocker la réponse API (et non l’objet bonCommande initial)
    setBonCommande(response.data.bonCommande); // Use the populated bonCommande from the response
    
    setOpenSuccessModal(true); // Afficher la pop-up de succès
      } catch (error) {
    console.error("Erreur lors de la création du bon de commande:", error);
    alert("Erreur lors de la création du bon de commande.");
  }
};
*/



const handleSubmit = async (e) => {
  e.preventDefault();

  // Vérifiez que les champs requis sont remplis
  if (!selectedFournisseur || lignes.length === 0 || !selectedDepot) {
    alert("Veuillez remplir tous les champs.");
    return;
  }

  // Vérifiez que les lignes ne sont pas vides
  if (lignes.length === 0) {
    alert("Veuillez ajouter au moins une ligne de commande.");
    return;
  }

  // Vérifiez que la date est valide
  if (!dateCommande || isNaN(dateCommande.getTime())) {
    alert("Date de commande invalide.");
    return;
  }

  // Préparez l'objet bonCommande
  const bonCommande = {
    fournisseur: selectedFournisseur,
    lignes: lignes,
    total_ht: totalHT,
    total_ttc: totalTTC,
    depot: selectedDepot,
    dateCommande: dateCommande.toISOString(),
  };

  console.log("Données envoyées:", bonCommande); // Vérifiez les données dans les logs

  // Envoyez la requête
  try {
    const response = await axios.post("http://localhost:5000/achat/BCF/create", bonCommande);
    console.log("Réponse API:", response.data);
    setBonCommande(response.data.bonCommande);
    setOpenSuccessModal(true);
  } catch (error) {
    console.error("Erreur lors de la création du bon de commande:", error);
    alert("Erreur lors de la création du bon de commande.");
  }
};
const handleSuccessModalClose = () => {
  setOpenSuccessModal(false); // Fermer la pop-up de succès
  if (bonCommande) {
    console.log("Lignes de Commande:", bonCommande.lignes); // Vérifiez les lignes
    const pdfBlob = generatePDF(bonCommande); // Générer le PDF
    const pdfUrl = URL.createObjectURL(pdfBlob); // Créer l'URL du PDF
    setPdfUrl(pdfUrl); // Mettre à jour l'état avec l'URL du PDF
    setOpenModal(true); // Ouvrir la modal de prévisualisation du PDF
  }
};

/*const generatePDF = (bonCommande) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Bon de Commande", 10, 10);
    doc.setFontSize(12);
    doc.text(`Commande N°: ${bonCommande.numero_commande}`, 10, 20);
    doc.text(`Date Commande: ${new Date(bonCommande.dateCommande).toLocaleDateString()}`, 10, 30);
    if (!bonCommande.fournisseur) {
      console.error("Fournisseur is undefined");
      return;
  }
  const fournisseur = bonCommande.fournisseur;
  doc.text(`À l'intention de: ${fournisseur.raison_sociale}`, 10, 40);
  doc.text(`Adresse: ${fournisseur.adresse || 'N/A'}`, 10, 50);
  doc.text(`Téléphone: ${fournisseur.telephone || 'N/A'}`, 10, 60);
    doc.autoTable({
      startY: 70,
      head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
      body: bonCommande.lignes.map(ligne => [
        ligne.libelle,
        ligne.quantite,
      `${Number(ligne.prix_unitaire).toFixed(2)} TND`,
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND`
      ]),
    });
    const pdfBlob = doc.output('blob');
    console.log("PDF Blob:", pdfBlob); // Vérifiez le Blob dans la console
    return pdfBlob;
  };
*/

const generatePDF = (bonCommande) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text("Bon de Commande", 10, 10);
  doc.setFontSize(12);

  // Check if numero_Bon exists
  if (!bonCommande.numero_Bon) {
      console.error("numero_Bon is undefined in bonCommande:", bonCommande);
      return;
  }
  doc.setFontSize(12);
  doc.text(`Commande N°: ${bonCommande.numero_Bon}`, 10, 20);
  doc.text(`Date Commande: ${new Date(bonCommande.dateCommande).toLocaleDateString()}`, 10, 30);
  // Ensure fournisseur is defined
  if (!bonCommande.fournisseur) {
      console.error("Fournisseur is undefined in bonCommande:", bonCommande);
      return;
  }

  const fournisseur = bonCommande.fournisseur;
  doc.text(`À l'intention de: ${fournisseur.raison_sociale}`, 10, 40);
  doc.text(`Adresse: ${fournisseur.adresse || 'N/A'}`, 10, 50);
  doc.text(`Téléphone: ${fournisseur.telephone || 'N/A'}`, 10, 60);

  // Add table for lignes
  doc.autoTable({
    startY: 80,
    head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
    body: bonCommande.lignes.map(ligne => [
      ligne.article.libelle,
      'DT',
      ligne.quantite,
      `${ligne.prix_unitaire.toFixed(2)} DT`,
      `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} DT`
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
    link.download = (`bon_de_commande_${bonCommande.numero_Bon}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    handleCloseModal();
  };

  return (
    <>
      <Navbar />
      <Box height={80} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto", maxHeight: "100vh" }}>
          <Typography variant="h4" sx={{ mb: 3 }}>Créer un bon de commande fournisseur</Typography>
          {/* Fournisseur*/}
        {/* Fournisseur */}
        <Card sx={{ mb: 3}}>
     <CardContent>
    <Typography variant="h6" sx={{ textAlign: 'left' }}>Informations Fournisseur</Typography>
    <Grid container spacing={2} alignItems="center">
      {/* Champ Fournisseur */}
      <Grid item xs={12} sm={5} md={4}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={10} sm={10} md={10}>
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
          {/* Bouton Ajouter Fournisseur */}
          <Grid item xs={2} sm={2} md={2}>
            <IconButton color="primary" onClick={() => navigate("/createFournisseur")}>
              <AddCircleOutlineIcon fontSize="large" />
            </IconButton>
          </Grid>
        </Grid>
      </Grid>

      {/* Champ Adresse */}
      <Grid item xs={12} sm={3} md={3}>
        <TextField label="Adresse" value={adresse} fullWidth disabled />
      </Grid>

      {/* Champ Matricule Fiscale */}
      <Grid item xs={12} sm={2} md={2}>
        <TextField label="Matricule Fiscale" value={matriculeFiscale} fullWidth disabled />
      </Grid>

      {/* Champ Date de commande */}
      <Grid item xs={12} sm={2} md={3}>
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
  </CardContent>
</Card>

          {/*article */}
          <Card sx={{ p: 3, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ textAlign: 'left' }}>Informations Articles</Typography>
              <Grid container spacing={2} alignItems="center">
                {/*select article */}
                <Grid item xs={12} sm={6} md={2}>
                  <Autocomplete
                    options={articles}
                    getOptionLabel={(option) => option.libelle}
                    value={articles.find(a => a._id === selectedArticle) || null}
                    onChange={(e, newValue) => {
                      if (newValue) {
                        setSelectedArticle(newValue._id);
                        setPrixUnitaire(newValue.prixht || 0);
                        setPrix_uTTC(newValue.prix_totale_concre || 0);
                        setTva(newValue.tva || 0);
                        setFodec(newValue.fodec || 0);
                        setDc(newValue.dc || 0);
                        setRemise(newValue.remise || 0); 
                      } else {
                        setSelectedArticle('');
                        setPrixUnitaire(0);
                        setPrix_uTTC(0);
                        setTva(0);
                        setFodec(0);
                        setDc(0);
                        setRemise(0); 
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Article" fullWidth required />
                    )}
                  />
                </Grid>
            {/* prix unitaire ht*/ }
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
                 {/* Remise*/ }
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label="Remise"
                    type="number"
                    value={remise}
                    fullWidth
                    required
                    disabled
                  />
                </Grid>
                   {/* TVA*/ }
                   <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label="TVA"
                    type="number"
                    value={tva}
                    fullWidth
                    required
                    disabled
                  />
                </Grid>
                  {/* DC */ }
                  <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label="Droit de consommation"
                    type="number"
                    value={dc}
                    fullWidth
                    required
                    disabled
                  />
                </Grid>
                 {/* fodec */ }
                 <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label="Fonds de Développement de la Compétitivité Industrielle"
                    type="number"
                    value={fodec}
                    fullWidth
                    required
                    disabled
                  />
                </Grid>
                 {/* puTTC */ }
                 <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label="Prix Unitaire TTC"
                    type="number"
                    value={prix_uTTC}
                    fullWidth
                    required
                    disabled
                  />
                </Grid>

                {/* quantité*/}
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
               
                {/* select depot */}
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
                {/* add ligne */}
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
                        <TableCell>Prix Unitaire TTC</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lignes.map((ligne, index) => (
                        <TableRow key={index}>
                          <TableCell>{ligne.libelle}</TableCell>
                          <TableCell>{ligne.quantite}</TableCell>
                          <TableCell>{ligne.prix_uTTC} TND</TableCell>
                          <TableCell>{(ligne.quantite * ligne.prix_uTTC).toFixed(2)} TND</TableCell>
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
                  Créer le bon de commande
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
      <Dialog open={openSuccessModal} onClose={handleSuccessModalClose}>
  <DialogTitle>Succès</DialogTitle>
  <DialogContent>
    <Typography>Le bon de commande a été créé avec succès.</Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleSuccessModalClose} color="primary">
      OK
    </Button>
  </DialogActions>
</Dialog>

      {/* Modal pour afficher le PDF */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
  <DialogTitle>Prévisualisation du Bon de Commande</DialogTitle>
  <DialogContent>
    <iframe
      src={pdfUrl}
      width="100%"
      height="500px" // Ajustez la hauteur selon vos besoins
      style={{ border: "none" }}
      title="Prévisualisation du PDF"
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={handleCloseModal}>Fermer</Button>
    <Button onClick={handleDownload} color="primary">Télécharger</Button>
  </DialogActions>
</Dialog>
    </>
  );
}