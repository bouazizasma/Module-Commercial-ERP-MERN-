import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import {Card, CardContent, Typography, Grid, TextField, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Autocomplete, Stack, Divider, Radio, RadioGroup, FormControlLabel, FormLabel, FormControl, Alert, Snackbar, Dialog, DialogTitle, DialogContent, DialogActions} from "@mui/material";
import { Add as AddIcon, Delete as DeleteIcon, Print as PrintIcon, Download as DownloadIcon, Mode } from "@mui/icons-material";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function SaisieBonLivraisonClient() {
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [depots, setDepots] = useState([]);
  const [vehicules, setVehicules] = useState([]);
  const [secteurs, setSecteurs] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedDepot, setSelectedDepot] = useState(null);
  const [selectedSecteur, setSelectedSecteur] = useState(null);

  const [selectedVehicule, setSelectedVehicule] = useState(null);
  const [dateFacture, setDateFacture] = useState(new Date().toISOString().slice(0, 10));
  const [typePaiement, setTypePaiement] = useState("Espèce");
  const [dateBonLivraison, setDateBonLivraison] = useState(new Date());

  const [lignes, setLignes] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [quantite, setQuantite] = useState(1);
  const [prixUnitaire, setPrixUnitaire] = useState(0);
  const [tva, setTva] = useState(0);
  const [remise, setRemise] = useState(0);
  const [prix_uTTC, setPrix_uTTC] = useState(0);
  const [totalHT, setTotalHT] = useState(0);
  const [totalTTC, setTotalTTC] = useState(0);
  const [timbre, setTimbre] = useState(1.000);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [chauffeur, setChauffeur] = useState("");
  const [notation, setNotation] = useState("");

  // Pour les infos client affichées
  const [adresse, setAdresse] = useState("");
  const [matriculeFiscale, setMatriculeFiscale] = useState("");
  const [telephone, setTelephone] = useState("");

  const [openPdfDialog, setOpenPdfDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Début de la récupération des données...");
        const [clientsResponse, articlesResponse, depotsResponse, vehiculesResponse , secteurResponse] = await Promise.all([
          axios.get("http://localhost:5000/client/clients"),
          axios.get("http://localhost:5000/article/articles"),
          axios.get("http://localhost:5000/depot/depots"),
          axios.get("http://localhost:5000/vehicule/Vehicules") ,
          axios.get("http://localhost:5000/secteur/secteurs") 

        ]);
        console.log("Clients:", clientsResponse.data);
        console.log("Articles:", articlesResponse.data);
        console.log("Dépôts:", depotsResponse.data);
        console.log("Véhicules:", vehiculesResponse.data);
        console.log("Secteurs:", secteurResponse.data);

        setClients(clientsResponse.data);
        setArticles(articlesResponse.data);
        setDepots(depotsResponse.data);
        setVehicules(vehiculesResponse.data);
        setSecteurs(secteurResponse.data);

      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setSnackbarSeverity("error");
        setSnackbarMessage("Erreur lors de la récupération des données");
        setOpenSnackbar(true);
      }
    };
    fetchData();
  }, []);

  const handleClientChange = (event, newValue) => {
    setSelectedClient(newValue);
    if (newValue) {
      setAdresse(newValue.adresse || "");
      setMatriculeFiscale(newValue.matricule_fiscale || "");
      setTelephone(newValue.telephone || "");
    } else {
      setAdresse("");
      setMatriculeFiscale("");
      setTelephone("");
    }
  };

  const handleDepotChange = (event, newValue) => {
    setSelectedDepot(newValue);
  };

  const handleSecteurChange = (event, newValue) => {
    setSelectedSecteur(newValue);
  };


  const handleVehiculeChange = (event, newValue) => {
    setSelectedVehicule(newValue);
  };

  const handleArticleChange = (event, newValue) => {
    setSelectedArticle(newValue);
    if (newValue) {

    const prixHT = newValue.prixht || 0;
    const tauxTVA = newValue.tva || 19;
    const tauxRemise = newValue.remise || 0;
    
    const prixTTC = prixHT * (1 + tauxTVA / 100);
      setPrixUnitaire(prixHT);
      setTva(tauxTVA);
      setRemise(tauxRemise);
      setPrix_uTTC(prixTTC);
    } else {
      setPrixUnitaire(0);
      setTva(19);
      setRemise(0);
      setPrix_uTTC(0);
    }
  };

  const handleAddLigne = () => {
    if (!selectedArticle || quantite <= 0) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Veuillez sélectionner un article et une quantité valide");
      setOpenSnackbar(true);
      return;
    }

    const montantHT = quantite * prixUnitaire;
    const montantTVA = montantHT * (tva / 100);
    const newLigne = {
      article: selectedArticle,
      libelle: selectedArticle.libelle,
      quantite: quantite,
      prix_unitaire: prixUnitaire,
      tva: tva,
      remise: remise,
      prix_uTTC: prix_uTTC,
      total:montantHT + montantTVA
    };
    setLignes([...lignes, newLigne]);
    calculateTotals([...lignes, newLigne]);
    setSelectedArticle(null);
    setQuantite(1);
    setPrixUnitaire(0);
    setTva(19);
    setRemise(0);
    setPrix_uTTC(0);
  };

  const handleRemoveLigne = (index) => {
    const newLignes = [...lignes];
    newLignes.splice(index, 1);
    setLignes(newLignes);
    calculateTotals(newLignes);
  };

  const calculateTotals = (lignes) => {
    const totalHT = lignes.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.19; // TVA 19%
    setTotalHT(totalHT);
    setTotalTTC(totalTTC);
  };

  const handleTimbreChange = (e) => {
    setTimbre(e.target.value);
  };

  const handleTypePaiementChange = (event) => {
    setTypePaiement(event.target.value);
  };

  /*const generatePDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    // Configuration du style
    pdf.setFont("helvetica");
    pdf.setFontSize(16);
    
    // En-tête
    pdf.text("Bon de Livraison", 85, 20);
    
    // Informations client
    pdf.setFontSize(10);
    pdf.rect(10, 30, 95, 15); // Rectangle pour numéro BL et client
    pdf.text(`Numero BL: ${Date.now()}`, 15, 37);
    pdf.text(`Client: ${selectedClient?.nom_prenom || ''}`, 15, 42);
    
    // Date et autres informations
    pdf.rect(10, 47, 95, 10);
    pdf.text(`Date: ${dateFacture}`, 15, 53);
    
    // En-tête du tableau
    const headers = ['Code Article', 'Désignation', 'Qte', 'P.U H.T', 'Rem %', 'P.U T.T.C', 'Nt Net', 'T.V.A %'];
    let y = 65;
    
    // Dessiner l'en-tête du tableau
    pdf.rect(10, y-5, 190, 10);
    let x = 15;
    headers.forEach((header, i) => {
      pdf.text(header, x, y);
      x += 24;
    });
    
    // Contenu du tableau
    y += 10;
    lignes.forEach((ligne, index) => {
      pdf.rect(10, y-5, 190, 10);
      x = 15;
      pdf.text(ligne.article?.code || '', x, y);
      x += 24;
      pdf.text(ligne.libelle || '', x, y);
      x += 24;
      pdf.text(ligne.quantite.toString(), x, y);
      x += 24;
      pdf.text(ligne.prix_unitaire.toString(), x, y);
      x += 24;
      pdf.text(ligne.remise.toString(), x, y);
      x += 24;
      pdf.text(prix_uTTC.toString(), x, y);
      x += 24;
      pdf.text((ligne.prix_unitaire * ligne.quantite).toString(), x, y);
      x += 24;
      pdf.text(ligne.tva.toString(), x, y);
      y += 10;
    });
    
    // Totaux
    y += 10;
    pdf.rect(10, y, 190, 25);
    pdf.text(`TOTAL HT: ${totalHT.toFixed(3)}`, 15, y+5);
    pdf.text(`REMISE: 0.000`, 15, y+10);
    pdf.text(`NET HT: ${totalHT.toFixed(3)}`, 15, y+15);
    pdf.text(`MT TVA: ${(totalTTC - totalHT).toFixed(3)}`, 15, y+20);
    
    // Timbre et total à payer
    pdf.text(`TIMBRE: ${timbre}`, 120, y+15);
    pdf.text(`A PAYER: ${(totalTTC + parseFloat(timbre)).toFixed(3)}`, 120, y+20);
    
    // Montant en lettres
    y += 35;
    pdf.rect(10, y, 190, 10);
    pdf.text("Arrêtée la présente Bon de Livraison à la somme de :", 15, y+5);
    
    // Zone signature
    y += 20;
    pdf.rect(10, y, 190, 30);
    pdf.text("Notation", 15, y+5);
    pdf.text("Chauffeur", 75, y+5);
    pdf.text("Signature & Cachet", 135, y+5);
    
    // Véhicule
    pdf.text(`Véhicule: ${selectedVehicule?.matricule || ''}`, 75, y+20);
    
    const pdfBlob = pdf.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(pdfUrl);
    setOpenPdfDialog(true);
  };

  */

  const generatePDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Configuration du style
      pdf.setFont("helvetica");
      pdf.setFontSize(16);
      
      // En-tête
      pdf.text("Bon de Livraison", 85, 20);
      
      // Informations client
      pdf.setFontSize(10);
      pdf.rect(10, 30, 95, 15);
      pdf.text(`Numero BL: ${Date.now().toString()}`, 15, 37);
      pdf.text(`Client: ${selectedClient?.nom_prenom || 'Non spécifié'}`, 15, 42);
      
      // Date et autres informations
      pdf.rect(10, 47, 95, 10);
      pdf.text(`Date: ${dateFacture || 'Non spécifiée'}`, 15, 53);
      
      // En-tête du tableau
      const headers = [ 'Désignation', 'Quantitée', 'P.U H.T', 'Remise%', 'P.U T.T.C', 'Net', 'TVA%'];
      let y = 65;
      
      // Dessiner l'en-tête du tableau
      pdf.rect(10, y-5, 190, 10);
      let x = 15;
      headers.forEach((header) => {
        pdf.text(header, x, y);
        x += 24;
      });
      
      // Contenu du tableau
      y += 10;
      lignes.forEach((ligne) => {
        pdf.rect(10, y-5, 190, 10);
        x = 15;
        
        // Convertir toutes les valeurs en chaînes et fournir des valeurs par défaut
        
        pdf.text(ligne.libelle?.toString() || '', x, y);
        x += 24;
        pdf.text(ligne.quantite?.toString() || '0', x, y);
        x += 24;
        pdf.text(ligne.prix_unitaire?.toFixed(3) || '0.000', x, y);
        x += 24;
        pdf.text(ligne.remise?.toString() || '0', x, y);
        x += 24;
        pdf.text(prix_uTTC?.toFixed(3) || '0.000', x, y);
        x += 24;
        pdf.text((ligne.prix_unitaire * ligne.quantite)?.toFixed(3) || '0.000', x, y);
        x += 24;
        pdf.text(ligne.tva?.toString() || '0', x, y);
        y += 10;
      });
      
      // Totaux
      y += 10;
      pdf.rect(10, y, 190, 25);
      pdf.text(`TOTAL HT: ${totalHT?.toFixed(3) || '0.000'}`, 15, y+5);
      pdf.text(`REMISE: 0.000`, 15, y+10);
      pdf.text(`NET HT: ${totalHT?.toFixed(3) || '0.000'}`, 15, y+15);
      pdf.text(`MT TVA: ${(totalTTC - totalHT)?.toFixed(3) || '0.000'}`, 15, y+20);
      
      // Timbre et total à payer
      pdf.text(`TIMBRE: ${timbre?.toString() || '0.000'}`, 120, y+15);
      pdf.text(`A PAYER: ${(totalTTC + parseFloat(timbre || 0))?.toFixed(3) || '0.000'}`, 120, y+20);
      
      // Montant en lettres
      y += 35;
      pdf.rect(10, y, 190, 10);
      pdf.text("Arrêtée la présente Bon de Livraison à la somme de :", 15, y+5);
      
      // Zone signature
     // Zone signature
      y += 20;
      pdf.rect(10, y, 190, 30);
      pdf.text(`Notation: ${notation || 'Non spécifié'}`, 15, y+5);
      pdf.text(`Chauffeur: ${chauffeur || 'Non spécifié'}`, 75, y+5);
      pdf.text("Signature & Cachet", 135, y+5);
      
      // Véhicule
      pdf.text(`Véhicule: ${selectedVehicule?.matricule?.toString() || 'Non spécifié'}`, 75, y+20);
      
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPdfUrl(pdfUrl);
      setOpenPdfDialog(true);
      
      return true;
    } catch (error) {
      console.error("Erreur détaillée lors de la génération du PDF:", error);
      throw error;
    }
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl);
      printWindow.print();
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `bon_livraison_${Date.now()}.pdf`;
      link.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const bonLivraison = {
        client: selectedClient._id,
        depot: selectedDepot._id,
        dateLivraison:dateBonLivraison,
        secteur: selectedSecteur._id,
        vehicule : selectedVehicule._id, 
        chauffeur ,
        notation,
        modePaiement : typePaiement,
        lignes: lignes.map(ligne => ({
          article: ligne.article._id,
          quantite: ligne.quantite,
          prix_unitaire: ligne.prix_unitaire,
          tva: ligne.tva,
          remise: ligne.remise,
          dc: ligne.dc,
          fodec: ligne.fodec,
          prix_uTTC: ligne.prix_uTTC,
          total: ligne.total
        })),
      total_hors_Taxe: totalHT,   
      total_ttc: totalTTC ,
      netapayer: (totalTTC + parseFloat(timbre)).toFixed(3) ,
      timbre: parseFloat(timbre || 0) // Ajout du timbre si nécessaire

      };
      await axios.post("http://localhost:5000/ventes/BL/create", bonLivraison);
      // TODO: Envoyer les données à l'API
      setSnackbarSeverity("success");
      setSnackbarMessage("Bon de livraison généré avec succès !");
      setOpenSnackbar(true);
      await generatePDF();
     
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("Erreur lors de la génération du PDF");
      setOpenSnackbar(true);
    }
  };

  return (
    <>
      <Navbar />
      <Box height={150} />
      <Box sx={{ overflow: "auto", flexGrow: 1, p: 3, display: "flex", backgroundColor: "#FFFFFF" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto", backgroundColor: "#FFFFFF", maxWidth: "none", maxHeight: "100vh", width: "100%" }}>
          <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold', textAlign: 'center' }}>
              Saisie Bon de Livraison Client
            </Typography>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={3}>
           {/* Section Données Générales et Articles (Gauche) */}
<Grid item xs={12} md={8}>
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
        Données Générales
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField 
            label="Date" 
            type="date" 
            value={dateFacture} 
            onChange={e => setDateFacture(e.target.value)} 
            fullWidth 
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Autocomplete
            options={clients}
            getOptionLabel={option => option.nom_prenom || ""}
            value={selectedClient}
            onChange={handleClientChange}
            renderInput={params => <TextField {...params} label="Client" fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Autocomplete
            options={depots}
            getOptionLabel={option => option.libelle || ""}
            value={selectedDepot}
            onChange={handleDepotChange}
            renderInput={params => <TextField {...params} label="Dépôt" fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Adresse"
            value={adresse}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Matricule Fiscale"
            value={matriculeFiscale}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            label="Téléphone"
            value={telephone}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>

  {/* Section Articles - Maintenant sous les données générales */}
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
        Articles
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={3}>
          <Autocomplete
            options={articles}
            getOptionLabel={option => option.libelle || ""}
            value={selectedArticle}
            onChange={handleArticleChange}
            renderInput={params => <TextField {...params} label="Article" fullWidth />}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            label="Quantité"
            type="number"
            value={quantite}
            onChange={e => setQuantite(Number(e.target.value))}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            label="Prix Unitaire"
            type="number"
            value={prixUnitaire}
            onChange={e => setPrixUnitaire(Number(e.target.value))}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            label="TVA %"
            type="number"
            value={tva}
            onChange={e => setTva(Number(e.target.value))}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField
            label="Remise %"
            type="number"
            value={remise}
            onChange={e => setRemise(Number(e.target.value))}
            fullWidth
          />
        </Grid>
        <Grid item xs={12} sm={1}>
          <IconButton 
            color="primary" 
            onClick={handleAddLigne}
            sx={{ mt: 1 }}
          >
            <AddIcon />
          </IconButton>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Article</TableCell>
              <TableCell>Quantité</TableCell>
              <TableCell>Prix Unitaire</TableCell>
              <TableCell>TVA %</TableCell>
              <TableCell>Remise %</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lignes.map((ligne, index) => (
              <TableRow key={index}>
                <TableCell>{ligne.libelle}</TableCell>
                <TableCell>{ligne.quantite}</TableCell>
                <TableCell>{ligne.prix_unitaire}</TableCell>
                <TableCell>{ligne.tva}</TableCell>
                <TableCell>{ligne.remise}</TableCell>
                <TableCell>{ligne.total}</TableCell>
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
</Grid>

{/* Section Véhicule, Secteur et Paiement (Droite) */}
<Grid item xs={12} md={4}>
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
        Véhicule et Paiement
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Autocomplete
            options={vehicules}
            getOptionLabel={option => option.matricule || ""}
            value={selectedVehicule}
            onChange={handleVehiculeChange}
            renderInput={params => <TextField {...params} label="Véhicule" fullWidth />}
          />
        </Grid>
        <Grid item xs={12}>
          <Autocomplete
            options={secteurs}
            getOptionLabel={option => option.libelle || ""}
            value={selectedSecteur}
            onChange={handleSecteurChange}
            renderInput={params => <TextField {...params} label="Secteur" fullWidth />}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl component="fieldset" sx={{ width: '90%' }}>
            <FormLabel component="legend">Type de Paiement</FormLabel>
            <RadioGroup
              value={typePaiement}
              onChange={handleTypePaiementChange}
              sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}
            >
              <FormControlLabel value="Espèce" control={<Radio />} label="Espèce" />
              <FormControlLabel value="Chèque" control={<Radio />} label="Chèque" />
              <FormControlLabel value="Effet" control={<Radio />} label="Effet" />
            </RadioGroup>
          </FormControl>
        </Grid>
      </Grid>
    </CardContent>
  </Card>

  {/* Section Totaux - Déplacée à droite */}
  <Card sx={{ mb: 3 }}>
    <CardContent>
      <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
        Totaux
      </Typography>
      <Grid container spacing={2}>
        {/*<Grid item xs={12}>
          <TextField
            label="Total HT"
            value={totalHT}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </Grid> */}
        <Grid item xs={12}>
          <TextField
            label="Total TTC"
            value={totalTTC}
            fullWidth
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            label="Timbre"
            value={timbre}
            onChange={handleTimbreChange}
            fullWidth
          />
        </Grid>
        <Grid item xs={12}>
          <TextField 
            label="Net à Payer" 
            value={(totalTTC + parseFloat(timbre)).toFixed(3)} 
            InputProps={{ readOnly: true }} 
            fullWidth 
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
</Grid>

               {/* Section Signature */}
<Grid item xs={12}>
  <Card>
    <CardContent>
      <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 2 }}>
        Signature
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Notation"
            value={notation}
            onChange={(e) => setNotation(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Chauffeur"
            value={chauffeur}
            onChange={(e) => setChauffeur(e.target.value)}
            fullWidth
          />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
</Grid>

                {/* Bouton Enregistrer */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Button 
                      variant="contained" 
                      color="primary" 
                      type="submit"
                      size="large"
                    >
                      Enregistrer le bon de Livraison
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Box>
      </Box>
      <Dialog
        open={openPdfDialog}
        onClose={() => setOpenPdfDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Bon de Livraison</DialogTitle>
        <DialogContent>
          <iframe
            src={pdfUrl}
            width="100%"
            height="500px"
            title="Bon de Livraison"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            startIcon={<PrintIcon />} 
            onClick={handlePrint}
            variant="contained"
            color="primary"
          >
            Imprimer
          </Button>
          <Button 
            startIcon={<DownloadIcon />} 
            onClick={handleDownload}
            variant="contained"
            color="secondary"
          >
            Télécharger
          </Button>
          <Button onClick={() => setOpenPdfDialog(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
} 