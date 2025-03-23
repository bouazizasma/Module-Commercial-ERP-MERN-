import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import { Visibility, Delete, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Chip } from "@mui/material";
import {
  Card, CardContent, Typography, Grid, Button, TextField, MenuItem, Select, FormControl, InputLabel, IconButton, Drawer, Modal, Backdrop, Fade, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import { Stack } from "@mui/material";
import { FilterList, Search, Clear } from "@mui/icons-material";
import { InputAdornment } from "@mui/material";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
export default function ListeBonCommandeFournisseur() {
  const [bonsCommande, setBonsCommande] = useState([]);
  const [editLignes, setEditLignes] = useState([]); // État pour les lignes modifiables
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    fournisseur: "",
    year: "",
    month: "",
    article: "",
    
  });
  const [error, setError] = useState(null);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [selectedBonCommande, setSelectedBonCommande] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // État pour la pagination
  const itemsPerPage = 5; // Nombre d'éléments par page
  const [editBonCommande, setEditBonCommande] = useState(null); // État pour le bon de commande en cours de modification
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // État pour contrôler l'affichage du formulaire de modification
  const [fournisseurs, setFournisseurs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [depots, setDepots] = useState([]);
  const navigate = useNavigate();

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les bons de commande
        const bonsCommandeResponse = await axios.get("http://localhost:5000/achat/BCF/all");
        setBonsCommande(bonsCommandeResponse.data);

        // Récupérer les fournisseurs
        const fournisseursResponse = await axios.get("http://localhost:5000/fournisseur/fournisseurs");
        setFournisseurs(fournisseursResponse.data);

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

  //handleDOWNLOAD

  {/*const handleDownload = (bonCommande) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Bon de Commande", 10, 10);
    doc.setFontSize(12);
    doc.text(`Commande N°: ${bonCommande.numero_commande}`, 10, 20);
    doc.text(`Date Commande: ${new Date(bonCommande.dateCommande).toLocaleDateString()}`, 10, 30);
    const fournisseur = fournisseurs.find(f => f._id === bonCommande.fournisseur._id);
    doc.text(`À l'intention de: ${fournisseur.raison_sociale}`, 10, 40);
    doc.text(`Adresse: ${fournisseur.adresse || 'N/A'}`, 10, 50);
    doc.text(`Téléphone: ${fournisseur.telephone || 'N/A'}`, 10, 60);
    doc.autoTable({
      startY: 70,
      head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
      body: bonCommande.lignes.map(ligne => [
        ligne.article.libelle,
        ligne.quantite,
        `${ligne.prix_unitaire.toFixed(2)} TND`,
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND`
      ]),
    });
    doc.save(`bon_de_commande_${bonCommande.numero_commande}.pdf`);
  }; 
  */}

  const handleDownload = (bonCommande) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Bon de Commande", 10, 10);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(bonCommande.dateCommande).toLocaleDateString()}`, 10, 20);
    doc.text(`Bon de Commande: ${bonCommande.numero_Bon}`, 10, 30);

    const fournisseur = fournisseurs.find(f => f._id === bonCommande.fournisseur._id);
    doc.text(`${fournisseur.raison_sociale}`, 10, 50);
    doc.text(`${fournisseur.adresse || 'N/A'}`, 10, 60);
    doc.text(`Tel: ${fournisseur.telephone || 'N/A'}`, 10, 70);
    //doc.text(`Email: ${fournisseur.email || 'N/A'}`, 10, 80);
  
    doc.text(`Objet : Commande`  , 10, 90);
  
    // Tableau des articles commandés
    doc.autoTable({
      startY: 100,
      head: [['Description', 'Unité', 'Quantité', 'Prix Unitaire HT', 'Total Net']],
      body: bonCommande.lignes.map(ligne => [
        ligne.article.libelle,
        'DT',
        ligne.quantite,
        `${ligne.prix_unitaire.toFixed(2)} DT`,
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} DT`
      ]),
    });
  
    // Totaux
    const totalHT = bonCommande.lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2;
  
    doc.text(`Montant Total HT: ${totalHT.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 10);
    doc.text(`Total TTC (20%): ${totalTTC.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 20);
    doc.text(`Montant Total TTC: ${totalTTC.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 30);
  
    doc.save(`bon_de_commande_${bonCommande.numero_Bon}.pdf`);
  };
  // Filtrage des bons de commande
  const filteredBonsCommande = useMemo(() => {
    return bonsCommande.filter((bonCommande) => {
      const matchesSearchTerm =
        bonCommande.numero_Bon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bonCommande.fournisseur && bonCommande.fournisseur.raison_sociale.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bonCommande.lignes && bonCommande.lignes.some((ligne) =>
          ligne.article.libelle.toLowerCase().includes(searchTerm.toLowerCase())
        ));

      const matchesFilters =
        (!filters.fournisseur || (bonCommande.fournisseur && bonCommande.fournisseur.raison_sociale === filters.fournisseur)) &&
        (!filters.year || new Date(bonCommande.dateCommande).getFullYear().toString() === filters.year) &&
        (!filters.month || (new Date(bonCommande.dateCommande).getMonth() + 1).toString() === filters.month) &&
        (!filters.article || (bonCommande.lignes && bonCommande.lignes.some((ligne) => ligne.article.libelle === filters.article)));

      return matchesSearchTerm && matchesFilters;
    });
  }, [bonsCommande, searchTerm, filters]);

  // Pagination
  const paginatedBonsCommande = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBonsCommande.slice(startIndex, endIndex);
  }, [filteredBonsCommande, currentPage]);

  // Gestion de la recherche
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Réinitialiser à la première page lors d'une nouvelle recherche
  };

  // Suppression d'un bon de commande
  const handleDeleteBonCommande = async (id) => {
    try {
      const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce bon de commande ?");
      if (!confirmDelete) return;

      await axios.delete(`http://localhost:5000/achat/BCF${id}`);
      setBonsCommande(bonsCommande.filter((bon) => bon._id !== id)); // Mettre à jour l'état local
      alert("Bon de commande supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression du bon de commande :", error);
      alert("Erreur lors de la suppression du bon de commande.");
    }
  };

  // Ouverture du formulaire de modification
 {/*} const handleEditBonCommande = (bonCommande) => {
    setEditBonCommande(bonCommande); // Stocker les données du bon de commande à modifier
    setEditLignes(bonCommande.lignes); // Initialiser les lignes modifiables
    setIsEditModalOpen(true); // Ouvrir le formulaire de modification
  };
*/}

