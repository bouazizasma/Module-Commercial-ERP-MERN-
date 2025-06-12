import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import { Visibility, Delete, Edit } from "@mui/icons-material";
import { Chip, Tooltip, Divider } from "@mui/material";
import { format } from 'date-fns';
import { useNavigate } from "react-router-dom";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  Card, CardContent, Typography, Grid, Button, TextField, MenuItem, Select, FormControl, InputLabel, IconButton, Drawer, Modal, Backdrop, Fade, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, Autocomplete, Collapse
} from "@mui/material";
import { Stack } from "@mui/material";
import { FilterList, Search, Clear, ExpandMore, ExpandLess } from "@mui/icons-material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import { InputAdornment } from "@mui/material";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import { Add, NavigateBefore, NavigateNext, Close } from "@mui/icons-material";
import InfoIcon from '@mui/icons-material/Info';
// Nouvelles icônes pour un design moderne
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
// Composant moderne de suppression
import ModernDeleteDialog from '../../components/ModernDeleteDialog';
import LocationOnIcon from '@mui/icons-material/LocationOn';

export default function ListeBonReceptionFournisseur() {
  const [bonsReception, setBonsReception] = useState([]);
  const [editLignes, setEditLignes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    fournisseur: "",
    startDate: "",
    endDate: "",
    article: "",
    numeroFacture: "",
    timbre: "1.000",
  });
  const [pdfUrl, setPdfUrl] = useState("");
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [error, setError] = useState(null);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBonReception, setSelectedBonReception] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [editBon, setEditBonReception] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [depots, setDepots] = useState([]);
  const [selectedBons, setSelectedBons] = useState([]);
  const [isFactureModalOpen, setIsFactureModalOpen] = useState(false);
  const [factureFournisseur, setFactureFournisseur] = useState("");
  const [timbre, setTimbre] = useState("1.000");
  const [selectedBonForFacture, setSelectedBonForFacture] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    numeroFactureFournisseur: "", // Assurez-vous que cette clé est présente
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Début de la récupération des données");
        const response = await axios.get("http://localhost:5000/achat/BEF/all");
        console.log("Réponse brute de l'API:", response);
        
        if (!response.data) {
          console.error("Pas de données dans la réponse");
          return;
        }

        console.log("Données reçues de l'API:", response.data);
        setBonsReception(response.data);

        // Récupération des autres données
        const [fournisseursRes, articlesRes, depotsRes] = await Promise.all([
          axios.get("http://localhost:5000/fournisseur/fournisseurs"),
          axios.get("http://localhost:5000/article/articles"),
          axios.get("http://localhost:5000/depot/depots")
        ]);

        setFournisseurs(fournisseursRes.data);
        setArticles(articlesRes.data);
        setDepots(depotsRes.data);
      } catch (error) {
        console.error("Erreur détaillée lors de la récupération des données:", error);
        if (error.response) {
          console.error("Réponse d'erreur:", error.response.data);
        }
        setError(`Erreur lors de la récupération des données: ${error.message}`);
      }
    };

    fetchData();
  }, []);

  // Ajout d'un useEffect pour déboguer l'état des bons de réception
  useEffect(() => {
    console.log("État actuel des bons de réception:", bonsReception);
  }, [bonsReception]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value, // Met à jour dynamiquement la clé correspondante dans formData
    }));
  };
  const handleSelectBon = (id) => {
    if (selectedBons.includes(id)) {
      setSelectedBons(selectedBons.filter((bonId) => bonId !== id));
    } else {
      setSelectedBons([...selectedBons, id]);
    }
  };

  const handleGroupedFacturation = async () => {
    try {
      const selectedBonsData = bonsReception.filter((bon) => selectedBons.includes(bon._id));
      const fournisseurId = selectedBonsData[0].fournisseur._id;

      if (!selectedBonsData.every((bon) => bon.fournisseur._id === fournisseurId)) {
        alert("Tous les bons sélectionnés doivent avoir le même fournisseur.");
        return;
      }

      if (!selectedBonsData.every((bon) => bon.statut === "En attente")) {
        alert("Tous les bons sélectionnés doivent avoir le statut 'En attente'.");
        return;
      }

      const response = await axios.post("http://localhost:5000/factureF/plusieurs/generer", {
        bonIds: selectedBons,
      }, { headers: { "Content-Type": "application/json" } });

      if (response.data.pdfUrl) {
        setPdfUrl(response.data.pdfUrl);
        setOpenPreviewModal(true);
      }
    } catch (error) {
      console.error("Erreur lors de la génération de la facture groupée :", error);
      alert("Erreur lors de la génération de la facture groupée.");
    }
  };

  const handleSelectAll = () => {
    if (selectedBons.length === filteredBonsReception.length) {
      setSelectedBons([]);
    } else {
      setSelectedBons(filteredBonsReception.map((bon) => bon._id));
    }
  };

  const handleDownload = (bonReception) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Bon de Reception", 10, 10);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(bonReception.dateReception).toLocaleDateString()}`, 10, 20);
    doc.text(`Bon de Reception: ${bonReception.numero_Bon}`, 10, 30);

    const fournisseur = fournisseurs.find(f => f._id === bonReception.fournisseur._id);
    doc.text(`${fournisseur.raison_sociale}`, 10, 50);
    doc.text(`${fournisseur.adresse || 'N/A'}`, 10, 60);
    doc.text(`Tel: ${fournisseur.telephone || 'N/A'}`, 10, 70);

    doc.text(`Objet : Reception`, 10, 90);

    doc.autoTable({
      startY: 100,
      head: [['Description', 'Unité', 'Quantité', 'Prix Unitaire HT', 'Total Net']],
      body: bonReception.lignes.map(ligne => [
        ligne.article.libelle,
        'DT',
        ligne.quantite,
        `${ligne.prix_unitaire.toFixed(2)} DT`,
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} DT`
      ]),
    });

    const totalHT = bonReception.lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2;

    doc.text(`Montant Total HT: ${totalHT.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 10);
    doc.text(`Total TTC (20%): ${totalTTC.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 20);
    doc.text(`Montant Total TTC: ${totalTTC.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 30);

    doc.save(`bon_de_Reception_${bonReception.numero_Bon}.pdf`);
  };

  const handleDownloadFacture = async (bonReception) => {
    try {
      if (bonReception.statut === "Facturé") {
        alert("Ce bon de réception a déjà été facturé.");
        return;
      }
      const response = await axios.post("http://localhost:5000/factureF/generer", {
        enteteAchatId: bonReception._id,
      }, { headers: { "Content-Type": "application/json" } });

      if (response.data.pdfUrl) {
        setPdfUrl(response.data.pdfUrl);
        setOpenPreviewModal(true);
      }
    } catch (error) {
      console.error("Erreur lors de la génération de la facture :", error);
      alert("Erreur lors de la génération de la facture.");
    }
  };

  const filteredBonsReception = useMemo(() => {
    return bonsReception.filter((bonReception) => {
      const matchesSearchTerm =
        bonReception.numero_Bon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bonReception.fournisseur && bonReception.fournisseur.raison_sociale.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bonReception.lignes && bonReception.lignes.some((ligne) =>
          ligne.article.libelle.toLowerCase().includes(searchTerm.toLowerCase())
        ));

      const matchesFilters =
        (!filters.fournisseur || (bonReception.fournisseur && bonReception.fournisseur.raison_sociale === filters.fournisseur)) &&
        (!filters.startDate || new Date(bonReception.dateReception) >= new Date(filters.startDate)) &&
        (!filters.endDate || new Date(bonReception.dateReception) <= new Date(filters.endDate)) &&
        (!filters.article || (bonReception.lignes && bonReception.lignes.some((ligne) => ligne.article.libelle === filters.article)));

      return matchesSearchTerm && matchesFilters;
    });
  }, [bonsReception, searchTerm, filters]);

  const paginatedBonsReception = useMemo(() => {
    if (!filteredBonsReception || filteredBonsReception.length === 0) {
      return [];
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBonsReception.slice(startIndex, endIndex);
  }, [filteredBonsReception, currentPage, itemsPerPage]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1);
  };

  const handleDeleteBonReception = async (id) => {
    try {
      const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce bon de Réception ?");
      if (!confirmDelete) return;

      await axios.delete(`http://localhost:5000/achat/BEF${id}`);
      setBonsReception(bonsReception.filter((bon) => bon._id !== id));
      alert("Bon de Reception supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression du bon de reception :", error);
      alert("Erreur lors de la suppression du bon de reception.");
    }
  };

  const getStatusChip = (statut) => {
    let color = "default";

    switch (statut) {
      case "Facturé":
        color = "success";
        break;
      case "Annulée":
        color = "error";
        break;
      case "Non Facturé":
        color = "#f5f5f5";
        break;
      default:
        color = "#f5f5f5";
    }

    return <Chip label={statut} color={color} sx={{ fontWeight: "bold", fontSize: "0.9rem" }} />;
  };

  const deleteSelectedBons = async () => {
    try {
      await axios.post("http://localhost:5000/achat/BEF/deleteMultiple", { ids: selectedBons });
      setBonsReception(bonsReception.filter((bon) => !selectedBons.includes(bon._id)));
      setSelectedBons([]);
      alert("Bons de réception supprimés avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression des bons de réception :", error);
      alert("Erreur lors de la suppression des bons de réception.");
    }
  };

  const handleEditBonReception = (bonReception) => {
    setEditBonReception(bonReception);
    setEditLignes(bonReception.lignes);
    setIsEditModalOpen(true);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilters({
      fournisseur: "",
      startDate: "",
      endDate: "",
      article: "",
      numeroFacture: "",
      timbre: "1.000",
    });
    setCurrentPage(1);
  };

  const handleOpenModal = (bonReception) => {
    setSelectedBonReception(bonReception);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBonReception(null);
  };

  const handleOpenFactureModal = (bonReception) => {
    setSelectedBonForFacture(bonReception);
    setIsFactureModalOpen(true);
  };

  const handleCloseFactureModal = () => {
    setIsFactureModalOpen(false);
    setFactureFournisseur("");
    setTimbre("1.000");
    setSelectedBonForFacture(null);
  };

  const handleGenerateFacture = async () => {
    if (!selectedBonForFacture) return;

    try {
      const response = await axios.post("http://localhost:5000/factureF/generer", {
        enteteAchatId: selectedBonForFacture._id,
        factureFournisseur: factureFournisseur,
        timbre: timbre,
      }, { headers: { "Content-Type": "application/json" } });

      if (response.data.pdfUrl) {
        setPdfUrl(response.data.pdfUrl);
        setOpenPreviewModal(true);
        handleCloseFactureModal();
      }
    } catch (error) {
      console.error("Erreur lors de la génération de la facture :", error);
      alert("Erreur lors de la génération de la facture.");
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
              <LocalShippingIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                Bons de Réceptions Fournisseurs
              </Typography>  
               <Typography variant="h6" sx={{ opacity: 0.9 }}>
                             gérez vos Bons de Réceptions facilement
                          </Typography>           
            </Box>
          </Fade>

          {/* Section principale avec tout le contenu dans une seule carte */}
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
                {/* Section Liste des Bons de Réception */}
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
                      Liste des Bons de Réception ({filteredBonsReception.length})
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/BonReceptionFournisseur')}
                      startIcon={<Add />}
                      sx={{
                        borderRadius: 2,
                        height: '35px',
                        width: '279px',
                        left: '245px',
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
                      Créer Bon de réception
                    </Button>
                  </Box>
                </Box>
                <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  {/* Barre de recherche fine avec bouton filtrer */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      placeholder="Rechercher par numéro, fournisseur ou article..."
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
                      {/* Filtre Fournisseur avec Autocomplete */}
                      <Grid item xs={12} sm={6} md={3}>
                        <Autocomplete
                          options={[...new Set(bonsReception.map((bon) => bon.fournisseur?.raison_sociale).filter(Boolean))]}
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

                      {/* Filtre Date début */}
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          label="Date début"
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => handleFilterChange("startDate", e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                          fullWidth
                          sx={{
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      </Grid>

                      {/* Filtre Date fin */}
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          label="Date fin"
                          type="date"
                          value={filters.endDate}
                          onChange={(e) => handleFilterChange("endDate", e.target.value)}
                          InputLabelProps={{ shrink: true }}
                          size="small"
                          fullWidth
                          sx={{
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      </Grid>

                      {/* Filtre Article avec Autocomplete */}
                      <Grid item xs={12} sm={6} md={3}>
                        <Autocomplete
                          options={[...new Set(bonsReception.flatMap((bon) => bon.lignes?.map((ligne) => ligne.article?.libelle).filter(Boolean) || []))]}
                          value={filters.article || null}
                          onChange={(event, newValue) => handleFilterChange("article", newValue || "")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Article"
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

                {/* Boutons d'actions pour les éléments sélectionnés */}
                {selectedBons.length > 0 && (
                  <Box sx={{ display: 'flex', gap: 2, mt: 2, mb: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={deleteSelectedBons}
                      startIcon={<Delete />}
                      sx={{
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(244, 67, 54, 0.4)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Supprimer ({selectedBons.length})
                    </Button>
                    {selectedBons.length > 1 && (
                      <Button
                        variant="contained"
                        onClick={handleGroupedFacturation}
                        startIcon={<ReceiptIcon />}
                        sx={{
                          borderRadius: 2,
                          background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #45a049 0%, #4caf50 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 8px 25px rgba(76, 175, 80, 0.4)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                      >
                        Facturer groupé
                      </Button>
                    )}
                  </Box>
                )}

                <TableContainer component={Paper} sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  overflow: 'hidden'
                }}>
                  <Table>
                    <TableHead sx={{
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
                    }}>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedBons.length === filteredBonsReception.length}
                            indeterminate={selectedBons.length > 0 && selectedBons.length < filteredBonsReception.length}
                            onChange={handleSelectAll}
                            sx={{ color: 'white' }}
                          />
                        </TableCell>
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
                          Total HT
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
                    {paginatedBonsReception.length > 0 ? (
                      paginatedBonsReception.map((bon, index) => (
                        <TableRow
                          key={bon._id || index}
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
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedBons.includes(bon._id)}
                              onChange={() => handleSelectBon(bon._id)}
                              disabled={bon.statut === "Facturé"}
                              sx={{
                                color: '#667eea',
                                '&.Mui-checked': {
                                  color: '#667eea'
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium', color: '#2c3e50' }}>
                            {bon.numero_Bon}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: '#2c3e50' }} />
                            {new Date(bon.dateReception).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            <BusinessIcon sx={{ fontSize: 16, mr: 1, color: '#2c3e50' }} />
                            {bon.fournisseur ? bon.fournisseur.raison_sociale : "Non spécifié"}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium', color: '#95a5a6' }}>
                            {bon.total_hors_Taxe?.toFixed(2)} TND
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium', color: '#2c3e50' }}>
                            {bon.total_ttc?.toFixed(2)} TND
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={bon.statut}
                              color={bon.statut === "Facturé" ? "success" :
                                     bon.statut === "Annulée" ? "error" :
                                     bon.statut === "En attente" ? "warning" : "info"}
                              sx={{
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                borderRadius: 2,
                                padding: '4px 8px'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Voir les détails">
                                <IconButton
                                  onClick={() => handleOpenModal(bon)}
                                  sx={{
                                    color: '#667eea',
                                    '&:hover': {
                                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
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
                                  onClick={() => handleDeleteBonReception(bon._id)}
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
                              <Tooltip title="Modifier">
                                <IconButton
                                  onClick={() => navigate(`/updateBonReception/${bon._id}`)}
                                  sx={{
                                    color: '#4caf50',
                                    '&:hover': {
                                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
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
                                  onClick={() => handleDownload(bon)}
                                  sx={{
                                    color: '#ff9800',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <FileDownloadIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" color="text.secondary" gutterBottom>
                              Aucun bon de réception trouvé
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Ajoutez un nouveau bon de réception ou modifiez vos filtres
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
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
                  disabled={currentPage * itemsPerPage >= filteredBonsReception.length}
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
                Page {currentPage} sur {Math.ceil(filteredBonsReception.length / itemsPerPage)}
              </Typography>
            </Box>
              </CardContent>
            </Card>
          </Fade>
        </Box>
      </Box>

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
            <InputLabel>Fournisseur</InputLabel>
            <Select
              value={filters.fournisseur}
              onChange={(e) => handleFilterChange("fournisseur", e.target.value)}
              label="Fournisseur"
            >
              <MenuItem value="">Tous</MenuItem>
              {[...new Set(bonsReception.map(bon => bon.fournisseur?.raison_sociale))]
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
            {selectedBonReception && (
              <>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  mb: 4,
                  pb: 2,
                  borderBottom: '2px solid #f0f0f0'
                }}>
                  <Box>
                    <Typography variant="h4" component="h2" sx={{ 
                      fontWeight: 'bold',
                      color: '#1976d2',
                      mb: 1
                    }}>
                      Bon de Réception N° {selectedBonReception.numero_Bon}
                    </Typography>
                    <Chip 
                      label={selectedBonReception.statut}
                      color={
                        selectedBonReception.statut === "Facturé" ? "success" :
                        selectedBonReception.statut === "Annulée" ? "error" :
                        selectedBonReception.statut === "En attente" ? "warning" : "default"
                      }
                      sx={{ 
                        fontWeight: 'bold',
                        minWidth: 120,
                        justifyContent: 'center'
                      }}
                    />
                  </Box>
                  <IconButton 
                    onClick={handleCloseModal}
                    sx={{ 
                      color: 'text.secondary',
                      '&:hover': { color: 'error.main' }
                    }}
                  >
                    <Close />
                  </IconButton>
                </Box>

                <Grid container spacing={3}>
                  {/* Informations Générales */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%', bgcolor: '#f8f9fa' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ 
                          mb: 3,
                          color: '#1976d2',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <InfoIcon /> Informations Générales
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Date de Reception
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {new Date(selectedBonReception.dateReception).toLocaleDateString('fr-FR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Fournisseur
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {selectedBonReception.fournisseur ? selectedBonReception.fournisseur.raison_sociale : "Non spécifié"}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Total HT
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#1976d2' }}>
                              {selectedBonReception.total_hors_Taxe?.toFixed(3)} TND
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="subtitle2" color="text.secondary">
                              Total TTC
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 'medium', color: '#2e7d32' }}>
                              {selectedBonReception.total_ttc?.toFixed(3)} TND
                            </Typography>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Adresse du Fournisseur */}
                  <Grid item xs={12} md={6}>
                    <Card sx={{ height: '100%', bgcolor: '#f8f9fa' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ 
                          mb: 3,
                          color: '#1976d2',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <LocationOnIcon /> Adresse du Fournisseur
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          {selectedBonReception.fournisseur?.adresse || "Adresse non spécifiée"}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          Tél: {selectedBonReception.fournisseur?.telephone || "Non spécifié"}
                        </Typography>
                       
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Liste des Articles */}
                  <Grid item xs={12}>
                    <Card sx={{ bgcolor: '#f8f9fa' }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ 
                          mb: 3,
                          color: '#1976d2',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <InventoryIcon /> Articles Réceptionnés
                        </Typography>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow sx={{ backgroundColor: '#fff' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Article</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Quantité</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Prix Unitaire</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Total HT</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Total TTC</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {selectedBonReception.lignes.map((ligne, index) => (
                                <TableRow 
                                  key={index}
                                  sx={{ 
                                    '&:hover': { backgroundColor: '#fff' },
                                    transition: 'background-color 0.2s'
                                  }}
                                >
                                  <TableCell>{ligne.article ? ligne.article.libelle : 'Article inconnu'}</TableCell>
                                  <TableCell>{ligne.quantite}</TableCell>
                                  <TableCell>{ligne.prix_unitaire?.toFixed(3)} TND</TableCell>
                                  <TableCell>{ligne.total_ht?.toFixed(3)} TND</TableCell>
                                  <TableCell>{ligne.total_ttc?.toFixed(3)} TND</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Actions */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  gap: 2,
                  mt: 4,
                  pt: 2,
                  borderTop: '2px solid #f0f0f0'
                }}>
                  <Button
                    variant="outlined"
                    onClick={handleCloseModal}
                    startIcon={<Close />}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3
                    }}
                  >
                    Fermer
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => handleEditBonReception(selectedBonReception)}
                    startIcon={<Edit />}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="contained"
                    color="info"
                    onClick={() => handleDownload(selectedBonReception)}
                    startIcon={<FileDownloadIcon />}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3
                    }}
                  >
                    Télécharger
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>

      <Dialog open={openPreviewModal} onClose={() => setOpenPreviewModal(false)} maxWidth="md" fullWidth>
        <DialogTitle>Prévisualisation de la Facture</DialogTitle>
        <DialogContent>
          <iframe
            src={pdfUrl}
            width="100%"
            height="500px"
            style={{ border: "none" }}
            title="Prévisualisation de la Facture"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenPreviewModal(false)}>Fermer</Button>
          <Button
            onClick={() => {
              const link = document.createElement("a");
              link.href = pdfUrl;
              link.download = `facture_${selectedBonReception?.numero_Bon}.pdf`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            color="primary"
          >
            Télécharger
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={isFactureModalOpen} 
        onClose={handleCloseFactureModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 3
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: '#f5f5f5',
          borderBottom: '1px solid #e0e0e0',
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <ReceiptIcon sx={{ color: '#1976d2' }} />
          <Typography variant="h6" component="div">
            Génération de Facture
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Bon de Réception N° {selectedBonForFacture?.numero_Bon}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fournisseur: {selectedBonForFacture?.fournisseur?.raison_sociale}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Date: {selectedBonForFacture && new Date(selectedBonForFacture.dateReception).toLocaleDateString()}
            </Typography>
          </Box>

          <TextField
            fullWidth
            label="Numéro Facture Fournisseur"
            name="numeroFactureFournisseur" // Assurez-vous que le nom correspond à la clé dans formData
            value={formData.numeroFactureFournisseur} // Liez la valeur à l'état
            onChange={handleChange} // Utilisez handleChange pour mettre à jour l'état
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2
              }
            }}
            placeholder="Entrez le numéro Facture Fournisseur"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <ReceiptIcon color="primary" />
                </InputAdornment>
              ),
            }}
          />

          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Timbre</InputLabel>
            <Select
              value={timbre}
              onChange={(e) => setTimbre(e.target.value)}
              sx={{
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e0e0e0'
                }
              }}
            >
              <MenuItem value="1.000">1.000 TND</MenuItem>
              <MenuItem value="-1.000">-1.000 TND</MenuItem>
            </Select>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Le timbre fiscal sera appliqué au montant total de la facture
            </Typography>
          </FormControl>

          <Box sx={{ 
            backgroundColor: '#f8f9fa', 
            p: 2, 
            borderRadius: 2,
            mb: 3 
          }}>
            <Typography variant="subtitle2" gutterBottom>
              Récapitulatif
            </Typography>
            <Typography variant="body2">
              Total HT: {selectedBonForFacture?.total_hors_Taxe} TND
            </Typography>
            <Typography variant="body2">
              Total TTC: {selectedBonForFacture?.total_ttc} TND
            </Typography>
            <Typography variant="body2" color="primary">
              Montant du Timbre: {timbre} TND
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3, 
          borderTop: '1px solid #e0e0e0',
          gap: 1
        }}>
          <Button 
            onClick={handleCloseFactureModal}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleGenerateFacture}
            variant="contained"
            startIcon={<ReceiptIcon />}
            sx={{ 
              borderRadius: 2,
              textTransform: 'none',
              px: 3
            }}
          >
            Générer la Facture
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}