import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Tooltip,
  Autocomplete,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Search,
  FilterList,
  Visibility,
  Edit,
  Delete,
  Add,
  NavigateBefore,
  NavigateNext,
  Close,
  Receipt,
  Business,
  CalendarToday,
  AttachMoney,
  Description,
  LocalShipping,
  Assessment,
  Print,
  Download,
  Share,
  Email,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";

export default function ListeFactureFournisseur() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [factures, setFactures] = useState([]);
  const [filteredFactures, setFilteredFactures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [filters, setFilters] = useState({
    fournisseur: "",
    dateDebut: "",
    dateFin: "",
    montantMin: "",
    montantMax: "",
    statut: "",
  });
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facturesRes, fournisseursRes] = await Promise.all([
          axios.get("http://localhost:5000/facture/factures"),
          axios.get("http://localhost:5000/fournisseur/fournisseurs")
        ]);
        setFactures(facturesRes.data);
        setFilteredFactures(facturesRes.data);
        setFournisseurs(fournisseursRes.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setDialogMessage("Erreur lors de la récupération des données");
        setOpenDialog(true);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...factures];

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(
        (facture) =>
          facture.numero_Facture.toLowerCase().includes(searchTerm.toLowerCase()) ||
          facture.fournisseur.raison_sociale.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtres avancés
    if (filters.fournisseur) {
      filtered = filtered.filter(
        (facture) => facture.fournisseur._id === filters.fournisseur
      );
    }

    if (filters.dateDebut && filters.dateFin) {
      filtered = filtered.filter(
        (facture) =>
          new Date(facture.date_Facture) >= new Date(filters.dateDebut) &&
          new Date(facture.date_Facture) <= new Date(filters.dateFin)
      );
    }

    if (filters.montantMin) {
      filtered = filtered.filter(
        (facture) => facture.total_ttc >= parseFloat(filters.montantMin)
      );
    }

    if (filters.montantMax) {
      filtered = filtered.filter(
        (facture) => facture.total_ttc <= parseFloat(filters.montantMax)
      );
    }

    if (filters.statut) {
      filtered = filtered.filter((facture) => facture.statut === filters.statut);
    }

    setFilteredFactures(filtered);
    setPage(1);
  }, [searchTerm, filters, factures]);

  const handleOpenDetails = (facture) => {
    setSelectedFacture(facture);
    setOpenDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setSelectedFacture(null);
    setOpenDetailsDialog(false);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/facture/facture/${selectedFacture._id}`);
      setFactures(factures.filter((f) => f._id !== selectedFacture._id));
      setOpenDeleteDialog(false);
      setSelectedFacture(null);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      setDialogMessage("Erreur lors de la suppression de la facture");
      setOpenDialog(true);
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case "paye":
        return "success";
      case "En attente":
        return "warning";
      case "Annulée":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "TND",
    }).format(amount);
  };

  return (
    <>
      <Navbar />
      <Box height={50} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Card sx={{ minWidth: 275, mt: 3, mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5" component="div" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                  Liste des Factures
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => navigate("/NouvelleFacture")}
                >
                  Nouvelle Facture
                </Button>
              </Box>

              {/* Statistiques */}
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} md={3}>
                  <Card sx={{ bgcolor: '#e3f2fd', height: '100%' }}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Factures
                      </Typography>
                      <Typography variant="h4">
                        {filteredFactures.length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card sx={{ bgcolor: '#e8f5e9', height: '100%' }}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Montant Total
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(filteredFactures.reduce((sum, f) => sum + f.total_ttc, 0))}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card sx={{ bgcolor: '#fff3e0', height: '100%' }}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        En Attente
                      </Typography>
                      <Typography variant="h4">
                        {filteredFactures.filter(f => f.statut === "En attente").length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Card sx={{ bgcolor: '#fce4ec', height: '100%' }}>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Annulées
                      </Typography>
                      <Typography variant="h4">
                        {filteredFactures.filter(f => f.statut === "Annulée").length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Barre de recherche et filtres */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Rechercher par numéro ou fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  onClick={() => setOpenFilters(true)}
                >
                  Filtres
                </Button>
              </Box>

              {/* Tableau des factures */}
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell>N° Facture</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Fournisseur</TableCell>
                      <TableCell align="right">Montant HT</TableCell>
                      <TableCell align="right">Montant TTC</TableCell>
                      <TableCell>Statut</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredFactures
                      .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                      .map((facture) => (
                        <TableRow key={facture._id} hover>
                          <TableCell>{facture.numero_Facture}</TableCell>
                          <TableCell>{formatDate(facture.date_Facture)}</TableCell>
                          <TableCell>{facture.fournisseur.raison_sociale}</TableCell>
                          <TableCell align="right">{formatCurrency(facture.total_hors_Taxe)}</TableCell>
                          <TableCell align="right">{formatCurrency(facture.total_ttc)}</TableCell>
                          <TableCell>
                            <Chip
                              label={facture.statut}
                              color={getStatusColor(facture.statut)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Tooltip title="Voir les détails">
                              <IconButton
                                color="primary"
                                onClick={() => handleOpenDetails(facture)}
                                size="small"
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Modifier">
                              <IconButton
                                color="primary"
                                onClick={() => navigate(`/UpdateFacture/${facture._id}`)}
                                size="small"
                              >
                                <Edit />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                color="error"
                                onClick={() => {
                                  setSelectedFacture(facture);
                                  setOpenDeleteDialog(true);
                                }}
                                size="small"
                              >
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {`${(page - 1) * rowsPerPage + 1}-${Math.min(
                    page * rowsPerPage,
                    filteredFactures.length
                  )} sur ${filteredFactures.length}`}
                </Typography>
                <Box>
                  <Button
                    startIcon={<NavigateBefore />}
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Précédent
                  </Button>
                  <Button
                    endIcon={<NavigateNext />}
                    onClick={() => setPage(page + 1)}
                    disabled={page * rowsPerPage >= filteredFactures.length}
                  >
                    Suivant
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Modal de détails */}
      <Dialog
        open={openDetailsDialog}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        {selectedFacture && (
          <>
            <DialogTitle sx={{ 
              bgcolor: '#f5f5f5',
              borderBottom: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Receipt sx={{ color: '#1976d2' }} />
                <Typography variant="h6">
                  Détails de la Facture {selectedFacture.numero_Facture}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseDetails} size="small">
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Informations générales */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: '#1976d2' }}>
                    Informations Générales
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday sx={{ color: 'text.secondary' }} />
                        <Typography>
                          <strong>Date:</strong> {formatDate(selectedFacture.date_Facture)}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Business sx={{ color: 'text.secondary' }} />
                        <Typography>
                          <strong>Fournisseur:</strong> {selectedFacture.fournisseur.raison_sociale}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Assessment sx={{ color: 'text.secondary' }} />
                        <Typography>
                          <strong>Statut:</strong>
                          <Chip
                            label={selectedFacture.statut}
                            color={getStatusColor(selectedFacture.statut)}
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>

                {/* Articles */}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2, color: '#1976d2' }}>
                    Articles
                  </Typography>
                  <TableContainer component={Paper} sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell>Article</TableCell>
                          <TableCell align="right">Quantité</TableCell>
                          <TableCell align="right">Prix Unitaire</TableCell>
                          <TableCell align="right">Total HT</TableCell>
                          <TableCell align="right">Total TTC</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedFacture.lignes.map((ligne, index) => (
                          <TableRow key={index}>
                            <TableCell>{ligne.article.libelle}</TableCell>
                            <TableCell align="right">{ligne.quantite}</TableCell>
                            <TableCell align="right">{formatCurrency(ligne.prix_unitaire)}</TableCell>
                            <TableCell align="right">{formatCurrency(ligne.total_ht)}</TableCell>
                            <TableCell align="right">{formatCurrency(ligne.total_ttc)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>

                {/* Totaux */}
                <Grid item xs={12}>
                  <Box sx={{ 
                    bgcolor: '#f5f5f5',
                    p: 2,
                    borderRadius: 1,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 4
                  }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total HT
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(selectedFacture.total_hors_Taxe)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Total TTC
                      </Typography>
                      <Typography variant="h6" color="primary">
                        {formatCurrency(selectedFacture.total_ttc)}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ 
              p: 2,
              bgcolor: '#f5f5f5',
              borderTop: '1px solid #e0e0e0'
            }}>
              <Button
                startIcon={<Print />}
                variant="outlined"
                onClick={() => {/* Logique d'impression */}}
              >
                Imprimer
              </Button>
              <Button
                startIcon={<Download />}
                variant="outlined"
                onClick={() => {/* Logique de téléchargement */}}
              >
                Télécharger
              </Button>
              <Button
                startIcon={<Share />}
                variant="outlined"
                onClick={() => {/* Logique de partage */}}
              >
                Partager
              </Button>
              <Button
                startIcon={<Email />}
                variant="outlined"
                onClick={() => {/* Logique d'envoi par email */}}
              >
                Envoyer par email
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer cette facture ?
            Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer des filtres */}
      <Drawer
        anchor="right"
        open={openFilters}
        onClose={() => setOpenFilters(false)}
      >
        <Box sx={{ width: 350, p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6">Filtres</Typography>
            <IconButton onClick={() => setOpenFilters(false)}>
              <Close />
            </IconButton>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Autocomplete
                options={fournisseurs}
                getOptionLabel={(option) => option.raison_sociale}
                value={filters.fournisseur ? fournisseurs.find(f => f._id === filters.fournisseur) : null}
                onChange={(_, newValue) => setFilters({ ...filters, fournisseur: newValue?._id || "" })}
                renderInput={(params) => <TextField {...params} label="Fournisseur" />}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date de début"
                type="date"
                value={filters.dateDebut}
                onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Date de fin"
                type="date"
                value={filters.dateFin}
                onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Montant minimum"
                type="number"
                value={filters.montantMin}
                onChange={(e) => setFilters({ ...filters, montantMin: e.target.value })}
                InputProps={{
                  startAdornment: <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Montant maximum"
                type="number"
                value={filters.montantMax}
                onChange={(e) => setFilters({ ...filters, montantMax: e.target.value })}
                InputProps={{
                  startAdornment: <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Statut"
                value={filters.statut}
                onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                SelectProps={{
                  native: true,
                }}
              >
                <option value="">Tous</option>
                <option value="Payée">Payée</option>
                <option value="En attente">En attente</option>
                <option value="Annulée">Annulée</option>
              </TextField>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setFilters({
                fournisseur: "",
                dateDebut: "",
                dateFin: "",
                montantMin: "",
                montantMax: "",
                statut: "",
              })}
            >
              Réinitialiser
            </Button>
            <Button
              fullWidth
              variant="contained"
              onClick={() => setOpenFilters(false)}
            >
              Appliquer
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Dialog de message */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Message</DialogTitle>
        <DialogContent>
          <Typography>{dialogMessage}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 