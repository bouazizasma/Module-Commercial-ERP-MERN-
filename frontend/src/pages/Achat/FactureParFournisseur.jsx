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
  Dialog, DialogTitle, DialogContent, DialogActions, Checkbox, Autocomplete
} from "@mui/material";
import { Stack } from "@mui/material";
import { FilterList, Search, Clear } from "@mui/icons-material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import { InputAdornment } from "@mui/material";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import { Document, Page } from "react-pdf";

// Composant FiltresDeRecherche intégré dans la même page
const FiltresDeRecherche = ({ fournisseurs, applyFilters, handleGroupedFacturation }) => {
  const [filters, setFilters] = useState({
    fournisseur: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState("");

  // Gestion du changement de filtre
  const handleFilterChange = (field, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [field]: value,
    }));

    // Validation des dates
    if (field === "startDate" || field === "endDate") {
      validateDates(field, value);
    }
  };

  // Validation des dates
  const validateDates = (field, value) => {
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);

      if (endDate <= startDate) {
        setError("La date de fin doit être postérieure à la date de début.");
      } else {
        setError("");
      }
    } else {
      setError("");
    }
  };

  // Appliquer les filtres
  const handleApplyFilters = () => {
    if (error) {
      alert(error); // Afficher un message d'erreur
      return;
    }
    applyFilters(filters);
  };

  return (
    <Card sx={{ p: 3, mb: 3, boxShadow: 3, borderRadius: 2, backgroundColor: '#f8f9fa' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
          Filtres de Recherche
        </Typography>
        <Grid container spacing={2} alignItems="center">
          {/* Fournisseur */}
          <Grid item xs={12} sm={6} md={4}>
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
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2
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
              sx={{ mb: 2 }}
            />
          </Grid>

          {/* Date de début */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Date de début"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              fullWidth
              sx={{ backgroundColor: 'white' }}
            />
          </Grid>

          {/* Date de fin */}
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Date de fin"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              fullWidth
              sx={{ backgroundColor: 'white' }}
              error={!!error} // Afficher une erreur si la date de fin est invalide
              helperText={error} // Afficher le message d'erreur
              inputProps={{
                min: filters.startDate, // Désactiver les dates antérieures à la date de début
              }}
            />
          </Grid>

          {/* Bouton CHERCHER */}
          <Grid item xs={6} sm={6} md={4}>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' },
                height: '56px',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              CHERCHER
            </Button>
          </Grid>

          {/* Bouton FACTURE */}
          <Grid item xs={6} sm={6} md={4}>
            <Button
              variant="contained"
              onClick={handleGroupedFacturation}
              sx={{
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' },
                height: '56px',
                borderRadius: '8px',
                textTransform: 'none',
                fontWeight: 'bold',
                width: '100%'
              }}
            >
              FACTURE
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

// Composant principal FactureParFournisseur
export default function FactureParFournisseur() {
  const [bonsReception, setBonsReception] = useState([]);
  const [filteredBonsReception, setFilteredBonsReception] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [editLignes, setEditLignes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    fournisseur: "",
    startDate: "",
    endDate: "",
    numeroFacture: "",
    timbre: "1.000",
  });
  const [pdfUrl, setPdfUrl] = useState("");
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [error, setError] = useState(null);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
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

  // Fonction pour appliquer le filtrage
  const applyFilters = (filters) => {
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
    setShowResults(true);
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

  // Réinitialisation des filtres
  const resetFilters = () => {
    setFilters({
      fournisseur: "",
      startDate: "",
      endDate: "",
      numeroFacture: "",
      timbre: "1.000",
    });
    setFilteredBonsReception([]);
    setCurrentPage(1);
    setShowResults(false);
    setSelectedBons([]);
  };

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
      setShowResults(false);
    } catch (error) {
      console.error("Erreur lors de la création de la facture groupée:", error);
      alert("Erreur lors de la création de la facture groupée");
    }
  };

  return (
    <>
      <Navbar />
      <Box height={20} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: "auto",
            backgroundColor: "#FFFFFF",
            maxWidth: "none",
            maxHeight: "100vh",
            width: "100%",
          }}
        >
          <Box sx={{ flexGrow: 1, p: 3 }}>
            <Typography variant="h4" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
              Facturation par Fournisseur
            </Typography>
            <Box height={70} />

            {/* Utilisation du composant FiltresDeRecherche */}
            <FiltresDeRecherche
              fournisseurs={fournisseurs}
              applyFilters={applyFilters}
              handleGroupedFacturation={handleGroupedFacturation}
            />

            {/* Tableau des bons de réception */}
            {showResults && (
              <Card sx={{ p: 3, mb: 3, boxShadow: 3, borderRadius: 2, backgroundColor: '#f8f9fa' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
                    Liste des Bons de Réception
                  </Typography>
                  <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                          <TableCell sx={{ fontWeight: 'bold' }}>
                            <Checkbox
                              checked={selectedBons.length === paginatedBonsReception.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBons(paginatedBonsReception.map(bon => bon._id));
                                } else {
                                  setSelectedBons([]);
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Numéro de réception</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Date de réception</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Fournisseur</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Total HT</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Total TTC</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedBonsReception.map((bonReception, index) => (
                          <TableRow key={index} sx={{ '&:hover': { backgroundColor: '#f5f5f5' } }}>
                            <TableCell>
                              <Checkbox
                                checked={selectedBons.includes(bonReception._id)}
                                onChange={() => handleSelectBon(bonReception._id)}
                                disabled={bonReception.statut === "Facturé"}
                              />
                            </TableCell>
                            <TableCell>{bonReception.numero_Bon}</TableCell>
                            <TableCell>{new Date(bonReception.dateReception).toLocaleDateString()}</TableCell>
                            <TableCell>{bonReception.fournisseur ? bonReception.fournisseur.raison_sociale : "Non spécifié"}</TableCell>
                            <TableCell>{bonReception.total_hors_Taxe.toFixed(2)} TND</TableCell>
                            <TableCell>{bonReception.total_ttc.toFixed(2)} TND</TableCell>
                            <TableCell>
                              <Chip 
                                label={bonReception.statut} 
                                color={bonReception.statut === "Facturé" ? "error" : "success"}
                                sx={{ fontWeight: 'bold' }}
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                onClick={() => handleOpenModal(bonReception)}
                                sx={{ color: '#1976d2' }}
                              >
                                <Visibility />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDownload(bonReception)}
                                sx={{ color: '#1976d2' }}
                              >
                                <FileDownloadIcon />
                              </IconButton>
                              <IconButton
                                onClick={() => handleOpenFactureModal(bonReception)}
                                sx={{ color: '#1976d2' }}
                              >
                                <ReceiptIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            )}

            {/* Pagination */}
            {showResults && (
              <>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Button
                    variant="contained"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    sx={{ mr: 2 }}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="contained"
                    disabled={currentPage * itemsPerPage >= filteredBonsReception.length}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Suivant
                  </Button>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Typography variant="body1">
                    Page {currentPage} sur {Math.ceil(filteredBonsReception.length / itemsPerPage)}
                  </Typography>
                </Box>
              </>
            )}

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