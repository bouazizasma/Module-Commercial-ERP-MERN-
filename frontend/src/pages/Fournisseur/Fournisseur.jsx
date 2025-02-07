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

export default function Fournisseur() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false); // Gère l'état du Dialog
  const [selectedFournisseurId, setSelectedFournisseurId] = useState(null); // Fournisseur à supprimer
  const navigate = useNavigate();

  // Fetch fournisseurs from the backend
  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/fournisseur/fournisseurs"); // Update with your backend URL
      setFournisseurs(response.data);
    } catch (error) {
      console.error("Error fetching fournisseurs:", error);
    }
  };

  // Delete fournisseur by ID
  const deleteFournisseur = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/fournisseur/${id}`);
      fetchFournisseurs(); // Refresh list after deletion
    } catch (error) {
      console.error("Error deleting fournisseur:", error);
    }
  };

  // Open delete confirmation dialog
  const handleOpenDialog = (id) => {
    setSelectedFournisseurId(id); // Set the fournisseur ID to be deleted
    setOpenDialog(true); // Open dialog
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false); // Close dialog
    setSelectedFournisseurId(null); // Reset selected fournisseur ID
  };

  // Effect to fetch data when component mounts
  useEffect(() => {
    fetchFournisseurs();
  }, []);

  return (
    <>
      {/* Navbar fixe */}
      <Navbar />


      <Box sx={{ overflow: "auto",  flexGrow: 1,
            p: 3,display: "flex", backgroundColor: "#f5f5f5",}}>
        {/* Sidenav */}
        <Sidenav />

        {/* Contenu principal */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 10,
            backgroundColor: "#f5f5f5",
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
            <h1>Fournisseurs</h1>
            <Button
              variant="contained"
              color="success"
              style={{ marginBottom: "10px" }}
              onClick={() => {
                navigate("/Fournisseur/create");
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
                  <TableCell>Raison Sociale</TableCell>
                  <TableCell>Matricule Fiscale</TableCell>
                  <TableCell>Adresse</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fournisseurs.map((fournisseur) => (
                  <TableRow key={fournisseur._id}>
                    <TableCell>{fournisseur.code}</TableCell>
                    <TableCell>{fournisseur.raison_sociale}</TableCell>
                    <TableCell>{fournisseur.matricule_fiscale}</TableCell>
                    <TableCell>{fournisseur.adresse}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleOpenDialog(fournisseur._id)} // Open dialog when delete button is clicked
                        style={{ marginRight: "10px" }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="contained"
                        color="inherit"
                        onClick={() => navigate( `/Fournisseur/details/${fournisseur._id}`)} // Redirect to update page
                        style={{ marginRight: "10px" }}
                      >
                        Details
                      </Button>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={() => navigate( `/Fournisseur/update/${fournisseur._id}`)} // Redirect to update page
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
        <DialogTitle>Supprimer le fournisseur</DialogTitle>
        <DialogContent>
          <p>Êtes-vous sûr de vouloir supprimer ce fournisseur ?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Non
          </Button>
          <Button
            onClick={() => {
              deleteFournisseur(selectedFournisseurId);
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
