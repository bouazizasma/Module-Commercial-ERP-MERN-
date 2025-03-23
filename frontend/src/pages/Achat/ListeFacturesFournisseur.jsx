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
  Dialog, DialogTitle, DialogContent, DialogActions, Divider, Chip
} from "@mui/material";
import { Stack } from "@mui/material";
import { FilterList, Search, Clear } from "@mui/icons-material";
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

  const handleDownloadFacture = async (facture) => {
    try {
      // Vérifier si la facture existe et a un ID valide
      if (!facture || !facture._id) {
        alert("Aucune facture valide à télécharger.");
        return;
      }
  
      // Télécharger le fichier PDF
      const response = await axios.get(
        `http://localhost:5000/factureF/download/${facture._id}`,
        {
        responseType: "blob", // Indique que la réponse est un fichier binaire
        }
      );
  
      if (response.data) {
      // Créer un lien pour télécharger le fichier
        const blob = new Blob([response.data], { type: "application/pdf" });
        const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
        link.href = downloadUrl;
      link.setAttribute("download", `facture_${facture.numero_facture}.pdf`); // Nom du fichier
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        alert("Aucun fichier PDF trouvé pour cette facture.");
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement de la facture :", error);
      alert("Erreur lors du téléchargement de la facture.");
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
      <Box height={150} />
      <Box sx={{ overflow: "auto", flexGrow: 1, p: 3, display: "flex", backgroundColor: "#f5f5f5" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: "auto",
            backgroundColor: "#f5f5f5",
            maxWidth: "none",
            maxHeight: "100vh",
            width: "100%",
          }}
        >
          <Card sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Receipt sx={{ fontSize: 40, color: "#1976d2" }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
                Liste des Factures
              </Typography>
            </Stack>

            {/* Barre de recherche et bouton Filtre */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
              <TextField
                fullWidth
                label="Rechercher"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                sx={{
                  maxWidth: "400px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#1976d2" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
                startIcon={<FilterList />}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  backgroundColor: "#1976d2",
                  "&:hover": {
                    backgroundColor: "#1565c0",
                  },
                }}
              >
                Filtres
              </Button>
            </Box>

            {/* Tableau des factures */}
            <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 2, borderRadius: 2 }}>
              <Table sx={{ minWidth: 550 }} aria-label="simple table">
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Numéro de facture</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Date de facturation</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Fournisseur</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedFactures.map((facture, index) => (
                    <TableRow 
                      key={index} 
                      sx={{ 
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:hover": { backgroundColor: "#f5f5f5" }
                      }}
                    >
                      <TableCell>{facture.numero_facture}</TableCell>
                      <TableCell>{new Date(facture.date_facture).toLocaleDateString()}</TableCell>
                      <TableCell>{facture.fournisseur ? facture.fournisseur.raison_sociale : "Non spécifié"}</TableCell>
                      <TableCell>
                      <Chip
                      label={formatStatut(facture.statut)} // Utilisez formatStatut pour afficher "p.payé"
                      color={getStatusColor(facture.statut)} // Utilisez getStatusColor pour la couleur
                      size="small"
                       />
                     </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                        <IconButton
                          onClick={() => handleOpenModal(facture)}
                            sx={{ color: "#1976d2" }}
                            size="small"
                            title="Voir les détails"
                        >
                          <Visibility />
                        </IconButton>
                          <Button
                       onClick={() => handleDownloadFacture(facture)} // facture est l'objet de la facture sélectionnée
                        startIcon={<FileDownloadIcon />}
                          >
                         Télécharger
                        </Button>
                        <IconButton
                          onClick={() => handleDeleteFacture(facture._id)}
                            sx={{ color: "#d32f2f" }}
                            size="small"
                            title="Supprimer"
                        >
                          <Delete />
                        </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 3, gap: 2 }}>
              <Button
                variant="outlined"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                sx={{ borderRadius: "8px" }}
              >
                Précédent
              </Button>
              <Typography variant="body1" sx={{ mx: 2 }}>
                Page {currentPage} sur {Math.ceil(filteredFactures.length / itemsPerPage)}
              </Typography>
              <Button
                variant="outlined"
                disabled={currentPage * itemsPerPage >= filteredFactures.length}
                onClick={() => setCurrentPage(currentPage + 1)}
                sx={{ borderRadius: "8px" }}
              >
                Suivant
              </Button>
            </Box>
          </Card>
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



    </>
  );
}