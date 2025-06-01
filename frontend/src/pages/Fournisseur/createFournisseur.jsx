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
  useMediaQuery,
  useTheme,
  Divider
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
  Close
} from "@mui/icons-material";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";
import { useNavigate } from "react-router-dom";

export default function CreateFournisseur() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [formData, setFormData] = useState({
    raison_sociale: "",
    matricule_fiscale: "",
    adresse: "",
    telephone: "",
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
      await axios.post("http://localhost:5000/fournisseur/newF", formData);
      setOpenSnackbar(true);
      setTimeout(() => navigate("/fournisseur"), 1500);
    } catch (error) {
      console.error("Erreur lors de la création du fournisseur:", error);
    }
  };

  return (
    <>
      <Navbar />
      <Box height={70} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: isMobile ? 2 : 3, 
          maxHeight: "calc(100vh - 70px)",
          overflow: "auto"
        }}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <CardContent>
              {/* Header */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  <Business sx={{ 
                    mr: 1, 
                    verticalAlign: 'middle', 
                    color: 'primary.main' 
                  }} />
                  Nouveau Fournisseur
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/fournisseur')}
                  startIcon={<ArrowBack />}
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    borderRadius: '12px',
                    textTransform: 'none',
                    px: 3
                  }}
                >
                  Retour
                </Button>
              </Box>

              <Divider sx={{ mb: 4 }} />

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  {/* Informations Générales */}
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ 
                          mb: 2, 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <Business color="primary" fontSize="small" />
                          Informations Générales
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Raison Sociale"
                              name="raison_sociale"
                              value={formData.raison_sociale}
                              onChange={handleChange}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Business color="action" fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Matricule Fiscale"
                              name="matricule_fiscale"
                              value={formData.matricule_fiscale}
                              onChange={handleChange}
                              required
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Description color="action" fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Coordonnées */}
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ 
                          mb: 2, 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <LocationOn color="primary" fontSize="small" />
                          Coordonnées
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Adresse"
                              name="adresse"
                              value={formData.adresse}
                              onChange={handleChange}
                              multiline
                              rows={2}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <LocationOn color="action" fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Téléphone"
                              name="telephone"
                              value={formData.telephone}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Phone color="action" fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Fax"
                              name="fax"
                              value={formData.fax}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Fax color="action" fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Informations Financières */}
                  <Grid item xs={12}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ 
                          mb: 2, 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}>
                          <AccountBalance color="primary" fontSize="small" />
                          Informations Financières
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Solde Initial"
                              name="solde_initial"
                              type="number"
                              value={formData.solde_initial}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AccountBalance color="action" fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              size="small"
                              label="Montant Rapprochement"
                              name="montant_rapprochement"
                              type="number"
                              value={formData.montant_rapprochement}
                              onChange={handleChange}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <AccountBalance color="action" fontSize="small" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Boutons d'action */}
                  <Grid item xs={12}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end', 
                      gap: 2,
                      mt: 2
                    }}>
                      <Button
                        variant="outlined"
                        onClick={() => navigate('/fournisseur')}
                        size={isMobile ? "small" : "medium"}
                        sx={{ 
                          borderRadius: '12px',
                          textTransform: 'none',
                          px: 3
                        }}
                      >
                        Annuler
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        size={isMobile ? "small" : "medium"}
                        sx={{ 
                          borderRadius: '12px',
                          textTransform: 'none',
                          px: 3
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

      {/* Snackbar modernisé */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="success"
          icon={<CheckCircle fontSize="inherit" />}
          sx={{ 
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            alignItems: 'center'
          }}
        >
          Fournisseur créé avec succès
        </Alert>
      </Snackbar>
    </>
  );
}