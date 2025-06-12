import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import { Visibility, Delete, Edit } from "@mui/icons-material";
import { Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  Card, CardContent, Typography, Grid, Button, TextField, MenuItem, Select, FormControl, InputLabel, IconButton, Drawer, Modal, Backdrop, Fade, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, Autocomplete, Divider, Tooltip, Chip as MuiChip, Collapse
} from "@mui/material";
import { Stack, Box as MuiBox } from "@mui/material";
import { FilterList, Search, Clear, Business as BusinessIcon, CalendarToday as CalendarTodayIcon, Assessment as AssessmentIcon, ExpandMore, ExpandLess } from "@mui/icons-material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import SaveIcon from '@mui/icons-material/Save';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PreviewIcon from '@mui/icons-material/Preview';
import DownloadIcon from '@mui/icons-material/Download';
import { InputAdornment } from "@mui/material";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import { Document, Page } from "react-pdf";



// Composant principal FactureParFournisseur
export default function FactureParFournisseur() {
  const [bonsReception, setBonsReception] = useState([]);
  const [filteredBonsReception, setFilteredBonsReception] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    fournisseur: "",
    startDate: "",
    endDate: "",
  });
  const [filterError, setFilterError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBonReception, setSelectedBonReception] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [fournisseurs, setFournisseurs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [depots, setDepots] = useState([]);
  const [selectedBons, setSelectedBons] = useState([]);
  const [isGroupedFacturationModalOpen, setIsGroupedFacturationModalOpen] = useState(false);
  const [groupedFactureData, setGroupedFactureData] = useState({
    numero_Facture: "",
    date_Facture: "",
    fournisseur: "",
    bons: [],
    total_HT: 0,
    total_TTC: 0,
  });
  const [isFactureModalOpen, setIsFactureModalOpen] = useState(false);
  const [selectedBonForFacture, setSelectedBonForFacture] = useState(null);
  const [formData, setFormData] = useState({
    numeroFactureFournisseur: "",
  });
  const [timbre, setTimbre] = useState("1.000");
  const navigate = useNavigate();

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const bonsReceptionResponse = await axios.get("http://localhost:5000/achat/BEF/all");
        setBonsReception(bonsReceptionResponse.data);
        setFilteredBonsReception(bonsReceptionResponse.data);

        const fournisseursResponse = await axios.get("http://localhost:5000/fournisseur/fournisseurs");
        setFournisseurs(fournisseursResponse.data);

        const articlesResponse = await axios.get("http://localhost:5000/article/articles");
        setArticles(articlesResponse.data);

        const depotsResponse = await axios.get("http://localhost:5000/depot/depots");
        setDepots(depotsResponse.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        setError("Erreur lors de la récupération des données. Veuillez réessayer.");
      }
    };

    fetchData();
  }, []);

  // Gestion des filtres
  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));

    // Validation des dates
    if (filterName === "startDate" || filterName === "endDate") {
      validateDates(filterName, value);
    }
    setCurrentPage(1);
  };

  // Validation des dates
  const validateDates = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    if (newFilters.startDate && newFilters.endDate) {
      const startDate = new Date(newFilters.startDate);
      const endDate = new Date(newFilters.endDate);

      if (endDate <= startDate) {
        setFilterError("La date de fin doit être postérieure à la date de début.");
      } else {
        setFilterError("");
      }
    } else {
      setFilterError("");
    }
  };

  // Fonction pour appliquer le filtrage
  const applyFilters = () => {
    if (filterError) {
      alert(filterError);
      return;
    }

    const filtered = bonsReception.filter((bonReception) => {
      const matchesFournisseur =
        !filters.fournisseur || (bonReception.fournisseur && bonReception.fournisseur.raison_sociale === filters.fournisseur);

      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;
      const dateReception = new Date(bonReception.dateReception);

      const matchesDate =
        (!startDate || dateReception >= startDate) &&
        (!endDate || dateReception <= endDate);

      return matchesFournisseur && matchesDate;
    });

    setFilteredBonsReception(filtered);
    setCurrentPage(1);
  };

  // Réinitialisation des filtres
  const resetFilters = () => {
    setFilters({
      fournisseur: "",
      startDate: "",
      endDate: "",
    });
    setFilterError("");
    setFilteredBonsReception([]);
    setCurrentPage(1);
    setSelectedBons([]);
  };

  // Fonction pour gérer la facturation groupée
  const handleGroupedFacturation = async () => {
    if (selectedBons.length === 0) {
      alert("Veuillez sélectionner au moins un bon de réception");
      return;
    }

    const selectedBonsData = bonsReception.filter(bon => selectedBons.includes(bon._id));
    
    // Vérifier si tous les bons sont non facturés
    if (!selectedBonsData.every(bon => bon.statut !== "Facturé")) {
      alert("Le bon de réception doit être non facturé pour assurer l'opération de facturation groupée");
      return;
    }

    // Vérifier que tous les bons ont le même fournisseur
    const fournisseurId = selectedBonsData[0].fournisseur._id;
    if (!selectedBonsData.every(bon => bon.fournisseur._id === fournisseurId)) {
      alert("Tous les bons sélectionnés doivent avoir le même fournisseur");
      return;
    }

    const totalHT = selectedBonsData.reduce((acc, bon) => acc + bon.total_hors_Taxe, 0);
    const totalTTC = selectedBonsData.reduce((acc, bon) => acc + bon.total_ttc, 0);

    try {
      const response = await axios.post("http://localhost:5000/factureF/plusieurs/generer", {
        bonIds: selectedBons,
      }, { headers: { "Content-Type": "application/json" } });

      if (response.data.pdfUrl) {
        setPdfUrl(response.data.pdfUrl);
        setOpenPreviewModal(true);
      }
    } catch (error) {
      console.error("Erreur lors de la génération de la facture groupée:", error);
      alert("Erreur lors de la génération de la facture groupée");
    }
  };

  // Fonction pour ouvrir le pop-up de génération de facture
  const handleOpenFactureModal = (bonReception) => {
    setSelectedBonForFacture(bonReception);
    setIsFactureModalOpen(true);
  };

  // Fonction pour fermer le pop-up de génération de facture
  const handleCloseFactureModal = () => {
    setIsFactureModalOpen(false);
    setFormData({ numeroFactureFournisseur: "" });
    setTimbre("1.000");
    setSelectedBonForFacture(null);
  };

  // Fonction pour gérer la génération de la facture
  const handleGenerateFacture = async () => {
    if (!selectedBonForFacture) return;

    try {
      const response = await axios.post("http://localhost:5000/factureF/generer", {
        enteteAchatId: selectedBonForFacture._id,
        numeroFactureFournisseur: formData.numeroFactureFournisseur,
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

  // Pagination
  const paginatedBonsReception = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBonsReception.slice(startIndex, endIndex);
  }, [filteredBonsReception, currentPage]);



  // Ouverture de la modal de détails
  const handleOpenModal = (bonReception) => {
    setSelectedBonReception(bonReception);
    setIsModalOpen(true);
  };

  // Fermeture de la modal de détails
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBonReception(null);
  };

  if (error) {
    return <div>{error}</div>;
  }

  const handleSelectBon = (id) => {
    if (selectedBons.includes(id)) {
      setSelectedBons(selectedBons.filter((bonId) => bonId !== id));
    } else {
      setSelectedBons([...selectedBons, id]);
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
  
  const createGroupedFacture = async () => {
    try {
      await axios.post("http://localhost:5000/achat/facture/create", groupedFactureData);
      alert("Facture groupée créée avec succès");
      setIsGroupedFacturationModalOpen(false);
      setSelectedBons([]);
    } catch (error) {
      console.error("Erreur lors de la création de la facture groupée:", error);
      alert("Erreur lors de la création de la facture groupée");
    }
  };

  return (
    <>
      <Navbar />
      <Box height={85} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: "auto",
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            minHeight: '100vh',
            maxWidth: "none",
            maxHeight: "100vh",
            width: "100%",
          }}
        >
          <Box sx={{ flexGrow: 1, p: 3 }}>
            {/* Header principal moderne */}
            <Box sx={{
              textAlign: 'center',
              mb: 2,
              p: 1,
              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              color: 'white'
            }}>
              <ReceiptIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                Facturation par Fournisseur
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Gérez et générez vos factures facilement
              </Typography>
            </Box>

            {/* Section consolidée avec filtres, liste et pagination */}
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
                    <AssessmentIcon sx={{
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
                      Facturation par Fournisseur ({filteredBonsReception.length})
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />

                {/* Barre de recherche avec bouton filtrer */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    startIcon={<FilterList />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{
                      height: '35px',
                      minWidth: '120px',
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
                      Filtres de recherche
                    </Typography>

                    {/* Première ligne: Fournisseur, Date de début, Date de fin */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      {/* Fournisseur */}
                      <Grid item xs={12} sm={4} md={4}>
                        <Autocomplete
                          options={fournisseurs}
                          getOptionLabel={(option) => option.raison_sociale || ""}
                          value={fournisseurs.find(f => f.raison_sociale === filters.fournisseur) || null}
                          onChange={(event, newValue) => {
                            handleFilterChange("fournisseur", newValue ? newValue.raison_sociale : "");
                          }}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Fournisseur"
                              placeholder="Sélectionner un fournisseur"
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
                          renderOption={(props, option) => (
                            <li {...props}>
                              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body1">{option.raison_sociale}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {option.adresse || "Adresse non spécifiée"}
                                </Typography>
                              </Box>
                            </li>
                          )}
                          isOptionEqualToValue={(option, value) => option.raison_sociale === value.raison_sociale}
                          noOptionsText="Aucun fournisseur trouvé"
                          loadingText="Chargement..."
                          sx={{ width: '100%' }}
                        />
                      </Grid>

                      {/* Date de début */}
                      <Grid item xs={12} sm={4} md={4}>
                        <TextField
                          label="Date de début"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          value={filters.startDate}
                          onChange={(e) => handleFilterChange("startDate", e.target.value)}
                          fullWidth
                          variant="outlined"
                          size="small"
                          sx={{
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      </Grid>

                      {/* Date de fin */}
                      <Grid item xs={12} sm={4} md={4}>
                        <TextField
                          label="Date de fin"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          value={filters.endDate}
                          onChange={(e) => handleFilterChange("endDate", e.target.value)}
                          fullWidth
                          error={!!filterError}
                          helperText={filterError}
                          variant="outlined"
                          size="small"
                          inputProps={{
                            min: filters.startDate,
                          }}
                          sx={{
                            backgroundColor: 'white',
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            }
                          }}
                        />
                      </Grid>
                    </Grid>

                    {/* Deuxième ligne: Boutons centrés */}
                    <Grid container spacing={3} justifyContent="center" alignItems="center" sx={{ mb: 2 }}>
                      {/* Bouton CHERCHER */}
                      <Grid item xs={12} sm={6} md={3}>
                        <Button
                          variant="contained"
                          onClick={applyFilters}
                          startIcon={<Search />}
                          sx={{
                            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                            color: 'white',
                            height: '40px',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            width: '100%',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(52, 73, 94, 0.4)'
                            }
                          }}
                        >
                          CHERCHER
                        </Button>
                      </Grid>

                      {/* Bouton FACTURE */}
                      <Grid item xs={12} sm={6} md={3}>
                        <Button
                          variant="contained"
                          onClick={handleGroupedFacturation}
                          startIcon={<ReceiptIcon />}
                          sx={{
                            background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                            color: 'white',
                            height: '40px',
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 'bold',
                            width: '100%',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              background: 'linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%)',
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(149, 165, 166, 0.4)'
                            }
                          }}
                        >
                          FACTURE
                        </Button>
                      </Grid>
                    </Grid>

                    {/* Bouton pour réinitialiser les filtres */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
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

                {/* Tableau des bons de réception */}
                {filteredBonsReception.length > 0 && (
                  <>
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
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                              <Checkbox
                                checked={selectedBons.length === paginatedBonsReception.length && paginatedBonsReception.length > 0}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedBons(paginatedBonsReception.map(bon => bon._id));
                                  } else {
                                    setSelectedBons([]);
                                  }
                                }}
                                sx={{
                                  color: 'white',
                                  '&.Mui-checked': {
                                    color: 'white',
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Numéro de réception</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Date de réception</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Fournisseur</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Total HT</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Total TTC</TableCell>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Status</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedBonsReception.map((bonReception, index) => (
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
                              <TableCell>
                                <Checkbox
                                  checked={selectedBons.includes(bonReception._id)}
                                  onChange={() => handleSelectBon(bonReception._id)}
                                  disabled={bonReception.statut === "Facturé"}
                                  sx={{
                                    color: '#2c3e50',
                                    '&.Mui-checked': {
                                      color: '#2c3e50',
                                    },
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'medium', color: '#2c3e50' }}>{bonReception.numero_Bon}</TableCell>
                              <TableCell sx={{ fontWeight: 'medium' }}>{new Date(bonReception.dateReception).toLocaleDateString()}</TableCell>
                              <TableCell sx={{ fontWeight: 'medium' }}>{bonReception.fournisseur ? bonReception.fournisseur.raison_sociale : "Non spécifié"}</TableCell>
                              <TableCell sx={{ fontWeight: 'medium', color: '#95a5a6' }}>{bonReception.total_hors_Taxe.toFixed(2)} TND</TableCell>
                              <TableCell sx={{ fontWeight: 'medium', color: '#2c3e50' }}>{bonReception.total_ttc.toFixed(2)} TND</TableCell>
                              <TableCell>
                                <Chip
                                  label={bonReception.statut}
                                  color={bonReception.statut === "Facturé" ? "error" : "success"}
                                  sx={{
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    borderRadius: 2,
                                    padding: '4px 8px'
                                  }}
                                />
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
                              boxShadow: '0 8px 25px rgba(44, 62, 80, 0.4)'
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
                              boxShadow: '0 8px 25px rgba(44, 62, 80, 0.4)'
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
                        color: '#2c3e50',
                        fontWeight: 'medium',
                        fontSize: '1.1rem'
                      }}>
                        Page {currentPage} sur {Math.ceil(filteredBonsReception.length / itemsPerPage)}
                      </Typography>
                    </Box>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Modal de facturation groupée */}
            <Dialog
              open={isGroupedFacturationModalOpen}
              onClose={() => setIsGroupedFacturationModalOpen(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>Créer une facture groupée</DialogTitle>
              <DialogContent>
                <Box sx={{ mt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Numéro de facture"
                        value={groupedFactureData.numero_Facture}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Date de facture"
                        type="date"
                        value={groupedFactureData.date_Facture}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Fournisseur"
                        value={groupedFactureData.fournisseur}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Total HT"
                        value={groupedFactureData.total_HT}
                        disabled
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        fullWidth
                        label="Total TTC"
                        value={groupedFactureData.total_TTC}
                        disabled
                      />
                    </Grid>
                  </Grid>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsGroupedFacturationModalOpen(false)}>Annuler</Button>
                <Button onClick={createGroupedFacture} variant="contained" color="primary">
                  Créer la facture
                </Button>
              </DialogActions>
            </Dialog>

            {/* Modal de prévisualisation du PDF */}
            <Dialog 
              open={openPreviewModal} 
              onClose={() => setOpenPreviewModal(false)} 
              maxWidth="md" 
              fullWidth
            >
              <DialogTitle>Prévisualisation de la Facture</DialogTitle>
              <DialogContent>
                <Document 
                  file={pdfUrl}
                  onLoadSuccess={() => console.log("PDF loaded successfully")}
                  onLoadError={(error) => console.error("Failed to load PDF:", error)}
                >
                  <Page pageNumber={1} />
                </Document>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpenPreviewModal(false)}>Fermer</Button>
                <Button 
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = pdfUrl;
                    link.download = 'facture.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }} 
                  color="primary"
                  startIcon={<FileDownloadIcon />}
                >
                  Télécharger
                </Button>
              </DialogActions>
            </Dialog>

            {/* Modal de génération de facture */}
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
                  name="numeroFactureFournisseur"
                  value={formData.numeroFactureFournisseur}
                  onChange={(e) => setFormData({ ...formData, numeroFactureFournisseur: e.target.value })}
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
          </Box>
        </Box>
      </Box>
    </>
  );
}