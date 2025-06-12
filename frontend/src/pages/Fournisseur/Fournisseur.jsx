import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  InputAdornment,
  Checkbox,
  Box,
  Grid,
  Typography,
  CardContent,
  Card,
  Stack,
  Chip,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme,
  Divider,
  Alert,
  Snackbar,
  LinearProgress
} from "@mui/material";
import {
  Visibility,
  Delete,
  Edit,
  Search,
  Business,
  Phone,
  LocationOn,
  Email,
  Badge,
  Add,
  Close,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";
import { useNavigate } from "react-router-dom";

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  }
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  }
}));

export default function Fournisseur() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFournisseurs, setSelectedFournisseurs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const itemsPerPage = 4;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // États pour les popups de suppression
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    fournisseurId: null,
    fournisseurName: ''
  });

  const [deleteMultipleDialog, setDeleteMultipleDialog] = useState({
    open: false,
    count: 0
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchFournisseurs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/fournisseur/fournisseurs");
      setFournisseurs(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching fournisseurs:", error);
      showSnackbar('Erreur lors de la récupération des fournisseurs', 'error');
      setLoading(false);
    }
  };

  // Fonctions pour ouvrir les popups de suppression
  const handleOpenDeleteDialog = (fournisseur) => {
    setDeleteDialog({
      open: true,
      fournisseurId: fournisseur._id,
      fournisseurName: fournisseur.raison_sociale
    });
  };

  const handleOpenDeleteMultipleDialog = () => {
    setDeleteMultipleDialog({
      open: true,
      count: selectedFournisseurs.length
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      fournisseurId: null,
      fournisseurName: ''
    });
  };

  const handleCloseDeleteMultipleDialog = () => {
    setDeleteMultipleDialog({
      open: false,
      count: 0
    });
  };

  const deleteFournisseur = async () => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/fournisseur/${deleteDialog.fournisseurId}`);
      showSnackbar('Fournisseur supprimé avec succès');
      fetchFournisseurs();
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting fournisseur:", error);
      showSnackbar('Erreur lors de la suppression', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteSelectedFournisseurs = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedFournisseurs.map((id) => axios.delete(`http://localhost:5000/fournisseur/${id}`)));
      showSnackbar(`${selectedFournisseurs.length} fournisseur(s) supprimé(s) avec succès`);
      fetchFournisseurs();
      setSelectedFournisseurs([]);
      setCurrentPage(1);
      handleCloseDeleteMultipleDialog();
    } catch (error) {
      console.error("Error deleting fournisseurs:", error);
      showSnackbar('Erreur lors de la suppression', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

 const filteredFournisseurs = fournisseurs.filter((fournisseur) => {
  const searchTermLower = searchTerm.toLowerCase();
  return (
    fournisseur.raison_sociale?.toLowerCase().includes(searchTermLower) ||
    fournisseur.matricule_fiscale?.toLowerCase().includes(searchTermLower) ||
    (fournisseur.code && fournisseur.code.toString().toLowerCase().includes(searchTermLower))
  );
});

  const paginatedFournisseurs = filteredFournisseurs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectFournisseur = (id) => {
    if (selectedFournisseurs.includes(id)) {
      setSelectedFournisseurs(selectedFournisseurs.filter((fournisseurId) => fournisseurId !== id));
    } else {
      setSelectedFournisseurs([...selectedFournisseurs, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedFournisseurs.length === filteredFournisseurs.length) {
      setSelectedFournisseurs([]);
    } else {
      setSelectedFournisseurs(filteredFournisseurs.map((fournisseur) => fournisseur._id));
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
              <Business sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                Gestion des Fournisseurs
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Gérez vos fournisseurs et leurs informations
              </Typography>
            </Box>

            {/* Section Recherche et Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Search sx={{
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
                  Recherche et Filtres
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => navigate("/createFournisseur")}
                sx={{
                  borderRadius: 2,
                  height: '35px',
                  background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                  fontWeight: 'bold',
                  px: 3,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(52, 73, 94, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Nouveau Fournisseur
              </Button>
            </Box>
            <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />

            <TextField
              fullWidth
              variant="outlined"
              label="Rechercher un fournisseur"
              placeholder="Rechercher par raison sociale, matricule ou code..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#2c3e50' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 3,
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

            {selectedFournisseurs.length > 0 && (
              <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleOpenDeleteMultipleDialog}
                  startIcon={<Delete />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3,
                    background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(231, 76, 60, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Supprimer ({selectedFournisseurs.length}) fournisseur(s)
                </Button>
              </Box>
            )}

            {/* Section Liste des Fournisseurs */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Business sx={{
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
                Liste des Fournisseurs ({filteredFournisseurs.length})
              </Typography>
            </Box>
            <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />

            {loading ? (
              <LinearProgress sx={{
                my: 2,
                background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #2c3e50, #34495e)'
                }
              }} />
            ) : (
              <>
                <TableContainer component={Paper} sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  overflow: 'hidden'
                }}>
                  <Table size={isMobile ? "small" : "medium"}>
                    <TableHead sx={{
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
                    }}>
                      <TableRow>
                        <TableCell padding="checkbox" sx={{ color: 'white', fontWeight: 'bold' }}>
                          <Checkbox
                            checked={selectedFournisseurs.length === filteredFournisseurs.length && filteredFournisseurs.length > 0}
                            indeterminate={selectedFournisseurs.length > 0 && selectedFournisseurs.length < filteredFournisseurs.length}
                            onChange={handleSelectAll}
                            size="small"
                            sx={{ color: 'white' }}
                          />
                        </TableCell>
                        {!isMobile && <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Code</TableCell>}
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Fournisseur</TableCell>
                        {!isMobile && <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Matricule</TableCell>}
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Contact</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedFournisseurs.length > 0 ? (
                        paginatedFournisseurs.map((fournisseur) => (
                          <TableRow
                            key={fournisseur._id}
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
                            <TableCell padding="checkbox">
                              <Checkbox
                                checked={selectedFournisseurs.includes(fournisseur._id)}
                                onChange={() => handleSelectFournisseur(fournisseur._id)}
                                size="small"
                              />
                            </TableCell>
                            {!isMobile && <TableCell>{fournisseur.code}</TableCell>}
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{
                                  background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                                  color: 'white'
                                }}>
                                  <Business />
                                </Avatar>
                                <Box>
                                  <Typography sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                                    {fournisseur.raison_sociale}
                                  </Typography>
                                  {isMobile && fournisseur.code && (
                                    <Typography variant="caption" color="text.secondary">
                                      Code: {fournisseur.code}
                                    </Typography>
                                  )}
                                </Box>
                              </Stack>
                            </TableCell>
                            {!isMobile && <TableCell>{fournisseur.matricule_fiscale}</TableCell>}
                            <TableCell>
                              {isMobile ? (
                                <Box>
                                  {fournisseur.telephone && (
                                    <Typography variant="body2">
                                      <Phone fontSize="small" sx={{
                                        verticalAlign: 'middle',
                                        mr: 0.5,
                                        color: 'text.secondary'
                                      }} />
                                      {fournisseur.telephone}
                                    </Typography>
                                  )}
                                </Box>
                              ) : (
                                <Stack direction="row" spacing={1} flexWrap="wrap">
                                  {fournisseur.telephone && (
                                    <Chip
                                      label={fournisseur.telephone}
                                      size="small"
                                      icon={<Phone fontSize="small" />}
                                      sx={{
                                        mb: 0.5,
                                        backgroundColor: '#d4edda',
                                        color: '#155724',
                                        border: '1px solid #c3e6cb'
                                      }}
                                    />
                                  )}
                                </Stack>
                              )}
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Voir détails">
                                <ActionButton
                                  onClick={() => {
                                    setSelectedFournisseur(fournisseur);
                                    setIsModalOpen(true);
                                  }}
                                  sx={{
                                    color: '#2c3e50',
                                    '&:hover': {
                                      backgroundColor: '#e3f2fd',
                                      transform: 'scale(1.1)',
                                      color: '#34495e'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <Visibility />
                                </ActionButton>
                              </Tooltip>
                              <Tooltip title="Modifier">
                                <ActionButton
                                  onClick={() => navigate(`/updateFournisseur/${fournisseur._id}`)}
                                  sx={{
                                    color: '#2c3e50',
                                    '&:hover': {
                                      backgroundColor: '#e3f2fd',
                                      transform: 'scale(1.1)',
                                      color: '#34495e'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <Edit />
                                </ActionButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <ActionButton
                                  onClick={() => handleOpenDeleteDialog(fournisseur)}
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
                                  <Delete />
                                </ActionButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={isMobile ? 4 : 6} align="center" sx={{ py: 4 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <CancelIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                              <Typography color="textSecondary">
                                Aucun fournisseur trouvé
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Divider entre tableau et pagination */}
                <Divider sx={{ my: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />

                {/* Section Pagination intégrée */}
                <Box sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mt: 2
                }}>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Button
                      variant="contained"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      sx={{
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        fontWeight: 'bold',
                        px: 3,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                        },
                        '&:disabled': {
                          background: '#e0e0e0',
                          color: '#9e9e9e'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Précédent
                    </Button>
                    <Button
                      variant="contained"
                      disabled={currentPage * itemsPerPage >= filteredFournisseurs.length}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      sx={{
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        fontWeight: 'bold',
                        px: 3,
                        '&:hover': {
                          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                        },
                        '&:disabled': {
                          background: '#e0e0e0',
                          color: '#9e9e9e'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Suivant
                    </Button>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                    Page {currentPage} sur {Math.ceil(filteredFournisseurs.length / itemsPerPage)}
                    ({filteredFournisseurs.length} fournisseurs au total)
                  </Typography>
                </Box>
              </>
            )}
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

      {/* Fournisseur Details Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            width: isMobile ? '95vw' : '600px'
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: '600',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Business color="primary" />
            Détails du Fournisseur
          </Box>
          <IconButton onClick={() => setIsModalOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedFournisseur && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar sx={{
                  bgcolor: 'primary.main',
                  width: 56,
                  height: 56,
                  fontSize: '1.25rem'
                }}>
                  {selectedFournisseur.raison_sociale?.charAt(0) || 'F'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedFournisseur.raison_sociale}
                  </Typography>
                  {selectedFournisseur.code && (
                    <Typography variant="body2" color="text.secondary">
                      Code: {selectedFournisseur.code}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  INFORMATIONS PRINCIPALES
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Business fontSize="small" color="action" />
                      <Box>
                        <Typography component="span" color="text.secondary">Matricule: </Typography>
                        {selectedFournisseur.matricule_fiscale || 'Non spécifié'}
                      </Box>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Box>
                        <Typography component="span" color="text.secondary">Adresse: </Typography>
                        {selectedFournisseur.adresse || 'Non spécifié'}
                      </Box>
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  COORDONNÉES
                </Typography>
                <Grid container spacing={2}>
                  {selectedFournisseur.telephone && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone fontSize="small" color="action" />
                        <Box>
                          <Typography component="span" color="text.secondary">Téléphone: </Typography>
                          {selectedFournisseur.telephone}
                        </Box>
                      </Typography>
                    </Grid>
                  )}
                  {selectedFournisseur.fax && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email fontSize="small" color="action" />
                        <Box>
                          <Typography component="span" color="text.secondary">Fax: </Typography>
                          {selectedFournisseur.fax}
                        </Box>
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => navigate(`/updateFournisseur/${selectedFournisseur._id}`)}
            variant="contained"
            startIcon={<Edit />}
            size={isMobile ? "small" : "medium"}
            sx={{ borderRadius: '12px', textTransform: 'none', px: 3 }}
          >
            Modifier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Popup de suppression individuelle */}
      <Dialog
        open={deleteDialog.open}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
          color: 'white',
          textAlign: 'center',
          py: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Delete sx={{ fontSize: 32 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Confirmer la suppression
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50' }}>
            Êtes-vous sûr de vouloir supprimer ce fournisseur ?
          </Typography>
          <Typography variant="body1" sx={{ color: '#7f8c8d', mb: 2 }}>
            <strong>{deleteDialog.fournisseurName}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cette action est irréversible et supprimera définitivement toutes les données associées à ce fournisseur.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              borderColor: '#95a5a6',
              color: '#95a5a6',
              '&:hover': {
                borderColor: '#7f8c8d',
                backgroundColor: '#f8f9fa'
              }
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={deleteFournisseur}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(231, 76, 60, 0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Popup de suppression multiple */}
      <Dialog
        open={deleteMultipleDialog.open}
        onClose={handleCloseDeleteMultipleDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
          color: 'white',
          textAlign: 'center',
          py: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <Delete sx={{ fontSize: 32 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Suppression multiple
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#2c3e50' }}>
            Êtes-vous sûr de vouloir supprimer {deleteMultipleDialog.count} fournisseur(s) ?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cette action est irréversible et supprimera définitivement tous les fournisseurs sélectionnés ainsi que leurs données associées.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
          <Button
            onClick={handleCloseDeleteMultipleDialog}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              borderColor: '#95a5a6',
              color: '#95a5a6',
              '&:hover': {
                borderColor: '#7f8c8d',
                backgroundColor: '#f8f9fa'
              }
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={deleteSelectedFournisseurs}
            variant="contained"
            color="error"
            sx={{
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(231, 76, 60, 0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Supprimer ({deleteMultipleDialog.count})
          </Button>
        </DialogActions>
      </Dialog>

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
    </>
  );
}