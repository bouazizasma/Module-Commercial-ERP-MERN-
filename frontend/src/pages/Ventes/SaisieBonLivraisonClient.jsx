import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
  Stack,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  FormControl,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Chip,
  InputAdornment
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Print as PrintIcon,
  Download as DownloadIcon,
  LocalShipping as LocalShippingIcon,
  Person as PersonIcon,
  Inventory as InventoryIcon,
  CalendarToday as CalendarTodayIcon,
  LocationOn as LocationOnIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  AttachMoney as AttachMoneyIcon,
  Percent as PercentIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  ShoppingCart as ShoppingCartIcon,
  DirectionsCar as DirectionsCarIcon,
  Person4 as Person4Icon,
  Note as NoteIcon
} from "@mui/icons-material";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Composant moderne de carte
const ModernCard = ({ children, sx, ...props }) => (
  <Card sx={{ ...sx }} {...props}>
    {children}
  </Card>
);

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
      <Box height={64} />
      <Box sx={{
        display: "flex",
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        minHeight: "100vh"
      }}>
        <Sidenav />
        <Box component="main" sx={{
          flexGrow: 1,
          p: 3,
          overflow: "auto",
          maxHeight: "100vh",
          "&::-webkit-scrollbar": {
            width: "8px",
            backgroundColor: "rgba(0,0,0,0.1)"
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: "8px",
            background: "linear-gradient(135deg, #495057 0%, #6c757d 100%)"
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(0,0,0,0.05)"
          }
        }}>
        {/* Header principal moderne */}
        <Box sx={{
          textAlign: 'center',
          mb: 3,
          p: 3,
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          color: 'white'
        }}>
          <LocalShippingIcon sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h5" sx={{
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            mb: 1
          }}>
            Bon de Livraison Client
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Créez et gérez vos livraisons clients facilement
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {/* Section Client et Livraison */}
          <ModernCard sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <PersonIcon sx={{
                    fontSize: 32,
                    mr: 2,
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    borderRadius: '50%',
                    p: 1,
                    color: 'white'
                  }} />
                  <Typography variant="h5" sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Informations Client et Livraison
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Date de livraison"
                      type="date"
                      value={dateFacture}
                      onChange={(e) => setDateFacture(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon sx={{ color: '#2c3e50' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(52, 73, 94, 0.15)'
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(52, 73, 94, 0.25)'
                          }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Autocomplete
                      options={clients}
                      getOptionLabel={(option) => option.nom_prenom}
                      value={selectedClient}
                      onChange={handleClientChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Client"
                          fullWidth
                          required
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ color: '#2c3e50' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(52, 73, 94, 0.15)'
                              },
                              '&.Mui-focused': {
                                boxShadow: '0 4px 12px rgba(52, 73, 94, 0.25)'
                              }
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Adresse"
                      value={adresse}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ backgroundColor: "white" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Matricule Fiscale"
                      value={matriculeFiscale}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ backgroundColor: "white" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Téléphone"
                      value={telephone}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ backgroundColor: "white" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Autocomplete
                      options={depots}
                      getOptionLabel={(option) => option.libelle}
                      value={selectedDepot}
                      onChange={(event, newValue) => setSelectedDepot(newValue)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Dépôt"
                          fullWidth
                          required
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <BusinessIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ backgroundColor: "white" }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Autocomplete
                      options={secteurs}
                      getOptionLabel={(option) => option.libelle}
                      value={selectedSecteur}
                      onChange={handleSecteurChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Secteur"
                          fullWidth
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOnIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ backgroundColor: "white" }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Autocomplete
                      options={vehicules}
                      getOptionLabel={(option) => option.matricule}
                      value={selectedVehicule}
                      onChange={handleVehiculeChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Véhicule"
                          fullWidth
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <DirectionsCarIcon color="primary" />
                              </InputAdornment>
                            ),
                          }}
                          sx={{ backgroundColor: "white" }}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </ModernCard>

          {/* Section Articles */}
            <ModernCard sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <InventoryIcon sx={{
                    fontSize: 32,
                    mr: 2,
                    background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                    borderRadius: '50%',
                    p: 1,
                    color: 'white'
                  }} />
                  <Typography variant="h5" sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Sélection d'Articles
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <Autocomplete
                      options={articles}
                      getOptionLabel={(option) => option.libelle}
                      value={selectedArticle}
                      onChange={handleArticleChange}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Article"
                          fullWidth
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <InventoryIcon sx={{ color: '#95a5a6' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(149, 165, 166, 0.15)'
                              },
                              '&.Mui-focused': {
                                boxShadow: '0 4px 12px rgba(149, 165, 166, 0.25)'
                              }
                            }
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      label="Quantité"
                      type="number"
                      value={quantite}
                      onChange={(e) => setQuantite(parseInt(e.target.value) || 0)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoneyIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ backgroundColor: "white" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      label="Prix Unitaire"
                      value={prixUnitaire}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoneyIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ backgroundColor: "white" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      label="TVA"
                      value={tva}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PercentIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ backgroundColor: "white" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      fullWidth
                      label="Prix TTC"
                      value={prix_uTTC}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoneyIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ backgroundColor: "white" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={1}>
                    <Tooltip title="Ajouter cette ligne à la livraison">
                      <IconButton
                        sx={{
                          background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                        onClick={handleAddLigne}
                      >
                        <AddCircleOutlineIcon fontSize="large" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </CardContent>
            </ModernCard>

          {/* Section Tableau des Lignes */}
          {lignes.length > 0 && (
              <ModernCard sx={{
                mb: 3,
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <ShoppingCartIcon sx={{
                      fontSize: 32,
                      mr: 2,
                      background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                      borderRadius: '50%',
                      p: 1,
                      color: 'white'
                    }} />
                    <Typography variant="h5" sx={{
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Lignes de Livraison ({lignes.length})
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3, background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)' }} />

                  <TableContainer component={Paper} sx={{
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden'
                  }}>
                    <Table>
                      <TableHead sx={{
                        background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)'
                      }}>
                        <TableRow>
                          <TableCell sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            Article
                          </TableCell>
                          <TableCell sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            Quantité
                          </TableCell>
                          <TableCell sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            Prix Unitaire
                          </TableCell>
                          <TableCell sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            Prix TTC
                          </TableCell>
                          <TableCell sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            Total
                          </TableCell>
                          <TableCell sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {lignes.map((ligne, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              '&:nth-of-type(odd)': {
                                backgroundColor: '#f8f9fa',
                              },
                              '&:hover': {
                                backgroundColor: '#e3f2fd',
                                transform: 'scale(1.01)',
                                transition: 'all 0.2s ease'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <TableCell sx={{ fontWeight: 'medium' }}>
                              {ligne.libelle}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={ligne.quantite}
                                size="small"
                                sx={{
                                  background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'medium' }}>
                              {ligne.prix_unitaire.toFixed(2)} DT
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'medium' }}>
                              {ligne.prix_uTTC.toFixed(2)} DT
                            </TableCell>
                            <TableCell sx={{
                              fontWeight: 'bold',
                              color: '#667eea'
                            }}>
                              {ligne.total.toFixed(2)} DT
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Supprimer cette ligne">
                                <IconButton
                                  sx={{
                                    color: '#f44336',
                                    '&:hover': {
                                      backgroundColor: '#ffebee',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                  onClick={() => handleRemoveLigne(index)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </ModernCard>
          )}

          {/* Section Informations Supplémentaires */}
            <ModernCard sx={{
              mb: 3,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <LocalShippingIcon sx={{
                    fontSize: 32,
                    mr: 2,
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    borderRadius: '50%',
                    p: 1,
                    color: 'white'
                  }} />
                  <Typography variant="h5" sx={{
                    fontWeight: 'bold',
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    Informations Supplémentaires
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Chauffeur"
                      value={chauffeur}
                      onChange={(e) => setChauffeur(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person4Icon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ backgroundColor: "white" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Notation"
                      value={notation}
                      onChange={(e) => setNotation(e.target.value)}
                      multiline
                      rows={2}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <NoteIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ backgroundColor: "white" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Timbre"
                      type="number"
                      value={timbre}
                      onChange={handleTimbreChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoneyIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ backgroundColor: "white" }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Net à Payer"
                      value={(totalTTC + parseFloat(timbre || 0)).toFixed(3)}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AttachMoneyIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ backgroundColor: "white" }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </ModernCard>

          {/* Bouton de soumission moderne */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 4,
            mb: 2
          }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                px: 6,
                py: 2,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                textTransform: 'none',
                boxShadow: '0 8px 25px rgba(44, 62, 80, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 35px rgba(44, 62, 80, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              <LocalShippingIcon sx={{ mr: 2 }} />
              Enregistrer le Bon de Livraison
            </Button>
          </Box>
        </form>
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