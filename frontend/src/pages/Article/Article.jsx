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
} from "@mui/material";
export default function Article() {
  const [articles, setArticles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false); // Gère l'état du Dialog
  const [selectedArticleId, setSelectedArticleId] = useState(null); // Fournisseur à supprimer
  const navigate = useNavigate();
  // Fetch fournisseurs from the backend
  const fetchArticles = async () => {
    try {
      const response = await axios.get("http://localhost:5000/article/articles"); // Update with your backend URL
      setArticles(response.data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    }
  };
  // Delete fournisseur by ID
  const deleteArticle = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/article/${id}`);
      fetchArticles(); // Refresh list after deletion
    } catch (error) {
      console.error("Error deleting Article:", error);
    }
  };

  // Open delete confirmation dialog
  const handleOpenDialog = (id) => {
    setSelectedArticleId(id); // Set the article ID to be deleted
    setOpenDialog(true); // Open dialog
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false); // Close dialog
    setSelectedArticleId(null); // Reset selected fournisseur ID
  };

  // Effect to fetch data when component mounts
  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <>
      {/* Navbar fixe */}
      <Navbar />
      <Box sx={{ overflow: "auto",  flexGrow: 1,
            p: 3,display: "flex"  ,backgroundColor: "#f5f5f5",}}>
        {/* Sidenav */}
        <Sidenav />
        {/* Contenu principal */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: "auto", // Activer le scroll pour le contenu
            maxHeight: "100vh", // Fixer une hauteur maximale pour le contenu principal
          }}
        >
          {/* Conteneur fixe pour le titre et le bouton */}
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 2,
              backgroundColor: "#f5f5f5",
            }}
          >
            <h1>Articles</h1>
            <Button
              variant="contained"
              color="success"
              style={{ marginBottom: "10px" }}
              onClick={() => {
                navigate("/Article/create");
              }}
            >
              Create
            </Button>
          </Box>

          {/* Tableau des articles */}
          <TableContainer component={Paper} sx={{ marginTop: "20px" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell> <strong>Code</strong></TableCell>
                  <TableCell> <strong>libelle</strong></TableCell>
                  <TableCell> <strong>Nombre Unite</strong></TableCell>
                  <TableCell><strong>Nature</strong></TableCell>
                  <TableCell><strong>Image</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {articles.map((article) => (
                  <TableRow key={article._id}>
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
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleOpenDialog(article._id)} // Open dialog when delete button is clicked
                        style={{ marginRight: "10px" }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="contained"
                        color="inherit"
                        onClick={() => (window.location.href = `/details/${article._id}`)} // Redirect to details page
                        style={{ marginRight: "10px" }}
                      >
                        Details
                      </Button>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={() => navigate( `/Article/update/${article._id}`)} // Redirect to update page
                      >
                        Update
                      </Button>
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
              handleCloseDialog(); // Close dialog after deletion
            }}
            color="secondary"
          >
            Oui
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
