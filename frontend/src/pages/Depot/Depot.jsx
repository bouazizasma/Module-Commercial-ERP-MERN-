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

export default function Depot() {
  const [depots, setDepots] = useState([]);
  const [openDialog, setOpenDialog] = useState(false); // Gère l'état du Dialog
  const [selectedDepotId, setSelectedDepotId] = useState(null); // Fournisseur à supprimer
  
  const navigate = useNavigate();
  

  // Fetch fournisseurs from the backend
  const fetchDepots = async () => {
    try {
      const response = await axios.get("http://localhost:5000/depot/depots"); // Update with your backend URL
      setDepots(response.data);
    } catch (error) {
      console.error("Error fetching Depots:", error);
    }
  };

  // Delete fournisseur by ID
  const deleteDepot = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/depot/${id}`);
      fetchDepots(); // Refresh list after deletion
    } catch (error) {
      console.error("Error deleting Depot:", error);
    }
  };

  // Open delete confirmation dialog
  const handleOpenDialog = (id) => {
    setSelectedDepotId(id); // Set the article ID to be deleted
    setOpenDialog(true); // Open dialog
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false); // Close dialog
    setSelectedDepotId(null); // Reset selected fournisseur ID
  };

  // Effect to fetch data when component mounts
  useEffect(() => {
    fetchDepots();
  }, []);

  return (
    <>
      {/* Navbar fixe */}
      <Navbar />
      <Box sx={{overflow: "auto",  flexGrow: 1,
            p: 3,display: "flex" ,backgroundColor: "#f5f5f5",}}>
        {/* Sidenav */}
        <Sidenav />
        {/* Contenu principal */}
        <Box
          component="main"
          sx={{
            p: 30,
            backgroundColor: "#f5f5f5",
            overflow: "auto", // Activer le scroll pour le contenu
            maxHeight: "500vh", // Fixer une hauteur maximale pour le contenu principal
          }}
        >
          {/* Conteneur fixe pour le titre et le bouton */}
          <Box
            sx={{
              position: "relative",
              //backgroundColor: "#fff",
              paddingBottom: "10px",
               marginTop: "10px", 
            }}
          >
            <h1>Depots</h1>
            <Button
              variant="contained"
              color="success"
              style={{ marginBottom: "3px" }}
              onClick={() => {
                navigate("/Depot/create");
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
                  <TableCell> <strong>Code Depot</strong></TableCell>
                  <TableCell> <strong>Libelle</strong></TableCell>
                  <TableCell><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {depots.map((depot) => (
                  <TableRow key={depot._id}>
                  <TableCell>{depot.code}</TableCell>
                  <TableCell>{depot.codeDepot}</TableCell>
                  <TableCell>{depot.libelle}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleOpenDialog(depot._id)} // Open dialog when delete button is clicked
                        style={{ marginRight: "10px" }}
                      >
                        Delete
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
        <DialogTitle>Supprimer le Depot </DialogTitle>
        <DialogContent>
          <p>Êtes-vous sûr de vouloir supprimer cet Depot ?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Non
          </Button>
          <Button
            onClick={() => {
                deleteDepot(selectedDepotId);
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
