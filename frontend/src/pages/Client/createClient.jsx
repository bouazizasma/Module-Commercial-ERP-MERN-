import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Grid,
  Box,
  Card,
  MenuItem,
  Checkbox,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  LinearProgress
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Phone as PhoneIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  LocationOn as LocationOn,
  Business as Business,
  AccountBalance as AccountBalance,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Save as SaveIcon
} from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";
import { useNavigate } from "react-router-dom";

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  }
}));

export default function CreateClient() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    nom_prenom: "",
    matricule_fiscale: "",
    adresse: "",
    telephone: ["", ""],
    register_commerce: "",
    solde_initial: "",
    montant_rapprochement: "",
    code_rapprochement: "",
    rapBl: "",
    codeSecteur: "",
    libelleSecteur: "",
    codeRegion: "",
    libelleRegion: "",
    solde_initial_bl: "",
    montant_reglement_bl: "",
    taux_retenu: "",
  });

  const [secteurs, setSecteurs] = useState([]);
  const [regions, setRegions] = useState([]);
  const [banques, setBanques] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([{
    banque: '',
    RIB: '',
    adresseBanque: '',
    isPrimary: false
  }]);

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
    const fetchData = async () => {
      try {
        setLoading(true);
        const [SecteursResponse, BanquesResponse] = await Promise.all([
          axios.get("http://localhost:5000/secteur/Secteurs"),
          axios.get("http://localhost:5000/banqueClient/AllBanques")
        ]);
        setSecteurs(SecteursResponse.data);
        setBanques(BanquesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
        showSnackbar('Erreur lors du chargement des données', 'error');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fonction pour charger les régions par secteur
  const fetchRegionsBySecteur = async (secteurId) => {
    try {
      const response = await axios.get(`http://localhost:5000/client/secteur/${secteurId}/regions`);
      setRegions(response.data);
    } catch (error) {
      console.error("Erreur lors du chargement des régions :", error);
      setRegions([]);
      if (error.response?.status !== 404) {
        showSnackbar('Erreur lors du chargement des régions', 'error');
      }
    }
  };

  const handleBankAccountChange = (index, field, value) => {
    const updatedAccounts = [...bankAccounts];
    updatedAccounts[index][field] = value;
    
    if (field === 'isPrimary' && value) {
      updatedAccounts.forEach((acc, i) => {
        if (i !== index) acc.isPrimary = false;
      });
    }
    
    setBankAccounts(updatedAccounts);
  };

  const addBankAccount = () => {
    setBankAccounts([...bankAccounts, {
      banque: '',
      RIB: '',
      adresseBanque: '',
      isPrimary: false
    }]);
  };

  const removeBankAccount = (index) => {
    const updatedAccounts = [...bankAccounts];
    updatedAccounts.splice(index, 1);
    setBankAccounts(updatedAccounts);
  };

  const createClient = async () => {
    try {
      setLoading(true);
      const clientData = {
        ...formData,
        bankAccounts: bankAccounts.filter(acc => acc.banque && acc.RIB)
      };

      await axios.post("http://localhost:5000/client/newC", clientData);
      showSnackbar("Client créé avec succès !");
      setTimeout(() => {
        navigate("/Client");
      }, 1500);
    } catch (error) {
      console.error("Erreur:", error);
      showSnackbar("Erreur lors de la création du client", 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "telephone1" || name === "telephone2") {
      setFormData((prev) => {
        const updatedTelephones = [...prev.telephone];
        if (name === "telephone1") {
          updatedTelephones[0] = value;
        } else {
          updatedTelephones[1] = value;
        }
        return { ...prev, telephone: updatedTelephones };
      });
    } else if (name === "codeSecteur" || name === "libelleSecteur") {
      const selectedSecteur = secteurs.find(secteur =>
        name === "codeSecteur"
          ? secteur.codeSecteur === value
          : secteur.libelle === value
      );

      setFormData(prev => ({
        ...prev,
        [name]: value,
        codeSecteur: selectedSecteur?.codeSecteur || (name === "codeSecteur" ? value : prev.codeSecteur),
        libelleSecteur: selectedSecteur?.libelle || (name === "libelleSecteur" ? value : prev.libelleSecteur),
        // Réinitialiser la région quand le secteur change
        codeRegion: "",
        libelleRegion: ""
      }));

      // Charger les régions pour le secteur sélectionné
      if (selectedSecteur) {
        fetchRegionsBySecteur(selectedSecteur._id);
      } else {
        setRegions([]);
      }
    } else if (name === "codeRegion" || name === "libelleRegion") {
      const selectedRegion = regions.find(region =>
        name === "codeRegion"
          ? region.codeRegion === value
          : region.libelle === value
      );

      setFormData(prev => ({
        ...prev,
        [name]: value,
        codeRegion: selectedRegion?.codeRegion || (name === "codeRegion" ? value : prev.codeRegion),
        libelleRegion: selectedRegion?.libelle || (name === "libelleRegion" ? value : prev.libelleRegion)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
              <PersonIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                Nouveau Client
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Créez un nouveau client et gérez ses informations
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
              <PersonIcon sx={{
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
                    name="nom_prenom"
                    label="Nom & Prénom"
                    fullWidth
                    size="small"
                    value={formData.nom_prenom}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon fontSize="small" sx={{ color: '#2c3e50' }} />
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
                          <Business fontSize="small" sx={{ color: '#2c3e50' }} />
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
                          <LocationOn fontSize="small" sx={{ color: '#2c3e50' }} />
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
                    name="telephone1"
                    label="Téléphone 1"
                    fullWidth
                    size="small"
                    value={formData.telephone[0] || ''}
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
                    name="telephone2"
                    label="Téléphone 2"
                    fullWidth
                    size="small"
                    value={formData.telephone[1] || ''}
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
                    select
                    fullWidth
                    size="small"
                    label="Code Secteur"
                    name="codeSecteur"
                    value={formData.codeSecteur}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon fontSize="small" sx={{ color: '#2c3e50' }} />
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
                  >
                    {secteurs.map((secteur) => (
                      <MenuItem key={secteur._id} value={secteur.codeSecteur}>
                        {secteur.codeSecteur}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Libellé Secteur"
                    name="libelleSecteur"
                    value={formData.libelleSecteur}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon fontSize="small" sx={{ color: '#2c3e50' }} />
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
                  >
                    {secteurs.map((secteur) => (
                      <MenuItem key={secteur._id} value={secteur.libelle}>
                        {secteur.libelle}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Libellé Région"
                    name="libelleRegion"
                    value={formData.libelleRegion}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon fontSize="small" sx={{ color: '#2c3e50' }} />
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
                  >
                    {regions.map((region) => (
                      <MenuItem key={region._id} value={region.libelle}>
                        {region.libelle}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

            {/* SECTION INFORMATIONS COMPLEMENTAIRES */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 4 }}>
              <AccountBalance sx={{
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
                Informations Complémentaires
              </Typography>
            </Box>
            <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />

            <Accordion defaultExpanded={!isMobile} sx={{
              boxShadow: 'none',
              background: 'transparent',
              '&:before': { display: 'none' },
              mb: 3
            }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#2c3e50' }} />}
                sx={{
                  background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                  borderRadius: 2,
                  color: 'white',
                  mb: 2,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%)',
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ExpandMoreIcon sx={{ mr: 1, color: 'white' }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
                    Détails Financiers
                  </Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ pt: 2 }}>
                <Grid container spacing={3}>
                  {[
                    { name: "register_commerce", label: "Register Commerce" },
                    { name: "solde_initial", label: "Solde Initial" },
                    { name: "montant_rapprochement", label: "Montant Rapprochement" },
                    { name: "code_rapprochement", label: "Code Rapprochement" },
                    { name: "rapBl", label: "Rapprochement BL" },
                    { name: "solde_initial_bl", label: "Solde Initial BL" },
                    { name: "montant_reglement_bl", label: "Montant Règlement BL" },
                    { name: "taux_retenu", label: "Taux Retenu" }
                  ].map((field, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <TextField
                        name={field.name}
                        label={field.label}
                        fullWidth
                        size="small"
                        value={formData[field.name]}
                        onChange={handleChange}
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
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>

            {/* SECTION COMPTES BANCAIRES */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, mt: 4 }}>
              <AccountBalance sx={{
                fontSize: 32,
                mr: 2,
                background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
                borderRadius: '50%',
                p: 1,
                color: 'white'
              }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #e67e22 0%, #d35400 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Comptes Bancaires
              </Typography>
            </Box>
            <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #e67e22, #d35400)' }} />

              {bankAccounts.map((account, index) => (
                <Card key={index} variant="outlined" sx={{
                  mb: 2,
                  borderRadius: 3,
                  borderColor: account.isPrimary ? '#2c3e50' : 'divider',
                  borderWidth: account.isPrimary ? 2 : 1,
                  background: account.isPrimary
                    ? 'linear-gradient(135deg, #ecf0f1 0%, #bdc3c7 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardContent sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Banque"
                          value={account.banque}
                          onChange={(e) => handleBankAccountChange(index, 'banque', e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Business fontSize="small" sx={{ color: '#2c3e50' }} />
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
                        >
                          {banques.map((banque) => (
                            <MenuItem key={banque._id} value={banque._id}>
                              {banque.libelle} ({banque.code_banque})
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="RIB"
                          value={account.RIB}
                          onChange={(e) => handleBankAccountChange(index, 'RIB', e.target.value)}
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

                      <Grid item xs={12} sm={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                          <Tooltip title="Compte principal">
                            <Box sx={{
                              display: 'flex',
                              alignItems: 'center',
                              p: 1,
                              borderRadius: 2,
                              background: account.isPrimary
                                ? 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
                                : 'transparent',
                              color: account.isPrimary ? 'white' : 'inherit',
                              transition: 'all 0.3s ease'
                            }}>
                              <Checkbox
                                checked={account.isPrimary}
                                onChange={(e) => handleBankAccountChange(index, 'isPrimary', e.target.checked)}
                                size="small"
                                sx={{
                                  color: account.isPrimary ? 'white' : 'primary.main',
                                  '&.Mui-checked': {
                                    color: account.isPrimary ? 'white' : 'primary.main'
                                  }
                                }}
                              />
                              <Typography variant="caption" sx={{
                                color: account.isPrimary ? 'white' : 'text.secondary',
                                fontWeight: account.isPrimary ? 'bold' : 'normal'
                              }}>
                                Principal
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Adresse Banque"
                          value={account.adresseBanque}
                          onChange={(e) => handleBankAccountChange(index, 'adresseBanque', e.target.value)}
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

                      <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Supprimer ce compte">
                          <IconButton
                            onClick={() => removeBankAccount(index)}
                            size="small"
                            sx={{
                              color: '#e74c3c',
                              '&:hover': {
                                backgroundColor: '#ffebee',
                                transform: 'scale(1.1)',
                                color: '#c0392b'
                              },
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}

              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={addBankAccount}
                sx={{
                  mt: 2,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                  fontWeight: 'bold',
                  px: 3,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(149, 165, 166, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Ajouter un compte
              </Button>

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
                onClick={() => navigate("/Client")}
                size="large"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  borderColor: '#95a5a6',
                  color: '#95a5a6',
                  fontWeight: 'bold',
                  '&:hover': {
                    borderColor: '#7f8c8d',
                    backgroundColor: 'rgba(149, 165, 166, 0.1)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(149, 165, 166, 0.3)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Annuler
              </Button>
              <Button
                onClick={createClient}
                variant="contained"
                startIcon={<SaveIcon />}
                disabled={loading}
                size="large"
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                  color: 'white',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 15px rgba(52, 73, 94, 0.3)',
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
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </Box>
          </CardContent>
        </ModernCard>

        {/* Snackbar pour les notifications modernisé */}
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