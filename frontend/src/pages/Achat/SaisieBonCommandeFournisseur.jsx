import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Paper, Grid, TextField, IconButton, Card, CardContent, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Fade, Slide, Chip, Divider, Stack, Alert, Snackbar, Tooltip, InputAdornment,
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
// Nouvelles icônes pour un design moderne
import BusinessIcon from '@mui/icons-material/Business';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BadgeIcon from '@mui/icons-material/Badge';
import EuroIcon from '@mui/icons-material/Euro';
import SaveIcon from '@mui/icons-material/Save';
import PreviewIcon from '@mui/icons-material/Preview';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { styled } from '@mui/material/styles';

// Configurez le worker avec un CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Styled components pour le design moderne unifié
const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  }
}));
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
      <Box height={64} />
      <Box sx={{
        display: "flex",
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        minHeight: "calc(100vh - 64px)",
        overflow: "hidden"
      }}>
        <Sidenav />
        <Box component="main" sx={{
          flexGrow: 1,
          p: 3,
          overflow: "auto",
          height: "calc(100vh - 64px)",
          width:"1000px",
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
        {/* Carte consolidée moderne unifiée */}
        <ModernCard sx={{
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
            {/* Header principal intégré */}
            <Box sx={{
              textAlign: 'center',
              mb: 4,
              p: 3,
              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              color: 'white'
            }}>
              <ShoppingCartIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                Bon de Commande Fournisseur
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Créez et gérez vos commandes facilement
              </Typography>
            </Box>

            {/* Section Fournisseur intégrée */}
            <Fade in={true} timeout={800}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <BusinessIcon sx={{
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
                    Informations Fournisseur
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />
                <Grid container spacing={3} alignItems="center">
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
                            <TextField
                              {...params}
                              label="Fournisseur"
                              fullWidth
                              required
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <BusinessIcon sx={{ color: '#2c3e50' }} />
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
                      {/* Bouton Ajouter Fournisseur */}
                      <Grid item xs={2} sm={2} md={2}>
                        <Tooltip title="Ajouter un nouveau fournisseur">
                          <IconButton
                            sx={{
                              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                              color: 'white',
                              '&:hover': {
                                background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                                transform: 'scale(1.1)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                            onClick={() => navigate("/createFournisseur")}
                          >
                            <AddCircleOutlineIcon fontSize="large" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </Grid>

                  {/* Champ Adresse */}
                  <Grid item xs={12} sm={3} md={3}>
                    <TextField
                      label="Adresse"
                      value={adresse}
                      fullWidth
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnIcon sx={{ color: '#2c3e50' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#f8f9fa'
                        }
                      }}
                    />
                  </Grid>

                  {/* Champ Matricule Fiscale */}
                  <Grid item xs={12} sm={2} md={2}>
                    <TextField
                      label="Matricule Fiscale"
                      value={matriculeFiscale}
                      fullWidth
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <BadgeIcon sx={{ color: '#2c3e50' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#f8f9fa'
                        }
                      }}
                    />
                  </Grid>

                  {/* Champ Date de commande */}
                  <Grid item xs={12} sm={2} md={3}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <DatePicker
                        label="Date de commande"
                        value={dateCommande}
                        onChange={(newValue) => setDateCommande(newValue)}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            InputProps={{
                              ...params.InputProps,
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
                        )}
                      />
                    </LocalizationProvider>
                  </Grid>
                </Grid>
              </Box>
            </Fade>

            {/* Section Articles intégrée */}
            <Fade in={true} timeout={1000}>
              <Box sx={{ mb: 4 }}>
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
                    Informations Articles
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />
                <Grid container spacing={3} alignItems="center">
                  {/* Sélection Article */}
                  <Grid item xs={12} sm={6} md={3}>
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
                        <TextField
                          {...params}
                          label="Article"
                          fullWidth
                          required
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

                  {/* Quantité */}
                  <Grid item xs={12} sm={6} md={2}>
                    <TextField
                      label="Quantité"
                      type="number"
                      value={quantite}
                      onChange={(e) => setQuantite(parseInt(e.target.value))}
                      fullWidth
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
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
                  </Grid>

                  {/* Sélection Dépôt */}
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
                        <TextField
                          {...params}
                          label="Dépôt"
                          fullWidth
                          required
                          InputProps={{
                            ...params.InputProps,
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOnIcon sx={{ color: '#95a5a6' }} />
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

                  {/* Bouton Ajouter Ligne */}
                  <Grid item xs={12} sm={6} md={1}>
                    <Tooltip title="Ajouter cette ligne à la commande">
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
              </Box>
            </Fade>

            {/* Section Tableau des Lignes intégrée */}
            {lignes.length > 0 && (
              <Fade in={true} timeout={1200}>
                <Box sx={{ mb: 4 }}>
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
                      Lignes de Commande ({lignes.length})
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
                            Prix Unitaire TTC
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
                                 background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)' ,
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'medium' }}>
                              {ligne.prix_uTTC} TND
                            </TableCell>
                            <TableCell sx={{
                              fontWeight: 'bold',
                              color: '#667eea'
                            }}>
                              {(ligne.quantite * ligne.prix_uTTC).toFixed(2)} TND
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
                </Box>
              </Fade>
            )}
          </CardContent>
        </ModernCard>

        {/* Footer moderne avec totaux et bouton */}
        <Box
          sx={{
            position: 'fixed',
            bottom: 2,
            left: 300,
            right: 0,
            width: '70%',
            height: '14%',
            //background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '-8px -8px 32px rgba(0,0,0,0.15)',
            zIndex: 1000,
            p: 0.5,
         //   borderTop: '3px solid',
           // borderImage: 'linear-gradient(90deg,rgb(255, 253, 253),rgb(255, 245, 245)) 1',
          }}
        >
            <Grid container alignItems="center" justifyContent="space-between">
              {/* Totaux HT et TTC modernisés */}
              <Grid item>
                <Stack direction="row" spacing={3}>
                  <Box sx={{
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(149, 165, 166, 0.3)'
                  }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
                      Total HT
                    </Typography>
                    <Typography variant="h5" sx={{
                      fontWeight: 'bold',
                      color: 'white'
                    }}>
                      {totalHT.toFixed(2)} TND
                    </Typography>
                  </Box>

                  <Box sx={{
                    textAlign: 'center',
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    color: 'white',
                    boxShadow: '0 4px 20px rgba(52, 73, 94, 0.3)'
                  }}>
                    <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
                      Total TTC
                    </Typography>
                    <Typography variant="h5" sx={{
                      fontWeight: 'bold'
                    }}>
                      {totalTTC.toFixed(2)} TND
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {/* Bouton de soumission modernisé */}
              <Grid item>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  startIcon={<SaveIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    color: 'white',
                    px: 4,
                    py: 2,
                    borderRadius: 3,
                    fontSize: '1.1rem',
                    fontWeight: 'bold',
                    boxShadow: '0 8px 25px rgba(52, 73, 94, 0.4)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(52, 73, 94, 0.5)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Créer le bon de commande
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
      {/* Modal de succès modernisée */}
      <Dialog
        open={openSuccessModal}
        onClose={handleSuccessModalClose}
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
          }
        }}
      >
        <DialogTitle sx={{
          textAlign: 'center',
          background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2
        }}>
          <CheckCircleIcon sx={{ fontSize: 32 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Succès !
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#2e7d32' }}>
            Le bon de commande a été créé avec succès.
          </Typography>
          <Typography variant="body1" sx={{ color: '#666' }}>
            Vous pouvez maintenant prévisualiser et télécharger le document.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
          <Button
            onClick={handleSuccessModalClose}
            variant="contained"
            size="large"
            sx={{
              background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #45a049 0%, #4caf50 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Continuer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de prévisualisation PDF modernisée */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            minHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <PreviewIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Prévisualisation du Bon de Commande
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <iframe
            src={pdfUrl}
            width="100%"
            height="600px"
            style={{ border: "none", borderRadius: '0 0 12px 12px' }}
            title="Prévisualisation du PDF"
          />
        </DialogContent>
        <DialogActions sx={{
          p: 3,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          gap: 2
        }}>
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            size="large"
            sx={{
              borderColor: '#667eea',
              color: '#667eea',
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              '&:hover': {
                borderColor: '#764ba2',
                color: '#764ba2',
                backgroundColor: 'rgba(102, 126, 234, 0.1)'
              }
            }}
          >
            Fermer
          </Button>
          <Button
            onClick={handleDownload}
            variant="contained"
            size="large"
            startIcon={<DownloadIcon />}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 'bold',
              '&:hover': {
                background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Télécharger
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}