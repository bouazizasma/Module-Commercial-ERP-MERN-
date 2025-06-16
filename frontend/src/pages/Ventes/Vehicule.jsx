import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

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
  DirectionsCar,
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


export default function Vehicule() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [vehicules, setVehicules] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedVehiculeId, setSelectedVehiculeId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicule, setSelectedVehicule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    code: '',
    codeVehicule: '',
    libelle: '',
    matricule: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const itemsPerPage = 4;

  const fetchVehicule = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/vehicule/Vehicules");
      setVehicules(response.data);
    } catch (error) {
      console.error("Error fetching Vehicule:", error);
      showSnackbar('Erreur lors de la récupération des véhicules', 'error');
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
      case 'codeVehicule':
        if (!value.trim()) {
          newErrors[name] = 'Le code véhicule est requis';
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
      case 'matricule':
        if (!value.trim()) {
          newErrors[name] = 'Le matricule est requis';
        } else if (value.length < 3) {
          newErrors[name] = 'Le matricule doit contenir au moins 3 caractères';
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

  // Handle form submission (create or update vehicule)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation complète avant soumission
    const isValid = validateField('libelle', formData.libelle) &&
                   validateField('codeVehicule', formData.codeVehicule) &&
                   validateField('code', formData.code) &&
                   validateField('matricule', formData.matricule);

    if (!isValid) return;

    try {
      setLoading(true);
      if (selectedVehicule) {
        await axios.put(`http://localhost:5000/vehicule/${selectedVehicule._id}`, formData);
        showSnackbar('Véhicule modifié avec succès');
      } else {
        await axios.post('http://localhost:5000/vehicule/newVehicule', formData);
        showSnackbar('Véhicule créé avec succès');
      }
      fetchVehicule();
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
      setErrors({ submit: "Une erreur s'est produite lors de la sauvegarde" });
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicule = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/vehicule/${id}`);
      fetchVehicule();
      showSnackbar('Véhicule supprimé avec succès');
      setOpenDeleteDialog(false);
      setSelectedVehiculeId(null);
    } catch (error) {
      console.error("Error deleting Vehicule :", error);
      showSnackbar('Erreur lors de la suppression', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open dialog for creating or editing a vehicule
  const handleOpenDialog = (vehicule = null) => {
    if (vehicule) {
      setSelectedVehicule(vehicule);
      setFormData({
        code: vehicule.code,
        codeVehicule: vehicule.codeVehicule,
        libelle: vehicule.libelle,
        matricule: vehicule.matricule,
      });
    } else {
      setSelectedVehicule(null);
      setFormData({
        code: '',
        codeVehicule: '',
        libelle: '',
        matricule: '',
      });
    }
    setErrors({});
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedVehicule(null);
    setFormData({
      code: '',
      codeVehicule: '',
      libelle: '',
      matricule: '',
    });
    setErrors({});
  };

  // Handle delete dialog
  const handleOpenDeleteDialog = (id) => {
    setSelectedVehiculeId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedVehiculeId(null);
  };

  const handleOpenModal = (vehicule) => {
    setSelectedVehicule(vehicule);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVehicule(null);
  };

  // Filter and pagination logic
  const filteredVehicules = vehicules.filter((vehicule) =>
    vehicule.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicule.codeVehicule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicule.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicule.code.toString().includes(searchTerm)
  );

  const paginatedVehicules = filteredVehicules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchVehicule();
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
              <DirectionsCar sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                Gestion des Véhicules
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Gérez votre flotte de véhicules
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
                Nouveau Véhicule
              </Button>
            </Box>
            <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />

            <TextField
              fullWidth
              variant="outlined"
              label="Rechercher un véhicule"
              placeholder="Rechercher par libellé, code véhicule, matricule ou code..."
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

            {/* Section Liste des Véhicules */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <DirectionsCar sx={{
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
                Liste des Véhicules ({filteredVehicules.length})
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
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Code Véhicule</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Libellé</TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Matricule</TableCell>
                        <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedVehicules.length > 0 ? (
                        paginatedVehicules.map((vehicule) => (
                          <TableRow
                            key={vehicule._id}
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
                                  <DirectionsCar />
                                </Avatar>
                                <Typography sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                                  {vehicule.code}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={vehicule.codeVehicule}
                                size="small"
                                sx={{
                                  background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontWeight: 'medium', color: '#2c3e50' }}>
                                {vehicule.libelle}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={vehicule.matricule}
                                size="small"
                                sx={{
                                  background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                                  color: 'white',
                                  fontWeight: 'bold'
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Tooltip title="Voir les détails">
                                  <ActionButton
                                    onClick={() => handleOpenModal(vehicule)}
                                    sx={{ color: '#3498db' }}
                                  >
                                    <Visibility />
                                  </ActionButton>
                                </Tooltip>
                                <Tooltip title="Modifier">
                                  <ActionButton
                                    onClick={() => handleOpenDialog(vehicule)}
                                    sx={{ color: '#f39c12' }}
                                  >
                                    <Edit />
                                  </ActionButton>
                                </Tooltip>
                                <Tooltip title="Supprimer">
                                  <ActionButton
                                    onClick={() => handleOpenDeleteDialog(vehicule._id)}
                                    sx={{ color: '#e74c3c' }}
                                  >
                                    <Delete />
                                  </ActionButton>
                                </Tooltip>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            <Typography variant="h6" color="text.secondary">
                              Aucun véhicule trouvé
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                {filteredVehicules.length > itemsPerPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Stack direction="row" spacing={1}>
                      {Array.from({ length: Math.ceil(filteredVehicules.length / itemsPerPage) }, (_, i) => (
                        <Button
                          key={i + 1}
                          variant={currentPage === i + 1 ? "contained" : "outlined"}
                          onClick={() => setCurrentPage(i + 1)}
                          sx={{
                            minWidth: 40,
                            height: 40,
                            borderRadius: 2,
                            background: currentPage === i + 1
                              ? 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
                              : 'transparent',
                            '&:hover': {
                              background: currentPage === i + 1
                                ? 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)'
                                : 'rgba(52, 73, 94, 0.1)'
                            }
                          }}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </Stack>
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </ModernCard>
        </Box>
      </Box>

      {/* Dialog de création/modification */}
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
          textAlign: 'center',
          py: 3
        }}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
            <DirectionsCar sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {selectedVehicule ? 'Modifier le Véhicule' : 'Nouveau Véhicule'}
            </Typography>
          </Stack>
        </DialogTitle>

        <form onSubmit={handleSubmit}>
          <DialogContent sx={{ p: 3 }}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Libellé"
                value={formData.libelle}
                onChange={(e) => handleFieldChange('libelle', e.target.value)}
                error={!!errors.libelle}
                helperText={errors.libelle}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(52, 73, 94, 0.15)'
                    }
                  }
                }}
              />

              <TextField
                fullWidth
                label="Matricule"
                value={formData.matricule}
                onChange={(e) => handleFieldChange('matricule', e.target.value)}
                error={!!errors.matricule}
                helperText={errors.matricule}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(52, 73, 94, 0.15)'
                    }
                  }
                }}
              />

              {errors.submit && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {errors.submit}
                </Alert>
              )}
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              startIcon={<CancelIcon />}
              sx={{
                borderRadius: 2,
                px: 3,
                borderColor: '#95a5a6',
                color: '#95a5a6',
                '&:hover': {
                  borderColor: '#7f8c8d',
                  backgroundColor: 'rgba(149, 165, 166, 0.1)'
                }
              }}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={selectedVehicule ? <Edit /> : <Add />}
              disabled={loading}
              sx={{
                borderRadius: 2,
                px: 3,
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 25px rgba(52, 73, 94, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? 'Enregistrement...' : (selectedVehicule ? 'Modifier' : 'Créer')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="sm"
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
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
            <WarningIcon sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Confirmation de suppression
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Êtes-vous sûr de vouloir supprimer ce véhicule ?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cette action est irréversible.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCloseDeleteDialog}
            variant="outlined"
            startIcon={<CancelIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              borderColor: '#95a5a6',
              color: '#95a5a6',
              '&:hover': {
                borderColor: '#7f8c8d',
                backgroundColor: 'rgba(149, 165, 166, 0.1)'
              }
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={() => deleteVehicule(selectedVehiculeId)}
            variant="contained"
            startIcon={<Delete />}
            disabled={loading}
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
            {loading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de détails du véhicule */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }
        }}
      >
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
          color: 'white',
          textAlign: 'center',
          py: 3
        }}>
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={2}>
            <DirectionsCar sx={{ fontSize: 28 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Détails du Véhicule
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ p: 4 }}>
          {selectedVehicule && (
            <Stack spacing={3}>
              <Card sx={{
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}>
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{
                      background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                      color: 'white'
                    }}>
                      <DirectionsCar />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                        {selectedVehicule.libelle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Code: {selectedVehicule.code}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider />

                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        Code Véhicule:
                      </Typography>
                      <Chip
                        label={selectedVehicule.codeVehicule}
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        Matricule:
                      </Typography>
                      <Chip
                        label={selectedVehicule.matricule}
                        size="small"
                        sx={{
                          background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                          color: 'white',
                          fontWeight: 'bold'
                        }}
                      />
                    </Box>
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={handleCloseModal}
            variant="outlined"
            startIcon={<CancelIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              borderColor: '#95a5a6',
              color: '#95a5a6',
              '&:hover': {
                borderColor: '#7f8c8d',
                backgroundColor: 'rgba(149, 165, 166, 0.1)'
              }
            }}
          >
            Fermer
          </Button>
          <Button
            onClick={() => handleOpenDialog(selectedVehicule)}
            variant="contained"
            startIcon={<Edit />}
            sx={{
              borderRadius: 2,
              px: 3,
              background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #e67e22 0%, #f39c12 100%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 8px 25px rgba(243, 156, 18, 0.4)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Modifier
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)'
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
