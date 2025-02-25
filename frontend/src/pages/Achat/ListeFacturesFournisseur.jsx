import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import { Visibility, Delete, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  Card, CardContent, Typography, Grid, Button, TextField, MenuItem, Select, FormControl, InputLabel, IconButton, Drawer, Modal, Backdrop, Fade, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
 , Dialog, DialogTitle, DialogContent, DialogActions} from "@mui/material";
import { Stack } from "@mui/material";
import { FilterList, Search, Clear } from "@mui/icons-material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import { InputAdornment } from "@mui/material";
import jsPDF from "jspdf";
import 'jspdf-autotable';

export default function ListeFactures() {
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
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const facturesResponse = await axios.get("http://localhost:5000/factureF/factures");
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

  // Suppression d'une facture
  const handleDeleteFacture = async (id) => {
    try {
      const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cette facture ?");
      if (!confirmDelete) return;
      await axios.delete(`http://localhost:5000/factureF/${id}`);
      setFactures(factures.filter((facture) => facture._id !== id));
      alert("Facture supprimée avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression de la facture :", error);
      alert("Erreur lors de la suppression de la facture.");
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

  // Ouverture de la modal de détails
  const handleOpenModal = (facture) => {
    setSelectedFacture(facture);
    setIsModalOpen(true);
  };

  // Fermeture de la modal de détails
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFacture(null);
  };

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <Navbar />
      <Box height={150} />
      <Box sx={{ overflow: "auto", flexGrow: 1, p: 3, display: "flex", backgroundColor: "#FFFFFF" }}>
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
            <h1>Liste des Factures</h1>
            <Box height={50} />
            {/* Barre de recherche et bouton Filtre */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
              <TextField
                fullWidth
                label="Rechercher"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{
                  mb: 2,
                  borderRadius: "20px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "40px",
                  },
                  width: "400px",
                }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton>
                        <Search />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Box width={150} />
              <Button
                onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
                startIcon={<FilterList />}
                sx={{ ml: 30 }}
              >
                Filtre
              </Button>
            </Box>
            {/* Sidebar pour les filtres avancés */}
            <Drawer
              anchor="right"
              open={isFilterSidebarOpen}
              onClose={() => setIsFilterSidebarOpen(false)}
            >
              <Box sx={{ width: 300, p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Filtres Avancés
                </Typography>
                {/* Filtre par fournisseur */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Fournisseur</InputLabel>
                  <Select
                    value={filters.fournisseur}
                    onChange={(e) => handleFilterChange("fournisseur", e.target.value)}
                  >
                    <MenuItem value="">Tous</MenuItem>
                    {[...new Set(factures.map((facture) => facture.fournisseur?.raison_sociale))].map((name, index) => (
                      <MenuItem key={index} value={name}>
                        {name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* Filtre par année */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Année</InputLabel>
                  <Select
                    value={filters.year}
                    onChange={(e) => handleFilterChange("year", e.target.value)}
                  >
                    <MenuItem value="">Toutes</MenuItem>
                    {[...new Set(factures.map((facture) => new Date(facture.date_facture).getFullYear().toString()))].map((year, index) => (
                      <MenuItem key={index} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* Filtre par mois */}
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Mois</InputLabel>
                  <Select
                    value={filters.month}
                    onChange={(e) => handleFilterChange("month", e.target.value)}
                  >
                    <MenuItem value="">Tous</MenuItem>
                    {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map((month, index) => (
                      <MenuItem key={index} value={month}>
                        {month}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {/* Bouton pour réinitialiser les filtres */}
                <Button
                  onClick={resetFilters}
                  startIcon={<Clear />}
                  fullWidth
                  variant="outlined"
                  sx={{ mt: 2 }}
                >
                  Réinitialiser les filtres
                </Button>
              </Box>
            </Drawer>
            {/* Tableau des factures */}
            <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 3 }}>
              <Table sx={{ minWidth: 550 }} aria-label="simple table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                    <TableCell sx={{ fontWeight: "bold" }}>Numéro de facture</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Date de facturation</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Fournisseur</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedFactures.map((facture, index) => (
                    <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell>{facture.numero_facture}</TableCell>
                      <TableCell>{new Date(facture.date_facture).toLocaleDateString()}</TableCell>
                      <TableCell>{facture.fournisseur ? facture.fournisseur.raison_sociale : "Non spécifié"}</TableCell>
                      <TableCell>
                        {/* Icône pour "Détails" */}
                        <IconButton
                          onClick={() => handleOpenModal(facture)}
                          sx={{ color: "black" }}
                        >
                          <Visibility />
                        </IconButton>
                        {/* Icône pour "Supprimer" */}
                        <IconButton
                          onClick={() => handleDeleteFacture(facture._id)}
                          sx={{ color: "black" }}
                        >
                          <Delete />
                        </IconButton>
                        {/* Icône pour "Télécharger" */}
                        <IconButton
                          onClick={() => setPdfUrl(facture.fichierPdf)}
                          sx={{ color: "black" }}
                        >
                          <FileDownloadIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Pagination */}
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
                disabled={currentPage * itemsPerPage >= filteredFactures.length}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Suivant
              </Button>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Typography variant="body1">
                Page {currentPage} sur {Math.ceil(filteredFactures.length / itemsPerPage)}
              </Typography>
            </Box>
          </Box>
          {/* Pop-up pour afficher les détails de la facture */}
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
                  width: "80%",
                  maxWidth: "800px",
                  bgcolor: "#FFFFFF",
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                {selectedFacture && (
                  <>
                    <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
                      Détails de la Facture N° {selectedFacture.numero_facture}
                    </Typography>
                    {/* Informations de base */}
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Informations Générales
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Date de facturation:</strong> {new Date(selectedFacture.date_facture).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Fournisseur:</strong> {selectedFacture.fournisseur ? selectedFacture.fournisseur.raison_sociale : "Non spécifié"}
                    </Typography>
                    {/* Bouton pour fermer la pop-up */}
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleCloseModal}
                      sx={{ mt: 2 }}
                    >
                      Fermer
                    </Button>
                  </>
                )}
              </Box>
            </Fade>
          </Modal>
          {/* Prévisualisation de facture */}
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
                  link.download = `facture_${selectedFacture?.numero_facture}.pdf`;
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
        </Box>
      </Box>
    </>
  );
}