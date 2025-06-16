import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import { Visibility, Delete, Edit, Receipt, ShoppingCart, Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Chip, Tooltip, Divider, Collapse } from "@mui/material";
import {
  Card, CardContent, Alert, Typography, Grid, Button, TextField, MenuItem, Select, FormControl, InputLabel, IconButton, Drawer, Modal, Backdrop, Fade, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Snackbar, Paper, Autocomplete
} from "@mui/material";
import { Stack } from "@mui/material";
import { Search, Clear, CheckCircle, Close, FilterList, ExpandMore, ExpandLess } from "@mui/icons-material";
import { InputAdornment } from "@mui/material";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
// Nouvelles icônes pour un design moderne
import AssignmentIcon from '@mui/icons-material/Assignment';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
// Composant moderne de suppression
import ModernDeleteDialog from '../../components/ModernDeleteDialog';
export default function ListeDevisClient() {
  const [listeDevis, setListeDevis] = useState([]);
  const [editLignes, setEditLignes] = useState([]); // État pour les lignes modifiables
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    client: "",
    year: "",
    month: "",
    article: "",
  });
  const [error, setError] = useState(null);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // État pour la pagination
  const itemsPerPage = 6; // Nombre d'éléments par page
  const [editDevis, setEditDevis] = useState(null); // État pour le devis en cours de modification
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // État pour contrôler l'affichage du formulaire de modification
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [depots, setDepots] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [devisToDelete, setDevisToDelete] = useState(null);

  const navigate = useNavigate();

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les bons de commande
        const listeDevisResponse = await axios.get("http://localhost:5000/ventes/devis/all");
        setListeDevis(listeDevisResponse.data);

        // Récupérer les Clients
        const ClientsResponse = await axios.get("http://localhost:5000/client/clients");
        setClients(ClientsResponse.data);

        // Récupérer les articles
        const articlesResponse = await axios.get("http://localhost:5000/article/articles");
        setArticles(articlesResponse.data);

        // Récupérer les dépôts
        const depotsResponse = await axios.get("http://localhost:5000/depot/depots");
        setDepots(depotsResponse.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        setError("Erreur lors de la récupération des données. Veuillez réessayer.");
      }
    };

    fetchData();
  }, []);
