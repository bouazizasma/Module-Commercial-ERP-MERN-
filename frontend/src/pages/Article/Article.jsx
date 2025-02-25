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
  Grid,
} from "@mui/material";
import { Visibility, Delete, Edit, Search } from "@mui/icons-material";
export default function Article() {
  const [articles, setArticles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const navigate = useNavigate();

  // Fetch articles from the backend
  const fetchArticles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/article/articles");
      setArticles(response.data);
    } catch (error) {
      console.error("Error fetching articles:", error);
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
  const filteredArticles = articles.filter((article) =>
    article.libelle.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <>
      {/* Navbar fixe */}
      <Navbar />
      <Box height={70} />
      <Box sx={{ overflow: "auto", flexGrow: 1, p: 3, display: "flex", backgroundColor: "#FFFFFF" }}>
        {/* Sidenav */}
        <Sidenav />
        {/* Contenu principal */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: "auto",
            backgroundColor: "#FFFFFF",
            maxWidth: "none",
            maxHeight: "100vh",
            marginLeft: "10px", // Compense la largeur de la Sidenav
            width: "100%",
          }}
        >
          <h1>Articles</h1>
          <Box height={50} />

          {/* Barre de recherche */}
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <TextField
              fullWidth
              label="Rechercher"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                mb: 2,
                borderRadius: "20px",
                "& .MuiOutlinedInput-root": {
                  borderRadius: "40px",
                },
                width: "400px",
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <Search />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box width={150} />
            {/* Bouton pour créer un nouvel article */}
            <Button
              variant="contained"
              color="success"
              sx={{ ml: 20 }}
              onClick={() => navigate("/Article/create")}
            >
              Créer un article
            </Button>
          </Box>

          {/* Bouton pour supprimer les articles sélectionnés */}
          {selectedArticles.length > 0 && (
            <Button
              variant="contained"
              color="error"
              sx={{ mb: 2 }}
              onClick={deleteSelectedArticles}
            >
              Supprimer les articles sélectionnés
            </Button>
          )}

          {/* Tableau des articles */}
          <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>
                    <Checkbox
                      checked={selectedArticles.length === filteredArticles.length}
                      indeterminate={
                        selectedArticles.length > 0 &&
                        selectedArticles.length < filteredArticles.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Libellé</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Nombre Unité</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Nature</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Image</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedArticles.includes(article._id)}
                        onChange={() => handleSelectArticle(article._id)}
                      />
                    </TableCell>
                    <TableCell>{article.code}</TableCell>
                    <TableCell>{article.libelle}</TableCell>
                    <TableCell>{article.Nombre_unite}</TableCell>
                    <TableCell>{article.Nature}</TableCell>
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
                      {/* Icône pour "Détails" */}
                      <IconButton
                        onClick={() => handleOpenModal(article)}
                        sx={{ color: "black" }}
                      >
                        <Visibility />
                      </IconButton>

                      {/* Icône pour "Supprimer" */}
                      <IconButton
                        onClick={() => handleOpenDialog(article._id)}
                        sx={{ color: "black" }}
                      >
                        <Delete />
                      </IconButton>

                      {/* Icône pour "Modifier" */}
                      <IconButton
                        onClick={() => navigate(`/Article/update/${article._id}`)}
                        sx={{ color: "black" }}
                      >
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Supprimer l'article</DialogTitle>
        <DialogContent>
          <p>Êtes-vous sûr de vouloir supprimer cet article ?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Non
          </Button>
          <Button
            onClick={() => {
              deleteArticle(selectedArticleId);
              handleCloseDialog();
            }}
            color="secondary"
          >
            Oui
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal pour afficher les détails de l'article */}
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
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "80%",
              maxWidth: "800px",
              bgcolor: "#FFFFFF",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {selectedArticle && (
              <>
                {/* Titre de la pop-up */}
                <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: "bold", color: "#1976d2" }}>
                  Détails de l'Article
                </Typography>

                {/* Section Informations Générales */}
                <Card sx={{ mb: 3, p: 2, boxShadow: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#555" }}>
                    Informations Générales
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Code:</strong> {selectedArticle.code}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Libellé:</strong> {selectedArticle.libelle}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Nombre Unité:</strong> {selectedArticle.Nombre_unite}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Nature:</strong> {selectedArticle.Nature}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Image:</strong>
                      </Typography>
                      {selectedArticle.image_article ? (
                        <img
                          src={`data:image/jpeg;base64,${Buffer.from(selectedArticle.image_article).toString("base64")}`}
                          style={{ width: "100px", height: "100px", borderRadius: "5px" }}
                        />
                      ) : (
                        <span>Pas d'image</span>
                      )}
                    </Grid>
                  </Grid>
                </Card>

                {/* Bouton de fermeture */}
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleCloseModal}
                    sx={{ mt: 2 }}
                  >
                    Fermer
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </>
  );
}