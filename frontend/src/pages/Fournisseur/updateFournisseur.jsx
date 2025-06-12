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
  InputAdornment,
  useMediaQuery,
  useTheme,
  Divider,
  Alert,
  Snackbar,
  LinearProgress
} from "@mui/material";
import {
  Business as BusinessIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  AccountBalance as AccountBalanceIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
  Fax as FaxIcon
} from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";
import { useParams, useNavigate } from "react-router-dom";

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  }
}));

export default function UpdateFournisseur() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    const fetchFournisseur = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:5000/fournisseur/${id}`);
        setFormData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors de la récupération du fournisseur :", error);
        showSnackbar('Erreur lors du chargement des données', 'error');
        setLoading(false);
      }
    };
    fetchFournisseur();
  }, [id]);

  const updateFournisseur = async () => {
    try {
      setLoading(true);
      const dataToSend = { ...formData };
      delete dataToSend._id;
      delete dataToSend.__v;

      await axios.put(`http://localhost:5000/fournisseur/${id}`, dataToSend);
      showSnackbar("Fournisseur mis à jour avec succès !");
      setTimeout(() => {
        navigate("/fournisseur");
      }, 1500);
    } catch (error) {
      console.error("Erreur:", error);
      showSnackbar("Erreur lors de la mise à jour du fournisseur", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      <Navbar />
      <Box height={64} />
      <Box sx={{
        display: "flex",
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        minHeight: "calc(100vh - 64px)",
        overflow: "hidden"
      }}>
        <Sidenav />
        <Box component="main" sx={{
          flexGrow: 1,
          p: 3,
          overflow: "auto",
          height: "calc(100vh - 64px)",
          width:"1000px",
          "&::-webkit-scrollbar": {
            width: "8px",
            backgroundColor: "rgba(0,0,0,0.1)"
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: "8px",
            background: "linear-gradient(135deg, #495057 0%, #6c757d 100%)"
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(0,0,0,0.05)"
          }
        }}>

        {/* Carte consolidée moderne unifiée */}
        <ModernCard sx={{
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
          border: '1px solid rgba(255,255,255,0.2)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
          }
        }}>
          <CardContent sx={{ p: 4 }}>
            {/* Header principal intégré */}
            <Box sx={{
              textAlign: 'center',
              mb: 4,
              p: 3,
              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              color: 'white'
            }}>
              <EditIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                Modifier Fournisseur
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Modifiez les informations du fournisseur
              </Typography>
            </Box>

            {loading && (
              <LinearProgress sx={{
                mb: 3,
                background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #2c3e50, #34495e)'
                }
              }} />
            )}

            {/* SECTION INFORMATIONS GENERALES */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 4 }}>
              <BusinessIcon sx={{
                fontSize: 32,
                mr: 2,
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                borderRadius: '50%',
                p: 1,
                color: 'white'
              }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Informations Générales
              </Typography>
            </Box>
            <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="raison_sociale"
                    label="Raison Sociale"
                    fullWidth
                    size="small"
                    value={formData.raison_sociale}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon fontSize="small" sx={{ color: '#2c3e50' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.15)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.25)'
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="matricule_fiscale"
                    label="Matricule Fiscale"
                    fullWidth
                    size="small"
                    value={formData.matricule_fiscale}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BusinessIcon fontSize="small" sx={{ color: '#2c3e50' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.15)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.25)'
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="adresse"
                    label="Adresse"
                    fullWidth
                    size="small"
                    value={formData.adresse}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon fontSize="small" sx={{ color: '#2c3e50' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.15)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.25)'
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="telephone"
                    label="Téléphone"
                    fullWidth
                    size="small"
                    value={formData.telephone}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon fontSize="small" sx={{ color: '#2c3e50' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.15)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.25)'
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="fax"
                    label="Fax"
                    fullWidth
                    size="small"
                    value={formData.fax}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaxIcon fontSize="small" sx={{ color: '#2c3e50' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.15)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.25)'
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>

            {/* SECTION INFORMATIONS FINANCIERES */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 4 }}>
              <AccountBalanceIcon sx={{
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
                Informations Financières
              </Typography>
            </Box>
            <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="solde_initial"
                    label="Solde Initial"
                    fullWidth
                    size="small"
                    type="number"
                    value={formData.solde_initial}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountBalanceIcon fontSize="small" sx={{ color: '#2c3e50' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.15)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.25)'
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="montant_rapprochement"
                    label="Montant Rapprochement"
                    fullWidth
                    size="small"
                    type="number"
                    value={formData.montant_rapprochement}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountBalanceIcon fontSize="small" sx={{ color: '#2c3e50' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.15)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.25)'
                        }
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="taux_retenu"
                    label="Taux Retenu"
                    fullWidth
                    size="small"
                    type="number"
                    value={formData.taux_retenu}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <AccountBalanceIcon fontSize="small" sx={{ color: '#2c3e50' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.15)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.25)'
                        }
                      }
                    }}
                  />
                </Grid>
              </Grid>

            {/* BOUTONS D'ACTION INTEGRES */}
            <Divider sx={{ my: 4, background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 3,
              mt: 4,
              mb: 2
            }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/fournisseur')}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  borderColor: '#95a5a6',
                  color: '#95a5a6',
                  fontWeight: 'bold',
                  '&:hover': {
                    borderColor: '#7f8c8d',
                    backgroundColor: '#f8f9fa',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(149, 165, 166, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Annuler
              </Button>
              <Button
                variant="contained"
                onClick={updateFournisseur}
                startIcon={<SaveIcon />}
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                  fontWeight: 'bold',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(52, 73, 94, 0.4)'
                  },
                  '&:disabled': {
                    background: '#e0e0e0',
                    color: '#9e9e9e'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                {loading ? 'Mise à jour...' : 'Mettre à jour'}
              </Button>
            </Box>
          </CardContent>
        </ModernCard>

        {/* Snackbar pour les notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            variant="filled"
            sx={{
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              '&.MuiAlert-filledSuccess': {
                background: 'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
              },
              '&.MuiAlert-filledError': {
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              }
            }}
            iconMapping={{
              success: <CheckCircleIcon fontSize="inherit" />,
              error: <CancelIcon fontSize="inherit" />
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
    </>
  );
}