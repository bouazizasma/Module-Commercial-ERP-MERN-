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

export default function FamilleArticle() {
  const [FamilleArticles, setFamilleArticles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false); // Gère l'état du Dialog
  const [selectedFamilleArticleId, setSelectedFamilleArticleId] = useState(null); // client à supprimer
  const navigate = useNavigate();

  // Fetch fournisseurs from the backend
  const fetchFamilleArticle = async () => {
    try {
      const response = await axios.get("http://localhost:5000/familleArticle/familleArticle"); // Update with your backend URL
      setFamilleArticles(response.data);
    } catch (error) {
      console.error("Error fetching FamilleArticle:", error);
    }
  };

  // Delete fournisseur by ID
  const deleteFamilleArticle = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/familleArticle/${id}`);
      fetchFamilleArticle(); // Refresh list after deletion
    } catch (error) {
      console.error("Error deleting FamilleArticle:", error);
    }
  };

  // Open delete confirmation dialog
  const handleOpenDialog = (id) => {
    setSelectedFamilleArticleId(id); // Set the fournisseur ID to be deleted
    setOpenDialog(true); // Open dialog
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false); // Close dialog
    setSelectedFamilleArticleId(null); // Reset selected Client ID
  };

  // Effect to fetch data when component mounts
  useEffect(() => {
    fetchFamilleArticle();
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
            <h1>Famille Article</h1>
            <Button
              variant="contained"
              color="success"
              style={{ marginBottom: "10px" }}
              onClick={() => {
                navigate("/FamilleArticle/create");
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
                  <TableCell>Designation Famille</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {FamilleArticles.map((FamilleArticle) => (
                  <TableRow key={FamilleArticle._id}>
                    <TableCell>{FamilleArticle.code}</TableCell>
                    <TableCell>{FamilleArticle.designationFamille}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleOpenDialog(FamilleArticle._id)} // Open dialog when delete button is clicked
                        style={{ marginRight: "10px" }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="contained"
                        color="inherit"
                        onClick={() => (window.location.href = `/details/${FamilleArticle._id}`)} // Redirect to details page
                        style={{ marginRight: "10px" }}
                      >
                        Details
                      </Button>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={() => navigate(`/FamilleArticle/update/${FamilleArticle._id}`)} // Redirect to update page
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
        <DialogTitle>Supprimer la Famille Article</DialogTitle>
        <DialogContent>
          <p>Êtes-vous sûr de vouloir supprimer ce Famille Article ?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Non
          </Button>
          <Button
            onClick={() => {
                deleteFamilleArticle(selectedFamilleArticleId);
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
