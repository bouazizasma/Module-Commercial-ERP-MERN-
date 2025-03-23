import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  Fade,
} from "@mui/material";
import {
  Business,
  Phone,
  Fax,
  LocationOn,
  Description,
  AccountBalance,
  ArrowBack,
  Save,
  CheckCircle,
} from "@mui/icons-material";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";
import { useParams, useNavigate } from "react-router-dom";

export default function UpdateFournisseur() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [formData, setFormData] = useState({
    raison_sociale: "",
    matricule_fiscale: "",
    adresse: "",
    telephone: [],
    fax: "",
    register_commerce: "",
    solde_initial: "",
    montant_rapprochement: "",
    code_rapprochement: "",
    rapebe: "",
    solde_initial_ebe: "",
    montant_paie_ebe: "",
    taux_retenu: "",
  });

  useEffect(() => {
    const fetchFournisseur = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/fournisseur/${id}`);
        setFormData(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération :", error);
      }
    };
    fetchFournisseur();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/fournisseur/${id}`, formData);
      setOpenSnackbar(true);
      setTimeout(() => {
        navigate("/fournisseur");
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du fournisseur:", error);
      alert("Une erreur s'est produite lors de la mise à jour du fournisseur.");
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

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
                  Modification du Fournisseur
                </Typography>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate('/fournisseur')}
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

              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Informations Générales */}
                  <Grid item xs={12}>
                    <Card sx={{ backgroundColor: '#f8f9fa', boxShadow: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                          <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Informations Générales
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Raison Sociale"
                              name="raison_sociale"
                              value={formData.raison_sociale}
                              onChange={handleChange}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Business color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Matricule Fiscale"
                              name="matricule_fiscale"
                              value={formData.matricule_fiscale}
                              onChange={handleChange}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Description color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Coordonnées */}
                  <Grid item xs={12}>
                    <Card sx={{ backgroundColor: '#f8f9fa', boxShadow: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                          <LocationOn sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Coordonnées
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Adresse"
                              name="adresse"
                              value={formData.adresse}
                              onChange={handleChange}
                              multiline
                              rows={2}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LocationOn color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Téléphone"
                              name="telephone"
                              value={formData.telephone}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Phone color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Fax"
                              name="fax"
                              value={formData.fax}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Fax color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                }
                              }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Informations Financières */}
                  <Grid item xs={12}>
                    <Card sx={{ backgroundColor: '#f8f9fa', boxShadow: 2 }}>
                      <CardContent>
                        <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                          <AccountBalance sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Informations Financières
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Solde Initial"
                              name="solde_initial"
                              type="number"
                              value={formData.solde_initial}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AccountBalance color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label="Montant Rapprochement"
                              name="montant_rapprochement"
                              type="number"
                              value={formData.montant_rapprochement}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AccountBalance color="primary" />
                                  </InputAdornment>
                                ),
                              }}
                              sx={{ 
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                  backgroundColor: '#fff',
                                }
                              }}
                            />
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
                        onClick={() => navigate('/fournisseur')}
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
                        type="submit"
                        variant="contained"
                        color="primary"
                        startIcon={<Save />}
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
              </form>
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
            Le fournisseur a été modifié avec succès !
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
}