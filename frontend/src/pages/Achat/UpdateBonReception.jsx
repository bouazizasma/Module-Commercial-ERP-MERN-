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
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete, Add, Save, ArrowBack } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";

export default function UpdateBonReception() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fournisseurs, setFournisseurs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [quantite, setQuantite] = useState("");
  const [prixUnitaire, setPrixUnitaire] = useState("");
  const [lignes, setLignes] = useState([]);
  const [dateReception, setDateReception] = useState("");
  const [numero_Bon, setNumeroBon] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Début de la récupération des données pour l'ID:", id);
        
        // Récupérer les données du bon de réception
        const bonResponse = await axios.get(`http://localhost:5000/achat/BEF/${id}`);
        console.log("Réponse du bon de réception:", bonResponse.data);
        
        if (!bonResponse.data) {
          throw new Error("Aucune donnée reçue du bon de réception");
        }

        const bonData = bonResponse.data;

        // Mettre à jour les états avec les données du bon
        setNumeroBon(bonData.numero_Bon);
        setDateReception(new Date(bonData.dateReception).toISOString().split('T')[0]);
        setSelectedFournisseur(bonData.fournisseur);
        
        // Vérifier si les lignes existent et les formater correctement
        if (bonData.lignes && Array.isArray(bonData.lignes)) {
          const formattedLignes = bonData.lignes.map(ligne => ({
            ...ligne,
            article: ligne.article || {},
            prix_unitaire: parseFloat(ligne.prix_unitaire) || 0,
            quantite: parseFloat(ligne.quantite) || 0,
            total_ht: parseFloat(ligne.total_ht) || 0,
            total_ttc: parseFloat(ligne.total_ttc) || 0
          }));
          console.log("Lignes formatées:", formattedLignes);
          setLignes(formattedLignes);
        } else {
          console.log("Aucune ligne trouvée dans le bon de réception");
          setLignes([]);
        }

        // Récupérer la liste des fournisseurs et articles
        console.log("Récupération des fournisseurs et articles...");
        const [fournisseursRes, articlesRes] = await Promise.all([
          axios.get("http://localhost:5000/fournisseur/fournisseurs"),
          axios.get("http://localhost:5000/article/articles")
        ]);

        console.log("Données des fournisseurs:", fournisseursRes.data);
        console.log("Données des articles:", articlesRes.data);

        if (!fournisseursRes.data || !articlesRes.data) {
          throw new Error("Données manquantes pour les fournisseurs ou les articles");
        }

        setFournisseurs(fournisseursRes.data);
        setArticles(articlesRes.data);
        
        console.log("Toutes les données ont été récupérées avec succès");
      } catch (error) {
        console.error("Erreur détaillée:", error);
        console.error("Message d'erreur:", error.message);
        if (error.response) {
          console.error("Données de réponse:", error.response.data);
          console.error("Statut de la réponse:", error.response.status);
        }
        
        let errorMessage = "Erreur lors de la récupération des données";
        if (error.response?.status === 404) {
          errorMessage = "Bon de réception non trouvé";
        } else if (error.response?.status === 500) {
          errorMessage = "Erreur serveur lors de la récupération des données";
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setDialogMessage(errorMessage);
        setOpenDialog(true);
      }
    };

    if (id) {
      fetchData();
    } else {
      console.error("ID non fourni");
      setDialogMessage("ID du bon de réception non fourni");
      setOpenDialog(true);
    }
  }, [id]);

  const handleAddLigne = () => {
    if (!selectedArticle || !quantite || !prixUnitaire) {
      setDialogMessage("Veuillez remplir tous les champs de la ligne");
      setOpenDialog(true);
      return;
    }

    const total_ht = quantite * prixUnitaire;
    const total_ttc = total_ht * 1.2; // TVA 20%

    const newLigne = {
      article: selectedArticle,
      quantite: parseFloat(quantite),
      prix_unitaire: parseFloat(prixUnitaire),
      total_ht: total_ht,
      total_ttc: total_ttc
    };

    setLignes([...lignes, newLigne]);
    setSelectedArticle(null);
    setQuantite("");
    setPrixUnitaire("");
  };

  const handleDeleteLigne = (index) => {
    const newLignes = lignes.filter((_, i) => i !== index);
    setLignes(newLignes);
  };

  const calculateTotals = () => {
    const totalHT = lignes.reduce((sum, ligne) => sum + ligne.total_ht, 0);
    const totalTTC = lignes.reduce((sum, ligne) => sum + ligne.total_ttc, 0);
    return { totalHT, totalTTC };
  };

  const handleSubmit = async () => {
    if (!selectedFournisseur || !dateReception || lignes.length === 0) {
      setDialogMessage("Veuillez remplir tous les champs obligatoires");
      setOpenDialog(true);
      return;
    }

    try {
      const { totalHT, totalTTC } = calculateTotals();
      const updatedBonReception = {
        numero_Bon,
        dateReception,
        fournisseur: selectedFournisseur._id,
        lignes: lignes.map(ligne => ({
          article: ligne.article._id,
          quantite: ligne.quantite,
          prix_unitaire: ligne.prix_unitaire,
          total_ht: ligne.total_ht,
          total_ttc: ligne.total_ttc
        })),
        total_hors_Taxe: totalHT,
        total_ttc: totalTTC
      };

      await axios.put(`http://localhost:5000/achat/BEF/${id}`, updatedBonReception);
      navigate("/ListeBonReceptionFournisseur");
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setDialogMessage("Erreur lors de la mise à jour du bon de réception");
      setOpenDialog(true);
    }
  };

  const { totalHT, totalTTC } = calculateTotals();

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
                  Modifier Bon de Réception
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBack />}
                  onClick={() => navigate("/ListeBonReceptionFournisseur")}
                >
                  Retour
                </Button>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="N° Bon de Réception"
                    value={numero_Bon}
                    onChange={(e) => setNumeroBon(e.target.value)}
                    disabled
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Date de Réception"
                    type="date"
                    value={dateReception}
                    onChange={(e) => setDateReception(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Autocomplete
                    options={fournisseurs}
                    getOptionLabel={(option) => option.raison_sociale}
                    value={selectedFournisseur}
                    onChange={(_, newValue) => setSelectedFournisseur(newValue)}
                    renderInput={(params) => <TextField {...params} label="Fournisseur" />}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, color: '#1976d2' }}>
                  Articles
                </Typography>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={4}>
                    <Autocomplete
                      options={articles}
                      getOptionLabel={(option) => option.libelle}
                      value={selectedArticle}
                      onChange={(_, newValue) => setSelectedArticle(newValue)}
                      renderInput={(params) => <TextField {...params} label="Article" />}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Quantité"
                      type="number"
                      value={quantite}
                      onChange={(e) => setQuantite(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Prix Unitaire"
                      type="number"
                      value={prixUnitaire}
                      onChange={(e) => setPrixUnitaire(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<Add />}
                      onClick={handleAddLigne}
                      sx={{ height: '56px' }}
                    >
                      Ajouter
                    </Button>
                  </Grid>
                </Grid>

                <TableContainer component={Paper} sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell>Article</TableCell>
                        <TableCell align="right">Quantité</TableCell>
                        <TableCell align="right">Prix Unitaire</TableCell>
                        <TableCell align="right">Total HT</TableCell>
                        <TableCell align="right">Total TTC</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lignes.map((ligne, index) => (
                        <TableRow key={index}>
                          <TableCell>{ligne.article.libelle}</TableCell>
                          <TableCell align="right">{ligne.quantite}</TableCell>
                          <TableCell align="right">{ligne.prix_unitaire.toFixed(3)} TND</TableCell>
                          <TableCell align="right">{ligne.total_ht.toFixed(3)} TND</TableCell>
                          <TableCell align="right">{ligne.total_ttc.toFixed(3)} TND</TableCell>
                          <TableCell align="center">
                            <IconButton 
                              color="error" 
                              onClick={() => handleDeleteLigne(index)}
                              size="small"
                            >
                              <Delete />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ mt: 3, backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1">
                        Total HT: {totalHT.toFixed(3)} TND
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1">
                        Total TTC: {totalTTC.toFixed(3)} TND
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={<Save />}
                  onClick={handleSubmit}
                  sx={{ minWidth: 150 }}
                >
                  Enregistrer
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

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