import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Card,
  CardContent,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Stack,
  Alert,
  Snackbar,
  Tooltip,
  useTheme,
  useMediaQuery,
  LinearProgress,
  InputAdornment,
  Divider,
  Avatar,
  Chip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  AccountBalance as BankIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import Sidenav from '../../navbar/Sidenav';
import Navbar from '../../navbar/Navbar';

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

const BanqueClient = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [banques, setBanques] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedBanque, setSelectedBanque] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const itemsPerPage = 4;

  const [formData, setFormData] = useState({
    code_banque: '',
    libelle: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch all banques on component mount
  useEffect(() => {
    fetchBanques();
  }, []);

  // Fetch banques from the backend
  const fetchBanques = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/banqueClient/AllBanques');
      setBanques(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des banques:', error);
      showSnackbar('Erreur lors de la récupération des banques', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
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
      case 'code_banque':
        if (!value.trim()) {
          newErrors[name] = 'Le code banque est requis';
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

  // Handle form submission (create or update banque)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation complète avant soumission
    const isValid = validateField('libelle', formData.libelle) &&
                   validateField('code_banque', formData.code_banque);

    if (!isValid) return;

    try {
      setLoading(true);
      if (selectedBanque) {
        await axios.put(`http://localhost:5000/banqueClient/${selectedBanque._id}`, formData);
        showSnackbar('Banque modifiée avec succès');
      } else {
        await axios.post('http://localhost:5000/banqueClient/createBanque', formData);
        showSnackbar('Banque créée avec succès');
      }
      fetchBanques();
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
      setErrors({ submit: "Une erreur s'est produite lors de la sauvegarde" });
    } finally {
      setLoading(false);
    }
  };

  // Handle delete banque
  const handleDelete = async (banque) => {
    setSelectedBanque(banque);
    setOpenDeleteDialog(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/banqueClient/${selectedBanque._id}`);
      showSnackbar('Banque supprimée avec succès');
      fetchBanques();
      setOpenDeleteDialog(false);
      setSelectedBanque(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showSnackbar('Erreur lors de la suppression', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open dialog for creating or editing a banque
  const handleOpenDialog = (banque = null) => {
    if (banque) {
      setSelectedBanque(banque);
      setFormData({
        code_banque: banque.code_banque,
        libelle: banque.libelle,
      });
    } else {
      setSelectedBanque(null);
      setFormData({
        code_banque: '',
        libelle: '',
      });
    }
    setErrors({});
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBanque(null);
    setFormData({
      code_banque: '',
      libelle: '',
    });
    setErrors({});
  };

  // Handle form field changes with validation
  const handleFieldChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  // Filter and pagination logic
  const filteredBanques = banques.filter((banque) =>
    banque.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banque.code_banque.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedBanques = filteredBanques.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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
              <BankIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                Gestion des Banques Client
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Gérez vos banques clients
              </Typography>
            </Box>

            {/* Section Recherche et Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <SearchIcon sx={{
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
                startIcon={<AddIcon />}
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
                Nouvelle Banque
              </Button>
            </Box>
            <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />

            <TextField
              fullWidth
              variant="outlined"
              label="Rechercher une banque"
              placeholder="Rechercher par libellé ou code banque..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#2c3e50' }} />
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

            {/* Section Liste des Banques */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <BankIcon sx={{
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
                Liste des Banques ({filteredBanques.length})
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
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Libellé</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Code Banque</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedBanques.length > 0 ? (
                        paginatedBanques.map((banque) => (
                          <TableRow
                            key={banque._id}
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
                                  <BankIcon />
                                </Avatar>
                                <Typography sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                                  {banque.libelle}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={banque.code_banque}
                                size="small"
                                sx={{
                                  backgroundColor: '#d4edda',
                                  color: '#155724',
                                  border: '1px solid #c3e6cb'
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Modifier">
                                <ActionButton
                                  onClick={() => handleOpenDialog(banque)}
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
                                  <EditIcon />
                                </ActionButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <ActionButton
                                  onClick={() => handleDelete(banque)}
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
                                  <DeleteIcon />
                                </ActionButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <CancelIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                              <Typography color="textSecondary">
                                Aucune banque trouvée
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
                      disabled={currentPage * itemsPerPage >= filteredBanques.length}
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
                    Page {currentPage} sur {Math.ceil(filteredBanques.length / itemsPerPage)}
                    ({filteredBanques.length} banques au total)
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </ModernCard>
        </Box>
      </Box>

      {/* Dialog pour créer/modifier une banque */}
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
          <BankIcon sx={{ color: '#3b82f6' }} />
          {selectedBanque ? 'Modifier la Banque' : 'Créer une Banque'}
        </DialogTitle>
        <Divider sx={{ borderColor: '#e2e8f0' }} />
        <DialogContent sx={{ pt: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
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
            <TextField
              fullWidth
              size="small"
              label="Code Banque"
              value={formData.code_banque}
              onChange={(e) => handleFieldChange('code_banque', e.target.value)}
              margin="normal"
              required
              error={!!errors.code_banque}
              helperText={errors.code_banque}
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
            {loading ? 'Enregistrement...' : (selectedBanque ? 'Modifier' : 'Créer')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
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
            Êtes-vous sûr de vouloir supprimer la banque{' '}
            <strong style={{ color: '#1e293b' }}>"{selectedBanque?.libelle}"</strong> ?
            <br />
            <span style={{ fontSize: '0.9rem', color: '#ef4444' }}>
              Cette action est irréversible.
            </span>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
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
            onClick={confirmDelete}
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
};

export default BanqueClient;