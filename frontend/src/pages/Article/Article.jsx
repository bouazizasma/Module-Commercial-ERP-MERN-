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
    const designation = String(article.designation || '');
    
    const matchesSearch = code.toLowerCase().includes(searchTermLower) ||
                         designation.toLowerCase().includes(searchTermLower);
    return matchesSearch ;
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

  return (
    <>
      <Navbar />
      <Box height={70} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto", maxHeight: "100vh" }}>
          <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
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
                    backgroundColor: '#1976d2',
                    '&:hover': { backgroundColor: '#1565c0' }
                  }}
                >
                  Nouvel Article
                </Button>
              </Box>

              {/* Barre de recherche */}
              <Card sx={{ mb: 3, backgroundColor: '#f8f9fa', boxShadow: 2 }}>
                <CardContent sx={{ display: 'flex', gap: 2 }}>
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
                      }
                    }}
                  />
                 {/* <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Filtrer par famille</InputLabel>
                    <Select
                      value={filterFamille}
                      onChange={(e) => setFilterFamille(e.target.value)}
                      label="Filtrer par famille"
                    >
                      <MenuItem value="">Toutes les familles</MenuItem>
                      {familles.map((famille) => (
                        <MenuItem key={famille._id} value={famille._id}>
                          {famille.nom}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  */}
                </CardContent>
              </Card>

              {/* Tableau des articles */}
              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Code</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Désignation</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Prix TTC</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Stock</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Image</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredArticles.map((article) => (
                      <TableRow key={article._id} hover>
                        <TableCell>{article.code}</TableCell>
                        <TableCell>{article.libelle}</TableCell>
                        <TableCell>{article.prix_totale_concre} TND</TableCell>
                        <TableCell>{article.Nombre_unite}</TableCell>
                        <TableCell>
                      {article.image_article ? (
                        <img
                          src={`data:image/jpeg;base64,${Buffer.from(article.image_article).toString("base64")}`}
                          style={{ width: "50px", height: "50px", borderRadius: "5px" }}
                        />
                      ) : (
                        <span>Pas d'image</span>
                      )}
                    </TableCell>
                        <TableCell>
                          <IconButton
                            color="info"
                            onClick={() => handleOpenModal(article)}
                            sx={{ mr: 1 }}
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/updateArticle/${article._id}`)}
                            sx={{ mr: 1 }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(article)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Modal de détails */}
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
                width: 400,
                bgcolor: 'background.paper',
                boxShadow: 24,
                p: 4,
                borderRadius: 2,
              }}>
                {selectedArticle && (
                  <>
                    <Typography variant="h6" component="h2" gutterBottom>
                      Détails de l'article
                    </Typography>
                    <Typography><strong>Code:</strong> {selectedArticle.code}</Typography>
                    <Typography><strong>Désignation:</strong> {selectedArticle.libelle}</Typography>
                    <Typography><strong>Prix d'achat:</strong> {selectedArticle.prix_achat} TND</Typography>
                    <Typography><strong>Stock :</strong> {selectedArticle.Nombre_unite}</Typography>
                    <Typography><strong>Famille:</strong> {selectedArticle.libelleFamille}</Typography>
                    <Typography><strong>TVA:</strong> {selectedArticle.tva}%</Typography>
                    <Typography><strong>Fodec:</strong> {selectedArticle.fodec}%</Typography>
                  </>
                )}
              </Box>
            </Fade>
          </Modal>

          {/* Dialog de confirmation de suppression */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"Confirmer la suppression"}
            </DialogTitle>
            <DialogContent>
              <Typography>
                Êtes-vous sûr de vouloir supprimer cet article ?
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Annuler
              </Button>
              <Button onClick={handleDeleteConfirm} color="error" autoFocus>
                Supprimer
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar de confirmation */}
          <Snackbar
            open={openSnackbar}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity="success"
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