import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Autocomplete,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Fade,
} from "@mui/material";
import { Clear, AddCircleOutline, ArrowBack, Add, Delete, CheckCircle } from "@mui/icons-material";
import Sidenav from "../../navbar/Sidenav";
import Navbar from "../../navbar/Navbar";

export default function UpdateDevis() {
  const { id } = useParams(); // Récupérer l'ID du devis depuis l'URL
  const navigate = useNavigate(); // Pour la navigation
  const [devis, setDevis] = useState(null); // État pour le devis à modifier
  const [editLignes, setEditLignes] = useState([]); // État pour les lignes modifiables
  const [clients, setClients] = useState([]); // Liste des Clients
  const [articles, setArticles] = useState([]); // Liste des articles
  const [depots, setDepots] = useState([]); // Liste des dépôts
  const [error, setError] = useState(null); // Gestion des erreurs
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [quantite, setQuantite] = useState(1);
  const [prixUnitaire, setPrixUnitaire] = useState(0);
  const [openSnackbar, setOpenSnackbar] = useState(false);

  // Récupérer les données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer le devis
        const devisResponse = await axios.get(`http://localhost:5000/ventes/devis/${id}`);
        setDevis(devisResponse.data.devis);
        setEditLignes(devisResponse.data.lignes);

        // Récupérer les clients
        const clientsResponse = await axios.get("http://localhost:5000/client/clients");
        setClients(clientsResponse.data);

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
  }, [id]);

  // Gestion des changements dans les champs du devis
  const handleDevisChange = (field, value) => {
    setDevis((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Gestion des changements dans les lignes de devis
  const handleLigneChange = (index, field, value) => {
    const newLignes = [...editLignes];
    newLignes[index][field] = value;

    // Recalculer les totaux si la quantité ou le prix unitaire change
    if (field === "quantite" || field === "prix_unitaire") {
      const quantite = Number(newLignes[index].quantite) || 0;
      const prix_unitaire = Number(newLignes[index].prix_unitaire) || 0;
      newLignes[index].total_ht = quantite * prix_unitaire;
      newLignes[index].total_ttc = newLignes[index].total_ht * 1.2;
    }

    setEditLignes(newLignes);

    // Mettre à jour les totaux du devis
    const total_hors_Taxe = newLignes.reduce((acc, ligne) => acc + (Number(ligne.total_ht) || 0), 0);
    const devisTotalTTC = total_hors_Taxe * 1.2;

    setDevis(prev => ({
      ...prev,
      total_hors_Taxe,
      total_ttc: devisTotalTTC
    }));
  };

  // Supprimer une ligne de devis
  const handleDeleteLigne = (index) => {
    const newLignes = [...editLignes];
    newLignes.splice(index, 1);
    setEditLignes(newLignes);

    // Mettre à jour les totaux  de devis
    const total_hors_Taxe = newLignes.reduce((acc, ligne) => acc + (Number(ligne.total_ht) || 0), 0);
    const devisTotalTTC = total_hors_Taxe * 1.2;

    setDevis(prev => ({
      ...prev,
      total_hors_Taxe,
      total_ttc: devisTotalTTC
    }));
  };

  // Ajouter une nouvelle ligne de Devis
  const handleAddLigne = () => {
    if (!selectedArticle) return;
    
    const quantiteValue = Number(quantite) || 0;
    const prixUnitaireValue = Number(prixUnitaire) || 0;
    const total_ht = quantiteValue * prixUnitaireValue;
    const total_ttc = total_ht * 1.2;

    const newLignes = [...editLignes, {
      article: selectedArticle,
      quantite: quantiteValue,
      prix_unitaire: prixUnitaireValue,
      total_ht,
      total_ttc
    }];

    setEditLignes(newLignes);

    // Mettre à jour les totaux  de Devis
    const total_hors_Taxe = newLignes.reduce((acc, ligne) => acc + (Number(ligne.total_ht) || 0), 0);
    const devisTotalTTC = total_hors_Taxe * 1.2;

    setDevis(prev => ({
      ...prev,
      total_hors_Taxe,
      total_ttc: devisTotalTTC
    }));

    setSelectedArticle(null);
    setQuantite(1);
    setPrixUnitaire(0);
  };

  // Soumettre le formulaire de modification
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Calculer les totaux
      const total_hors_Taxe = editLignes.reduce((acc, ligne) => acc + (Number(ligne.total_ht) || 0), 0);
      const total_ttc = total_hors_Taxe * 1.2;

      // Préparer les lignes pour l'envoi
      const lignesFormatees = editLignes.map(ligne => ({
        article: ligne.article._id,
        quantite: Number(ligne.quantite) || 0,
        prix_unitaire: Number(ligne.prix_unitaire) || 0,
        total_ht: Number(ligne.total_ht) || 0,
        total_ttc: Number(ligne.total_ttc) || 0,
        prix_uTTC: Number(ligne.prix_unitaire) * 1.2 || 0,
        tva: 20,
        remise: 0,
        dc: 0,
        fodec: 0
      }));

      // Mettre à jour le bon de devis
      const updatedDevis = {
        ...devis,
        lignes: lignesFormatees,
        total_hors_Taxe,
        total_ttc,
        date_modification: new Date(),
        client: devis.client._id,
        depot: devis.depot?._id,
      };

      // Envoyer la requête de mise à jour
      await axios.put(`http://localhost:5000/ventes/devis/${id}`, updatedDevis);
      
      // Afficher le message de succès
      setOpenSnackbar(true);
      
      // Rediriger après un délai
      setTimeout(() => {
        navigate("/ListeDevisClient");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du devis :", error);
      setError(error.response?.data?.message || "Erreur lors de la mise à jour du devis.");
    }
  };

  // Gérer la fermeture du Snackbar
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Mettre à jour les totaux au chargement initial
  useEffect(() => {
    if (editLignes.length > 0) {
      const total_hors_Taxe = editLignes.reduce((acc, ligne) => acc + (Number(ligne.total_ht) || 0), 0);
      const total_ttc = total_hors_Taxe * 1.2;

      setDevis(prev => ({
        ...prev,
        total_hors_Taxe,
        total_ttc
      }));
    }
  }, [editLignes]);

  if (error) {
    return <div>{error}</div>;
  }

  if (!devis) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <Navbar />
      <Box height={70} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto", maxHeight: "100vh" }}>
          <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                  Modification du Devis N° {devis.numero}
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/ListeDevisClient')}
                  startIcon={<ArrowBack />}
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
                  Retour
                </Button>
              </Box>

              <Grid container spacing={3}>
                {/* Informations de base */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ backgroundColor: '#f8f9fa', boxShadow: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                        Informations Générales
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Date de Devis"
                            type="date"
                            value={devis.dateDevis ? devis.dateDevis.split('T')[0] : ''}
                            onChange={(e) => setDevis({ ...devis, dateDevis: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                backgroundColor: '#fff',
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Autocomplete
                            options={clients}
                            getOptionLabel={(option) => option?.nom_prenom || ''}
                            value={devis.client}
                            onChange={(event, newValue) => {
                              setDevis({ ...devis, client: newValue });
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Client"
                                required
                                error={!devis.client}
                                helperText={!devis.client ? "Le client est requis" : ""}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    backgroundColor: '#fff',
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Ajout d'articles */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ backgroundColor: '#f8f9fa', boxShadow: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                        Ajouter un Article
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Autocomplete
                            options={articles}
                            getOptionLabel={(option) => option?.libelle || ''}
                            value={selectedArticle}
                            onChange={(event, newValue) => {
                              setSelectedArticle(newValue);
                              if (newValue) {
                                setQuantite(Number(newValue.quantite_stock) || 1);
                                setPrixUnitaire(Number(newValue.prix_net) || 0);
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Article"
                                required
                                error={!selectedArticle}
                                helperText={!selectedArticle ? "L'article est requis" : ""}
                                sx={{ 
                                  '& .MuiOutlinedInput-root': {
                                    borderRadius: '8px',
                                    backgroundColor: '#fff',
                                  }
                                }}
                              />
                            )}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Quantité"
                            type="number"
                            value={quantite}
                            onChange={(e) => setQuantite(Number(e.target.value) || 0)}
                            InputProps={{ inputProps: { min: 1 } }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                backgroundColor: '#fff',
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Prix Unitaire"
                            type="number"
                            value={prixUnitaire}
                            onChange={(e) => setPrixUnitaire(Number(e.target.value) || 0)}
                            InputProps={{ inputProps: { min: 0 } }}
                            sx={{ 
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '8px',
                                backgroundColor: '#fff',
                              }
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddLigne}
                            disabled={!selectedArticle || quantite <= 0 || prixUnitaire <= 0}
                            startIcon={<Add />}
                            sx={{ 
                              borderRadius: '8px',
                              backgroundColor: '#1976d2',
                              '&:hover': { backgroundColor: '#1565c0' }
                            }}
                          >
                            Ajouter l'article
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Liste des articles */}
                <Grid item xs={12}>
                  <Card sx={{ backgroundColor: '#f8f9fa', boxShadow: 2 }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                        Articles Demmandés
                      </Typography>
                      <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
                        <Table>
                          <TableHead>
                            <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                              <TableCell sx={{ fontWeight: 'bold' }}>Article</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Quantité</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Prix Unitaire</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Total HT</TableCell>
                              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {editLignes.map((ligne, index) => (
                              <TableRow 
                                key={index}
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: '#f5f5f5',
                                    transition: 'background-color 0.2s'
                                  }
                                }}
                              >
                                <TableCell>
                                  <Autocomplete
                                    options={articles}
                                    getOptionLabel={(option) => option?.libelle || ''}
                                    value={ligne.article}
                                    onChange={(event, newValue) => {
                                      const newLignes = [...editLignes];
                                      newLignes[index].article = newValue;
                                      if (newValue) {
                                        newLignes[index].prix_unitaire = Number(newValue.prix_net) || 0;
                                        newLignes[index].total_ht = newLignes[index].quantite * newLignes[index].prix_unitaire;
                                        newLignes[index].total_ttc = newLignes[index].total_ht * 1.2;
                                      }
                                      setEditLignes(newLignes);
                                    }}
                                    renderInput={(params) => (
                                      <TextField
                                        {...params}
                                        label="Article"
                                        required
                                        error={!ligne.article}
                                        helperText={!ligne.article ? "L'article est requis" : ""}
                                        sx={{ 
                                          '& .MuiOutlinedInput-root': {
                                            borderRadius: '8px',
                                            backgroundColor: '#fff',
                                          }
                                        }}
                                      />
                                    )}
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    fullWidth
                                    type="number"
                                    value={ligne.quantite}
                                    onChange={(e) => handleLigneChange(index, "quantite", Number(e.target.value) || 0)}
                                    InputProps={{ inputProps: { min: 1 } }}
                                    sx={{ 
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        backgroundColor: '#fff',
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <TextField
                                    fullWidth
                                    type="number"
                                    value={ligne.prix_unitaire}
                                    onChange={(e) => handleLigneChange(index, "prix_unitaire", Number(e.target.value) || 0)}
                                    InputProps={{ inputProps: { min: 0 } }}
                                    sx={{ 
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        backgroundColor: '#fff',
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell>{(Number(ligne.total_ht) || 0).toFixed(2)} TND</TableCell>
                                <TableCell>
                                  <IconButton 
                                    color="error" 
                                    onClick={() => handleDeleteLigne(index)}
                                    sx={{ 
                                      '&:hover': { 
                                        backgroundColor: 'rgba(211, 47, 47, 0.04)',
                                      }
                                    }}
                                  >
                                    <Delete />
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
                  <Card sx={{ backgroundColor: '#f8f9fa', boxShadow: 2 }}>
                    <CardContent>
                      <Grid container spacing={2} justifyContent="flex-end">
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                            Total HT: {(Number(devis.total_hors_Taxe) || 0).toFixed(2)} TND
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6} md={4}>
                          <Typography variant="h6" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                            Total TTC: {(Number(devis.total_ttc) || 0).toFixed(2)} TND
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Boutons d'action */}
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => navigate('/ListeDevisClient')}
                      sx={{ 
                        borderRadius: '8px',
                        borderColor: '#d32f2f',
                        color: '#d32f2f',
                        '&:hover': {
                          borderColor: '#c62828',
                          backgroundColor: 'rgba(211, 47, 47, 0.04)',
                        }
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmit}
                      sx={{ 
                        borderRadius: '8px',
                        backgroundColor: '#1976d2',
                        '&:hover': { backgroundColor: '#1565c0' }
                      }}
                    >
                      Enregistrer
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </Box>

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
            Le Devis a été modifié avec succès !
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
}