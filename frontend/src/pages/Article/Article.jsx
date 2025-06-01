import React, { useEffect, useState } from "react";
import axios from "axios";
import { Buffer } from "buffer";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
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
  Checkbox,
  Modal,
  Backdrop,
  Fade,
  Typography,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TablePagination,
  Avatar,
  Chip,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Visibility, Delete, Edit, Search, CheckCircle, Add, Inventory } from "@mui/icons-material";

export default function Article() {
  const [articles, setArticles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch articles from the backend
  const fetchArticles = async () => {
    try {
      const [articlesResponse, famillesResponse] = await Promise.all([
        axios.get("http://localhost:5000/article/articles"),
      ]);
      setArticles(articlesResponse.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
    }
  };

  // Delete article by ID
  const deleteArticle = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/article/${id}`);
      fetchArticles(); // Refresh list after deletion
    } catch (error) {
      console.error("Error deleting Article:", error);
    }
  };

  // Delete multiple articles by IDs
  const deleteSelectedArticles = async () => {
    try {
      await Promise.all(selectedArticles.map((id) => axios.delete(`http://localhost:5000/article/${id}`)));
      fetchArticles(); // Refresh list after deletion
      setSelectedArticles([]); // Clear selected articles
    } catch (error) {
      console.error("Error deleting Articles:", error);
    }
  };

  // Open delete confirmation dialog
  const handleOpenDialog = (id) => {
    setSelectedArticleId(id);
    setOpenDialog(true);
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedArticleId(null);
  };

  // Open details modal
  const handleOpenModal = (article) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  // Close details modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
  };

  // Effect to fetch data when component mounts
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

  // Handle checkbox selection
  const handleSelectArticle = (id) => {
    if (selectedArticles.includes(id)) {
      setSelectedArticles(selectedArticles.filter((articleId) => articleId !== id));
    } else {
      setSelectedArticles([...selectedArticles, id]);
    }
  };

  // Handle select all checkboxes
  const handleSelectAll = () => {
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([]); // Deselect all
    } else {
      setSelectedArticles(filteredArticles.map((article) => article._id)); // Select all
    }
  };

  const handleDeleteClick = (article) => {
    setSelectedArticle(article);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axios.delete(`http://localhost:5000/article/${selectedArticle._id}`);
      setArticles(articles.filter(article => article._id !== selectedArticle._id));
      setOpenDialog(false);
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Empty rows for pagination
  const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredArticles.length - page * rowsPerPage);

  return (
    <>
      <Navbar />
      <Box height={70} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: isMobile ? 1 : 3, 
          overflow: "auto", 
          maxHeight: "100vh",
          backgroundColor: '#f5f7fa'
        }}>
          <Card sx={{ 
            mb: 3, 
            boxShadow: 3, 
            borderRadius: 2,
            border: 'none',
            backgroundColor: 'white'
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 2 : 0
              }}>
                <Typography variant="h5" component="h1" sx={{ 
                  color: theme.palette.primary.main, 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Inventory sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Gestion des Articles
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/createArticle')}
                  startIcon={<Add />}
                  sx={{ 
                    borderRadius: '8px',
                    textTransform: 'none',
                    fontWeight: '600',
                    boxShadow: 'none',
                    '&:hover': { 
                      boxShadow: 'none',
                      backgroundColor: theme.palette.primary.dark
                    }
                  }}
                  size={isMobile ? 'small' : 'medium'}
                >
                  Nouvel Article
                </Button>
              </Box>

              {/* Search bar */}
              <Card sx={{ 
                mb: 3, 
                backgroundColor: '#f8f9fa', 
                boxShadow: 'none',
                border: '1px solid #e0e0e0'
              }}>
                <CardContent sx={{ 
                  display: 'flex', 
                  gap: 2,
                  flexDirection: isMobile ? 'column' : 'row',
                  alignItems: isMobile ? 'stretch' : 'center'
                }}>
                  <TextField
                    fullWidth
                    label="Rechercher un article"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                      },
                      '& .MuiInputLabel-root': {
                        transform: 'translate(14px, 14px) scale(1)',
                      },
                      '& .MuiInputLabel-shrink': {
                        transform: 'translate(14px, -6px) scale(0.75)',
                      }
                    }}
                    size="small"
                  />
                </CardContent>
              </Card>

              {/* Articles table */}
              <TableContainer component={Paper} sx={{ 
                borderRadius: 2, 
                boxShadow: 'none',
                border: '1px solid #e0e0e0',
                overflowX: 'auto'
              }}>
                <Table sx={{ minWidth: 650 }} size="small" aria-label="articles table">
                  <TableHead sx={{ backgroundColor: theme.palette.primary.light }}>
                    <TableRow>
                      <TableCell sx={{ 
                        fontWeight: 'bold', 
                        color: 'white',
                        fontSize: '0.875rem'
                      }}>Code</TableCell>
                      <TableCell sx={{ 
                        fontWeight: 'bold', 
                        color: 'white',
                        fontSize: '0.875rem'
                      }}>Désignation</TableCell>
                      <TableCell sx={{ 
                        fontWeight: 'bold', 
                        color: 'white',
                        fontSize: '0.875rem'
                      }}>Prix TTC</TableCell>
                      <TableCell sx={{ 
                        fontWeight: 'bold', 
                        color: 'white',
                        fontSize: '0.875rem'
                      }}>Stock</TableCell>
                      <TableCell sx={{ 
                        fontWeight: 'bold', 
                        color: 'white',
                        fontSize: '0.875rem'
                      }}>Image</TableCell>
                      <TableCell sx={{ 
                        fontWeight: 'bold', 
                        color: 'white',
                        fontSize: '0.875rem'
                      }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(rowsPerPage > 0
                      ? filteredArticles.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      : filteredArticles
                    ).map((article) => (
                      <TableRow 
                        key={article._id} 
                        hover
                        sx={{ 
                          '&:nth-of-type(even)': { 
                            backgroundColor: '#f9f9f9' 
                          },
                          '&:last-child td, &:last-child th': { 
                            border: 0 
                          }
                        }}
                      >
                        <TableCell sx={{ fontSize: '0.875rem' }}>{article.code}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>{article.libelle}</TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          <Chip 
                            label={`${article.prix_totale_concre} TND`} 
                            color="primary" 
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.875rem' }}>
                          <Chip 
                            label={article.Nombre_unite} 
                            color={article.Nombre_unite > 0 ? "success" : "error"} 
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {article.image_article ? (
                            <Avatar
                              src={`data:image/jpeg;base64,${Buffer.from(article.image_article).toString("base64")}`}
                              sx={{ width: 40, height: 40 }}
                              variant="rounded"
                            />
                          ) : (
                            <Avatar sx={{ width: 40, height: 40, bgcolor: theme.palette.grey[300] }}>
                              <Inventory fontSize="small" />
                            </Avatar>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              color="primary"
                              onClick={() => handleOpenModal(article)}
                              size="small"
                              sx={{ 
                                backgroundColor: theme.palette.action.hover,
                                '&:hover': {
                                  backgroundColor: theme.palette.primary.light,
                                  color: 'white'
                                }
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="secondary"
                              onClick={() => navigate(`/updateArticle/${article._id}`)}
                              size="small"
                              sx={{ 
                                backgroundColor: theme.palette.action.hover,
                                '&:hover': {
                                  backgroundColor: theme.palette.secondary.light,
                                  color: 'white'
                                }
                              }}
                            >
                              <Edit fontSize="small" />
                            </IconButton>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteClick(article)}
                              size="small"
                              sx={{ 
                                backgroundColor: theme.palette.action.hover,
                                '&:hover': {
                                  backgroundColor: theme.palette.error.light,
                                  color: 'white'
                                }
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredArticles.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Articles par page:"
                  sx={{
                    borderTop: '1px solid #e0e0e0',
                    '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                      fontSize: '0.875rem'
                    }
                  }}
                />
              </TableContainer>
            </CardContent>
          </Card>

          {/* Details modal */}
          <Modal
            open={isModalOpen}
            onClose={handleCloseModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={isModalOpen}>
              <Box sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: isMobile ? '90%' : 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 3,
                borderRadius: 2,
                outline: 'none'
              }}>
                {selectedArticle && (
                  <>
                    <Typography variant="h6" component="h2" gutterBottom sx={{ 
                      color: theme.palette.primary.main,
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}>
                      <Inventory fontSize="inherit" />
                      Détails de l'article
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: 2,
                      mt: 2
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          minWidth: 120,
                          color: theme.palette.text.secondary
                        }}>Code:</Typography>
                        <Typography variant="body2">{selectedArticle.code}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          minWidth: 120,
                          color: theme.palette.text.secondary
                        }}>Désignation:</Typography>
                        <Typography variant="body2">{selectedArticle.libelle}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          minWidth: 120,
                          color: theme.palette.text.secondary
                        }}>Prix d'achat:</Typography>
                        <Typography variant="body2">{selectedArticle.prix_achat} TND</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          minWidth: 120,
                          color: theme.palette.text.secondary
                        }}>Stock:</Typography>
                        <Typography variant="body2">{selectedArticle.Nombre_unite}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          minWidth: 120,
                          color: theme.palette.text.secondary
                        }}>Famille:</Typography>
                        <Typography variant="body2">{selectedArticle.libelleFamille}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          minWidth: 120,
                          color: theme.palette.text.secondary
                        }}>TVA:</Typography>
                        <Typography variant="body2">{selectedArticle.tva}%</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold', 
                          minWidth: 120,
                          color: theme.palette.text.secondary
                        }}>Fodec:</Typography>
                        <Typography variant="body2">{selectedArticle.fodec}%</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'flex-end', 
                      mt: 3
                    }}>
                      <Button 
                        onClick={handleCloseModal} 
                        variant="outlined"
                        size="small"
                        sx={{
                          textTransform: 'none',
                          borderRadius: '8px'
                        }}
                      >
                        Fermer
                      </Button>
                    </Box>
                  </>
                )}
              </Box>
            </Fade>
          </Modal>

          {/* Delete confirmation dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            PaperProps={{
              sx: {
                borderRadius: 2,
                padding: 2,
                minWidth: isMobile ? '90%' : 400
              }
            }}
          >
            <DialogTitle id="alert-dialog-title" sx={{ 
              fontWeight: 'bold',
              color: theme.palette.error.main,
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <Delete color="error" />
              Confirmer la suppression
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1">
                Êtes-vous sûr de vouloir supprimer cet article ?
              </Typography>
              {selectedArticle && (
                <Typography variant="body2" sx={{ 
                  mt: 1,
                  fontStyle: 'italic',
                  color: theme.palette.text.secondary
                }}>
                  Article: {selectedArticle.code} - {selectedArticle.libelle}
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ 
              justifyContent: 'space-between',
              padding: 2
            }}>
              <Button 
                onClick={handleCloseDialog} 
                variant="outlined"
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none'
                }}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleDeleteConfirm} 
                color="error" 
                variant="contained"
                sx={{
                  borderRadius: '8px',
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                    backgroundColor: theme.palette.error.dark
                  }
                }}
              >
                Supprimer
              </Button>
            </DialogActions>
          </Dialog>

          {/* Success snackbar */}
          <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity="success"
              variant="filled"
              sx={{ width: '100%' }}
            >
              Article supprimé avec succès
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </>
  );
}