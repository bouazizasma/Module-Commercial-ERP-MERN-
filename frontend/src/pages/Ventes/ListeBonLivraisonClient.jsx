import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Modal,
  Backdrop,
  Fade,
  Autocomplete,
  Collapse,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Visibility,
  Edit,
  Delete,
  Add,
  Receipt,
  Print,
  Download,
  Search,
  Clear,
  FilterList,
  ExpandMore,
  ExpandLess,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
} from "@mui/icons-material";
import { InputAdornment } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import jsPDF from "jspdf";
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
// Nouvelles icônes pour un design moderne
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
// Composant moderne de suppression
import ModernDeleteDialog from '../../components/ModernDeleteDialog';

export default function ListeBonLivraisonClient() {
  const [bonLivraisons, setBonLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [openPdfDialog, setOpenPdfDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    client: "",
    year: "",
    month: "",
    article: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bonLivraisonToDelete, setBonLivraisonToDelete] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBonLivraisons();
  }, []);

  const fetchBonLivraisons = async () => {
    try {
      const response = await axios.get("http://localhost:5000/ventes/bons-Livraison");
      setBonLivraisons(response.data);
        // Récupérer les Clients
              const ClientsResponse = await axios.get("http://localhost:5000/client/clients");
              setClients(ClientsResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des bons de Livraison:", error);
      setError("Erreur lors de la récupération des bons de Livraison");
      setLoading(false);
    }
  };

  const handleView = (id) => {
    navigate(`/ventes/bon-livraison/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/ventes/bon-livraison/edit/${id}`);
  };

  const getStatusChip = (statut) => {
    let color = "default";
  
    switch (statut) {
      case "Facturée":
        color = "success"; // Vert
        break;
      case "Annulée":
        color = "error"; // Rouge
        break;
      case "Livrée":
        color = "#f5f5f5"; // Orange
        break;
      case "Confirmée" :
        color ="warning";
        break;
      default :
        color = "info"; // Bleu
    }
  
    return <Chip label={statut} color={color} sx={{ fontWeight: "bold", fontSize: "0.9rem" }} />;
  };
  // Suppression moderne d'un bon de livraison
  const handleDelete = (bonLivraison) => {
    setBonLivraisonToDelete(bonLivraison);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/enteteVentes/${bonLivraisonToDelete._id}`);
      fetchBonLivraisons();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression du bon de livraison.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtrage des bons de livraison
  const filteredBonLivraisons = useMemo(() => {
    return bonLivraisons.filter((bonLivraison) => {
      const matchesSearchTerm =
        bonLivraison.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bonLivraison.client && bonLivraison.client.nom_prenom.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilters =
        (!filters.client || (bonLivraison.client && bonLivraison.client.nom_prenom === filters.client)) &&
        (!filters.year || new Date(bonLivraison.dateLivraison).getFullYear().toString() === filters.year) &&
        (!filters.month || (new Date(bonLivraison.dateLivraison).getMonth() + 1).toString() === filters.month);

      return matchesSearchTerm && matchesFilters;
    });
  }, [bonLivraisons, searchTerm, filters]);

  // Pagination
  const paginatedBonLivraisons = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBonLivraisons.slice(startIndex, endIndex);
  }, [filteredBonLivraisons, currentPage]);

  // Gestion de la recherche
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Gestion des filtres
  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
    setCurrentPage(1);
  };

  // Réinitialisation des filtres
  const resetFilters = () => {
    setSearchTerm("");
    setFilters({
      client: "",
      year: "",
      month: "",
      article: "",
    });
    setCurrentPage(1);
  };

  const handleDownload = (bonLivraison) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Bon Livraison", 10, 10);
    doc.setFontSize(12);
    doc.text(`Bon Livraison N°: ${bonLivraison.numero}`, 10, 20);
    doc.text(`Date  Livraison: ${new Date(bonLivraison.dateLivraison).toLocaleDateString()}`, 10, 30);

    const client = clients.find(c => c._id === bonLivraison.client._id);
    doc.text(`À l'intention de: ${client.nom_prenom}`, 10, 40);
    doc.text(`Adresse: ${client.adresse || 'N/A'}`, 10, 50);
    doc.text(`Matricule Fiscale: ${client.matricule_fiscale || 'N/A'}`, 10, 60);
    doc.text(`Téléphone: ${client.telephone || 'N/A'}`, 10, 70);
  
    doc.text(`Objet : Bon Livraison`  , 10, 90);
  
    // Tableau des articles commandés
    doc.autoTable({
      startY: 100,
      head: [['Article',  'Quantité', 'Prix Unitaire ', 'Total ']],
      body: bonLivraison.lignes.map(ligne => [
        ligne.article.libelle,
        ligne.quantite,
        `${ligne.prix_unitaire.toFixed(2)} DT`,
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} DT`
      ]),
    });
  
    // Totaux
    const totalHT = bonLivraison.lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2;
  
    doc.text(`Montant Total HT: ${totalHT.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 10);
    doc.text(`Total TTC : ${totalTTC.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 20);
    doc.text(`Montant Total TTC: ${totalTTC.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 30);
  
    doc.save(`${bonLivraison.numero}.pdf`);
  };

  const generateFacturePDF = async (bonLivraison) => {
    try {
      await axios.post(`http://localhost:5000/ventes/${bonLivraison._id}/generate-Facture`);
      fetchBonLivraisons();

      setSnackbarMessage("Le bon de livraison a été généré avec succès !");
      setOpenSnackbar(true);
      setTimeout(() => {
        const pdf = new jsPDF('p', 'mm', 'a4');
      
        // Configuration du style
        pdf.setFont("helvetica");
        pdf.setFontSize(16);
        
        // En-tête
        pdf.text("Facture", 85, 20);
        
        // Informations client
        pdf.setFontSize(10);
        pdf.rect(10, 30, 95, 15);
        pdf.text(`Numero Facture: ${Date.now().toString()}`, 15, 37);
        pdf.text(`Client: ${bonLivraison.client?.nom_prenom || 'Non spécifié'}`, 15, 42);
        
        // Date et autres informations
        pdf.rect(10, 47, 95, 10);
        pdf.text(`Date: ${new Date(bonLivraison.dateLivraison).toLocaleDateString() || 'Non spécifiée'}`, 15, 53);
        
        // En-tête du tableau
        const headers = ['Désignation', 'Quantitée', 'P.U H.T', 'Remise%', 'P.U T.T.C', 'Net', 'TVA%'];
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
        bonLivraison.lignes.forEach((ligne) => {
          pdf.rect(10, y-5, 190, 10);
          x = 15;
          
          pdf.text(ligne.article?.libelle?.toString() || '', x, y);
          x += 24;
          pdf.text(ligne.quantite?.toString() || '0', x, y);
          x += 24;
          pdf.text(ligne.prix_unitaire?.toFixed(3) || '0.000', x, y);
          x += 24;
          pdf.text(ligne.remise?.toString() || '0', x, y);
          x += 24;
          pdf.text(ligne.prix_uTTC?.toFixed(3) || '0.000', x, y);
          x += 24;
          pdf.text((ligne.prix_unitaire * ligne.quantite)?.toFixed(3) || '0.000', x, y);
          x += 24;
          pdf.text(ligne.tva?.toString() || '0', x, y);
          y += 10;
        });
        
        // Totaux
        y += 10;
        pdf.rect(10, y, 190, 25);
        pdf.text(`TOTAL HT: ${bonLivraison.total_hors_Taxe?.toFixed(3) || '0.000'}`, 15, y+5);
        pdf.text(`REMISE: 0.000`, 15, y+10);
        pdf.text(`NET HT: ${bonLivraison.total_hors_Taxe?.toFixed(3) || '0.000'}`, 15, y+15);
        pdf.text(`MT TVA: ${(bonLivraison.total_ttc - bonLivraison.total_hors_Taxe)?.toFixed(3) || '0.000'}`, 15, y+20);
        
        // Timbre et total à payer
        pdf.text(`TIMBRE: ${bonLivraison.timbre?.toString() || '0.000'}`, 120, y+15);
        pdf.text(`A PAYER: ${bonLivraison.netapayer?.toFixed(3) || '0.000'}`, 120, y+20);
        
        // Montant en lettres
        y += 35;
        pdf.rect(10, y, 190, 10);
        pdf.text("Arrêtée la présente Facture à la somme de :", 15, y+5);
        
        // Zone signature
        y += 20;
        pdf.rect(10, y, 190, 30);
        pdf.text(`Notation: ${bonLivraison.notation || 'Non spécifié'}`, 15, y+5);
        pdf.text(`Chauffeur: ${bonLivraison.chauffeur || 'Non spécifié'}`, 75, y+5);
        pdf.text("Signature & Cachet", 135, y+5);
        
        // Véhicule
        pdf.text(`Véhicule: ${bonLivraison.vehicule?.matricule?.toString() || 'Non spécifié'}`, 75, y+20);
        
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(pdfUrl);
        setOpenPdfDialog(true);
        
        return true;
      }, 2000);
  
    } catch (error) {
      console.error("Erreur lors de la génération de la facture:", error);
      throw error;
    }
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl);
      printWindow.print();
    }
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `facture_${Date.now()}.pdf`;
      link.click();
    }
  };

  return (
    <>
      <Navbar />
      <Box height={120} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: "auto",
            maxHeight: "100vh",
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            minHeight: '100vh'
          }}
        >
          {/* Header moderne avec statistiques */}
          <Fade in={true} timeout={800}>
            <Box sx={{
              textAlign: 'center',
              mb: 2,
              p: 1,
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
                Bons de Livraison Clients
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Gérez vos livraisons clients facilement
              </Typography>
            </Box>
          </Fade>

          {/* Section Recherche et Filtres modernisée */}
          <Fade in={true} timeout={1000}>
            <Card sx={{
              p: 2,
              mb: 2,
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
              <CardContent>
                {/* Section Liste des Bons de Livraison */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
                      Liste des Bons de Livraison ({filteredBonLivraisons.length})
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/SaisieBonLivraisonClient')}
                      startIcon={<Add />}
                      sx={{
                        borderRadius: 2,
                        height: '35px',
                        width: '250px',
                        left: '300px',
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        fontWeight: 'bold',
                        px: 3,
                        py: 1.5,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(44, 62, 80, 0.4)'
                        }
                      }}
                    >
                      Créer Bon de Livraison
                    </Button>
                  </Box>
                </Box>
                <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  {/* Barre de recherche fine avec bouton filtrer */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      placeholder="Rechercher par numéro ou client..."
                      variant="outlined"
                      size="small"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      sx={{
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          height: '35px',
                          left:'445px',
                          width: '380px',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(52, 73, 94, 0.15)'
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(52, 73, 94, 0.25)'
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ color: '#2c3e50' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<FilterList />}
                      onClick={() => setShowFilters(!showFilters)}
                      sx={{
                        left: '410px',
                        height: '35px',
                        minWidth: '20px',
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        fontWeight: 'bold',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(44, 62, 80, 0.4)'
                        }
                      }}
                    >
                      Filtrer
                      {showFilters ? <ExpandLess sx={{ ml: 1 }} /> : <ExpandMore sx={{ ml: 1 }} />}
                    </Button>
                  </Box>
                </Box>

                {/* Section des filtres avec animation */}
                <Collapse in={showFilters} timeout={300}>
                  <Box sx={{
                    p: 3,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid #e9ecef',
                    mb: 2
                  }}>
                    <Typography variant="h6" sx={{
                      mb: 3,
                      color: '#2c3e50',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <FilterList sx={{ mr: 1 }} />
                      Filtres avancés
                    </Typography>

                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={4}>
                        <Autocomplete
                          options={clients}
                          getOptionLabel={(option) => option.nom_prenom}
                          value={clients.find(c => c.nom_prenom === filters.client) || null}
                          onChange={(event, newValue) => {
                            handleFilterChange("client", newValue ? newValue.nom_prenom : "");
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Client"
                              variant="outlined"
                              size="small"
                              sx={{
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2
                                }
                              }}
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <PersonIcon sx={{ color: '#2c3e50', fontSize: 20 }} />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          select
                          label="Année"
                          value={filters.year}
                          onChange={(e) => handleFilterChange("year", e.target.value)}
                          variant="outlined"
                          size="small"
                          fullWidth
                          sx={{
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <CalendarTodayIcon sx={{ color: '#2c3e50', fontSize: 20 }} />
                              </InputAdornment>
                            ),
                          }}
                        >
                          <MenuItem value="">Toutes les années</MenuItem>
                          {Array.from(new Set(bonLivraisons.map(bl => new Date(bl.dateLivraison).getFullYear())))
                            .sort((a, b) => b - a)
                            .map(year => (
                              <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                            ))}
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={6} md={4}>
                        <Button
                          variant="outlined"
                          onClick={resetFilters}
                          startIcon={<Clear />}
                          fullWidth
                          sx={{
                            height: '40px',
                            borderColor: '#95a5a6',
                            color: '#95a5a6',
                            '&:hover': {
                              borderColor: '#7f8c8d',
                              backgroundColor: 'rgba(149, 165, 166, 0.1)'
                            }
                          }}
                        >
                          Réinitialiser
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>

                {/* Tableau moderne des bons de livraison */}
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
                          Numéro
                        </TableCell>
                        <TableCell sx={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1rem'
                        }}>
                          Date
                        </TableCell>
                        <TableCell sx={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1rem'
                        }}>
                          Client
                        </TableCell>
                        <TableCell sx={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1rem'
                        }}>
                          Montant HT
                        </TableCell>
                        <TableCell sx={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1rem'
                        }}>
                          Montant TTC
                        </TableCell>
                        <TableCell sx={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1rem'
                        }}>
                          Statut
                        </TableCell>
                        <TableCell sx={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1rem'
                        }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedBonLivraisons.map((bonLivraison) => (
                        <TableRow
                          key={bonLivraison._id}
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
                            <Chip
                              label={bonLivraison.numero}
                              size="small"
                              sx={{
                                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            {new Date(bonLivraison.dateLivraison).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            {bonLivraison.client?.nom_prenom}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            {(bonLivraison.montantHT || bonLivraison.total_hors_Taxe || 0).toFixed(2)} DT
                          </TableCell>
                          <TableCell sx={{
                            fontWeight: 'bold',
                            color: '#667eea'
                          }}>
                            {(bonLivraison.montantTTC || bonLivraison.total_ttc || 0).toFixed(2)} DT
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={bonLivraison.statut}
                              color={bonLivraison.statut === "Facturée" ? "success" :
                                bonLivraison.statut === "Annulée" ? "error" :
                                bonLivraison.statut === "Livrée" ? "warning" : "info"}
                              sx={{
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                borderRadius: '16px',
                                padding: '4px 12px'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Voir les détails">
                                <IconButton
                                  onClick={() => handleView(bonLivraison._id)}
                                  sx={{
                                    color: '#1976d2',
                                    '&:hover': {
                                      backgroundColor: 'rgba(25, 118, 210, 0.1)',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Modifier">
                                <IconButton
                                  onClick={() => handleEdit(bonLivraison._id)}
                                  sx={{
                                    color: '#2e7d32',
                                    '&:hover': {
                                      backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  onClick={() => handleDelete(bonLivraison)}
                                  sx={{
                                    color: '#f44336',
                                    '&:hover': {
                                      backgroundColor: '#ffebee',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Télécharger PDF">
                                <IconButton
                                  onClick={() => handleDownload(bonLivraison)}
                                  sx={{
                                    color: '#ed6c02',
                                    '&:hover': {
                                      backgroundColor: 'rgba(237, 108, 2, 0.1)',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <FileDownloadIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Générer Facture">
                                <IconButton
                                  onClick={() => generateFacturePDF(bonLivraison)}
                                  sx={{
                                    color: '#4caf50',
                                    '&:hover': {
                                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <Receipt />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Imprimer">
                                <IconButton
                                  onClick={() => generateFacturePDF(bonLivraison)}
                                  sx={{
                                    color: '#9c27b0',
                                    '&:hover': {
                                      backgroundColor: 'rgba(156, 39, 176, 0.1)',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <Print />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination moderne */}
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: 3,
                  p: 2,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2
                }}>
                  <Typography variant="body2" sx={{ color: '#666' }}>
                    Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredBonLivraisons.length)} sur {filteredBonLivraisons.length} bons de livraison
                  </Typography>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      sx={{
                        borderColor: '#95a5a6',
                        color: '#95a5a6',
                        '&:hover': {
                          borderColor: '#7f8c8d',
                          backgroundColor: 'rgba(149, 165, 166, 0.1)'
                        },
                        '&:disabled': {
                          borderColor: '#ecf0f1',
                          color: '#bdc3c7'
                        }
                      }}
                    >
                      Précédent
                    </Button>
                    <Chip
                      label={`Page ${currentPage}`}
                      sx={{
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    />
                    <Button
                      variant="outlined"
                      disabled={currentPage * itemsPerPage >= filteredBonLivraisons.length}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      sx={{
                        borderColor: '#95a5a6',
                        color: '#95a5a6',
                        '&:hover': {
                          borderColor: '#7f8c8d',
                          backgroundColor: 'rgba(149, 165, 166, 0.1)'
                        },
                        '&:disabled': {
                          borderColor: '#ecf0f1',
                          color: '#bdc3c7'
                        }
                      }}
                    >
                      Suivant
                    </Button>
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          </Fade>
        </Box>
      </Box>

      <Dialog
        open={openPdfDialog}
        onClose={() => setOpenPdfDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Facture</DialogTitle>
        <DialogContent>
          <iframe
            src={pdfUrl}
            width="100%"
            height="500px"
            title="Facture"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            startIcon={<Print />} 
            onClick={handlePrint}
            variant="contained"
            color="primary"
          >
            Imprimer
          </Button>
          <Button 
            startIcon={<Download />} 
            onClick={handleDownloadPdf}
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

      {/* Dialog de suppression moderne */}
      <ModernDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Supprimer le bon de livraison"
        content={`Êtes-vous sûr de vouloir supprimer le bon de livraison ${bonLivraisonToDelete?.numero} ? Cette action est irréversible.`}
      />
    </>
  );
}