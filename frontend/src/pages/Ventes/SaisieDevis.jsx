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
  Fade,
  Chip,
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
  ShoppingCart as ShoppingCartIcon,
  Inventory as InventoryIcon,
  AddCircleOutline as AddCircleOutlineIcon,
  Assignment as AssignmentIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { styled } from '@mui/material/styles';

// Styled components pour le design moderne unifié
const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  }
}));

export default function SaisieDevis() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  const [depots, setDepots] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedDepot, setSelectedDepot] = useState(null);
  const [dateDevis, setDateDevis] = useState(new Date());
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
    if (!selectedClient || !selectedDepot || lignes.length === 0) {
      setSnackbarSeverity("error");
      setSnackbarMessage("Client, dépôt et au moins une ligne sont requis");
      setOpenSnackbar(true);
      return;
    }
    try {
      const devis = {
        client: selectedClient,
        depot: selectedDepot,
        dateDevis:dateDevis.toISOString(),
        lignes: lignes.map(ligne => ({
          articleId: ligne.article._id,
          quantite: ligne.quantite,
          prix_unitaire: ligne.prix_unitaire,
          tva: ligne.tva,
          remise: ligne.remise,
          dc: ligne.dc,
          fodec: ligne.fodec,
          prix_uTTC: ligne.prix_uTTC,
          total: ligne.total
        })),
        totalHT,
        totalTTC,
      };
          console.log("Sending devis data:", devis); // For debugging


      await axios.post("http://localhost:5000/ventes/devis/create", devis);
      setSnackbarSeverity("success");
      setSnackbarMessage("Devis créé avec succès");
      setOpenSnackbar(true);
      setTimeout(() => {
 navigate("/ListeDevisClient");
      }, 1500);
     
    } catch (error) {
      console.error("Erreur lors de la création du devis:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("Erreur lors de la création du devis");
      setOpenSnackbar(true);
    }
  };

  const handleReset = () => {
    setSelectedClient(null);
    setSelectedDepot(null);
    setDateDevis(new Date());
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
          <CardContent sx={{ p: 3 }}>
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
              <AssignmentIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                Devis Client
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Créez et gérez vos devis clients facilement
              </Typography>
            </Box>

            {/* Section Client intégrée */}
            <Fade in={true} timeout={800}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
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
                    Informations Client
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />
                <Grid container spacing={3} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <TextField
                      fullWidth
                      label="Date de devis"
                      type="date"
                      value={dateDevis.toISOString().split('T')[0]}
                      onChange={(e) => setDateDevis(new Date(e.target.value))}
                      InputLabelProps={{ shrink: true }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarTodayIcon sx={{ color: '#2c3e50' }} />
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
                                <PersonIcon sx={{ color: '#2c3e50' }} />
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
              </Box>
            </Fade>

            {/* Section Articles intégrée */}
            <Fade in={true} timeout={1000}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <InventoryIcon sx={{
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
                    Sélection d'Articles
                  </Typography>
                </Box>
                <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />
                <Grid container spacing={3} alignItems="center">
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
                                <InventoryIcon sx={{ color: '#95a5a6' }} />
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                boxShadow: '0 4px 12px rgba(149, 165, 166, 0.15)'
                              },
                              '&.Mui-focused': {
                                boxShadow: '0 4px 12px rgba(149, 165, 166, 0.25)'
                              }
                            }
                          }}
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
                            <AttachMoneyIcon sx={{ color: '#95a5a6' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(149, 165, 166, 0.15)'
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(149, 165, 166, 0.25)'
                          }
                        }
                      }}
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
                            <AttachMoneyIcon sx={{ color: '#95a5a6' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#f8f9fa'
                        }
                      }}
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
                            <AttachMoneyIcon sx={{ color: '#95a5a6' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          backgroundColor: '#f8f9fa'
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={1}>
                    <Tooltip title="Ajouter cette ligne au devis">
                      <IconButton
                        sx={{
                          background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                          color: 'white',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%)',
                            transform: 'scale(1.1)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                        onClick={handleAddLigne}
                      >
                        <AddCircleOutlineIcon fontSize="large" />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Box>
            </Fade>

            {/* Section Tableau des Lignes intégrée */}
            {lignes.length > 0 && (
              <Fade in={true} timeout={1200}>
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <AssignmentIcon sx={{
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
                      Lignes de Devis ({lignes.length})
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 3, background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)' }} />

                  <TableContainer component={Paper} sx={{
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden'
                  }}>
                    <Table>
                      <TableHead sx={{
                        background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)'
                      }}>
                        <TableRow>
                          <TableCell sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            Article
                          </TableCell>
                          <TableCell sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            Quantité
                          </TableCell>
                          <TableCell sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            Prix Unitaire
                          </TableCell>
                          <TableCell sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            Prix TTC
                          </TableCell>
                          <TableCell sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            Total
                          </TableCell>
                          <TableCell sx={{
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '1rem'
                          }}>
                            Action
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {lignes.map((ligne, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              '&:nth-of-type(odd)': {
                                backgroundColor: '#f8f9fa',
                              },
                              '&:hover': {
                                backgroundColor: '#e3f2fd',
                                transform: 'scale(1.01)',
                                transition: 'all 0.2s ease'
                              },
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <TableCell sx={{ fontWeight: 'medium' }}>
                              {ligne.libelle}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={ligne.quantite}
                                size="small"
                                sx={{
                                  background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'medium' }}>
                              {ligne.prix_unitaire.toFixed(2)} DT
                            </TableCell>
                            <TableCell sx={{ fontWeight: 'medium' }}>
                              {ligne.prix_uTTC.toFixed(2)} DT
                            </TableCell>
                            <TableCell sx={{
                              fontWeight: 'bold',
                              color: '#667eea'
                            }}>
                              {ligne.total.toFixed(2)} DT
                            </TableCell>
                            <TableCell>
                              <Tooltip title="Supprimer cette ligne">
                                <IconButton
                                  sx={{
                                    color: '#f44336',
                                    '&:hover': {
                                      backgroundColor: '#ffebee',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                  onClick={() => handleRemoveLigne(index)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Fade>
            )}

            {/* Section Totaux et Actions intégrée */}
            <Box sx={{ mt: 4 }}>
              <Grid container spacing={3} alignItems="center" justifyContent="space-between">
                {/* Totaux */}
                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={3}>
                    <Box sx={{
                      textAlign: 'center',
                      p: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                      color: 'white',
                      boxShadow: '0 4px 20px rgba(149, 165, 166, 0.3)'
                    }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
                        Total HT
                      </Typography>
                      <Typography variant="h5" sx={{
                        fontWeight: 'bold',
                        color: 'white'
                      }}>
                        {totalHT.toFixed(2)} DT
                      </Typography>
                    </Box>

                    <Box sx={{
                      textAlign: 'center',
                      p: 2,
                      borderRadius: 2,
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      color: 'white',
                      boxShadow: '0 4px 20px rgba(52, 73, 94, 0.3)'
                    }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 'medium' }}>
                        Total TTC
                      </Typography>
                      <Typography variant="h5" sx={{
                        fontWeight: 'bold'
                      }}>
                        {totalTTC.toFixed(2)} DT
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* Boutons d'action */}
                <Grid item xs={12} md={6}>
                  <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      startIcon={<ClearIcon />}
                      onClick={handleReset}
                      sx={{
                        borderColor: '#95a5a6',
                        color: '#95a5a6',
                        '&:hover': {
                          borderColor: '#7f8c8d',
                          color: '#7f8c8d',
                          backgroundColor: 'rgba(149, 165, 166, 0.1)'
                        }
                      }}
                    >
                      Réinitialiser
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={handleSubmit}
                      sx={{
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        color: 'white',
                        px: 4,
                        py: 1.5,
                        borderRadius: 2,
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        boxShadow: '0 8px 25px rgba(52, 73, 94, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 35px rgba(52, 73, 94, 0.5)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Enregistrer
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Box>
          </CardContent>
        </ModernCard>
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