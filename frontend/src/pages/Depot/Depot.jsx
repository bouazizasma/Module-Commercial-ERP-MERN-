import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";

import Navbar from "../../navbar/Navbar";
import {
  Table,
  CardContent,
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
  Avatar,
  Chip,
  Divider,
  LinearProgress,
  Tooltip,
  Snackbar,
  Alert
} from "@mui/material";
import {
  Visibility,
  Delete,
  Edit,
  Search,
  Warehouse,
  LocationOn,
  Badge,
  Label,
  Add,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon
} from "@mui/icons-material";
import { styled } from '@mui/material/styles';

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

export default function Depot() {
  const [depots, setDepots] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDepotId, setSelectedDepotId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepot, setSelectedDepot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // États pour les popups de création/modification
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingDepot, setEditingDepot] = useState(null);
  const [formData, setFormData] = useState({
    codeDepot: '',
    libelle: ''
  });

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

  const fetchDepots = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/depot/depots");
      setDepots(response.data);
    } catch (error) {
      console.error("Error fetching depots:", error);
      showSnackbar('Erreur lors de la récupération des dépôts', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteDepot = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/depot/${id}`);
      showSnackbar('Dépôt supprimé avec succès');
      await fetchDepots();
    } catch (error) {
      console.error("Error deleting depot:", error);
      showSnackbar('Erreur lors de la suppression', 'error');
    } finally {
      setLoading(false);
    }
  };



  const handleOpenDialog = (id) => {
    setSelectedDepotId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDepotId(null);
  };

  const handleOpenModal = (depot) => {
    setSelectedDepot(depot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDepot(null);
  };

  // Fonctions pour les popups de création/modification
  const handleOpenCreateDialog = () => {
    setFormData({ codeDepot: '', libelle: '' });
    setEditingDepot(null);
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
    setFormData({ codeDepot: '', libelle: '' });
  };

  const handleOpenEditDialog = (depot) => {
    setFormData({
      codeDepot: depot.codeDepot,
      libelle: depot.libelle
    });
    setEditingDepot(depot);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingDepot(null);
    setFormData({ codeDepot: '', libelle: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (editingDepot) {
        // Modification
        await axios.put(`http://localhost:5000/depot/${editingDepot._id}`, formData);
        showSnackbar('Dépôt modifié avec succès');
        handleCloseEditDialog();
      } else {
        // Création
        await axios.post('http://localhost:5000/depot/newD', formData);
        showSnackbar('Dépôt créé avec succès');
        handleCloseCreateDialog();
      }
      await fetchDepots();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepots();
  }, []);

  const filteredDepots = depots.filter((depot) =>
    depot.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    depot.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    depot.codeDepot.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedDepots = filteredDepots.slice(
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
          <StyledCard sx={{
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
                <Warehouse sx={{ fontSize: 48, mb: 2 }} />
                <Typography variant="h5" sx={{
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                  mb: 1
                }}>
                  Gestion des Dépôts
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Gérez vos dépôts et entrepôts facilement
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
                  onClick={handleOpenCreateDialog}
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
                  Nouveau Dépôt
                </Button>
              </Box>
              <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />

              <TextField
                fullWidth
                variant="outlined"
                label="Rechercher un dépôt"
                placeholder="Rechercher par code, libellé..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ color: '#2c3e50' }} />
                      </InputAdornment>
                    ),
                  }
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

              {/* Section Liste des Dépôts */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Warehouse sx={{
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
                  Liste des Dépôts ({filteredDepots.length})
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
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Code Dépôt</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Libellé</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Statut</TableCell>
                          <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedDepots.length > 0 ? (
                          paginatedDepots.map((depot) => (
                            <TableRow
                              key={depot._id}
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
                              <TableCell sx={{ fontWeight: 'medium', color: '#2c3e50' }}>
                                {depot.code}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'medium', color: '#2c3e50' }}>
                                {depot.codeDepot}
                              </TableCell>
                              <TableCell>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                  <Avatar sx={{
                                    background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                                    color: 'white'
                                  }}>
                                    <Warehouse />
                                  </Avatar>
                                  <Typography sx={{ fontWeight: 'bold', color: '#2c3e50' }}>{depot.libelle}</Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  icon={<Badge fontSize="small" />}
                                  label="Actif"
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
                                <Tooltip title="Voir détails">
                                  <ActionButton
                                    onClick={() => handleOpenModal(depot)}
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
                                    onClick={() => handleOpenEditDialog(depot)}
                                    sx={{
                                      color: '#f39c12',
                                      '&:hover': {
                                        backgroundColor: '#fff3cd',
                                        transform: 'scale(1.1)',
                                        color: '#e67e22'
                                      },
                                      transition: 'all 0.3s ease'
                                    }}
                                  >
                                    <Edit />
                                  </ActionButton>
                                </Tooltip>
                                <Tooltip title="Supprimer">
                                  <ActionButton
                                    onClick={() => handleOpenDialog(depot._id)}
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
                            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Warehouse sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                                <Typography color="textSecondary">
                                  {searchTerm ? 'Aucun dépôt trouvé' : 'Aucun dépôt disponible'}
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
                        disabled={currentPage * itemsPerPage >= filteredDepots.length}
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
                      Page {currentPage} sur {Math.ceil(filteredDepots.length / itemsPerPage)}
                      ({filteredDepots.length} dépôts au total)
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </StyledCard>

          {/* Dialog de confirmation de suppression modernisé */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            slotProps={{
              paper: {
                sx: { borderRadius: 3, width: '100%', maxWidth: '500px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }
              }
            }}
          >
            <DialogTitle sx={{
              background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
            }}>
              <Delete />
              Confirmation de suppression
            </DialogTitle>
            <Divider sx={{ background: 'linear-gradient(90deg, #e74c3c, #c0392b)' }} />
            <DialogContent sx={{
              py: 4,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
            }}>
              <Typography>
                Êtes-vous sûr de vouloir supprimer ce dépôt ? Cette action est irréversible.
              </Typography>
            </DialogContent>
            <Divider sx={{ background: 'linear-gradient(90deg, #e74c3c, #c0392b)' }} />
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
                onClick={() => {
                  deleteDepot(selectedDepotId);
                  handleCloseDialog();
                }}
                variant="contained"
                disabled={loading}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                  color: 'white',
                  boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 20px rgba(231, 76, 60, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Confirmer
              </Button>
            </DialogActions>
          </Dialog>

          {/* Modal de détails du dépôt modernisée */}
          <Dialog
            open={isModalOpen}
            onClose={handleCloseModal}
            maxWidth="md"
            fullWidth
            slotProps={{
              paper: {
                sx: { borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }
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
              <Warehouse />
              Détails du Dépôt
            </DialogTitle>
            <Divider sx={{ background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />
            <DialogContent sx={{
              py: 4,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
            }}>
              {selectedDepot && (
                <Stack spacing={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Badge sx={{ color: '#2c3e50' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Code
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" sx={{ color: '#2c3e50' }}>
                        {selectedDepot.code}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <LocationOn sx={{ color: '#2c3e50' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Code Dépôt
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" sx={{ color: '#2c3e50' }}>
                        {selectedDepot.codeDepot}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Label sx={{ color: '#2c3e50' }} />
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Libellé
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" sx={{ color: '#2c3e50' }}>
                        {selectedDepot.libelle}
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              )}
            </DialogContent>
            <Divider sx={{ background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />
            <DialogActions sx={{
              p: 3,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
            }}>
              <Button
                onClick={handleCloseModal}
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
                Fermer
              </Button>
              <Button
                onClick={() => {
                  handleCloseModal();
                  handleOpenEditDialog(selectedDepot);
                }}
                variant="contained"
                startIcon={<Edit />}
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
                Modifier
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog de création de dépôt */}
          <Dialog
            open={openCreateDialog}
            onClose={handleCloseCreateDialog}
            slotProps={{
              paper: {
                sx: { borderRadius: 3, width: '100%', maxWidth: '500px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }
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
              <Warehouse />
              Créer un Nouveau Dépôt
            </DialogTitle>
            <Divider sx={{ background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />
            <DialogContent sx={{
              py: 4,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
            }}>
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Code Dépôt"
                  value={formData.codeDepot}
                  onChange={(e) => setFormData({ ...formData, codeDepot: e.target.value })}
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
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn sx={{ color: '#2c3e50' }} />
                        </InputAdornment>
                      ),
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="Libellé"
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
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Label sx={{ color: '#2c3e50' }} />
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              </Box>
            </DialogContent>
            <Divider sx={{ background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />
            <DialogActions sx={{
              p: 3,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
            }}>
              <Button
                onClick={handleCloseCreateDialog}
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
                Créer
              </Button>
            </DialogActions>
          </Dialog>

          {/* Dialog de modification de dépôt */}
          <Dialog
            open={openEditDialog}
            onClose={handleCloseEditDialog}
            slotProps={{
              paper: {
                sx: { borderRadius: 3, width: '100%', maxWidth: '500px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }
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
              <Edit />
              Modifier le Dépôt
            </DialogTitle>
            <Divider sx={{ background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />
            <DialogContent sx={{
              py: 4,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
            }}>
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Code Dépôt"
                  value={formData.codeDepot}
                  onChange={(e) => setFormData({ ...formData, codeDepot: e.target.value })}
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
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOn sx={{ color: '#2c3e50' }} />
                        </InputAdornment>
                      ),
                    }
                  }}
                />
                <TextField
                  fullWidth
                  label="Libellé"
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
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Label sx={{ color: '#2c3e50' }} />
                        </InputAdornment>
                      ),
                    }
                  }}
                />
              </Box>
            </DialogContent>
            <Divider sx={{ background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />
            <DialogActions sx={{
              p: 3,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
            }}>
              <Button
                onClick={handleCloseEditDialog}
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
                Enregistrer
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
}