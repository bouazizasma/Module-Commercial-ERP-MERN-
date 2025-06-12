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
  InputAdornment,

  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  AccountBalanceWallet as WalletIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Height
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import Sidenav from '../../navbar/Sidenav';
import Navbar from '../../navbar/Navbar';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.secondary,
}));

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

const Caisse = () => {
  const theme = useTheme();
  const [caisses, setCaisses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCaisse, setSelectedCaisse] = useState(null);
  const [formData, setFormData] = useState({ libelle: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchCaisses();
  }, []);

  const fetchCaisses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/caisse/AllCaisses');
      setCaisses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des caisses:', error);
      showSnackbar('Erreur lors de la récupération des caisses', 'error');
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
      if (selectedCaisse) {
        await axios.put(`http://localhost:5000/caisse/${selectedCaisse._id}`, formData);
        showSnackbar('Caisse modifiée avec succès');
      } else {
        await axios.post('http://localhost:5000/caisse/createCaisse', formData);
        showSnackbar('Caisse créée avec succès');
      }
      await fetchCaisses();
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette caisse ?')) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5000/caisse/${id}`);
        showSnackbar('Caisse supprimée avec succès');
        await fetchCaisses();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showSnackbar('Erreur lors de la suppression', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenDialog = (caisse = null) => {
    setSelectedCaisse(caisse);
    setFormData({
      libelle: caisse?.libelle || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCaisse(null);
    setFormData({ libelle: '' });
  };

  const filteredCaisses = caisses.filter(caisse =>
    caisse.libelle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCaisses = filteredCaisses.slice(
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
              <WalletIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                Gestion des Caisses
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Gérez vos caisses et comptes de trésorerie
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
                Nouvelle Caisse
              </Button>
            </Box>
            <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />

            <TextField
              fullWidth
              variant="outlined"
              label="Rechercher une caisse"
              placeholder="Rechercher par libellé..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Section Liste des Caisses */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <WalletIcon sx={{
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
                Liste des Caisses ({filteredCaisses.length})
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
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Statut</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedCaisses.length > 0 ? (
                        paginatedCaisses.map((caisse) => (
                          <TableRow
                            key={caisse._id}
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
                                  <WalletIcon />
                                </Avatar>
                                <Typography sx={{ fontWeight: 'bold', color: '#2c3e50' }}>{caisse.libelle}</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                icon={<CheckCircleIcon fontSize="small" />}
                                label="Active"
                                sx={{
                                  backgroundColor: '#d4edda',
                                  color: '#155724',
                                  border: '1px solid #c3e6cb',
                                  fontWeight: 'bold',
                                  borderRadius: 2
                                }}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Modifier">
                                <ActionButton
                                  onClick={() => handleOpenDialog(caisse)}
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
                                  onClick={() => handleDelete(caisse._id)}
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
                                Aucune caisse trouvée
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
                      disabled={currentPage * itemsPerPage >= filteredCaisses.length}
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
                    Page {currentPage} sur {Math.ceil(filteredCaisses.length / itemsPerPage)}
                    ({filteredCaisses.length} caisses au total)
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </ModernCard>

        {/* Dialog pour créer/modifier une caisse modernisé */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          PaperProps={{
            sx: {
              borderRadius: 3,
              width: '100%',
              maxWidth: '500px',
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
            <WalletIcon />
            {selectedCaisse ? 'Modifier la Caisse' : 'Créer une Caisse'}
          </DialogTitle>
          <Divider sx={{ background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />
          <DialogContent sx={{
            py: 4,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
          }}>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Libellé de la caisse"
                value={formData.libelle}
                onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                margin="normal"
                required
                variant="outlined"
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <WalletIcon sx={{ color: '#2c3e50' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
          </DialogContent>
          <Divider sx={{ background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />
          <DialogActions sx={{
            p: 3,
            background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
          }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                px: 3,
                py: 1,
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
                textTransform: 'none',
                px: 3,
                py: 1,
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
              {selectedCaisse ? 'Enregistrer' : 'Créer'}
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
      </Box>
    </Box>
    </>
  );
};

export default Caisse;