{/*const handleEditBonCommande = (bonCommande) => {
  setEditBonCommande(bonCommande); // Stocker les données du bon de commande à modifier
  setEditLignes(bonCommande.lignes); // Initialiser les lignes modifiables
  setIsEditing(true); // Activer le mode édition
}; */}
const handleEditBonCommande = (bonCommande) => {
  setEditBonCommande(bonCommande); // Stocker les données du bon de commande à modifier
  setEditLignes(bonCommande.lignes); // Initialiser les lignes modifiables
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
  // Soumission du formulaire de modification
 {/*} const handleSubmitEdit = async (e, id) => {
    e.preventDefault();
    try {
      const total_hors_Taxe = editLignes.reduce((acc, ligne) => acc + ligne.total_ht, 0);
      const total_ttc = total_hors_Taxe * 1.2;

      const updatedBonCommande = {
        ...editBonCommande,
        lignes: editLignes,
        total_hors_Taxe,
        total_ttc,
        date_modification: new Date(), // Ajouter la date de modification
      };

      const response = await axios.put(`http://localhost:5000/boncommandeF/${id}`, updatedBonCommande);
      setBonsCommande((prev) =>
        prev.map((bon) => (bon._id === id ? response.data : bon))
      );
      setIsEditModalOpen(false);
      alert("Bon de commande mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du bon de commande :", error);
      alert("Erreur lors de la mise à jour du bon de commande.");
    }
  };
*/}
  // Gestion des filtres
  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
    setCurrentPage(1); // Réinitialiser à la première page lors d'un changement de filtre
  };

  // Réinitialisation des filtres
  const resetFilters = () => {
    setSearchTerm("");
    setFilters({
      fournisseur: "",
      year: "",
      month: "",
      article: "",
    });
    setCurrentPage(1); // Réinitialiser à la première page lors de la réinitialisation des filtres
  };

  // Ouverture de la modal de détails
  const handleOpenModal = (bonCommande) => {
    setSelectedBonCommande(bonCommande);
    setIsModalOpen(true);
  };

  // Fermeture de la modal de détails
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBonCommande(null);
  };

  // Affichage des filtres actifs
  const activeFilters = Object.entries(filters).filter(([key, value]) => value !== "");

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
            <Typography variant="h4" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold', textAlign: 'center' }}>
              Liste des Bons de Commande
            </Typography>
            <Box height={50} />

            {/* Barre de recherche et filtres */}
            <Card sx={{ p: 3, mb: 3, boxShadow: 3, borderRadius: 2, backgroundColor: '#f8f9fa' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
                  Recherche et Filtres
                </Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      fullWidth
                      label="Rechercher"
                      variant="outlined"
                      value={searchTerm}
                      onChange={(e) => handleSearch(e.target.value)}
                      sx={{
                        backgroundColor: 'white',
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                        }
                      }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Search sx={{ color: '#1976d2' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Fournisseur</InputLabel>
                      <Select
                        value={filters.fournisseur}
                        onChange={(e) => handleFilterChange("fournisseur", e.target.value)}
                        sx={{ 
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      >
                        <MenuItem value="">Tous</MenuItem>
                        {[...new Set(bonsCommande.map((bon) => bon.fournisseur?.raison_sociale))].map((name, index) => (
                          <MenuItem key={index} value={name}>
                            {name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Article</InputLabel>
                      <Select
                        value={filters.article}
                        onChange={(e) => handleFilterChange("article", e.target.value)}
                        sx={{ 
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      >
                        <MenuItem value="">Tous</MenuItem>
                        {[...new Set(bonsCommande.flatMap((bon) => bon.lignes.map((ligne) => ligne.article.libelle)))].map((article, index) => (
                          <MenuItem key={index} value={article}>
                            {article}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Année</InputLabel>
                      <Select
                        value={filters.year}
                        onChange={(e) => handleFilterChange("year", e.target.value)}
                        sx={{ 
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      >
                        <MenuItem value="">Toutes</MenuItem>
                        {[...new Set(bonsCommande.map((bon) => new Date(bon.dateCommande).getFullYear().toString()))].map((year, index) => (
                          <MenuItem key={index} value={year}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Mois</InputLabel>
                      <Select
                        value={filters.month}
                        onChange={(e) => handleFilterChange("month", e.target.value)}
                        sx={{ 
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          }
                        }}
                      >
                        <MenuItem value="">Tous</MenuItem>
                        {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map((month, index) => (
                          <MenuItem key={index} value={month}>
                            {month}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      onClick={resetFilters}
                      startIcon={<Clear />}
                      fullWidth
                      variant="outlined"
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
                      Réinitialiser les filtres
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Tableau des bons de commande */}
            <Card sx={{ p: 3, mb: 3, boxShadow: 3, borderRadius: 2, backgroundColor: '#f8f9fa' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
                  Liste des Bons de Commande
                </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Numéro de commande</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Date de commande</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Fournisseur</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Total HT</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Total TTC</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedBonsCommande.map((bonCommande, index) => (
                        <TableRow 
                          key={index} 
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: '#f5f5f5',
                              transition: 'background-color 0.2s'
                            }
                          }}
                        >
                          <TableCell sx={{ fontWeight: 'medium' }}>{bonCommande.numero_Bon}</TableCell>
                          <TableCell>{new Date(bonCommande.dateCommande).toLocaleDateString()}</TableCell>
                          <TableCell>{bonCommande.fournisseur ? bonCommande.fournisseur.raison_sociale : "Non spécifié"}</TableCell>
                          <TableCell>{bonCommande.total_hors_Taxe.toFixed(2)} TND</TableCell>
                          <TableCell>{bonCommande.total_ttc.toFixed(2)} TND</TableCell>
                          <TableCell>
                            <Chip 
                              label={bonCommande.statut} 
                              color={bonCommande.statut === "Livrée" ? "success" : 
                                     bonCommande.statut === "Annulée" ? "error" : 
                                     bonCommande.statut === "En attente" ? "warning" : "info"}
                              sx={{ 
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                borderRadius: '4px',
                                padding: '4px 8px'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                onClick={() => handleOpenModal(bonCommande)}
                                sx={{ 
                                  color: '#1976d2',
                                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' }
                                }}
                              >
                                <Visibility />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteBonCommande(bonCommande._id)}
                                sx={{ 
                                  color: '#d32f2f',
                                  '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.04)' }
                                }}
                              >
                                <Delete />
                              </IconButton>
                              <IconButton
                                onClick={() => navigate(`/ListeBonCommandeFournisseur/update/${bonCommande._id}`)}
                                sx={{ 
                                  color: '#2e7d32',
                                  '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.04)' }
                                }}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDownload(bonCommande)}
                                sx={{ 
                                  color: '#ed6c02',
                                  '&:hover': { backgroundColor: 'rgba(237, 108, 2, 0.04)' }
                                }}
                              >
                                <FileDownloadIcon />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Pagination */}
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2 }}>
              <Button
                variant="contained"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                sx={{ 
                  borderRadius: '8px',
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' }
                }}
              >
                Précédent
              </Button>
              <Button
                variant="contained"
                disabled={currentPage * itemsPerPage >= filteredBonsCommande.length}
                onClick={() => setCurrentPage(currentPage + 1)}
                sx={{ 
                  borderRadius: '8px',
                  backgroundColor: '#1976d2',
                  '&:hover': { backgroundColor: '#1565c0' }
                }}
              >
                Suivant
              </Button>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Typography variant="body1" sx={{ color: '#666' }}>
                Page {currentPage} sur {Math.ceil(filteredBonsCommande.length / itemsPerPage)}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

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
            {selectedBonCommande && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" component="h2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    Détails du Bon de Commande N° {selectedBonCommande.numero_Bon}
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
                          <strong style={{ color: '#666' }}>Date de commande:</strong>{" "}
                          {new Date(selectedBonCommande.dateCommande).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong style={{ color: '#666' }}>Fournisseur:</strong>{" "}
                          {selectedBonCommande.fournisseur ? selectedBonCommande.fournisseur.raison_sociale : "Non spécifié"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong style={{ color: '#666' }}>Total HT:</strong>{" "}
                          {selectedBonCommande.total_hors_Taxe.toFixed(2)} TND
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong style={{ color: '#666' }}>Total TTC:</strong>{" "}
                          {selectedBonCommande.total_ttc.toFixed(2)} TND
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong style={{ color: '#666' }}>Statut:</strong>{" "}
                          <Chip 
                            label={selectedBonCommande.statut} 
                            color={selectedBonCommande.statut === "Livrée" ? "success" : 
                                   selectedBonCommande.statut === "Annulée" ? "error" : 
                                   selectedBonCommande.statut === "En attente" ? "warning" : "info"}
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
                      Articles Commandés
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
                          {selectedBonCommande.lignes.map((ligne, index) => (
                            <TableRow 
                              key={index}
                              sx={{ 
                                '&:hover': { 
                                  backgroundColor: '#f5f5f5',
                                  transition: 'background-color 0.2s'
                                }
                              }}
                            >
                              <TableCell>{ligne.article ? ligne.article.libelle : 'Article inconnu'}</TableCell>
                              <TableCell>{ligne.quantite}</TableCell>
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
                    onClick={() => handleEditBonCommande(selectedBonCommande)}
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

      {/* Formulaire de modification */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={isEditModalOpen}>
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
            {editBonCommande && (
              <Box>
                <Typography variant="h4" component="h2" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
                  Modifier le Bon de Commande N° {editBonCommande.numero_Bon}
                </Typography>
                {/* Contenu du formulaire de modification */}
              </Box>
            )}
          </Box>
        </Fade>
      </Modal>
    </>
  );
}