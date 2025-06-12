import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import { Visibility, Delete, Edit, Receipt, AttachMoney, Business, CalendarToday, Description } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  Card, CardContent, Typography, Grid, Button, TextField, MenuItem, Select, FormControl, InputLabel, IconButton, Drawer, Modal, Backdrop, Fade, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, Chip, Tooltip, Autocomplete, Collapse
} from "@mui/material";
import { Stack } from "@mui/material";
import { FilterList, Search, Clear, ExpandMore, ExpandLess, Add } from "@mui/icons-material";
import { InputAdornment } from "@mui/material";
import jsPDF from "jspdf";
import 'jspdf-autotable';
// Nouvelles icônes pour un design moderne
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EuroIcon from '@mui/icons-material/Euro';
// Composant moderne de suppression
import ModernDeleteDialog from '../../components/ModernDeleteDialog';

function ListeFacturesFournisseur() {
  const [factures, setFactures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    fournisseur: "",
    year: "",
    month: "",
  });
  const [pdfUrl, setPdfUrl] = useState("");
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [error, setError] = useState(null);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [factureArticles, setFactureArticles] = useState([]);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Récupération des données

  useEffect(() => {
    const fetchData = async () => {
      try {
        const facturesResponse = await axios.get("http://localhost:5000/factureF/factures");
        console.log("Factures récupérées :", facturesResponse.data); // Ajoutez ce log pour vérifier les données
        console.log(facturesResponse.data);
        setFactures(facturesResponse.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        setError("Erreur lors de la récupération des données. Veuillez réessayer.");
      }
    };

    fetchData();
  }, []);
  // Filtrage des factures
  const filteredFactures = useMemo(() => {
    return factures.filter((facture) => {
      const matchesSearchTerm =
        facture.numero_facture.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (facture.fournisseur && facture.fournisseur.raison_sociale.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilters =
        (!filters.fournisseur || (facture.fournisseur && facture.fournisseur.raison_sociale === filters.fournisseur)) &&
        (!filters.year || new Date(facture.date_facture).getFullYear().toString() === filters.year) &&
        (!filters.month || (new Date(facture.date_facture).getMonth() + 1).toString() === filters.month);
      return matchesSearchTerm && matchesFilters;
    });
  }, [factures, searchTerm, filters]);

  // Pagination
  const paginatedFactures = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredFactures.slice(startIndex, endIndex);
  }, [filteredFactures, currentPage]);

  // Gestion de la recherche
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  // Suppression d'une facture avec modal de confirmation moderne
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [factureToDelete, setFactureToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteFacture = (facture) => {
    setFactureToDelete(facture);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteFacture = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/factureF/${factureToDelete._id}`);
      setFactures(factures.filter((facture) => facture._id !== factureToDelete._id));
      setDeleteDialogOpen(false);
      setFactureToDelete(null);
      alert("Facture supprimée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression de la facture :", error);
      alert("Erreur lors de la suppression de la facture.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDownloadFacture = async (facture) => {
    try {
      // Vérifier si la facture existe et a un ID valide
      if (!facture || !facture._id) {
        alert("Aucune facture valide à télécharger.");
        return;
      }

      console.log("Téléchargement de la facture:", facture._id);

      // Faire la requête pour télécharger le PDF
      const response = await axios.get(`http://localhost:5000/factureF/download/${facture._id}`, {
        responseType: 'blob', // Important pour les fichiers binaires
        headers: {
          'Accept': 'application/pdf'
        }
      });

      // Vérifier si la réponse contient des données
      if (!response.data || response.data.size === 0) {
        alert("Le fichier PDF est vide ou corrompu.");
        return;
      }

      // Créer un blob à partir de la réponse
      const blob = new Blob([response.data], { type: 'application/pdf' });

      // Créer un lien temporaire pour télécharger le fichier
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `facture_${facture.numero_facture || facture._id}.pdf`; // Nom du fichier
      document.body.appendChild(link);
      link.click();

      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Téléchargement réussi");
    } catch (error) {
      console.error("Erreur lors du téléchargement de la facture :", error);

      // Gestion des erreurs spécifiques
      if (error.response) {
        if (error.response.status === 404) {
          alert("Facture ou fichier PDF non trouvé.");
        } else if (error.response.status === 500) {
          alert("Erreur serveur lors du téléchargement.");
        } else {
          alert(`Erreur lors du téléchargement : ${error.response.data?.message || 'Erreur inconnue'}`);
        }
      } else if (error.request) {
        alert("Erreur de connexion lors du téléchargement.");
      } else {
        alert("Erreur lors de la préparation du téléchargement.");
      }
    }
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
      fournisseur: "",
      year: "",
      month: "",
    });
    setCurrentPage(1);
  };

  // Modifier la fonction handleOpenModal
  const handleOpenModal = async (facture) => {
    setSelectedFacture(facture);
    setIsModalOpen(true);
    try {
      // Récupérer les articles de la facture
      const response = await axios.get(`http://localhost:5000/factureF/articles/${facture._id}`);
      setFactureArticles(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des articles:", error);
      setFactureArticles([]);
    }
  };
  const getStatusColor = (statut) => {
    switch (statut) {
      case "paye":
        return "success";
      case "partiellement_paye":
        return "warning";
      case "non_paye":
        return "error";
      default:
        return "error";
    }
  };

  const formatStatut = (statut) => {
    switch (statut) {
      case "paye":
        return "Payée"; // Pas de changement
      case "partiellement_paye":
        return "p.payé"; // Transforme "partiellement_paye" en "p.payé" pour l'affichage
      case "non_paye":
        return "Non payé"; // Optionnel : vous pouvez aussi formater ce statut
      default:
        return statut; // Retourne le statut par défaut si inconnu
    }
};
  // Fermeture de la modal de détails
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFacture(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl); // Libérer l'URL
      setPdfUrl(""); // Réinitialiser l'URL
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

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
              mb: 4,
              p: 4,
              height: '175px',
              width: '1000px',

              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              color: 'white'
            }}>
              <ReceiptLongIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                Factures Fournisseurs
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
                Gestion et suivi de vos factures
              </Typography>

             
            </Box>
          </Fade>

          {/* Section principale avec tout le contenu dans une seule carte */}
          <Fade in={true} timeout={1000}>
            <Card sx={{
              p: 1,
              mb: 1,
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
                {/* Section Liste des Factures */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <ReceiptLongIcon sx={{
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
                      Liste des Factures ({filteredFactures.length})
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  {/* Barre de recherche fine avec bouton filtrer */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      placeholder="Rechercher par numéro ou fournisseur..."
                      variant="outlined"
                      size="small"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      sx={{
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          height: '35px',
                          left:'345px',
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
                        left: '310px',
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
                      {/* Filtre Fournisseur avec Autocomplete */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Autocomplete
                          options={[...new Set(factures.map((facture) => facture.fournisseur?.raison_sociale).filter(Boolean))]}
                          value={filters.fournisseur || null}
                          onChange={(event, newValue) => handleFilterChange("fournisseur", newValue || "")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Fournisseur"
                              variant="outlined"
                              size="small"
                              sx={{
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                            />
                          )}
                          sx={{ width: '100%' }}
                        />
                      </Grid>

                      {/* Filtre Année avec Autocomplete */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Autocomplete
                          options={[...new Set(factures.map((facture) => new Date(facture.date_facture).getFullYear().toString()))].sort((a, b) => b.localeCompare(a))}
                          value={filters.year || null}
                          onChange={(event, newValue) => handleFilterChange("year", newValue || "")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Année"
                              variant="outlined"
                              size="small"
                              sx={{
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                            />
                          )}
                          sx={{ width: '100%' }}
                        />
                      </Grid>

                      {/* Filtre Mois avec Autocomplete */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Autocomplete
                          options={[
                            { value: '1', label: 'Janvier' },
                            { value: '2', label: 'Février' },
                            { value: '3', label: 'Mars' },
                            { value: '4', label: 'Avril' },
                            { value: '5', label: 'Mai' },
                            { value: '6', label: 'Juin' },
                            { value: '7', label: 'Juillet' },
                            { value: '8', label: 'Août' },
                            { value: '9', label: 'Septembre' },
                            { value: '10', label: 'Octobre' },
                            { value: '11', label: 'Novembre' },
                            { value: '12', label: 'Décembre' }
                          ]}
                          getOptionLabel={(option) => option.label}
                          value={filters.month ? { value: filters.month, label: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][parseInt(filters.month) - 1] } : null}
                          onChange={(event, newValue) => handleFilterChange("month", newValue?.value || "")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Mois"
                              variant="outlined"
                              size="small"
                              sx={{
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                            />
                          )}
                          sx={{ width: '100%' }}
                        />
                      </Grid>
                    </Grid>

                    {/* Bouton pour réinitialiser les filtres */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                      <Button
                        onClick={resetFilters}
                        startIcon={<Clear />}
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          borderColor: '#2c3e50',
                          color: '#2c3e50',
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#34495e',
                            backgroundColor: 'rgba(52, 73, 94, 0.1)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(52, 73, 94, 0.3)'
                          }
                        }}
                      >
                        Réinitialiser les filtres
                      </Button>
                    </Box>
                  </Box>
                </Collapse>

                <TableContainer component={Paper} sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  overflow: 'hidden'
                }}>
                  <Table sx={{ minWidth: 550 }} aria-label="simple table">
                    <TableHead sx={{
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
                    }}>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          Numéro
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          Date
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          Fournisseur
                        </TableCell>
                       
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          Total TTC
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedFactures.map((facture, index) => (
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
                          <TableCell sx={{ fontWeight: 'medium', color: '#2c3e50' }}>
                            {facture.numero_facture}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: '#2c3e50' }} />
                            {new Date(facture.date_facture).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            <BusinessIcon sx={{ fontSize: 16, mr: 1, color: '#2c3e50' }} />
                            {facture.fournisseur ? facture.fournisseur.raison_sociale : "Non spécifié"}
                          </TableCell>
                         
                          <TableCell sx={{ fontWeight: 'medium', color: '#2c3e50' }}>
                            {facture.montantTTC?.toFixed(2)} TND
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={formatStatut(facture.statut)}
                              color={getStatusColor(facture.statut)}
                              size="small"
                              sx={{
                                fontWeight: 'bold',
                                borderRadius: 2
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                         
                              <Tooltip title="Télécharger PDF">
                                <Button
                                  onClick={() => handleDownloadFacture(facture)}
                                  startIcon={<FileDownloadIcon />}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    borderColor: '#ff9800',
                                    color: '#ff9800',
                                    borderRadius: 2,
                                    '&:hover': {
                                      borderColor: '#f57c00',
                                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                      transform: 'scale(1.05)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  PDF
                                </Button>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  onClick={() => handleDeleteFacture(facture)}
                                  size="small"
                                  sx={{
                                    color: '#f44336',
                                    '&:hover': {
                                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Divider entre tableau et pagination */}
                <Divider sx={{ my: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />

                {/* Section Pagination intégrée */}
                <Box sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mt: 2
                }}>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Button
                  variant="contained"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    fontWeight: 'bold',
                    px: 3,
                    '&:hover': {
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                    },
                    '&:disabled': {
                      background: '#e0e0e0',
                      color: '#9e9e9e'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Précédent
                </Button>
                <Button
                  variant="contained"
                  disabled={currentPage * itemsPerPage >= filteredFactures.length}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    fontWeight: 'bold',
                    px: 3,
                    '&:hover': {
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                    },
                    '&:disabled': {
                      background: '#e0e0e0',
                      color: '#9e9e9e'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Suivant
                </Button>
              </Box>
              <Typography variant="body1" sx={{
                color: '#667eea',
                fontWeight: 'medium',
                fontSize: '1.1rem'
              }}>
                Page {currentPage} sur {Math.ceil(filteredFactures.length / itemsPerPage)}
              </Typography>
            </Box>
              </CardContent>
            </Card>
          </Fade>
        </Box>
      </Box>

      {/* Modal de détails */}
      <Dialog 
            open={isModalOpen}
            onClose={handleCloseModal}
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #e0e0e0",
          pb: 2
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Receipt sx={{ color: "#1976d2" }} />
            <Typography variant="h6">
              Détails de la Facture N° {selectedFacture?.numero_facture}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
                {selectedFacture && (
            <Grid container spacing={3}>
              {/* Informations générales */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                  Informations générales
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business sx={{ color: "#1976d2" }} />
                        <Typography>
                          <strong>Fournisseur :</strong> {selectedFacture.fournisseur?.raison_sociale || "Non spécifié"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ color: "#1976d2" }} />
                        <Typography>
                          <strong>Date de facturation :</strong> {new Date(selectedFacture.date_facture).toLocaleDateString()}
                    </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney sx={{ color: "#1976d2" }} />
                        <Typography>
                          <strong>Montant :</strong> {selectedFacture.montantTTC?.toFixed(2)} DT
                    </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>

              {/* Articles de la facture */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, mt: 3, color: "#1976d2" }}>
                  Articles de la facture
                    </Typography>
                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                        <TableCell sx={{ fontWeight: "bold" }}>Désignation</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Quantité</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Prix unitaire</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Total HT</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>TVA</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Total TTC</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
           {factureArticles.map((article, index) => {
    console.log("Article:", article); // Ajoutez ce log pour vérifier les articles
    return (
      <TableRow key={index}>
        <TableCell>{article.libelle}</TableCell>
        <TableCell>{article.quantite}</TableCell>
        <TableCell>{article.prix_unitaire?.toFixed(2)} DT</TableCell>
        <TableCell>{article.total_ht?.toFixed(2)} DT</TableCell>
        <TableCell>{article.tva}%</TableCell>
        <TableCell>{article.total_ttc?.toFixed(2)} DT</TableCell>
      </TableRow>
    );
               })}
               </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Statut de la facture */}
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Typography variant="h6" sx={{ color: "#1976d2" }}>
                    Statut :
                    </Typography>
                  <Chip 
                    label={selectedFacture.statut || "partiellement_paye"} 
                    color={selectedFacture.statut === "Payée" ? "success" : "warning"}
                    size="small"
                  />
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #e0e0e0" }}>
                    <Button
                      onClick={handleCloseModal}
            variant="outlined"
            sx={{ borderRadius: "8px" }}
                    >
                      Fermer
                    </Button>
              <Button
            onClick={() => handleDownloadFacture(selectedFacture)}
            variant="contained"
            startIcon={<FileDownloadIcon />}
            sx={{ borderRadius: "8px" }}
          >
            Télécharger le PDF
              </Button>
            </DialogActions>
          </Dialog>

        {/* Modal de confirmation de suppression moderne */}
        <ModernDeleteDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={confirmDeleteFacture}
          title="Suppression de facture"
          message="Êtes-vous sûr de vouloir supprimer cette facture ?"
          itemDetails={factureToDelete ? {
            title: factureToDelete.numero_facture,
            details: [
              `🏢 Fournisseur: ${factureToDelete.fournisseur?.raison_sociale || 'Non spécifié'}`,
              `📅 Date: ${new Date(factureToDelete.date_facture).toLocaleDateString('fr-FR')}`,
              `💰 Statut: ${factureToDelete.statut || 'Non défini'}`
            ]
          } : null}
          itemIcon="📄"
          loading={deleteLoading}
        />

    </>
  );
}

export default ListeFacturesFournisseur;