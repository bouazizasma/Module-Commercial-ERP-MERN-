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
  Drawer,
  AppBar,
  Toolbar,
  Stack,
  Chip,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  Backdrop,
  Fade,
  Autocomplete,
  Collapse,
  Tooltip,
  Alert,
  Snackbar
} from "@mui/material";
import {
  Visibility,
  Edit,
  Delete,
  Add,
  Receipt,
  Close as CloseIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Payment as PaymentIcon,
  Description as DescriptionIcon,
  Search,
  Clear,
  FilterList,
  ExpandMore,
  ExpandLess,
  CheckCircle,
  FileDownload as FileDownloadIcon
} from "@mui/icons-material";
import { InputAdornment } from "@mui/material";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import { useNavigate } from "react-router-dom";
// Nouvelles icônes pour un design moderne
import InventoryIcon from '@mui/icons-material/Inventory';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
// Composant moderne de suppression
import ModernDeleteDialog from '../../components/ModernDeleteDialog';

export default function ListeBonCommandeClient() {
  const [bonCommandes, setBonCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
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
  const [bonCommandeToDelete, setBonCommandeToDelete] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchBonCommandes();
  }, []);

  const fetchBonCommandes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/ventes/bons-commande");
      setBonCommandes(response.data);
      
      // Récupérer les Clients
      const ClientsResponse = await axios.get("http://localhost:5000/client/clients");
      setClients(ClientsResponse.data);

      // Récupérer les articles
      const articlesResponse = await axios.get("http://localhost:5000/article/articles");
      setArticles(articlesResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des bons de commande:", error);
      setError("Erreur lors de la récupération des bons de commande");
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/ventes/bons-commande/${id}`);
      setSelectedCommande({
        ...response.data,
        lignes: response.data.lignes || []
      });
      setOpenDialog(true);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de la commande:", error);
    }
  };

  const handleEdit = (id) => {
    navigate(`/ventes/bon-commande/edit/${id}`);
  };

  const handleGenerateBonLivraison = async (bonCommandeId) => {
    try {  
      await axios.post(`http://localhost:5000/ventes/${bonCommandeId}/generate-bon-livraison`);
      fetchBonCommandes();
      setSnackbarMessage("Le bon de livraison a été généré avec succès !");
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate("/ListeBonLivraisonClient");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la génération du bon de livraison:", error);
      setSnackbarMessage("Erreur lors de la génération du bon de livraison");
      setOpenSnackbar(true);
    }
  };

  const handleDelete = (bonCommande) => {
    setBonCommandeToDelete(bonCommande);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/ventes/BCC/${bonCommandeToDelete._id}`);
      fetchBonCommandes();
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setSnackbarMessage("Erreur lors de la suppression du bon de commande");
      setOpenSnackbar(true);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredBonCommandes = useMemo(() => {
    return bonCommandes.filter((bonCommande) => {
      const matchesSearchTerm =
        bonCommande.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bonCommande.client && bonCommande.client.nom_prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bonCommande.lignes && bonCommande.lignes.some((ligne) =>
          ligne.article.libelle.toLowerCase().includes(searchTerm.toLowerCase())
        ));

      const matchesFilters =
        (!filters.client || (bonCommande.client && bonCommande.client.nom_prenom === filters.client)) &&
        (!filters.year || new Date(bonCommande.dateCommande).getFullYear().toString() === filters.year) &&
        (!filters.month || (new Date(bonCommande.dateCommande).getMonth() + 1).toString() === filters.month) &&
        (!filters.article || (bonCommande.lignes && bonCommande.lignes.some((ligne) => ligne.article.libelle === filters.article)));

      return matchesSearchTerm && matchesFilters;
    });
  }, [bonCommandes, searchTerm, filters]);

  const paginatedBonCommandes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBonCommandes.slice(startIndex, endIndex);
  }, [filteredBonCommandes, currentPage]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
    setCurrentPage(1);
  };

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

  const handleDownload = (bonCommande) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("BON DE COMMANDE", 10, 10);
    doc.setFontSize(12);
    doc.text(`Commande N°: ${bonCommande.numero}`, 10, 20);
    doc.text(`Date Commande: ${new Date(bonCommande.dateCommande).toLocaleDateString()}`, 10, 30);

    const client = clients.find(c => c._id === bonCommande.client._id);
    doc.text(`À l'intention de: ${client.nom_prenom}`, 10, 40);
    doc.text(`Adresse: ${client.adresse || 'N/A'}`, 10, 50);
    doc.text(`Matricule Fiscale: ${client.matricule_fiscale || 'N/A'}`, 10, 60);
    doc.text(`Téléphone: ${client.telephone || 'N/A'}`, 10, 70);
  
    doc.text(`Objet : BON DE COMMANDE`, 10, 90);
  
    // Tableau des articles commandés
    doc.autoTable({
      startY: 100,
      head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
      body: bonCommande.lignes.map(ligne => [
        ligne.article.libelle,
        ligne.quantite,
        `${ligne.prix_unitaire.toFixed(2)} DT`,
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} DT`
      ]),
    });
  
    // Totaux
    const totalHT = bonCommande.lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2;
  
    doc.text(`Montant Total HT: ${totalHT.toFixed(2)} DT`, 10, doc.autoTable.previous.finalliasfinalY + 10);
    doc.text(`Total TTC : ${totalTTC.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 20);
    doc.text(`Montant Total TTC: ${totalTTC.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 30);
  
    doc.save(`${bonCommande.numero}.pdf`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "En attente":
        return "warning";
      case "Confirmée":
        return "info";
      case "Annulée":
        return "error";
      case "Livrée":
        return "success";
      case "facturée":
        return "primary";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "en_attente":
        return "En attente";
      case "confirmée":
        return "Confirmée";
      case "annulée":
        return "Annulée";
      case "livrée":
        return "Livrée";
      case "facturée":
        return "Facturée";
      default:
        return status;
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCommande(null);
    setActiveTab(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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
              <ShoppingCartIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                Bons de Commande Clients
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Gérez vos commandes clients facilement
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
                {/* Section Liste des Bons de Commande */}
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
                      Liste des Bons de Commande ({filteredBonCommandes.length})
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/SaisieBonCommandeClient')}
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
                      Créer Bon de Commande
                    </Button>
                  </Box>
                </Box>
                <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  {/* Barre de recherche fine avec bouton filtrer */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      placeholder="Rechercher par numéro, client ou article..."
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
                      <Grid item xs={12} sm={6} md={3}>
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

                      <Grid item xs={12} sm={6} md={3}>
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
                          {Array.isArray(bonCommandes) && bonCommandes.length > 0
                            ? Array.from(new Set(bonCommandes.map(bc => new Date(bc.dateCommande).getFullYear())))
                                .sort((a, b) => b - a)
                                .map(year => (
                                  <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                                ))
                            : null}
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          select
                          label="Mois"
                          value={filters.month}
                          onChange={(e) => handleFilterChange("month", e.target.value)}
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
                          <MenuItem value="">Tous les mois</MenuItem>
                          {Array.from({ length: 12 }, (_, i) => (
                            <MenuItem key={i + 1} value={(i + 1).toString()}>
                              {new Date(0, i).toLocaleString('fr', { month: 'long' })}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
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

                {/* Tableau moderne des bons de commande */}
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
                      {paginatedBonCommandes.map((bonCommande) => (
                        <TableRow
                          key={bonCommande._id}
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
                              label={bonCommande.numero}
                              size="small"
                              sx={{
                                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            {new Date(bonCommande.dateCommande).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            {bonCommande.client?.nom_prenom}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            {(bonCommande.montantHT || bonCommande.total_hors_Taxe || 0).toFixed(2)} DT
                          </TableCell>
                          <TableCell sx={{
                            fontWeight: 'bold',
                            color: '#667eea'
                          }}>
                            {(bonCommande.montantTTC || bonCommande.total_ttc || 0).toFixed(2)} DT
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getStatusLabel(bonCommande.statut)}
                              color={getStatusColor(bonCommande.statut)}
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
                                  onClick={() => handleView(bonCommande._id)}
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
                                  onClick={() => handleEdit(bonCommande._id)}
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
                                  onClick={() => handleDelete(bonCommande)}
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
                                  onClick={() => handleDownload(bonCommande)}
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
                              {bonCommande.statut === "En attente" && (
                                <Tooltip title="Générer bon de livraison">
                                  <IconButton
                                    color="info"
                                    onClick={() => handleGenerateBonLivraison(bonCommande._id)}
                                    size="small"
                                    sx={{
                                      '&:hover': {
                                        transform: 'scale(1.1)',
                                        backgroundColor: 'rgba(33, 150, 243, 0.1)'
                                      },
                                      transition: 'all 0.3s ease'
                                    }}
                                  >
                                    <Receipt />
                                  </IconButton>
                                </Tooltip>
                              )}
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
                    Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredBonCommandes.length)} sur {filteredBonCommandes.length} bons de commande
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
                      disabled={currentPage * itemsPerPage >= filteredBonCommandes.length}
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

      {/* Drawer pour afficher les détails de la commande */}
      <Drawer
        anchor="right"
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: '80%', md: '60%' },
            maxWidth: '800px',
            bgcolor: '#f8f9fa',
          }
        }}
      >
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div" sx={{ color: "#1976d2" }}>
                Commande n°{selectedCommande?.numero || selectedCommande?.numero_bc}
              </Typography>
              <Chip
                label={getStatusLabel(selectedCommande?.statut)}
                color={getStatusColor(selectedCommande?.statut)}
                size="small"
                sx={{ ml: 2 }}
              />
            </Stack>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider', 
              mb: 2,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'bold',
              }
            }}
          >
            <Tab label="Informations générales" />
            <Tab label={`Produits (${selectedCommande?.lignes?.length || 0})`} />
            <Tab label="Événements" />
            <Tab label="Documents" />
          </Tabs>

          {activeTab === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: "#1976d2", fontWeight: 'bold' }}>
                Coordonnées
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography>{selectedCommande?.client?.nom_prenom || selectedCommande?.client?.nom}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                      <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography>{selectedCommande?.client?.adresse || "Non spécifié"}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                      <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography>{selectedCommande?.client?.telephone || "Non spécifié"}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                      <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography>{selectedCommande?.client?.email || "Non spécifié"}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ mb: 2, color: "#1976d2", fontWeight: 'bold' }}>
                Facturation
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Total H.T.</Typography>
                      <Typography variant="h6">{(selectedCommande?.montantHT || selectedCommande?.total_hors_Taxe || 0).toFixed(2)} DT</Typography>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Dont TVA à 19%</Typography>
                      <Typography variant="h6">
                        {((selectedCommande?.montantTTC || selectedCommande?.total_ttc || 0) - 
                          (selectedCommande?.montantHT || selectedCommande?.total_hors_Taxe || 0)).toFixed(2)} DT
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">Montant total des articles (T.T.C.)</Typography>
                    <Typography variant="h6" color="primary">
                      {(selectedCommande?.montantTTC || selectedCommande?.total_ttc || 0).toFixed(2)} DT
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ mb: 2, color: "#1976d2", fontWeight: 'bold' }}>
                Options de commande
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                    <Stack spacing={1}>
                      <Typography variant="body2">Date de commande: {new Date(selectedCommande?.dateCommande).toLocaleDateString()}</Typography>
                      <Typography variant="body2">Dépôt: {selectedCommande?.depot?.libelle || "Non spécifié"}</Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ mb: 2, color: "#1976d2", fontWeight: 'bold' }}>
                Méthode de livraison
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                    <Stack spacing={1}>
                      <Typography variant="body2">Mode de livraison: {selectedCommande?.modeLivraison || "Non spécifié"}</Typography>
                      <Typography variant="body2" color="text.secondary">Frais de livraison: 0,00 DT</Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ mb: 2, color: "#1976d2", fontWeight: 'bold' }}>
                Méthode de paiement
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                    <Stack spacing={1}>
                      <Typography variant="body2">Mode de paiement: {selectedCommande?.modePaiement || "Non spécifié"}</Typography>
                      <Typography variant="body2">Conditions de paiement: {selectedCommande?.conditionsPaiement || "Non spécifié"}</Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 1 && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Article</TableCell>
                    <TableCell align="right">Quantité</TableCell>
                    <TableCell align="right">Prix unitaire</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedCommande?.lignes?.map((ligne, index) => (
                    <TableRow key={index}>
                      <TableCell>{ligne.article?.libelle || ligne.libelle}</TableCell>
                      <TableCell align="right">{ligne.quantite || 0}</TableCell>
                      <TableCell align="right">{ligne.prix_unitaire?.toFixed(2)} DT</TableCell>
                      <TableCell align="right">{(ligne.quantite * ligne.prix_unitaire)?.toFixed(2)} DT</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeTab === 2 && (
            <List>
              <ListItem>
                <ListItemText
                  primary="Commande créée"
                  secondary={new Date(selectedCommande?.dateCommande).toLocaleString()}
                />
              </ListItem>
            </List>
          )}

          {activeTab === 3 && (
            <List>
              <ListItem>
                <ListItemText
                  primary="Bon de commande"
                  secondary="Télécharger le bon de commande"
                />
              </ListItem>
            </List>
          )}
        </Box>
      </Drawer>

      {/* Dialog de suppression moderne */}
      <ModernDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Supprimer le bon de commande"
        content={`Êtes-vous sûr de vouloir supprimer le bon de commande ${bonCommandeToDelete?.numero} ? Cette action est irréversible.`}
      />

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        TransitionComponent={Fade}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ 
            width: '100%',
            backgroundColor: '#4caf50',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            },
            '& .MuiAlert-action': {
              color: 'white',
            },
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <CheckCircle sx={{ fontSize: 28 }} />
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            {snackbarMessage}
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
}