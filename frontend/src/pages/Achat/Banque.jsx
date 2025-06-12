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
  Avatar,
  Chip,
  Divider,
  LinearProgress,

  InputAdornment,
  Badge as MuiBadge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  AccountBalance as BankIcon,
  LocationOn as AddressIcon,
  CreditCard as AccountIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import Sidenav from '../../navbar/Sidenav';
import Navbar from '../../navbar/Navbar';

// Styles personnalisés
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  }
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  borderRadius: '8px'
}));

const Banque = () => {
  const theme = useTheme();
  const [banques, setBanques] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBanque, setSelectedBanque] = useState(null);
  const [formData, setFormData] = useState({
    code_banque: '',
    libelle: '',
    adresse: '',
    numero_Compte: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const fetchBanques = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/banque/AllBanques');
      setBanques(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des banques:', error);
      showSnackbar('Erreur lors de la récupération des banques', 'error');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedBanque) {
        await axios.put(`http://localhost:5000/banque/${selectedBanque._id}`, formData);
        showSnackbar('Banque modifiée avec succès');
      } else {
        await axios.post('http://localhost:5000/banque/createBanque', formData);
        showSnackbar('Banque créée avec succès');
      }
      await fetchBanques();
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette banque ?')) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5000/banque/${id}`);
        showSnackbar('Banque supprimée avec succès');
        await fetchBanques();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showSnackbar('Erreur lors de la suppression', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenDialog = (banque = null) => {
    setSelectedBanque(banque);
    setFormData({
      code_banque: banque?.code_banque || '',
      libelle: banque?.libelle || '',
      adresse: banque?.adresse || '',
      numero_Compte: banque?.numero_Compte || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBanque(null);
    setFormData({
      code_banque: '',
      libelle: '',
      adresse: '',
      numero_Compte: '',
    });
  };

  useEffect(() => {
    fetchBanques();
  }, []);

  const filteredBanques = banques.filter(banque =>
    banque.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banque.code_banque.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banque.numero_Compte.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedBanques = filteredBanques.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
   <>
      <Navbar />
       <Box height={164} />
        <Box sx={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
      <Sidenav />
      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10 }}>
        {/* Carte consolidée moderne unifiée */}
        <StyledCard sx={{
          mb: 3,
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
                Gestion des Banques
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Gérez vos établissements bancaires et comptes
              </Typography>
            </Box>

            {/* Section Filtres modernisée */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
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
                Recherche et Actions
              </Typography>
            </Box>
            <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />

            {/* Barre d'actions modernisée */}
            <Box sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              mb: 3
            }}>
              <TextField
                fullWidth
                size="small"
                label="Rechercher une banque"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  maxWidth: '400px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(52, 73, 94, 0.15)'
                    },
                    '&.Mui-focused': {
                      boxShadow: '0 4px 12px rgba(52, 73, 94, 0.25)'
                    }
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#2c3e50' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )
                }}
              />
              
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  onClick={() => handleOpenDialog()}
                  startIcon={<AddIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    color: 'white',
                    boxShadow: '0 4px 15px rgba(52, 73, 94, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(52, 73, 94, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Nouvelle Banque
                </Button>
              </Stack>
            </Box>

            {/* Section Tableau modernisée */}
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

            {/* Tableau des banques modernisé */}
            <TableContainer component={Paper} sx={{
              borderRadius: 2,
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              overflow: 'hidden'
            }}>
              {loading && <LinearProgress sx={{
                background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #2c3e50, #34495e)'
                }
              }} />}
              <Table>
                <TableHead sx={{
                  background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
                }}>
                  <TableRow>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Libellé</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Code Banque</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Adresse</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Numéro de Compte</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Statut</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'right' }}>Actions</TableCell>
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
                          transition: 'all 0.2s ease',
                          '&:last-child td, &:last-child th': { border: 0 }
                        }}
                      >
                        <TableCell>
                          <Typography sx={{ fontWeight: 'bold', color: '#2c3e50' }}>{banque.libelle}</Typography>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'medium', color: '#95a5a6' }}>{banque.code_banque}</TableCell>
                        <TableCell sx={{ fontWeight: 'medium' }}>{banque.adresse}</TableCell>
                        <TableCell sx={{ fontWeight: 'medium' }}>{banque.numero_Compte}</TableCell>
                        <TableCell>
                          <StatusChip
                            label="Active"
                            sx={{
                              backgroundColor: '#d4edda',
                              color: '#155724',
                              border: '1px solid #c3e6cb',
                              fontWeight: 'bold',
                              borderRadius: 2
                            }}
                            size="small"
                            icon={<BankIcon fontSize="small" />}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
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
                                <EditIcon fontSize="small" />
                              </ActionButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <ActionButton
                                onClick={() => handleDelete(banque._id)}
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
                              </ActionButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <BankIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                          <Typography color="text.secondary">
                            {searchTerm ? 'Aucune banque trouvée' : 'Aucune banque disponible'}
                          </Typography>
                          {searchTerm && (
                            <Button 
                              onClick={() => setSearchTerm('')} 
                              size="small" 
                              sx={{ mt: 1 }}
                            >
                              Effacer la recherche
                            </Button>
                          )}
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
          </CardContent>
        </StyledCard>

        {/* Dialog pour créer/modifier une banque modernisé */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
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
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
          }}>
            <BankIcon />
            {selectedBanque ? 'Modifier la Banque' : 'Créer une Banque'}
          </DialogTitle>
          <Divider sx={{ background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />
          <DialogContent sx={{ py: 3, background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Libellé"
                value={formData.libelle}
                onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                margin="normal"
                required
                variant="outlined"
                sx={{
                  mb: 2,
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BankIcon sx={{ color: '#2c3e50' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Code Banque"
                value={formData.code_banque}
                onChange={(e) => setFormData({ ...formData, code_banque: e.target.value })}
                margin="normal"
                required
                variant="outlined"
                sx={{
                  mb: 2,
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountIcon sx={{ color: '#95a5a6' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Adresse"
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                margin="normal"
                required
                variant="outlined"
                sx={{
                  mb: 2,
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AddressIcon sx={{ color: '#95a5a6' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Numéro de Compte"
                value={formData.numero_Compte}
                onChange={(e) => setFormData({ ...formData, numero_Compte: e.target.value })}
                margin="normal"
                required
                variant="outlined"
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountIcon sx={{ color: '#2c3e50' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </DialogContent>
          <Divider sx={{ background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />
          <DialogActions sx={{ p: 2, background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              disabled={loading}
              sx={{
                borderRadius: 2,
                borderColor: '#95a5a6',
                color: '#95a5a6',
                '&:hover': {
                  borderColor: '#7f8c8d',
                  backgroundColor: 'rgba(149, 165, 166, 0.1)',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(149, 165, 166, 0.3)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: 2,
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(52, 73, 94, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(52, 73, 94, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {selectedBanque ? 'Enregistrer' : 'Créer'}
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
              success: <BankIcon fontSize="inherit" />,
              error: <CloseIcon fontSize="inherit" />
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  </>);
};

export default Banque;