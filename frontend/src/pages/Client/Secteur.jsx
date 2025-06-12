import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import LocationOnIcon from '@mui/icons-material/LocationOn';

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
  Typography,
  Card,
  Stack,
  useMediaQuery,
  useTheme,
  LinearProgress,
  Divider,
  Avatar,
  Chip,
  Tooltip,
  Snackbar,
  Alert,
  CardContent
} from "@mui/material";
import {
  Category,
  Delete,
  Edit,
  Search,
  Visibility,
  Add,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
    Warning as WarningIcon,
  
} from "@mui/icons-material";
import { styled } from '@mui/material/styles';

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


export default function Secteur() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [secteurs, setSecteurs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSecteurId, setSelectedSecteurId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSecteur, setSelectedSecteur] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    code: '',
    codeSecteur: '',
    libelle: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const itemsPerPage = 4;

  const fetchSecteur = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/secteur/Secteurs");
      setSecteurs(response.data);
    } catch (error) {
      console.error("Error fetching Secteur:", error);
      showSnackbar('Erreur lors de la récupération des secteurs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Validation des champs
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'libelle':
        if (!value.trim()) {
          newErrors[name] = 'Le libellé est requis';
        } else if (value.length < 2) {
          newErrors[name] = 'Le libellé doit contenir au moins 2 caractères';
        } else {
          delete newErrors[name];
        }
        break;
      case 'codeSecteur':
        if (!value.trim()) {
          newErrors[name] = 'Le code secteur est requis';
        } else {
          delete newErrors[name];
        }
        break;
      case 'code':
        if (!value.trim()) {
          newErrors[name] = 'Le code est requis';
        } else if (isNaN(value)) {
          newErrors[name] = 'Le code doit être un nombre';
        } else {
          delete newErrors[name];
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes with validation
  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // Handle form submission (create or update secteur)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation complète avant soumission
    const isValid = validateField('libelle', formData.libelle) &&
                   validateField('codeSecteur', formData.codeSecteur) 
    if (!isValid) return;

    try {
      setLoading(true);
      if (selectedSecteur) {
        await axios.put(`http://localhost:5000/secteur/${selectedSecteur._id}`, formData);
        showSnackbar('Secteur modifié avec succès');
      } else {
        await axios.post('http://localhost:5000/secteur/newSecteur', formData);
        showSnackbar('Secteur créé avec succès');
      }
      fetchSecteur();
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
      setErrors({ submit: "Une erreur s'est produite lors de la sauvegarde" });
    } finally {
      setLoading(false);
    }
  };

  const deleteSecteur = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/secteur/${id}`);
      fetchSecteur();
      showSnackbar('Secteur supprimé avec succès');
      setOpenDeleteDialog(false);
      setSelectedSecteurId(null);
    } catch (error) {
      console.error("Error deleting Secteur :", error);
      showSnackbar('Erreur lors de la suppression', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open dialog for creating or editing a secteur
  const handleOpenDialog = (secteur = null) => {
    if (secteur) {
      setSelectedSecteur(secteur);
      setFormData({
        code: secteur.code,
        codeSecteur: secteur.codeSecteur,
        libelle: secteur.libelle,
      });
    } else {
      setSelectedSecteur(null);
      setFormData({
        code: '',
        codeSecteur: '',
        libelle: '',
      });
    }
    setErrors({});
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSecteur(null);
    setFormData({
      code: '',
      codeSecteur: '',
      libelle: '',
    });
    setErrors({});
  };

  // Handle delete dialog
  const handleOpenDeleteDialog = (id) => {
    setSelectedSecteurId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedSecteurId(null);
  };

  const handleOpenModal = (secteur) => {
    setSelectedSecteur(secteur);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSecteur(null);
  };

  // Filter and pagination logic
  const filteredSecteurs = secteurs.filter((secteur) =>
    secteur.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    secteur.codeSecteur.toLowerCase().includes(searchTerm.toLowerCase()) ||
    secteur.code.toString().includes(searchTerm)
  );

  const paginatedSecteurs = filteredSecteurs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchSecteur();
  }, []);

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
              <Category sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                Gestion des Secteurs
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Gérez vos secteurs d'activité
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
                onClick={() => handleOpenDialog()}
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
                Nouveau Secteur
              </Button>
            </Box>
            <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />

            <TextField
              fullWidth
              variant="outlined"
              label="Rechercher un secteur"
              placeholder="Rechercher par libellé, code secteur ou code..."
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

            {/* Section Liste des Secteurs */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Category sx={{
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
                Liste des Secteurs ({filteredSecteurs.length})
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
                  <Table>
                    <TableHead sx={{
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
                    }}>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Code</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Code Secteur</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Libellé</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedSecteurs.length > 0 ? (
                        paginatedSecteurs.map((secteur) => (
                          <TableRow
                            key={secteur._id}
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
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{
                                  background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                                  color: 'white'
                                }}>
                                  <Category />
                                </Avatar>
                                <Typography sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                                  {secteur.code}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={secteur.codeSecteur}
                                size="small"
                                sx={{
                                  backgroundColor: '#d4edda',
                                  color: '#155724',
                                  border: '1px solid #c3e6cb'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                                {secteur.libelle}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Voir détails">
                                <ActionButton
                                  onClick={() => handleOpenModal(secteur)}
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
                                  onClick={() => handleOpenDialog(secteur)}
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
                                  onClick={() => handleOpenDeleteDialog(secteur._id)}
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
                          <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <CancelIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                              <Typography color="textSecondary">
                                Aucun secteur trouvé
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
                      disabled={currentPage * itemsPerPage >= filteredSecteurs.length}
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
                    Page {currentPage} sur {Math.ceil(filteredSecteurs.length / itemsPerPage)}
                    ({filteredSecteurs.length} secteurs au total)
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </ModernCard>
        </Box>
      </Box>

      {/* Dialog pour créer/modifier un secteur */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              width: isMobile ? '90vw' : '500px',
              mx: isMobile ? 'auto' : undefined,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e2e8f0'
            }
          }
        }}
      >
        {loading && (
          <LinearProgress
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              borderRadius: '12px 12px 0 0',
              '& .MuiLinearProgress-bar': {
                backgroundColor: '#3b82f6'
              }
            }}
          />
        )}
        <DialogTitle sx={{
          fontWeight: '700',
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 1,
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
          <LocationOnIcon sx={{ color: '#3b82f6' }} />
          {selectedSecteur ? 'Modifier le Secteur' : 'Créer un Secteur'}
        </DialogTitle>
        <Divider sx={{ borderColor: '#e2e8f0' }} />
        <DialogContent sx={{ pt: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              size="small"
              label="Code Secteur"
              value={formData.codeSecteur}
              onChange={(e) => handleFieldChange('codeSecteur', e.target.value)}
              margin="normal"
              required
              error={!!errors.codeSecteur}
              helperText={errors.codeSecteur}
              slotProps={{
                input: {
                  sx: {
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#f8fafc'
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    }
                  }
                }
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              size="small"
              label="Libellé"
              value={formData.libelle}
              onChange={(e) => handleFieldChange('libelle', e.target.value)}
              margin="normal"
              required
              error={!!errors.libelle}
              helperText={errors.libelle}
              slotProps={{
                input: {
                  sx: {
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    '&:hover': {
                      backgroundColor: '#f8fafc'
                    },
                    '&.Mui-focused': {
                      backgroundColor: '#ffffff',
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)'
                    }
                  }
                }
              }}
              sx={{ mb: 2 }}
            />
          </Box>
          {errors.submit && (
            <Typography variant="body2" sx={{
              color: '#ef4444',
              mt: 2,
              textAlign: 'center'
            }}>
              {errors.submit}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleCloseDialog}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            disabled={loading}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': {
                borderColor: '#3b82f6',
                backgroundColor: '#f8fafc'
              }
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            size={isMobile ? "small" : "medium"}
            disabled={loading}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#1e40af'
              },
              '&:disabled': {
                backgroundColor: '#94a3b8'
              }
            }}
          >
            {loading ? 'Enregistrement...' : (selectedSecteur ? 'Modifier' : 'Créer')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              width: isMobile ? '90vw' : '400px',
              mx: isMobile ? 'auto' : undefined,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e2e8f0'
            }
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: '700',
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 1
        }}>
          <WarningIcon sx={{ color: '#f59e0b' }} />
          Confirmer la suppression
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Typography sx={{ color: '#64748b', lineHeight: 1.6 }}>
            Êtes-vous sûr de vouloir supprimer ce secteur ?
            <br />
            <span style={{ fontSize: '0.9rem', color: '#ef4444' }}>
              Cette action est irréversible.
            </span>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': {
                borderColor: '#3b82f6',
                backgroundColor: '#f8fafc'
              }
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={() => deleteSecteur(selectedSecteurId)}
            variant="contained"
            size={isMobile ? "small" : "medium"}
            disabled={loading}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              backgroundColor: '#ef4444',
              '&:hover': {
                backgroundColor: '#dc2626'
              }
            }}
          >
            {loading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de détails du secteur */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              border: '1px solid #e2e8f0'
            }
          }
        }}
      >
        <DialogTitle sx={{
          fontWeight: '700',
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          pb: 1,
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
        }}>
          <Category sx={{ color: '#3b82f6' }} />
          Détails du secteur
        </DialogTitle>
        <Divider sx={{ borderColor: '#e2e8f0' }} />
        <DialogContent sx={{ pt: 3 }}>
          {selectedSecteur && (
            <Stack spacing={3}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 2,
                backgroundColor: '#f8fafc',
                borderRadius: 2,
                border: '1px solid #e2e8f0'
              }}>
                <Avatar sx={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                  width: 48,
                  height: 48,
                  fontSize: '1.2rem',
                  fontWeight: '600'
                }}>
                  {selectedSecteur.code}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: '600' }}>
                    {selectedSecteur.libelle}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Code secteur: {selectedSecteur.codeSecteur}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box sx={{ p: 2, backgroundColor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                    Code
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: '600' }}>
                    {selectedSecteur.code}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, backgroundColor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                    Code Secteur
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: '600' }}>
                    {selectedSecteur.codeSecteur}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              borderColor: '#e2e8f0',
              color: '#64748b',
              '&:hover': {
                borderColor: '#3b82f6',
                backgroundColor: '#f8fafc'
              }
            }}
          >
            Fermer
          </Button>
          <Button
            onClick={() => {
              handleCloseModal();
              handleOpenDialog(selectedSecteur);
            }}
            variant="contained"
            startIcon={<Edit />}
            size={isMobile ? "small" : "medium"}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              backgroundColor: '#3b82f6',
              '&:hover': {
                backgroundColor: '#1e40af'
              }
            }}
          >
            Modifier
          </Button>
        </DialogActions>
      </Dialog>

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
       
    </>
  );
}
