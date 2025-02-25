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
  Grid,
} from "@mui/material";
import { Visibility, Delete, Edit, Search } from "@mui/icons-material";

export default function Client() {
  const [clients, setClients] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClients, setSelectedClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const navigate = useNavigate();

  const fetchClients = async () => {
    try {
      const response = await axios.get("http://localhost:5000/client/clients");
      setClients(response.data);
    } catch (error) {
      console.error("Error fetching clients:", error);
    }
  };

  const deleteClient = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/client/${id}`);
      fetchClients();
    } catch (error) {
      console.error("Error deleting client:", error);
    }
  };

  const deleteSelectedClients = async () => {
    try {
      await Promise.all(selectedClients.map((id) => axios.delete(`http://localhost:5000/client/${id}`)));
      fetchClients();
      setSelectedClients([]);
    } catch (error) {
      console.error("Error deleting clients:", error);
    }
  };

  const handleOpenDialog = (id) => {
    setSelectedClientId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedClientId(null);
  };

  const handleOpenModal = (client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClient(null);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filteredClients = clients.filter((client) =>
    client.nom_prenom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectClient = (id) => {
    if (selectedClients.includes(id)) {
      setSelectedClients(selectedClients.filter((clientId) => clientId !== id));
    } else {
      setSelectedClients([...selectedClients, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedClients.length === filteredClients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(filteredClients.map((client) => client._id));
    }
  };

  return (
    <>
      <Navbar />
      <Box height={50} />
      <Box sx={{ overflow: "auto", flexGrow: 1, p: 3, display: "flex", backgroundColor: "#FFFFFF" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: "auto",
            backgroundColor: "#FFFFFF",
            maxWidth: "none",
            maxHeight: "100vh",
            marginLeft: "10px",
            width: "100%",
          }}
        >
          <h1>Clients</h1>
          <Box height={50} />

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
            <Button
              variant="contained"
              color="success"
              sx={{ ml: 20 }}
              onClick={() => navigate("/Client/create")}
            >
              Créer un client
            </Button>
          </Box>

          {selectedClients.length > 0 && (
            <Button
              variant="contained"
              color="error"
              sx={{ mb: 2 }}
              onClick={deleteSelectedClients}
            >
              Supprimer les clients sélectionnés
            </Button>
          )}

          <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>
                    <Checkbox
                      checked={selectedClients.length === filteredClients.length}
                      indeterminate={
                        selectedClients.length > 0 &&
                        selectedClients.length < filteredClients.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Nom & Prenom</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Matricule Fiscale</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Adresse</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Telephone</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients.map((client) => (
                  <TableRow key={client._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedClients.includes(client._id)}
                        onChange={() => handleSelectClient(client._id)}
                      />
                    </TableCell>
                    <TableCell>{client.code}</TableCell>
                    <TableCell>{client.nom_prenom}</TableCell>
                    <TableCell>{client.matricule_fiscale}</TableCell>
                    <TableCell>{client.adresse}</TableCell>
                    <TableCell>{client.telephone[0]} | {client.telephone[1]}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpenModal(client)}
                        sx={{ color: "black" }}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenDialog(client._id)}
                        sx={{ color: "black" }}
                      >
                        <Delete />
                      </IconButton>
                      <IconButton
                        onClick={() => navigate(`/Client/update/${client._id}`)}
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
              handleCloseDialog();
            }}
            color="secondary"
          >
            Oui
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal pour afficher les détails du client */}
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
            {selectedClient && (
              <>
                <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: "bold", color: "#1976d2" }}>
                  Détails du Client
                </Typography>

                {/* Informations Générales */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#555" }}>
                      Informations Générales
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Raison Sociale:</strong> {selectedClient.raison_sociale}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Matricule Fiscale:</strong> {selectedClient.matricule_fiscale}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Adresse:</strong> {selectedClient.adresse}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Téléphone 1:</strong> {selectedClient.telephone[0]}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Téléphone 2:</strong> {selectedClient.telephone[1]}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Fax:</strong> {selectedClient.fax}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Informations Complémentaires */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#555" }}>
                      Informations Complémentaires
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Register Commerce:</strong> {selectedClient.register_commerce}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Solde Initial:</strong> {selectedClient.solde_initial}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Montant Rapprochement:</strong> {selectedClient.montant_rapprochement}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Code Rapprochement:</strong> {selectedClient.code_rapprochement}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Rapprochement BL:</strong> {selectedClient.rapBl}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Solde Initial BL:</strong> {selectedClient.solde_initial_bl}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Montant Règlement BL:</strong> {selectedClient.montant_reglement_bl}
                        </Typography>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong>Taux Retenu:</strong> {selectedClient.taux_retenu}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Bouton de fermeture */}
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleCloseModal}
                  sx={{ mt: 2 }}
                >
                  Fermer
                </Button>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </>
  );
}