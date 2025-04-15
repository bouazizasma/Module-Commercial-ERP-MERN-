import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
  Stack,
  Divider,
  Alert,
  Snackbar,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Description as DescriptionIcon,
  Person as PersonIcon,
  CalendarToday as CalendarTodayIcon,
  Business as BusinessIcon,
  LocationOn as LocationOnIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  AttachMoney as AttachMoneyIcon,
  Percent as PercentIcon,
  LocalShipping as LocalShippingIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function SaisieBonCommandeClient() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [depots, setDepots] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedDepot, setSelectedDepot] = useState(null);
  const [dateBonCommande, setDateBonCommande] = useState(new Date());
  const [lignes, setLignes] = useState([]);
  const [totalHT, setTotalHT] = useState(0);
  const [totalTTC, setTotalTTC] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [adresse, setAdresse] = useState("");
  const [matriculeFiscale, setMatriculeFiscale] = useState("");
  const [telephone, setTelephone] = useState("");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [quantite, setQuantite] = useState(1);
  const [prixUnitaire, setPrixUnitaire] = useState(0);
  const [tva, setTva] = useState(0);
  const [remise, setRemise] = useState(0);
  const [dc, setDc] = useState(0);
  const [fodec, setFodec] = useState(0);
  const [prix_uTTC, setPrix_uTTC] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientsResponse, articlesResponse, depotsResponse] = await Promise.all([
          axios.get("http://localhost:5000/client/clients"),
          axios.get("http://localhost:5000/article/articles"),
          axios.get("http://localhost:5000/depot/depots"),
        ]);
        setClients(clientsResponse.data);
        setArticles(articlesResponse.data);
        setDepots(depotsResponse.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
        setSnackbarSeverity("error");
        setSnackbarMessage("Erreur lors de la récupération des données");
        setOpenSnackbar(true);
      }
    };

    fetchData();
  }, []);

  const handleClientChange = (event, newValue) => {
    setSelectedClient(newValue);
    if (newValue) {
      setAdresse(newValue.adresse || "");
      setMatriculeFiscale(newValue.matricule_fiscale || "");
      setTelephone(newValue.telephone || "");
    } else {
      setAdresse("");
      setMatriculeFiscale("");
      setTelephone("");
    }
  };

  const handleArticleChange = (event, newValue) => {
    setSelectedArticle(newValue);
    if (newValue) {
      setPrixUnitaire(newValue.prixht || 0);
      setTva(newValue.tva || 0);
      setRemise(newValue.remise || 0);
      setDc(newValue.dc || 0);
      setFodec(newValue.fodec || 0);
      setPrix_uTTC(newValue.prix_totale_concre || 0);
    } else {
      setPrixUnitaire(0);
      setTva(0);
      setRemise(0);
      setDc(0);
      setFodec(0);
      setPrix_uTTC(0);
    }
  };

  const handleAddLigne = () => {
    if (!selectedArticle || quantite <= 0) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Veuillez sélectionner un article et une quantité valide");
      setOpenSnackbar(true);
      return;
    }

    const newLigne = {
      article: selectedArticle,
      libelle: selectedArticle.libelle,
      quantite: quantite,
      prix_unitaire: prixUnitaire,
      tva: tva,
      remise: remise,
      dc: dc,
      fodec: fodec,
      prix_uTTC: prix_uTTC,
      total: quantite * prix_uTTC
    };

    setLignes([...lignes, newLigne]);
    calculateTotals([...lignes, newLigne]);
    
    // Réinitialiser les champs
    setSelectedArticle(null);
    setQuantite(1);
    setPrixUnitaire(0);
    setTva(0);
    setRemise(0);
    setDc(0);
    setFodec(0);
    setPrix_uTTC(0);
  };

  const handleRemoveLigne = (index) => {
    const newLignes = [...lignes];
    newLignes.splice(index, 1);
    setLignes(newLignes);
    calculateTotals(newLignes);
  };

  const calculateTotals = (lignes) => {
    const totalHT = lignes.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.19; // TVA 19%
    setTotalHT(totalHT);
    setTotalTTC(totalTTC);
  };

  const handleSubmit = async () => {
    try {
      const bonCommande = {
        client: selectedClient._id,
        depot: selectedDepot._id,
        dateCommande:dateBonCommande,
        lignes: lignes.map(ligne => ({
          article: ligne.article._id,
          quantite: ligne.quantite,
          prix_unitaire: ligne.prix_unitaire,
          tva: ligne.tva,
          remise: ligne.remise,
          dc: ligne.dc,
          fodec: ligne.fodec,
          prix_uTTC: ligne.prix_uTTC,
          total: ligne.total
        })),
        total_hors_Taxe: totalHT,   
      total_ttc: totalTTC        
      };

      await axios.post("http://localhost:5000/ventes/BCC/create", bonCommande);
      setSnackbarSeverity("success");
      setSnackbarMessage("Bon de commande créé avec succès");
      setOpenSnackbar(true);

      setTimeout(() => {
        navigate("/ListeBonCommandeClient");
      }, 2000);
      
    } catch (error) {
      console.error("Erreur lors de la création du bon de commande:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("Erreur lors de la création du bon de commande");
      setOpenSnackbar(true);
    }
  };

  const handleReset = () => {
    setSelectedClient(null);
    setSelectedDepot(null);
    setDateBonCommande(new Date());
    setLignes([]);
    setTotalHT(0);
    setTotalTTC(0);
    setAdresse("");
    setMatriculeFiscale("");
    setTelephone("");
    setSelectedArticle(null);
    setQuantite(1);
    setPrixUnitaire(0);
    setTva(0);
    setRemise(0);
    setDc(0);
    setFodec(0);
    setPrix_uTTC(0);
  };

  return (
    <>
      <Navbar />
      <Box height={600} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={3}>
                    <DescriptionIcon sx={{ fontSize: 40, color: "#1976d2" }} />
                    <Typography variant="h4" component="h1" sx={{ color: "#1976d2", fontWeight: "bold" }}>
                      Nouveau Bon de Commande Client
                    </Typography>
                  </Stack>

                  <Grid container spacing={3}>
                    {/* Informations de base */}
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ backgroundColor: "#f8f9fa" }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                            Informations de base
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                              <TextField
                                fullWidth
                                label="Date de bon de commande"
                                type="date"
                                value={dateBonCommande.toISOString().split('T')[0]}
                                onChange={(e) => setDateBonCommande(new Date(e.target.value))}
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <CalendarTodayIcon color="primary" />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ backgroundColor: "white" }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Autocomplete
                                options={clients}
                                getOptionLabel={(option) => option.nom_prenom}
                                value={selectedClient}
                                onChange={handleClientChange}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Client"
                                    fullWidth
                                    required
                                    InputProps={{
                                      ...params.InputProps,
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <PersonIcon color="primary" />
                                        </InputAdornment>
                                      ),
                                    }}
                                    sx={{ backgroundColor: "white" }}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <TextField
                                fullWidth
                                label="Adresse"
                                value={adresse}
                                disabled
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <LocationOnIcon color="primary" />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ backgroundColor: "white" }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <TextField
                                fullWidth
                                label="Matricule Fiscale"
                                value={matriculeFiscale}
                                disabled
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <BadgeIcon color="primary" />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ backgroundColor: "white" }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <TextField
                                fullWidth
                                label="Téléphone"
                                value={telephone}
                                disabled
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <PhoneIcon color="primary" />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ backgroundColor: "white" }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                              <Autocomplete
                                options={depots}
                                getOptionLabel={(option) => option.libelle}
                                value={selectedDepot}
                                onChange={(event, newValue) => setSelectedDepot(newValue)}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Dépôt"
                                    fullWidth
                                    required
                                    InputProps={{
                                      ...params.InputProps,
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <BusinessIcon color="primary" />
                                        </InputAdornment>
                                      ),
                                    }}
                                    sx={{ backgroundColor: "white" }}
                                  />
                                )}
                              />
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Sélection d'article */}
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ backgroundColor: "#f8f9fa" }}>
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 2, color: "#1976d2" }}>
                            Sélection d'article
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6} md={3}>
                              <Autocomplete
                                options={articles}
                                getOptionLabel={(option) => option.libelle}
                                value={selectedArticle}
                                onChange={handleArticleChange}
                                renderInput={(params) => (
                                  <TextField
                                    {...params}
                                    label="Article"
                                    fullWidth
                                    InputProps={{
                                      ...params.InputProps,
                                      startAdornment: (
                                        <InputAdornment position="start">
                                          <LocalShippingIcon color="primary" />
                                        </InputAdornment>
                                      ),
                                    }}
                                    sx={{ backgroundColor: "white" }}
                                  />
                                )}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <TextField
                                fullWidth
                                label="Quantité"
                                type="number"
                                value={quantite}
                                onChange={(e) => setQuantite(parseInt(e.target.value) || 0)}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <AttachMoneyIcon color="primary" />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ backgroundColor: "white" }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <TextField
                                fullWidth
                                label="Prix Unitaire"
                                value={prixUnitaire}
                                disabled
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <AttachMoneyIcon color="primary" />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ backgroundColor: "white" }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <TextField
                                fullWidth
                                label="TVA"
                                value={tva}
                                disabled
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <PercentIcon color="primary" />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ backgroundColor: "white" }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={2}>
                              <TextField
                                fullWidth
                                label="Prix TTC"
                                value={prix_uTTC}
                                disabled
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <AttachMoneyIcon color="primary" />
                                    </InputAdornment>
                                  ),
                                }}
                                sx={{ backgroundColor: "white" }}
                              />
                            </Grid>
                            <Grid item xs={12} sm={6} md={1}>
                              <Tooltip title="Ajouter l'article">
                                <IconButton
                                  color="primary"
                                  onClick={handleAddLigne}
                                  sx={{
                                    backgroundColor: "#1976d2",
                                    color: "white",
                                    "&:hover": { backgroundColor: "#1565c0" },
                                    height: "56px",
                                    width: "100%",
                                  }}
                                >
                                  <AddIcon />
                                </IconButton>
                              </Tooltip>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Lignes de bon de commande */}
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ backgroundColor: "#f8f9fa" }}>
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6" sx={{ color: "#1976d2" }}>
                              Articles sélectionnés
                            </Typography>
                          </Stack>

                          <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                            <Table>
                              <TableHead>
                                <TableRow sx={{ backgroundColor: "#e3f2fd" }}>
                                  <TableCell>Article</TableCell>
                                  <TableCell>Quantité</TableCell>
                                  <TableCell>Prix Unitaire</TableCell>
                                  <TableCell>TVA</TableCell>
                                  <TableCell>Remise</TableCell>
                                  <TableCell>DC</TableCell>
                                  <TableCell>FODEC</TableCell>
                                  <TableCell>Prix TTC</TableCell>
                                  <TableCell>Total</TableCell>
                                  <TableCell>Actions</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {lignes.map((ligne, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{ligne.libelle}</TableCell>
                                    <TableCell>{ligne.quantite}</TableCell>
                                    <TableCell>{ligne.prix_unitaire.toFixed(2)} DT</TableCell>
                                    <TableCell>{ligne.tva}%</TableCell>
                                    <TableCell>{ligne.remise}%</TableCell>
                                    <TableCell>{ligne.dc}%</TableCell>
                                    <TableCell>{ligne.fodec}%</TableCell>
                                    <TableCell>{ligne.prix_uTTC.toFixed(2)} DT</TableCell>
                                    <TableCell>{ligne.total.toFixed(2)} DT</TableCell>
                                    <TableCell>
                                      <IconButton
                                        color="error"
                                        onClick={() => handleRemoveLigne(index)}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Totaux */}
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ backgroundColor: "#f8f9fa" }}>
                        <CardContent>
                          <Grid container spacing={2} justifyContent="flex-end">
                            <Grid item xs={12} sm={6} md={4}>
                              <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="body1">Total HT:</Typography>
                                  <Typography variant="body1" fontWeight="bold">
                                    {totalHT.toFixed(2)} DT
                                  </Typography>
                                </Stack>
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="body1">Montant TVA :</Typography>
                                  <Typography variant="body1" fontWeight="bold">
                                    {(totalTTC - totalHT).toFixed(2)} DT
                                  </Typography>
                                </Stack>
                                <Divider />
                                <Stack direction="row" justifyContent="space-between">
                                  <Typography variant="h6">Total TTC:</Typography>
                                  <Typography variant="h6" color="primary" fontWeight="bold">
                                    {totalTTC.toFixed(2)} DT
                                  </Typography>
                                </Stack>
                              </Stack>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    </Grid>

                    {/* Boutons d'action */}
                    <Grid item xs={12}>
                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          startIcon={<ClearIcon />}
                          onClick={handleReset}
                          sx={{
                            borderColor: "#1976d2",
                            color: "#1976d2",
                            "&:hover": { borderColor: "#1565c0" },
                          }}
                        >
                          Réinitialiser
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={handleSubmit}
                          sx={{
                            backgroundColor: "#1976d2",
                            "&:hover": { backgroundColor: "#1565c0" },
                          }}
                        >
                          Enregistrer
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ 
          '& .MuiSnackbar-root': {
            bottom: '24px',
            right: '24px'
          }
        }}
      >
        <Alert
          onClose={() => setOpenSnackbar(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ 
            width: '100%',
            backgroundColor: snackbarSeverity === 'success' ? '#4caf50' : '#f44336',
            color: 'white'
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}