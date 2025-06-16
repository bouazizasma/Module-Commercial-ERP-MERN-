import React, { useEffect, useState } from "react";
import axios from "axios";
import { Buffer } from "buffer";
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
  Inventory,
  Add,
  Close,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Category,
  LocalOffer,
  AttachMoney
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

export default function Article() {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
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

  // États pour les dialogs de suppression
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    article: null
  });

  const [deleteMultipleDialog, setDeleteMultipleDialog] = useState({
    open: false
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Fetch articles from the backend
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/article/articles");
      setArticles(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      showSnackbar('Erreur lors du chargement des articles', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Gestion des dialogs de suppression
  const handleOpenDeleteDialog = (article) => {
    setDeleteDialog({
      open: true,
      article
    });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({
      open: false,
      article: null
    });
  };

  const handleOpenDeleteMultipleDialog = () => {
    setDeleteMultipleDialog({ open: true });
  };

  const handleCloseDeleteMultipleDialog = () => {
    setDeleteMultipleDialog({ open: false });
  };

  // Gestion du modal de détails
  const handleOpenModal = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  // Delete single article
  const deleteArticle = async () => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/article/${deleteDialog.article._id}`);
      setArticles(articles.filter(article => article._id !== deleteDialog.article._id));
      showSnackbar('Article supprimé avec succès');
      handleCloseDeleteDialog();
    } catch (error) {
      console.error("Error deleting article:", error);
      showSnackbar('Erreur lors de la suppression', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Delete multiple articles
  const deleteSelectedArticles = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedArticles.map((id) => axios.delete(`http://localhost:5000/article/${id}`)));
      showSnackbar(`${selectedArticles.length} article(s) supprimé(s) avec succès`);
      fetchArticles();
      setSelectedArticles([]);
      setCurrentPage(1);
      handleCloseDeleteMultipleDialog();
    } catch (error) {
      console.error("Error deleting articles:", error);
      showSnackbar('Erreur lors de la suppression', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Filter articles based on search term
  const filteredArticles = articles.filter((article) => {
    const searchTermLower = searchTerm.toLowerCase();
    const code = String(article.code || '');
    const designation = String(article.libelle || '');

    const matchesSearch = code.toLowerCase().includes(searchTermLower) ||
                         designation.toLowerCase().includes(searchTermLower);
    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const paginatedArticles = filteredArticles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectArticle = (id) => {
    if (selectedArticles.includes(id)) {
      setSelectedArticles(selectedArticles.filter((articleId) => articleId !== id));
    } else {
      setSelectedArticles([...selectedArticles, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(filteredArticles.map((article) => article._id));
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
              <Inventory sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                Gestion des Articles
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Gérez votre inventaire et catalogue produits
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

            {/* Bouton d'action moderne intégré */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/createArticle')}
                startIcon={<Add />}
                sx={{
                  background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                  color: 'white',
                  px: 4,
                  py: 2,
                  width:"300px",
                  height:"30px",
                  left:"270px",
                  borderRadius: 3,
                  fontSize: '1.1rem',
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
                Nouvel Article
              </Button>
            </Box>

            {/* Section Actions sur sélection multiple */}
            {selectedArticles.length > 0 && (
              <Box sx={{
                mb: 3,
                p: 2,
                background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
                borderRadius: 2,
                border: '1px solid #2196f3'
              }}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
                  {selectedArticles.length} article(s) sélectionné(s)
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<Delete />}
                  onClick={handleOpenDeleteMultipleDialog}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'bold'
                  }}
                >
                  Supprimer la sélection
                </Button>
              </Box>
            )}

            {/* Section Recherche intégrée */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
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
                Recherche d'Articles
              </Typography>
            </Box>
            <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #2c3e50, #34495e)' }} />

            {/* Search bar modernisé */}
            <TextField
              fullWidth
              label="Rechercher un article (code ou désignation)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#2c3e50' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 4,
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
              size="small"
            />

            {/* Section Liste des Articles */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Inventory sx={{
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
                Catalogue des Articles ({filteredArticles.length})
              </Typography>
            </Box>
            <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />

            {loading ? (
              <LinearProgress sx={{
                mb: 3,
                background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #2c3e50, #34495e)'
                }
              }} />
            ) : (
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
                          checked={selectedArticles.length === filteredArticles.length && filteredArticles.length > 0}
                          indeterminate={selectedArticles.length > 0 && selectedArticles.length < filteredArticles.length}
                          onChange={handleSelectAll}
                          size="small"
                          sx={{ color: 'white' }}
                        />
                      </TableCell>
                      {!isMobile && <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Code</TableCell>}
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Article</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Prix</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Stock</TableCell>
                      {!isMobile && <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Image</TableCell>}
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedArticles.map((article) => (
                      <TableRow
                        key={article._id}
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
                          '&:last-child td, &:last-child th': {
                            border: 0
                          }
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedArticles.includes(article._id)}
                            onChange={() => handleSelectArticle(article._id)}
                            size="small"
                          />
                        </TableCell>
                        {!isMobile && <TableCell>{article.code}</TableCell>}
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={2}>
                            {article.image_article ? (
                              <Avatar
                                src={`data:image/jpeg;base64,${Buffer.from(article.image_article).toString("base64")}`}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  border: '2px solid #95a5a6'
                                }}
                                variant="rounded"
                              />
                            ) : (
                              <Avatar sx={{
                                background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                                color: 'white'
                              }}>
                                <Inventory />
                              </Avatar>
                            )}
                            <Box>
                              <Typography sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                                {article.libelle}
                              </Typography>
                              {isMobile && article.code && (
                                <Typography variant="caption" color="text.secondary">
                                  Code: {article.code}
                                </Typography>
                              )}
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${article.prix_totale_concre} TND`}
                            sx={{
                              backgroundColor: '#e3f2fd',
                              color: '#2c3e50',
                              fontWeight: 'bold',
                              borderRadius: 2
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={article.Nombre_unite}
                            sx={{
                              backgroundColor: article.Nombre_unite > 0 ? '#d4edda' : '#f8d7da',
                              color: article.Nombre_unite > 0 ? '#155724' : '#721c24',
                              fontWeight: 'bold',
                              borderRadius: 2
                            }}
                            size="small"
                          />
                        </TableCell>
                        {!isMobile && (
                          <TableCell>
                            {article.image_article ? (
                              <Avatar
                                src={`data:image/jpeg;base64,${Buffer.from(article.image_article).toString("base64")}`}
                                sx={{
                                  width: 40,
                                  height: 40,
                                  border: '2px solid #95a5a6'
                                }}
                                variant="rounded"
                              />
                            ) : (
                              <Avatar sx={{
                                width: 40,
                                height: 40,
                                bgcolor: '#95a5a6',
                                color: 'white'
                              }}>
                                <Inventory fontSize="small" />
                              </Avatar>
                            )}
                          </TableCell>
                        )}
                        <TableCell align="right">
                          <Tooltip title="Voir détails">
                            <ActionButton
                              onClick={() => {
                                setSelectedArticle(article);
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
                              onClick={() => navigate(`/updateArticle/${article._id}`)}
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
                              onClick={() => handleOpenDeleteDialog(article)}
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
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination moderne */}
            {totalPages > 1 && (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mt: 3,
                gap: 2
              }}>
                <Button
                  variant="outlined"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  sx={{
                    borderColor: '#2c3e50',
                    color: '#2c3e50',
                    '&:hover': {
                      borderColor: '#34495e',
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                >
                  Précédent
                </Button>

                <Typography variant="body2" sx={{
                  px: 2,
                  py: 1,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 1,
                  fontWeight: 'bold',
                  color: '#2c3e50'
                }}>
                  Page {currentPage} sur {totalPages}
                </Typography>

                <Button
                  variant="outlined"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  sx={{
                    borderColor: '#2c3e50',
                    color: '#2c3e50',
                    '&:hover': {
                      borderColor: '#34495e',
                      backgroundColor: '#f8f9fa'
                    }
                  }}
                >
                  Suivant
                </Button>
              </Box>
            )}
          </CardContent>
        </ModernCard>

        {/* Article Details Modal */}
        <Dialog
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              width: isMobile ? '95vw' : '700px'
            }
          }}
        >
          <DialogTitle sx={{
            fontWeight: '600',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
            color: 'white'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Inventory />
              Détails de l'Article
            </Box>
            <IconButton onClick={() => setIsModalOpen(false)} size="small" sx={{ color: 'white' }}>
              <Close />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 3 }}>
            {selectedArticle && (
              <Stack spacing={3}>
                {/* En-tête avec image et infos principales */}
                <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  {selectedArticle.image_article ? (
                    <Avatar
                      src={`data:image/jpeg;base64,${Buffer.from(selectedArticle.image_article).toString("base64")}`}
                      sx={{
                        width: 100,
                        height: 100,
                        border: '3px solid #95a5a6',
                        borderRadius: 2
                      }}
                      variant="rounded"
                    />
                  ) : (
                    <Avatar sx={{
                      width: 100,
                      height: 100,
                      background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                      color: 'white',
                      borderRadius: 2
                    }}>
                      <Inventory sx={{ fontSize: 40 }} />
                    </Avatar>
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2c3e50', mb: 1 }}>
                      {selectedArticle.libelle}
                    </Typography>
                    <Chip
                      label={`Code: ${selectedArticle.code}`}
                      sx={{
                        backgroundColor: '#e3f2fd',
                        color: '#2c3e50',
                        fontWeight: 'bold'
                      }}
                    />
                  </Box>
                </Box>

                <Divider />

                {/* Informations détaillées */}
            <Box sx={{
  display: 'grid',
  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
  gap: 3,
  mb: 3
}}>
  {/* Carte Prix TTC */}
  <Card sx={{
    borderRadius: '12px',
    background: 'rgba(76, 175, 80, 0.08)',
    border: '1px solid rgba(76, 175, 80, 0.2)',
    backdropFilter: 'blur(5px)',
    boxShadow: '0 4px 20px rgba(76, 175, 80, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(76, 175, 80, 0.2)'
    }
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
        <Avatar sx={{ 
          bgcolor: 'rgba(76, 175, 80, 0.1)', 
          color: '#4caf50',
          width: 40,
          height: 40
        }}>
          <AttachMoney fontSize="small" />
        </Avatar>
        <Typography variant="subtitle1" sx={{ 
          fontWeight: '600', 
          color: '#2e7d32',
          letterSpacing: '0.5px'
        }}>
          Prix TTC
        </Typography>
      </Box>
      <Typography variant="h5" sx={{ 
        fontWeight: '700', 
        color: '#1b5e20',
        display: 'flex',
        alignItems: 'baseline',
        gap: 1
      }}>
        {selectedArticle.prix_totale_concre}
        <Typography variant="body2" component="span" sx={{ 
          color: '#388e3c',
          fontWeight: '500'
        }}>
          TND
        </Typography>
      </Typography>
      <Typography variant="caption" sx={{ 
        display: 'block',
        mt: 0.5,
        color: '#4caf50',
        fontStyle: 'italic'
      }}>
        Toutes taxes comprises
      </Typography>
    </CardContent>
  </Card>

  {/* Carte Stock */}
  <Card sx={{
    borderRadius: '12px',
    background: selectedArticle.Nombre_unite > 0 
      ? 'rgba(76, 175, 80, 0.08)' 
      : 'rgba(244, 67, 54, 0.08)',
    border: selectedArticle.Nombre_unite > 0 
      ? '1px solid rgba(76, 175, 80, 0.2)' 
      : '1px solid rgba(244, 67, 54, 0.2)',
    backdropFilter: 'blur(5px)',
    boxShadow: selectedArticle.Nombre_unite > 0 
      ? '0 4px 20px rgba(76, 175, 80, 0.1)' 
      : '0 4px 20px rgba(244, 67, 54, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: selectedArticle.Nombre_unite > 0 
        ? '0 8px 25px rgba(76, 175, 80, 0.2)' 
        : '0 8px 25px rgba(244, 67, 54, 0.2)'
    }
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
        <Avatar sx={{ 
          bgcolor: selectedArticle.Nombre_unite > 0 
            ? 'rgba(76, 175, 80, 0.1)' 
            : 'rgba(244, 67, 54, 0.1)',
          color: selectedArticle.Nombre_unite > 0 ? '#4caf50' : '#f44336',
          width: 40,
          height: 40
        }}>
          <Inventory fontSize="small" />
        </Avatar>
        <Typography variant="subtitle1" sx={{ 
          fontWeight: '600', 
          color: selectedArticle.Nombre_unite > 0 ? '#2e7d32' : '#c62828',
          letterSpacing: '0.5px'
        }}>
          Stock
        </Typography>
      </Box>
      <Typography variant="h5" sx={{ 
        fontWeight: '700', 
        color: selectedArticle.Nombre_unite > 0 ? '#1b5e20' : '#b71c1c'
      }}>
        {selectedArticle.Nombre_unite} unités
      </Typography>
      {selectedArticle.Nombre_unite <= 0 && (
        <Typography variant="caption" sx={{ 
          display: 'block',
          mt: 0.5,
          color: '#f44336',
          fontStyle: 'italic'
        }}>
          Rupture de stock
        </Typography>
      )}
      {selectedArticle.Nombre_unite > 0 && selectedArticle.Nombre_unite < 10 && (
        <Typography variant="caption" sx={{ 
          display: 'block',
          mt: 0.5,
          color: '#fb8c00',
          fontStyle: 'italic'
        }}>
          Stock faible
        </Typography>
      )}
    </CardContent>
  </Card>

  

  {/* Carte TVA */}
  <Card sx={{
    borderRadius: '12px',
    background: 'rgba(255, 152, 0, 0.08)',
    border: '1px solid rgba(255, 152, 0, 0.2)',
    backdropFilter: 'blur(5px)',
    boxShadow: '0 4px 20px rgba(255, 152, 0, 0.1)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 25px rgba(255, 152, 0, 0.2)'
    }
  }}>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
        <Avatar sx={{ 
          bgcolor: 'rgba(255, 152, 0, 0.1)', 
          color: '#ff9800',
          width: 40,
          height: 40
        }}>
          <Category fontSize="small" />
        </Avatar>
        <Typography variant="subtitle1" sx={{ 
          fontWeight: '600', 
          color: '#e65100',
          letterSpacing: '0.5px'
        }}>
          TVA
        </Typography>
      </Box>
      <Typography variant="h5" sx={{ 
        fontWeight: '700', 
        color: '#bf360c',
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        {selectedArticle.tva}%
        <Typography variant="body2" component="span" sx={{ 
          color: '#ef6c00',
          fontWeight: '500'
        }}>
          Taux appliqué
        </Typography>
      </Typography>
      <Typography variant="caption" sx={{ 
        display: 'block',
        mt: 0.5,
        color: '#ff9800',
        fontStyle: 'italic'
      }}>
        Taxe sur la valeur ajoutée
      </Typography>
    </CardContent>
  </Card>
</Box>
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={() => setIsModalOpen(false)}
              sx={{
                borderColor: '#95a5a6',
                color: '#95a5a6',
                '&:hover': {
                  borderColor: '#7f8c8d',
                  backgroundColor: '#f8f9fa'
                }
              }}
            >
              Fermer
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate(`/updateArticle/${selectedArticle._id}`)}
              sx={{
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)'
                }
              }}
            >
              Modifier
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Single Article Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={handleCloseDeleteDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{
            color: '#e74c3c',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Delete />
            Confirmer la suppression
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Êtes-vous sûr de vouloir supprimer l'article "{deleteDialog.article?.libelle}" ?
              Cette action est irréversible.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={handleCloseDeleteDialog}
              variant="outlined"
              sx={{
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
              onClick={deleteArticle}
              variant="contained"
              color="error"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)'
                }
              }}
            >
              {loading ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Multiple Articles Dialog */}
        <Dialog
          open={deleteMultipleDialog.open}
          onClose={handleCloseDeleteMultipleDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle sx={{
            color: '#e74c3c',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Delete />
            Confirmer la suppression multiple
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1">
              Êtes-vous sûr de vouloir supprimer {selectedArticles.length} article(s) sélectionné(s) ?
              Cette action est irréversible.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2, gap: 1 }}>
            <Button
              onClick={handleCloseDeleteMultipleDialog}
              variant="outlined"
              sx={{
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
              onClick={deleteSelectedArticles}
              variant="contained"
              color="error"
              disabled={loading}
              sx={{
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #c0392b 0%, #e74c3c 100%)'
                }
              }}
            >
              {loading ? 'Suppression...' : `Supprimer ${selectedArticles.length} article(s)`}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
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