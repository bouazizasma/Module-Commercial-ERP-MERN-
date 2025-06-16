import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
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
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from "@mui/material";
import {
  Delete,
  Edit,
  Search,
  Visibility,
  Add,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Category,
  Warning as WarningIcon
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

export default function CategorieArticle() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [categories, setCategories] = useState([]);
  const [familleArticles, setFamilleArticles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCategorieId, setSelectedCategorieId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    designationCategorie: '',
    familleArticle: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const itemsPerPage = 4;

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/categorieArticle/CategorieArticles");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching Categorie Article:", error);
      showSnackbar('Erreur lors de la récupération des catégories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchFamilleArticles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/familleArticle/familleArticle");
      setFamilleArticles(response.data);
    } catch (error) {
      console.error("Error fetching Famille Articles:", error);
      showSnackbar('Erreur lors de la récupération des familles d\'articles', 'error');
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
      case 'designationCategorie':
        if (!value.trim()) {
          newErrors[name] = 'Le libellé est requis';
        } else if (value.length < 2) {
          newErrors[name] = 'Le libellé doit contenir au moins 2 caractères';
        } else {
          delete newErrors[name];
        }
        break;
      case 'familleArticle':
        if (!value) {
          newErrors[name] = 'La famille d\'article est requise';
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

  // Handle form submission (create or update categorie)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation complète avant soumission
    const isValid = validateField('designationCategorie', formData.designationCategorie) &&
                   validateField('familleArticle', formData.familleArticle);

    if (!isValid) return;

    try {
      setLoading(true);
      if (selectedCategorie) {
        await axios.put(`http://localhost:5000/categorieArticle/${selectedCategorie._id}`, formData);
        showSnackbar('Catégorie modifiée avec succès');
      } else {
        await axios.post('http://localhost:5000/categorieArticle/newCategorieArticle', formData);
        showSnackbar('Catégorie créée avec succès');
      }
      fetchCategories();
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      let errorMessage = "Une erreur s'est produite lors de la sauvegarde";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      showSnackbar(errorMessage, 'error');
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const deleteCategorie = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/categorieArticle/${id}`);
      fetchCategories();
      showSnackbar('Catégorie supprimée avec succès');
      setOpenDeleteDialog(false);
      setSelectedCategorieId(null);
    } catch (error) {
      console.error("Error deleting Categorie:", error);
      showSnackbar('Erreur lors de la suppression', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Open dialog for creating or editing a categorie
  const handleOpenDialog = (categorie = null) => {
    if (categorie) {
      setSelectedCategorie(categorie);
      setFormData({
        designationCategorie: categorie.designationCategorie,
        familleArticle: categorie.familleArticle?._id || '',
      });
    } else {
      setSelectedCategorie(null);
      setFormData({
        designationCategorie: '',
        familleArticle: '',
      });
    }
    setErrors({});
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategorie(null);
    setFormData({
      designationCategorie: '',
      familleArticle: '',
    });
    setErrors({});
  };

  // Handle delete dialog
  const handleOpenDeleteDialog = (id) => {
    setSelectedCategorieId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedCategorieId(null);
  };

  const handleOpenModal = (categorie) => {
    setSelectedCategorie(categorie);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategorie(null);
  };

  // Filter and pagination logic
  const filteredCategories = categories.filter((categorie) => {
    if (!categorie) return false;
    const searchLower = searchTerm.toLowerCase();
    const designationCategorie = categorie.designationCategorie || '';
    const familleDesignation = categorie.familleArticleInfo?.designationFamille || '';
    return (
      designationCategorie.toLowerCase().includes(searchLower) ||
      familleDesignation.toLowerCase().includes(searchLower) ||
      categorie.code.toString().includes(searchLower)
    );
  });

  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchCategories();
    fetchFamilleArticles();
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
          width: "1000px",
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
                  Gestion des Catégories d'Articles
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Gérez vos catégories d'articles et leurs familles
                </Typography>
              </Box>

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
                  Nouvelle Catégorie
                </Button>
              </Box>
              <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />

              <TextField
                fullWidth
                variant="outlined"
                label="Rechercher une catégorie"
                placeholder="Rechercher par libellé, code ou famille..."
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
                  Liste des Catégories ({filteredCategories.length})
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
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Libellé</TableCell>
                          <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paginatedCategories.length > 0 ? (
                          paginatedCategories.map((categorie) => (
                            <TableRow
                              key={categorie._id}
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
                                    {categorie.code}
                                  </Typography>
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Typography sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                                  {categorie.designationCategorie}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title="Voir détails">
                                  <ActionButton
                                    onClick={() => handleOpenModal(categorie)}
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
                                    onClick={() => handleOpenDialog(categorie)}
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
                                    onClick={() => handleOpenDeleteDialog(categorie._id)}
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
                                  Aucune catégorie trouvée
                                </Typography>
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Divider sx={{ my: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />

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
                        disabled={currentPage * itemsPerPage >= filteredCategories.length}
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
                      Page {currentPage} sur {Math.ceil(filteredCategories.length / itemsPerPage)}
                      ({filteredCategories.length} catégories au total)
                    </Typography>
                  </Box>
                </>
              )}
            </CardContent>
          </ModernCard>
        </Box>
      </Box>

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
          <Category sx={{ color: '#3b82f6' }} />
          {selectedCategorie ? 'Modifier la Catégorie' : 'Créer une Catégorie'}
        </DialogTitle>
        <Divider sx={{ borderColor: '#e2e8f0' }} />
        <DialogContent sx={{ pt: 3 }}>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              size="small"
              label="Libellé"
              value={formData.designationCategorie}
              onChange={(e) => handleFieldChange('designationCategorie', e.target.value)}
              margin="normal"
              required
              error={!!errors.designationCategorie}
              helperText={errors.designationCategorie}
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
            {loading ? 'Enregistrement...' : (selectedCategorie ? 'Modifier' : 'Créer')}
          </Button>
        </DialogActions>
      </Dialog>

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
            Êtes-vous sûr de vouloir supprimer cette catégorie ?
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
            onClick={() => deleteCategorie(selectedCategorieId)}
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
          Détails de la catégorie
        </DialogTitle>
        <Divider sx={{ borderColor: '#e2e8f0' }} />
        <DialogContent sx={{ pt: 3 }}>
          {selectedCategorie && (
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
                  {selectedCategorie.code}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: '600' }}>
                    {selectedCategorie.designationCategorie}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <Box sx={{ p: 2, backgroundColor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                    Code
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: '600' }}>
                    {selectedCategorie.code}
                  </Typography>
                </Box>
                <Box sx={{ p: 2, backgroundColor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                    Libellé
                  </Typography>
                  <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: '600' }}>
                    {selectedCategorie.designationCategorie}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2, backgroundColor: '#ffffff', borderRadius: 2, border: '1px solid #e2e8f0' }}>
                <Typography variant="body2" sx={{ color: '#64748b', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Category sx={{ fontSize: '1rem' }} />
                  Famille d'article associée
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    label={selectedCategorie.familleArticleInfo?.code || 'N/A'}
                    size="small"
                    sx={{
                      backgroundColor: '#f1f5f9',
                      color: '#64748b',
                      fontSize: '0.75rem'
                    }}
                  />
                  <Typography variant="body1" sx={{ color: '#1e293b', fontWeight: '500' }}>
                    {selectedCategorie.familleArticleInfo?.designationFamille || 'Aucune famille'}
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
              handleOpenDialog(selectedCategorie);
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