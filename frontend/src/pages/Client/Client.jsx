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
  Typography,
  Card,
  Stack,
  Chip,
} from "@mui/material";
import { 
  Visibility, 
  Delete, 
  Edit, 
  Search, 
  Person, 
  Phone, 
  LocationOn, 
  Business, 
  Email,
  Badge 
} from "@mui/icons-material";

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
      <Box height={150} />
      <Box sx={{ overflow: "auto", flexGrow: 1, p: 3, display: "flex", backgroundColor: "#f5f5f5" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: "auto",
            backgroundColor: "#f5f5f5",
            maxWidth: "none",
            maxHeight: "100vh",
            width: "100%",
          }}
        >
          <Card sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Person sx={{ fontSize: 40, color: "#1976d2" }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
                Liste des Clients
              </Typography>
            </Stack>

            {/* Barre de recherche et bouton Créer */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
              <TextField
                fullWidth
                label="Rechercher un client"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  maxWidth: "400px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#1976d2" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={() => navigate("/Client/create")}
                startIcon={<Person />}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  backgroundColor: "#2e7d32",
                  "&:hover": {
                    backgroundColor: "#1b5e20",
                  },
                }}
              >
                Créer un client
              </Button>
            </Box>

            {selectedClients.length > 0 && (
              <Button
                variant="contained"
                color="error"
                sx={{ mb: 2, borderRadius: "8px" }}
                onClick={deleteSelectedClients}
                startIcon={<Delete />}
              >
                Supprimer les clients sélectionnés ({selectedClients.length})
              </Button>
            )}

            {/* Tableau des clients */}
            <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 2, borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedClients.length === filteredClients.length}
                        indeterminate={selectedClients.length > 0 && selectedClients.length < filteredClients.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Nom & Prénom</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Matricule Fiscale</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Adresse</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Téléphone</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow 
                      key={client._id}
                      sx={{ 
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:hover": { backgroundColor: "#f5f5f5" }
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedClients.includes(client._id)}
                          onChange={() => handleSelectClient(client._id)}
                        />
                      </TableCell>
                      <TableCell>{client.code}</TableCell>
                      <TableCell>{client.nom_prenom}</TableCell>
                      <TableCell>{client.matricule_fiscale}</TableCell>
                      <TableCell>{client.adresse}</TableCell>
                      <TableCell>
                        {client.telephone.map((tel, index) => (
                          <Chip 
                            key={index}
                            label={tel}
                            size="small"
                            sx={{ mr: 1, backgroundColor: "#e3f2fd" }}
                            icon={<Phone sx={{ fontSize: 16 }} />}
                          />
                        ))}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            onClick={() => handleOpenModal(client)}
                            sx={{ color: "#1976d2" }}
                            size="small"
                            title="Voir les détails"
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            onClick={() => navigate(`/Client/update/${client._id}`)}
                            sx={{ color: "#ff9800" }}
                            size="small"
                            title="Modifier"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => handleOpenDialog(client._id)}
                            sx={{ color: "#d32f2f" }}
                            size="small"
                            title="Supprimer"
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Box>
      </Box>

      {/* Dialog de confirmation de suppression */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ backgroundColor: "#f8f9fa", pb: 2 }}>
          Confirmation de suppression
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          Êtes-vous sûr de vouloir supprimer ce client ?
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            Annuler
          </Button>
          <Button
            onClick={() => {
              deleteClient(selectedClientId);
              handleCloseDialog();
            }}
            variant="contained"
            color="error"
            sx={{ borderRadius: "8px" }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de détails du client */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #e0e0e0",
          pb: 2
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Person sx={{ color: "#1976d2" }} />
            <Typography variant="h6">
              Détails du Client
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedClient && (
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge sx={{ color: "#1976d2" }} />
                <Typography>
                  <strong>Code :</strong> {selectedClient.code}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person sx={{ color: "#1976d2" }} />
                <Typography>
                  <strong>Nom & Prénom :</strong> {selectedClient.nom_prenom}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business sx={{ color: "#1976d2" }} />
                <Typography>
                  <strong>Matricule Fiscale :</strong> {selectedClient.matricule_fiscale}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: "#1976d2" }} />
                <Typography>
                  <strong>Adresse :</strong> {selectedClient.adresse}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Phone sx={{ color: "#1976d2" }} />
                <Typography>
                  <strong>Téléphones :</strong>
                  {selectedClient.telephone.map((tel, index) => (
                    <Chip 
                      key={index}
                      label={tel}
                      size="small"
                      sx={{ ml: 1, backgroundColor: "#e3f2fd" }}
                    />
                  ))}
                </Typography>
              </Box>
              {selectedClient.email && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ color: "#1976d2" }} />
                  <Typography>
                    <strong>Email :</strong> {selectedClient.email}
                  </Typography>
                </Box>
              )}

<Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
          Comptes Bancaires:
        </Typography>
        {selectedClient.bankAccounts?.length > 0 ? (
          <Box sx={{ 
            border: '1px solid #e0e0e0', 
            borderRadius: 1,
            p: 2 
          }}>
            {selectedClient.bankAccounts.map((account, index) => (
              <Box key={index} sx={{ mb: 2, pb: 2, borderBottom: index < selectedClient.bankAccounts.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Business sx={{ color: "#1976d2" }} />
                  <Box>
                    <Typography><strong>Banque:</strong> {account.banque?.libelle || 'Non spécifié'}</Typography>
                    <Typography><strong>RIB:</strong> {account.RIB}</Typography>
                    <Typography><strong>Adresse:</strong> {account.adresseBanque || 'Non spécifié'}</Typography>
                    {account.isPrimary && (
                      <Chip 
                        label="Compte principal" 
                        size="small" 
                        color="primary" 
                        sx={{ mt: 1 }}
                      />
                    )}
                  </Box>
                </Stack>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography>Aucun compte bancaire enregistré</Typography>
        )}
      </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #e0e0e0" }}>
          <Button 
            onClick={handleCloseModal}
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            Fermer
          </Button>
          <Button
            onClick={() => navigate(`/Client/update/${selectedClient._id}`)}
            variant="contained"
            startIcon={<Edit />}
            sx={{ borderRadius: "8px" }}
          >
            Modifier
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}