import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import { Visibility, Delete, Edit } from "@mui/icons-material";
import { Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import LocalPrintshopIcon from '@mui/icons-material/LocalPrintshop';
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

// Composant principal FacturerParClient

export default function FacturerParClient() {
  const [bonsLivraison, setBonsLivraison] = useState([]);
  const [filteredBonsLivraison, setFilteredBonsLivraison] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    client: "",
    startDate: "",
    endDate: "",
  });
  const [filterError, setFilterError] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBonLivraison, setSelectedBonLivraison] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [depots, setDepots] = useState([]);
  const [selectedBons, setSelectedBons] = useState([]);
  const [selectedBonsLivraison, setSelectedBonsLivraison] = useState([]);
  const [isGroupedFacturationModalOpen, setIsGroupedFacturationModalOpen] = useState(false);
  const [groupedFactureData, setGroupedFactureData] = useState({
    numero_Facture: "",
    date_Facture: "",
    client: "",
    bons: [],
    total_HT: 0,
    total_TTC: 0,
  });
  const [isFactureModalOpen, setIsFactureModalOpen] = useState(false);
  const [selectedBonForFacture, setSelectedBonForFacture] = useState(null);
  const [formData, setFormData] = useState({
    numeroFactureClient: "",
  });
  const [timbre, setTimbre] = useState("1.000");
  const [pdfBlob, setPdfBlob] = useState(null);
  const navigate = useNavigate();

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const bonsLivraisonResponse = await axios.get("http://localhost:5000/ventes/bonslivraison/nonfactures/all");
        setBonsLivraison(bonsLivraisonResponse.data);
        setFilteredBonsLivraison(bonsLivraisonResponse.data);

        const clientsResponse = await axios.get("http://localhost:5000/client/clients");
        setClients(clientsResponse.data);

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

    const filtered = bonsLivraison.filter((bonLivraison) => {
      const matchesClient =
        !filters.client || (bonLivraison.client && bonLivraison.client.nom_prenom === filters.client);

      const startDate = filters.startDate ? new Date(filters.startDate) : null;
      const endDate = filters.endDate ? new Date(filters.endDate) : null;
      const dateLivraison = new Date(bonLivraison.dateLivraison || bonLivraison.date_bon_livraison);

      const matchesDate =
        (!startDate || dateLivraison >= startDate) &&
        (!endDate || dateLivraison <= endDate);

      return matchesClient && matchesDate;
    });

    setFilteredBonsLivraison(filtered);
    setCurrentPage(1);
  };

  // Réinitialisation des filtres
  const resetFilters = () => {
    setFilters({
      client: "",
      startDate: "",
      endDate: "",
    });
    setFilterError("");
    setFilteredBonsLivraison([]);
    setCurrentPage(1);
    setSelectedBons([]);
  };

  // Gestion de la sélection des bons
  const handleSelectBon = (bon) => {
    setSelectedBons((prevSelected) => {
      const isSelected = prevSelected.some((selected) => selected._id === bon._id);
      if (isSelected) {
        return prevSelected.filter((selected) => selected._id !== bon._id);
      } else {
        return [...prevSelected, bon];
      }
    });
  };

  const handleSelectAllBons = () => {
    if (selectedBons.length === paginatedBons.length) {
      setSelectedBons([]);
    } else {
      setSelectedBons([...paginatedBons]);
    }
  };

  // Pagination
  const paginatedBons = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBonsLivraison.slice(startIndex, endIndex);
  }, [filteredBonsLivraison, currentPage]);

  // Gestion de la facturation groupée
  const handleGroupedFacturation = () => {
    if (selectedBons.length === 0) {
      return alert("Veuillez sélectionner au moins un bon de livraison");
    }

    const totalHT = selectedBons.reduce((sum, bon) => {
      const bonTotalHT = Number(bon.total_hors_Taxe || bon.totalHT || 0);
      return sum + bonTotalHT;
    }, 0);

    const totalTTC = selectedBons.reduce((sum, bon) => {
      const bonTotalTTC = Number(bon.total_ttc || bon.totalTTC || 0);
      return sum + bonTotalTTC;
    }, 0);

    setGroupedFactureData({
      numero_Facture: `FACT-${Date.now()}`,
      date_Facture: new Date().toISOString().split('T')[0],
      client: selectedBons[0]?.client?.nom_prenom || "",
      bons: selectedBons,
      total_HT: totalHT,
      total_TTC: totalTTC,
    });

    setIsGroupedFacturationModalOpen(true);
  };

  const generateFacturePDF = () => {
    try {
      const pdf = new jsPDF();
      pdf.setFont("helvetica");
      pdf.setFontSize(16);
      pdf.text("Facture Groupée", 85, 20);

      // Header
      pdf.setFontSize(10);
      pdf.text(`Numéro Facture: ${groupedFactureData.numero_Facture}`, 15, 30);
      pdf.text(`Client: ${groupedFactureData.client}`, 15, 40);
      pdf.text(`Date: ${groupedFactureData.date_Facture}`, 15, 50);

      // Table content
      let y = 70;
      const bonsToProcess = groupedFactureData.bons || selectedBons || [];
      bonsToProcess.forEach((bon, index) => {
        pdf.setFontSize(12);
        pdf.text(`Bon de Livraison ${index + 1}: ${bon.numero_bon_livraison || bon.numero}`, 15, y);
        y += 10;
        
        const headers = ['Désignation', 'Quantité', 'P.U HT', 'Total HT'];
        const rows = (bon.lignes || []).map(ligne => [
          ligne.article?.designation || ligne.libelle || 'N/A',
          ligne.quantite,
          `${Number(ligne.prix_unitaire || 0).toFixed(3)}`,
          `${Number(ligne.total_HT || (ligne.quantite * ligne.prix_unitaire) || 0).toFixed(3)}`
        ]);

        pdf.autoTable({
          startY: y,
          head: [headers],
          body: rows,
          margin: { left: 15 },
          styles: { fontSize: 8 }
        });
        y = pdf.lastAutoTable.finalY + 10;
      });

      // Totals
      pdf.setFontSize(10);
      pdf.text(`TOTAL HT: ${Number(groupedFactureData.total_HT || 0).toFixed(3)}`, 15, y);
      pdf.text(`TVA: ${Number((groupedFactureData.total_TTC || 0) - (groupedFactureData.total_HT || 0)).toFixed(3)}`, 15, y + 10);
      pdf.text(`TIMBRE: ${Number(timbre || 0).toFixed(3)}`, 15, y + 20);
      pdf.text(`TOTAL TTC: ${Number(groupedFactureData.total_TTC || 0).toFixed(3)}`, 15, y + 30);

      const pdfBlob = pdf.output('blob');
      setPdfBlob(pdfBlob);
      setOpenPreviewModal(true);
      return true;
    } catch (error) {
      console.error("Erreur lors de la génération du PDF:", error);
      alert("Erreur lors de la génération du PDF");
      return false;
    }
  };

  const handleGenerateFacture = async () => {
    try {
      const timbreValue = parseFloat(timbre);
      if (isNaN(timbreValue)) throw new Error("Valeur de timbre invalide");

      await axios.post("http://localhost:5000/ventes/factures/groupes", {
        bonLivraisonIDs: selectedBons.map(bon => bon._id),
        timbre: timbreValue
      });

      if (generateFacturePDF()) {
        const { data } = await axios.get("http://localhost:5000/ventes/bonslivraison/nonfactures/all");
        setBonsLivraison(data);
        setFilteredBonsLivraison(data);
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.response?.data?.message || error.message || "Erreur lors de la création de la facture");
    }
  };

  const handleDownloadFacture = () => {
    if (!pdfBlob) return alert("Aucun PDF disponible");
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `facture_${groupedFactureData.numero_Facture}.pdf`;
    link.click();
  };

  const handlePrintFacture = () => {
    if (!pdfBlob) return alert("Aucun PDF disponible");
    const url = URL.createObjectURL(pdfBlob);
    const printWindow = window.open(url);
    printWindow?.print();
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
              Facturation Clients
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9 }}>
              Gérez vos factures clients facilement
            </Typography>
          </Box>

          {/* Section Recherche et Filtres modernisée */}
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
                    Bons de Livraison à Facturer ({filteredBonsLivraison.length})
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleGroupedFacturation}
                    disabled={selectedBons.length === 0}
                    startIcon={<SaveIcon />}
                    sx={{
                      borderRadius: 2,
                      height: '35px',
                      width: '200px',
                      left: '200px',
                      background: selectedBons.length > 0
                        ? 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
                        : 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                      fontWeight: 'bold',
                      px: 3,
                      py: 1.5,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: selectedBons.length > 0
                          ? 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)'
                          : 'linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(44, 62, 80, 0.4)'
                      }
                    }}
                  >
                    Facturer ({selectedBons.length})
                  </Button>
                </Box>
              </Box>
              <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                {/* Barre de recherche fine avec bouton filtrer */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
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
                  <Button
                    variant="contained"
                    onClick={applyFilters}
                    startIcon={<Search />}
                    sx={{
                      left: '420px',
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
                    Rechercher
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
                                  <BusinessIcon sx={{ color: '#2c3e50', fontSize: 20 }} />
                                </InputAdornment>
                              ),
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        label="Date de début"
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => handleFilterChange("startDate", e.target.value)}
                        variant="outlined"
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
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
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <TextField
                        label="Date de fin"
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => handleFilterChange("endDate", e.target.value)}
                        variant="outlined"
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        error={!!filterError}
                        helperText={filterError}
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
                      />
                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>
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
              {filteredBonsLivraison.length > 0 && (
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
                        <TableCell padding="checkbox" sx={{ color: 'white' }}>
                          <Checkbox
                            indeterminate={selectedBons.length > 0 && selectedBons.length < paginatedBons.length}
                            checked={paginatedBons.length > 0 && selectedBons.length === paginatedBons.length}
                            onChange={handleSelectAllBons}
                            sx={{ color: 'white' }}
                          />
                        </TableCell>
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
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedBons.map((bon) => (
                        <TableRow
                          key={bon._id}
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
                              checked={selectedBons.some((selected) => selected._id === bon._id)}
                              onChange={() => handleSelectBon(bon)}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            <Chip
                              label={bon.numero || bon.numero_bon_livraison || 'N/A'}
                              size="small"
                              sx={{
                                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                                color: 'white',
                                fontWeight: 'bold'
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            {bon.dateLivraison ? new Date(bon.dateLivraison).toLocaleDateString() :
                             bon.date_bon_livraison ? new Date(bon.date_bon_livraison).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            {bon.client?.nom_prenom || 'N/A'}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            {(bon.total_hors_Taxe || 0).toFixed(2)} DT
                          </TableCell>
                          <TableCell sx={{
                            fontWeight: 'bold',
                            color: '#667eea'
                          }}>
                            {(bon.total_ttc || 0).toFixed(2)} DT
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Voir les détails">
                                <IconButton
                                  onClick={() => {
                                    setSelectedBonLivraison(bon);
                                    setIsModalOpen(true);
                                  }}
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
                              <Tooltip title="Facturer individuellement">
                                <IconButton
                                  onClick={() => {
                                    setSelectedBonForFacture(bon);
                                    setIsFactureModalOpen(true);
                                  }}
                                  sx={{
                                    color: '#2e7d32',
                                    '&:hover': {
                                      backgroundColor: 'rgba(46, 125, 50, 0.1)',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <ReceiptIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Pagination moderne */}
              {filteredBonsLivraison.length > 0 && (
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
                    Affichage de {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, filteredBonsLivraison.length)} sur {filteredBonsLivraison.length} bons de livraison
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
                      disabled={currentPage * itemsPerPage >= filteredBonsLivraison.length}
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
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Modal de détails */}
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Détails du Bon de Livraison</DialogTitle>
          <DialogContent>
            {selectedBonLivraison && (
              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid item xs={12}>
                  <Typography variant="h6">Informations</Typography>
                  <Typography>N°: {selectedBonLivraison.numero_bon_livraison || 'N/A'}</Typography>
                  <Typography>Client: {selectedBonLivraison.client?.nom_prenom || 'N/A'}</Typography>
                  <Typography>Date: {selectedBonLivraison.date_bon_livraison ? new Date(selectedBonLivraison.date_bon_livraison).toLocaleDateString() : 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h6">Articles</Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Article</TableCell>
                          <TableCell>Quantité</TableCell>
                          <TableCell>Prix unitaire</TableCell>
                          <TableCell>Total HT</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(selectedBonLivraison.lignes || []).map((ligne, i) => (
                          <TableRow key={i}>
                            <TableCell>{ligne.article?.designation || ligne.libelle || 'N/A'}</TableCell>
                            <TableCell>{ligne.quantite}</TableCell>
                            <TableCell>{Number(ligne.prix_unitaire || 0).toFixed(3)}</TableCell>
                            <TableCell>{Number(ligne.total_HT || (ligne.quantite * ligne.prix_unitaire) || 0).toFixed(3)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsModalOpen(false)}>Fermer</Button>
          </DialogActions>
        </Dialog>

        {/* Modal de facturation groupée */}
        <Dialog 
          open={isGroupedFacturationModalOpen} 
          onClose={() => setIsGroupedFacturationModalOpen(false)}
          maxWidth="md"
          fullWidth
        >
          {!openPreviewModal ? (
            <>
              <DialogTitle>Facturation Groupée</DialogTitle>
              <DialogContent>
                <Grid container spacing={2} sx={{ mt: 2 }}>
                  <Grid item xs={12}>
                    <TextField
                      label="Timbre"
                      fullWidth
                      value={timbre}
                      onChange={(e) => setTimbre(e.target.value)}
                      type="number"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6">Récapitulatif</Typography>
                    <Typography>Nombre de bons: {selectedBons.length}</Typography>
                    <Typography>Total HT: {Number(groupedFactureData.total_HT || 0).toFixed(3)}</Typography>
                    <Typography>Total TTC: {Number(groupedFactureData.total_TTC || 0).toFixed(3)}</Typography>
                    <Typography>Total avec timbre: {Number((groupedFactureData.total_TTC || 0) + Number(timbre || 0)).toFixed(3)}</Typography>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setIsGroupedFacturationModalOpen(false)}>Annuler</Button>
                <Button 
                  onClick={handleGenerateFacture} 
                  variant="contained" 
                  color="primary"
                >
                  Générer Facture
                </Button>
              </DialogActions>
            </>
          ) : (
            <>
              <DialogTitle>Facture Groupée</DialogTitle>
              <DialogContent>
                {pdfBlob ? (
                  <Document
                    file={pdfBlob}
                    onLoadError={(error) => console.error("Erreur PDF:", error)}
                  >
                    <Page pageNumber={1} width={600} />
                  </Document>
                ) : (
                  <Typography>Chargement du PDF...</Typography>
                )}
              </DialogContent>
              <DialogActions>
                <Button 
                  startIcon={<LocalPrintshopIcon />} 
                  onClick={handlePrintFacture}
                  variant="contained"
                  color="primary"
                >
                  Imprimer
                </Button>
                <Button 
                  startIcon={<FileDownloadIcon />} 
                  onClick={handleDownloadFacture}
                  variant="contained"
                  color="secondary"
                >
                  Télécharger
                </Button>
                <Button 
                  onClick={() => {
                    setOpenPreviewModal(false);
                    setIsGroupedFacturationModalOpen(false);
                    setSelectedBonsLivraison([]);
                  }}
                >
                  Terminer
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
    </>
  );
}