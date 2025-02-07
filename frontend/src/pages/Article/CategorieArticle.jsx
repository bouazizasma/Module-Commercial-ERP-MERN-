import React, { useEffect, useState } from "react";
import axios from "axios";
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

export default function CategorieArticle() {
  const [CategorieArticles, setCategorieArticles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false); // Gère l'état du Dialog
  const [selectedCategorieArticleId, setSelectedCategorieArticleId] = useState(null); //  à supprimer
  const navigate = useNavigate();

  // Fetch fournisseurs from the backend
  const fetchCategorieArticle = async () => {
    try {
      const response = await axios.get("http://localhost:5000/categorieArticle/CategorieArticles"); // Update with your backend URL
      setCategorieArticles(response.data);
    } catch (error) {
      console.error("Error fetching Categorie Article:", error);
    }
  };

  // Delete fournisseur by ID
  const deleteCategorieArticle = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/categorieArticle/${id}`);
      fetchCategorieArticle(); // Refresh list after deletion
    } catch (error) {
      console.error("Error deleting Categorie Article:", error);
    }
  };

  // Open delete confirmation dialog
  const handleOpenDialog = (id) => {
    setSelectedCategorieArticleId(id); // Set the fournisseur ID to be deleted
    setOpenDialog(true); // Open dialog
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false); // Close dialog
    setSelectedCategorieArticleId(null); // Reset selected Client ID
  };

  // Effect to fetch data when component mounts
  useEffect(() => {
    fetchCategorieArticle();
  }, []);

  return (
    <>
      {/* Navbar fixe */}
      <Navbar />

      <Box height={100} />

      <Box sx={{ display: "flex" }}>
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
              backgroundColor: "#fff",
              paddingBottom: "10px",
              borderBottom: "1px solid #ddd",
            }}
          >
            <h1>Categorie Article</h1>
            <Button
              variant="contained"
              color="success"
              style={{ marginBottom: "10px" }}
              onClick={() => {
                navigate("/categorieArticle/create");
              }}
            >
              Create
            </Button>
          </Box>

          {/* Tableau des fournisseurs */}
          <TableContainer component={Paper} sx={{ marginTop: "20px" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Designation Categorie</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {CategorieArticles.map((CategorieArticle) => (
                  <TableRow key={CategorieArticle._id}>
                    <TableCell>{CategorieArticle.code}</TableCell>
                    <TableCell>{CategorieArticle.designationCategorie}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleOpenDialog(CategorieArticle._id)} // Open dialog when delete button is clicked
                        style={{ marginRight: "10px" }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="contained"
                        color="inherit"
                        onClick={() => (window.location.href = `/details/${CategorieArticle._id}`)} // Redirect to details page
                        style={{ marginRight: "10px" }}
                      >
                        Details
                      </Button>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={() => navigate(`/CategorieArticle/update/${CategorieArticle._id}`)} // Redirect to update page
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
        <DialogTitle>Supprimer la Categorie Article</DialogTitle>
        <DialogContent>
          <p>Êtes-vous sûr de vouloir supprimer cette Categorie d'Article ?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Non
          </Button>
          <Button
            onClick={() => {
                deleteCategorieArticle(selectedCategorieArticleId);
              handleCloseDialog(); // Close dialog after deletion
            }}
            color="warning"
          >
            Oui
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