const handleCloseSnackbar = () => {
  setOpenSnackbar(false);
};
  const handleDownload = (devis) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("DEVIS", 10, 10);
    doc.setFontSize(12);
    doc.text(`Devis N°: ${devis.numero}`, 10, 20);
    doc.text(`Date devis: ${new Date(devis.dateDevis).toLocaleDateString()}`, 10, 30);

    const client = clients.find(c => c._id === devis.client._id);
    doc.text(`À l'intention de: ${client.nom_prenom}`, 10, 40);
    doc.text(`Adresse: ${client.adresse || 'N/A'}`, 10, 50);
    doc.text(`Matricule Fiscale: ${client.matricule_fiscale || 'N/A'}`, 10, 60);
    doc.text(`Téléphone: ${client.telephone || 'N/A'}`, 10, 70);
  
    doc.text(`Objet : DEVIS`  , 10, 90);
  
    // Tableau des articles commandés
    doc.autoTable({
      startY: 100,
      head: [['Article',  'Quantité', 'Prix Unitaire ', 'Total ']],
      body: devis.lignes.map(ligne => [
        ligne.article.libelle,
        ligne.quantite,
        `${ligne.prix_unitaire.toFixed(2)} DT`,
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} DT`
      ]),
    });
  
    // Totaux
    const totalHT = devis.lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2;
  
    doc.text(`Montant Total HT: ${totalHT.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 10);
    doc.text(`Total TTC : ${totalTTC.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 20);
    doc.text(`Montant Total TTC: ${totalTTC.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 30);
  
    doc.save(`devis${devis.numero}.pdf`);
  };
  // Filtrage des DEvis
  const filteredDevis = useMemo(() => {
    return listeDevis.filter((devis) => {
      const matchesSearchTerm =
        devis.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (devis.client && devis.client.nom_prenom.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (devis.lignes && devis.lignes.some((ligne) =>
          ligne.article.libelle.toLowerCase().includes(searchTerm.toLowerCase())
        ));

      const matchesFilters =
        (!filters.client || (devis.client && devis.client.nom_prenom === filters.client)) &&
        (!filters.year || new Date(devis.dateDevis).getFullYear().toString() === filters.year) &&
        (!filters.month || (new Date(devis.dateDevis).getMonth() + 1).toString() === filters.month) &&
        (!filters.article || (devis.lignes && devis.lignes.some((ligne) => ligne.article.libelle === filters.article)));

      return matchesSearchTerm && matchesFilters;
    });
  }, [listeDevis, searchTerm, filters]);


  // Pagination
  const paginatedDevis = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredDevis.slice(startIndex, endIndex);
  }, [filteredDevis, currentPage]);

  // Gestion de la recherche
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Réinitialiser à la première page lors d'une nouvelle recherche
  };

  // Suppression moderne d'un devis
  const handleDeleteDevis = (devis) => {
    setDevisToDelete(devis);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/ventes/devis/${devisToDelete._id}`);
      setListeDevis(listeDevis.filter((devis) => devis._id !== devisToDelete._id));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la suppression du devis :", error);
      alert("Erreur lors de la suppression du devis.");
    } finally {
      setDeleteLoading(false);
    }
  };

const handleEditDevis = (devis) => {
  setEditDevis(devis); // Stocker les données du devis à modifier
  setEditLignes(devis.lignes); // Initialiser les lignes modifiables
  setIsEditModalOpen(true); // Activer le mode édition
};

const getStatusChip = (statut) => {
  let color = "default";

  switch (statut) {
    case "Livrée":
      color = "success"; // Vert
      break;
    case "Annulée":
      color = "error"; // Rouge
      break;
    case "En attente":
      color = "#f5f5f5"; // Orange
      break;
    case "Confirmée" :
      color ="warning";
      break;
    default:
      color = "info"; // Bleu
  }

  return <Chip label={statut} color={color} sx={{ fontWeight: "bold", fontSize: "0.9rem" }} />;
};

  // Gestion des filtres
  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
    setCurrentPage(1); // Réinitialiser à la première page lors d'un changement de filtre
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
    setCurrentPage(1); // Réinitialiser à la première page lors de la réinitialisation des filtres
  };

  // Ouverture de la modal de détails
  const handleOpenModal = (devis) => {
    setSelectedDevis(devis);
    setIsModalOpen(true);
  };

  // Fermeture de la modal de détails
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDevis(null);
  };

  // Affichage des filtres actifs
  const activeFilters = Object.entries(filters).filter(([key, value]) => value !== "");

  // Ajouter la fonction fetchDevis
  const fetchDevis = async () => {
    try {
      const listeDevisResponse = await axios.get("http://localhost:5000/ventes/devis/all");
      setListeDevis(listeDevisResponse.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des devis:", error);
      setError("Erreur lors de la récupération des devis");
    }
  };
  // Ajouter la fonction pour générer un bon de commande client
  const handleGenerateBonCommande = async (devisId) => {
    try {  
      await axios.post(`http://localhost:5000/ventes/${devisId}/generate-bon-commande`);
      fetchDevis(); // Rafraîchir la liste des devis
      setSnackbarMessage("Le bon de commande a été généré avec succès !");
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate("/ListeBonCommandeClient");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la génération du bon de commande:", error);
    }
  };  
  
 const handleGenerateBonLivraison = async (devisId) => {
    try {  
      const response = await axios.post(
        `http://localhost:5000/ventes/${devisId}/generate-bon-livraison`
      );
      
      console.log('Réponse du serveur:', response.data);
      
      fetchDevis();
      setSnackbarMessage("Le bon de livraison a été généré avec succès !");
      setOpenSnackbar(true);
      
      // Redirection après confirmation
      setTimeout(() => {
        navigate("/ListeBonLivraisonClient");
      }, 2000);
    } catch (error) {
      console.error("Erreur complète:", error.response?.data || error.message);
      setSnackbarMessage("Erreur lors de la génération: " + (error.response?.data?.message || error.message));
      setOpenSnackbar(true);
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
              mb: 2,
              p: 1,
              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              color: 'white'
            }}>
              <AssignmentIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                Devis Clients
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Gérez vos devis clients facilement
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
                {/* Section Liste des Devis */}
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
                      Liste des Devis ({filteredDevis.length})
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/SaisieDevis')}
                      startIcon={<Add />}
                      sx={{
                        borderRadius: 2,
                        height: '35px',
                        width: '200px',
                        left: '350px',
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
                      Créer Devis
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
                          {Array.from(new Set(listeDevis.map(devis => new Date(devis.dateDevis).getFullYear())))
                            .sort((a, b) => b - a)
                            .map(year => (
                              <MenuItem key={year} value={year.toString()}>{year}</MenuItem>
                            ))}
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

                {/* Tableau moderne des devis */}
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
                          Total HT
                        </TableCell>
                        <TableCell sx={{
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '1rem'
                        }}>
                          Total TTC
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
                      {paginatedDevis.map((devis, index) => (
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
                            <Chip
                              label={devis.numero}
                              size="small"
                              sx={{
                                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            {new Date(devis.dateDevis).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            {devis.client ? devis.client.nom_prenom : "Non spécifié"}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            {(devis.total_hors_Taxe ??
                                devis.lignes?.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0) ?? 0)
                                .toFixed(2)} DT
                          </TableCell>
                          <TableCell sx={{
                            fontWeight: 'bold',
                            color: '#667eea'
                          }}>
                            {(devis.total_ttc ??
                                devis.lignes?.reduce((acc, ligne) => {
                                    const ht = ligne.quantite * ligne.prix_unitaire;
                                    return acc + (ht * (1 + (ligne.tva || 0) / 100));
                                }, 0) ?? 0)
                                .toFixed(2)} DT
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={devis.statut}
                              color={devis.statut === "Livrée" ? "success" :
                                     devis.statut === "Annulée" ? "error" :
                                     devis.statut === "En attente" ? "warning" : "info"}
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
                                  onClick={() => handleOpenModal(devis)}
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
                              <Tooltip title="Supprimer">
                                <IconButton
                                  onClick={() => handleDeleteDevis(devis)}
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
                              <Tooltip title="Modifier">
                                <IconButton
                                  onClick={() => navigate(`/ListeDevisClient/update/${devis._id}`)}
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
                              <Tooltip title="Télécharger PDF">
                                <IconButton
                                  onClick={() => handleDownload(devis)}
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
                              {devis.statut === "En attente" && (
                                <>
                                  <Tooltip title="Générer bon de commande">
                                    <IconButton
                                      color="success"
                                      onClick={() => handleGenerateBonCommande(devis._id)}
                                      size="small"
                                      sx={{
                                        '&:hover': {
                                          transform: 'scale(1.1)',
                                          backgroundColor: 'rgba(76, 175, 80, 0.1)'
                                        },
                                        transition: 'all 0.3s ease'
                                      }}
                                    >
                                      <Receipt />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Générer bon de livraison">
                                    <IconButton
                                      color="info"
                                      onClick={() => handleGenerateBonLivraison(devis._id)}
                                      size="small"
                                      sx={{
                                        '&:hover': {
                                          transform: 'scale(1.1)',
                                          backgroundColor: 'rgba(33, 150, 243, 0.1)'
                                        },
                                        transition: 'all 0.3s ease'
                                      }}
                                    >
                                      <ShoppingCart />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                              {devis.statut === "Confirmée" && (
                                <Tooltip title="Générer bon de livraison">
                                  <IconButton
                                    color="info"
                                    onClick={() => handleGenerateBonLivraison(devis._id)}
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
                    Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredDevis.length)} sur {filteredDevis.length} devis
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
                      disabled={currentPage * itemsPerPage >= filteredDevis.length}
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

      {/* Dialog de suppression moderne */}
      <ModernDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        loading={deleteLoading}
        title="Supprimer le devis"
        content={`Êtes-vous sûr de vouloir supprimer le devis ${devisToDelete?.numero} ? Cette action est irréversible.`}
      />

      {/* Drawer des filtres */}
      <Drawer
        anchor="right"
        open={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
        PaperProps={{
          sx: { width: 320, p: 3, borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">Filtres avancés</Typography>
          <IconButton onClick={() => setIsFilterSidebarOpen(false)}>
            <Close />
          </IconButton>
        </Box>

        <Stack spacing={3}>
          <FormControl fullWidth>
            <InputLabel>Client</InputLabel>
            <Select
              value={filters.fournisseur}
              onChange={(e) => handleFilterChange("Client", e.target.value)}
              label="Client"
            >
              <MenuItem value="">Tous</MenuItem>
              {[...new Set(listeDevis.map(bon => bon.client?.nom_prenom))]
                .filter(Boolean)
                .map((name, index) => (
                  <MenuItem key={index} value={name}>{name}</MenuItem>
                ))
              }
            </Select>
          </FormControl>

          <TextField
            label="Date début"
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="Date fin"
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />


          <Button
            variant="outlined"
            onClick={resetFilters}
            startIcon={<Clear />}
            fullWidth
          >
            Réinitialiser les filtres
          </Button>
        </Stack>
      </Drawer>


      {/* Pop-up pour afficher les détails du bon de commande */}
      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={isModalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: "1000px",
              bgcolor: "#FFFFFF",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {selectedDevis && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" component="h2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    Détails du Devis N° {selectedDevis.numero}
                  </Typography>
                  <IconButton onClick={handleCloseModal} sx={{ color: '#666' }}>
                    <Clear />
                  </IconButton>
                </Box>

                {/* Informations de base */}
                <Card sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                      Informations Générales
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong style={{ color: '#666' }}>Date de Devis:</strong>{" "}
                          {new Date(selectedDevis.dateDevis).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong style={{ color: '#666' }}>Client:</strong>{" "}
                          {selectedDevis.client ? selectedDevis.client.nom_prenom : "Non spécifié"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong style={{ color: '#666' }}>Total HT:</strong>{" "}
                          {selectedDevis.total_hors_Taxe.toFixed(2)} TND
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong style={{ color: '#666' }}>Total TTC:</strong>{" "}
                          {selectedDevis.total_ttc.toFixed(2)} TND
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong style={{ color: '#666' }}>Statut:</strong>{" "}
                          <Chip 
                            label={selectedDevis.statut} 
                            color={selectedDevis.statut === "Livrée" ? "success" : 
                                selectedDevis.statut === "Annulée" ? "error" : 
                                selectedDevis.statut === "En attente" ? "warning" : "info"}
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: '0.9rem',
                              borderRadius: '4px',
                              padding: '4px 8px'
                            }}
                          />
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Lignes de commande */}
                <Card sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                      Articles demandés
                    </Typography>
                    <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Article</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Quantité</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Prix Unitaire</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Total HT</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Total TTC</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedDevis.lignes.map((ligne, index) => (
                            <TableRow 
                              key={index}
                              sx={{ 
                                '&:hover': { 
                                  backgroundColor: '#f5f5f5',
                                  transition: 'background-color 0.2s'
                                }
                              }}
                            >
<TableCell>
  {ligne.article && typeof ligne.article === 'object' 
    ? ligne.article.libelle 
    : ligne.article || 'Article inconnu'}
</TableCell>                              <TableCell>{ligne.quantite}</TableCell>
                              <TableCell>{ligne.prix_unitaire.toFixed(2)} TND</TableCell>
                              <TableCell>{ligne.total_ht.toFixed(2)} TND</TableCell>
                              <TableCell>{ligne.total_ttc.toFixed(2)} TND</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                {/* Boutons d'action */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleEditDevis(selectedDevis)}
                    sx={{ 
                      borderRadius: '8px',
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      '&:hover': {
                        borderColor: '#1565c0',
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      }
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleCloseModal}
                    sx={{ 
                      borderRadius: '8px',
                      backgroundColor: '#d32f2f',
                      '&:hover': { backgroundColor: '#c62828' }
                    }}
                  >
                    Fermer
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>


{/*Snackbar*/}
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