import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import { Visibility, Delete, ReceiptLong, Business, CalendarToday, FileDownload } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import {
  Card, CardContent, Typography, Grid, Button, TextField, IconButton, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, 
  Divider, Chip, Tooltip, Autocomplete, Collapse, Stack
} from "@mui/material";
import { FilterList, Search, Clear, ExpandMore, ExpandLess } from "@mui/icons-material";
import { InputAdornment } from "@mui/material";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import ModernDeleteDialog from '../../components/ModernDeleteDialog';

function ListeFacturesClient() {
  const [factures, setFactures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    client: "",
    year: "",
    month: "",
  });
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [clients, setClients] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [factureToDelete, setFactureToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const facturesResponse = await axios.get("http://localhost:5000/ventes/facture/all");
        setFactures(facturesResponse.data);

        const clientsResponse = await axios.get("http://localhost:5000/client/clients");
        setClients(clientsResponse.data);
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
        facture.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (facture.client && facture.client.nom_prenom.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesFilters =
        (!filters.client || (facture.client && facture.client.nom_prenom === filters.client)) &&
        (!filters.year || new Date(facture.dateFacture).getFullYear().toString() === filters.year) &&
        (!filters.month || (new Date(facture.dateFacture).getMonth() + 1).toString() === filters.month);

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
  const handleDeleteFacture = (facture) => {
    setFactureToDelete(facture);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteFacture = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/ventes/facture/${factureToDelete._id}`);
      setFactures(factures.filter((f) => f._id !== factureToDelete._id));
      setDeleteDialogOpen(false);
      setFactureToDelete(null);
    } catch (error) {
      console.error("Erreur lors de la suppression de la facture :", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Téléchargement PDF
  const handleDownloadFacture = (facture) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Facture Client", 10, 10);
    doc.setFontSize(12);
    doc.text(`Facture N°: ${facture.numero}`, 10, 20);
    doc.text(`Date Facture: ${new Date(facture.dateFacture).toLocaleDateString()}`, 10, 30);

    const client = clients.find(c => c._id === facture.client._id);
    doc.text(`Client: ${client.nom_prenom}`, 10, 40);
    doc.text(`Adresse: ${client.adresse || 'N/A'}`, 10, 50);
    
    // Tableau des articles
    doc.autoTable({
      startY: 70,
      head: [['Article', 'Quantité', 'Prix Unitaire', 'Total HT']],
      body: facture.lignes.map(ligne => [
        ligne.article.libelle,
        ligne.quantite,
        `${ligne.prix_unitaire.toFixed(2)} DT`,
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} DT`
      ]),
    });

    // Totaux
    const totalHT = facture.lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2;

    doc.text(`Total HT: ${totalHT.toFixed(2)} DT`, 140, doc.autoTable.previous.finalY + 10);
    doc.text(`TVA (20%): ${(totalHT * 0.2).toFixed(2)} DT`, 140, doc.autoTable.previous.finalY + 20);
    doc.text(`Total TTC: ${totalTTC.toFixed(2)} DT`, 140, doc.autoTable.previous.finalY + 30);

    doc.save(`Facture_${facture.numero}.pdf`);
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
      client: "",
      year: "",
      month: "",
    });
    setCurrentPage(1);
  };

  // Ouverture/fermeture modal
  const handleOpenModal = (facture) => {
    setSelectedFacture(facture);
    setIsModalOpen(true);
  };

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
          {/* Header moderne */}
          <Box sx={{
            textAlign: 'center',
            mb: 4,
            p: 4,
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            color: 'white'
          }}>
            <ReceiptLong sx={{ fontSize: 48, mb: 2 }} />
            <Typography variant="h5" sx={{
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
              mb: 1
            }}>
              Factures Clients
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 }}>
              Gestion et suivi de vos factures clients
            </Typography>
          </Box>

          {/* Section principale */}
          <Card sx={{
            p: 1,
            mb: 1,
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <CardContent>
              {/* En-tête */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ReceiptLong sx={{
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

              {/* Barre de recherche et filtres */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  placeholder="Rechercher par numéro ou client..."
                  variant="outlined"
                  size="small"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  sx={{
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      height: '35px',
                      transition: 'all 0.3s ease',
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
                    height: '35px',
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    fontWeight: 'bold',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Filtrer
                  {showFilters ? <ExpandLess sx={{ ml: 1 }} /> : <ExpandMore sx={{ ml: 1 }} />}
                </Button>
              </Box>

              {/* Filtres avancés */}
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
                    {/* Filtre Client */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Autocomplete
                        options={[...new Set(factures.map(f => f.client?.nom_prenom).filter(Boolean))]}
                        value={filters.client || null}
                        onChange={(event, newValue) => handleFilterChange("client", newValue || "")}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Client"
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

                    {/* Filtre Année */}
                    <Grid item xs={12} sm={6} md={4}>
                      <Autocomplete
                        options={[...new Set(factures.map(f => new Date(f.dateFacture).getFullYear().toString()))].sort((a, b) => b.localeCompare(a))}
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

                    {/* Filtre Mois */}
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
                        value={filters.month ? { 
                          value: filters.month, 
                          label: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                                 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][parseInt(filters.month) - 1] 
                        } : null}
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

                  {/* Bouton réinitialisation */}
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
                        '&:hover': {
                          borderColor: '#34495e',
                          backgroundColor: 'rgba(52, 73, 94, 0.1)'
                        }
                      }}
                    >
                      Réinitialiser
                    </Button>
                  </Box>
                </Box>
              </Collapse>

              {/* Tableau des factures */}
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
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Numéro</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Client</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total HT</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total TTC</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedFactures.map((facture, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: '#f8f9fa' },
                          '&:hover': { backgroundColor: '#e3f2fd' }
                        }}
                      >
                        <TableCell sx={{ fontWeight: 'medium' }}>{facture.numero}</TableCell>
                        <TableCell>
                          <CalendarToday sx={{ fontSize: 16, mr: 1, color: '#2c3e50' }} />
                          {new Date(facture.dateFacture).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Business sx={{ fontSize: 16, mr: 1, color: '#2c3e50' }} />
                          {facture.client?.nom_prenom || "Non spécifié"}
                        </TableCell>
                        <TableCell>
                          {facture.lignes?.reduce((acc, ligne) => 
                            acc + (ligne.quantite * ligne.prix_unitaire), 0).toFixed(2)} DT
                        </TableCell>
                        <TableCell>
                          {facture.lignes?.reduce((acc, ligne) => {
                            const ht = ligne.quantite * ligne.prix_unitaire;
                            return acc + (ht * 1.2); // TVA 20%
                          }, 0).toFixed(2)} DT
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Voir détails">
                              <IconButton
                                onClick={() => handleOpenModal(facture)}
                                size="small"
                                sx={{
                                  color: '#1976d2',
                                  '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.1)' }
                                }}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Télécharger PDF">
                              <IconButton
                                onClick={() => handleDownloadFacture(facture)}
                                size="small"
                                sx={{
                                  color: '#4caf50',
                                  '&:hover': { backgroundColor: 'rgba(76, 175, 80, 0.1)' }
                                }}
                              >
                                <FileDownload />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                onClick={() => handleDeleteFacture(facture)}
                                size="small"
                                sx={{
                                  color: '#f44336',
                                  '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
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

              {/* Pagination */}
              <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    sx={{
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      fontWeight: 'bold',
                      '&:disabled': { background: '#e0e0e0' }
                    }}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="contained"
                    disabled={currentPage * itemsPerPage >= filteredFactures.length}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    sx={{
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      fontWeight: 'bold',
                      '&:disabled': { background: '#e0e0e0' }
                    }}
                  >
                    Suivant
                  </Button>
                </Stack>
              </Box>
              <Typography variant="body1" sx={{ textAlign: 'center', mt: 2, color: '#2c3e50' }}>
                Page {currentPage} sur {Math.ceil(filteredFactures.length / itemsPerPage)}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Modal de détails */}
      <Dialog 
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ 
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #e0e0e0",
          pb: 2
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <ReceiptLong sx={{ color: "#1976d2" }} />
            <Typography variant="h6">
              Détails de la Facture N° {selectedFacture?.numero}
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
                          <strong>Client :</strong> {selectedFacture.client?.nom_prenom || "Non spécifié"}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ color: "#1976d2" }} />
                        <Typography>
                          <strong>Date :</strong> {new Date(selectedFacture.dateFacture).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>
                          <strong>Total HT :</strong> {selectedFacture.lignes?.reduce((acc, ligne) => 
                            acc + (ligne.quantite * ligne.prix_unitaire), 0).toFixed(2)} DT
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography>
                          <strong>Total TTC :</strong> {selectedFacture.lignes?.reduce((acc, ligne) => {
                            const ht = ligne.quantite * ligne.prix_unitaire;
                            return acc + (ht * 1.2); // TVA 20%
                          }, 0).toFixed(2)} DT
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </Grid>

              {/* Articles */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                  Articles
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead sx={{ backgroundColor: "#f8f9fa" }}>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "bold" }}>Article</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Quantité</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Prix Unitaire</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Total HT</TableCell>
                        <TableCell sx={{ fontWeight: "bold" }}>Total TTC</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedFacture.lignes?.map((ligne, index) => (
                        <TableRow key={index}>
                          <TableCell>{ligne.article?.libelle || "Non spécifié"}</TableCell>
                          <TableCell>{ligne.quantite}</TableCell>
                          <TableCell>{ligne.prix_unitaire?.toFixed(2)} DT</TableCell>
                          <TableCell>{(ligne.quantite * ligne.prix_unitaire).toFixed(2)} DT</TableCell>
                          <TableCell>{((ligne.quantite * ligne.prix_unitaire) * 1.2).toFixed(2)} DT</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
            onClick={() => {
              handleDownloadFacture(selectedFacture);
              handleCloseModal();
            }}
            variant="contained"
            startIcon={<FileDownload />}
            sx={{ borderRadius: "8px" }}
          >
            Télécharger PDF
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de suppression moderne */}
      <ModernDeleteDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDeleteFacture}
        title="Suppression de facture"
        message="Êtes-vous sûr de vouloir supprimer cette facture ?"
        itemDetails={factureToDelete ? {
          title: factureToDelete.numero,
          details: [
            `👤 Client: ${factureToDelete.client?.nom_prenom || 'Non spécifié'}`,
            `📅 Date: ${new Date(factureToDelete.dateFacture).toLocaleDateString()}`,
            `💰 Total: ${factureToDelete.lignes?.reduce((acc, ligne) => 
              acc + (ligne.quantite * ligne.prix_unitaire * 1.2), 0).toFixed(2)} DT`
          ]
        } : null}
        itemIcon="📄"
        loading={deleteLoading}
      />
    </>
  );
}

export default ListeFacturesClient;