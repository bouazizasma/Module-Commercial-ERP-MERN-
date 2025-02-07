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

export default function Client() {
  const [clients, setClients] = useState([]);
  const [openDialog, setOpenDialog] = useState(false); // Gère l'état du Dialog
  const [selectedClientId, setSelectedClientId] = useState(null); // client à supprimer
  const navigate = useNavigate();

  // Fetch fournisseurs from the backend
  const fetchClients = async () => {
    try {
      const response = await axios.get("http://localhost:5000/client/clients"); // Update with your backend URL
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  // Delete fournisseur by ID
  const deleteClient = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/client/${id}`);
      fetchClients(); // Refresh list after deletion
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  // Open delete confirmation dialog
  const handleOpenDialog = (id) => {
    setSelectedClientId(id); // Set the fournisseur ID to be deleted
    setOpenDialog(true); // Open dialog
  };

  // Close the dialog
  const handleCloseDialog = () => {
    setOpenDialog(false); // Close dialog
    setSelectedClientId(null); // Reset selected Client ID
  };

  // Effect to fetch data when component mounts
  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <>
      {/* Navbar fixe */}
      <Navbar />

      <Box sx={{ overflow: "auto",  flexGrow: 1,
            p: 3,display: "flex" , backgroundColor: "#f5f5f5",}}>
        {/* Sidenav */}
        <Sidenav />

        {/* Contenu principal */}
        <Box
          component="main"
          sx={{
            backgroundColor: "#f5f5f5",
            p: 170,
            overflow: "auto", // Activer le scroll pour le contenu
            maxHeight: "500vh", // Fixer une hauteur maximale pour le contenu principal
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
            <h1>Clients</h1>
            <Button
              variant="contained"
              color="success"
              style={{ marginBottom: "10px" }}
              onClick={() => {
                navigate("/Client/create");
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
                  <TableCell>Nom & Prenom</TableCell>
                  <TableCell>matricule Fiscale</TableCell>
                  <TableCell>Adresse</TableCell>
                  <TableCell>Telephone</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client._id}>
                    <TableCell>{client.code}</TableCell>
                    <TableCell>{client.nom_prenom}</TableCell>
                    <TableCell>{client.matricule_fiscale}</TableCell>
                    <TableCell>{client.adresse}</TableCell>
                    <TableCell> {client.telephone[0]} | {client.telephone[1]}</TableCell>
                    <TableCell>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleOpenDialog(client._id)} // Open dialog when delete button is clicked
                        style={{ marginRight: "10px" }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="contained"
                        color="inherit"
                        onClick={() => (window.location.href = `/details/${client._id}`)} // Redirect to details page
                        style={{ marginRight: "10px" }}
                      >
                        Details
                      </Button>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={() => navigate(`/Client/update/${client._id}`)} // Redirect to update page
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
        <DialogTitle>Supprimer le client</DialogTitle>
        <DialogContent>
          <p>Êtes-vous sûr de vouloir supprimer ce client ?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Non
          </Button>
          <Button
            onClick={() => {
                deleteClient(selectedClientId);
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
