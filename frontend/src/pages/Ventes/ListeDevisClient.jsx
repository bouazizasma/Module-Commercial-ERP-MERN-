import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import { Visibility, Delete, Edit, Receipt, ShoppingCart } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Chip } from "@mui/material";
import {
  Card, CardContent, Alert, Typography, Grid, Button, TextField, MenuItem, Select, FormControl, InputLabel, IconButton, Drawer, Modal, Backdrop, Fade, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,   Snackbar,  Paper
} from "@mui/material";
import { Stack } from "@mui/material";
import {  Search, Clear , CheckCircle , Close  } from "@mui/icons-material";
import { InputAdornment } from "@mui/material";
import { FilterList } from "@mui/icons-material";

import jsPDF from "jspdf";
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
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
  const [selectedDevis, setSelectedDevis] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1); // État pour la pagination
  const itemsPerPage = 5; // Nombre d'éléments par page
  const [editDevis, setEditDevis] = useState(null); // État pour le bon de commande en cours de modification
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // État pour contrôler l'affichage du formulaire de modification
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [depots, setDepots] = useState([]);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  
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

  // Suppression d'un bon de commande
  const handleDeleteDevis = async (id) => {
    try {
      const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cet devis ?");
      if (!confirmDelete) return;

      await axios.delete(`http://localhost:5000/ventes/devis/${id}`);
      setListeDevis(listeDevis.filter((numeroEntete) => numeroEntete._id !== id)); // Mettre à jour l'état local
      alert("Devis supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression du Devis :", error);
      alert("Erreur lors de la suppression du Devis.");
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
      await axios.post(`http://localhost:5000/ventes/${devisId}/generate-bon-livraison`);
      fetchDevis(); // Rafraîchir la liste des devis
      setSnackbarMessage("Le bon de livraison a été généré avec succès !");
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate("/ListeBonLivraisonClient");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la génération du bon de livraison:", error);
    }
  };
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
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
            <Typography variant="h4" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold', textAlign: 'center' }}>
              Liste des Devis
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
                    <Button
                                   variant="outlined"
                                   onClick={() => setIsFilterSidebarOpen(true)}
                                   startIcon={<FilterList />}
                                   sx={{ borderRadius: 2, height: 56 }}
                                 >
                                   Filtres
                                 </Button>
                 
                </Grid>
              </CardContent>
            </Card>

            {/* Tableau des devis */}
            <Card sx={{ p: 3, mb: 3, boxShadow: 3, borderRadius: 2, backgroundColor: '#f8f9fa' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
                  Liste des devis
                </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Numéro de devis</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Date de devis</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Client</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Total HT</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Total TTC</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedDevis.map((devis, index) => (
                        <TableRow 
                          key={index} 
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: '#f5f5f5',
                              transition: 'background-color 0.2s'
                            }
                          }}
                        >
                          <TableCell sx={{ fontWeight: 'medium' }}>{devis.numero}</TableCell>
                          <TableCell>{new Date(devis.dateDevis).toLocaleDateString()}</TableCell>
                          <TableCell>{devis.client ? devis.client.nom_prenom : "Non spécifié"}</TableCell>
                          <TableCell>
    {(devis.total_hors_Taxe ?? 
        devis.lignes?.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0) ?? 0)
        .toFixed(2)} TND
</TableCell>
<TableCell>
    {(devis.total_ttc ?? 
        devis.lignes?.reduce((acc, ligne) => {
            const ht = ligne.quantite * ligne.prix_unitaire;
            return acc + (ht * (1 + (ligne.tva || 0) / 100));
        }, 0) ?? 0)
        .toFixed(2)} TND
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
                                borderRadius: '4px',
                                padding: '4px 8px'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <IconButton
                                onClick={() => handleOpenModal(devis)}
                                sx={{ 
                                  color: '#1976d2',
                                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' }
                                }}
                              >
                                <Visibility />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDeleteDevis(devis._id)}
                                sx={{ 
                                  color: '#d32f2f',
                                  '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.04)' }
                                }}
                              >
                                <Delete />
                              </IconButton>
                              <IconButton
                                onClick={() => navigate(`/ListeDevisClient/update/${devis._id}`)}
                                sx={{ 
                                  color: '#2e7d32',
                                  '&:hover': { backgroundColor: 'rgba(46, 125, 50, 0.04)' }
                                }}
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                onClick={() => handleDownload(devis)}
                                sx={{ 
                                  color: '#ed6c02',
                                  '&:hover': { backgroundColor: 'rgba(237, 108, 2, 0.04)' }
                                }}
                              >
                                <FileDownloadIcon />
                              </IconButton>  
                              {devis.statut === "En attente" && (
                                <>
                                  <IconButton
                                    color="success"
                                    onClick={() => handleGenerateBonCommande(devis._id)}
                                    size="small"
                                    title="Générer un bon de commande"
                                  >
                                    <Receipt />
                                  </IconButton>
                                  <IconButton
                                    color="info"
                                    onClick={() => handleGenerateBonLivraison(devis._id)}
                                    size="small"
                                    title="Générer un bon de livraison"
                                  >
                                    < ShoppingCart />
                                  </IconButton>
                                  
                                </>
                              )}
                                 {devis.statut === "Confirmée" && (
                                <>
                                  <IconButton
                                    color="info"
                                    onClick={() => handleGenerateBonLivraison(devis._id)}
                                    size="small"
                                    title="Générer un bon de livraison"
                                  >
                                    <Receipt />
                                  </IconButton>
                                  
                                </>
                              )}

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
                disabled={currentPage * itemsPerPage >= filteredDevis.length}
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
                Page {currentPage} sur {Math.ceil(filteredDevis.length / itemsPerPage)}
              </Typography>
            </Box>
          </Box>
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