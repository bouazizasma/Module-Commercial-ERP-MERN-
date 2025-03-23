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
} from "@mui/material";
import { 
  Visibility, 
  Delete, 
  Edit, 
  Search, 
  Warehouse,
  LocationOn,
  Badge,
  Label
} from "@mui/icons-material";

export default function Depot() {
  const [depots, setDepots] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDepotId, setSelectedDepotId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepots, setSelectedDepots] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepot, setSelectedDepot] = useState(null);
  const navigate = useNavigate();

  const fetchDepots = async () => {
    try {
      const response = await axios.get("http://localhost:5000/depot/depots");
      setDepots(response.data);
    } catch (error) {
      console.error("Error fetching depots:", error);
    }
  };

  const deleteDepot = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/depot/${id}`);
      fetchDepots();
    } catch (error) {
      console.error("Error deleting depot:", error);
    }
  };

  const deleteSelectedDepots = async () => {
    try {
      await Promise.all(selectedDepots.map((id) => axios.delete(`http://localhost:5000/depot/${id}`)));
      fetchDepots();
      setSelectedDepots([]);
    } catch (error) {
      console.error("Error deleting depots:", error);
    }
  };

  const handleOpenDialog = (id) => {
    setSelectedDepotId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedDepotId(null);
  };

  const handleOpenModal = (depot) => {
    setSelectedDepot(depot);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDepot(null);
  };

  useEffect(() => {
    fetchDepots();
  }, []);

  const filteredDepots = depots.filter((depot) =>
    depot.libelle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectDepot = (id) => {
    if (selectedDepots.includes(id)) {
      setSelectedDepots(selectedDepots.filter((depotId) => depotId !== id));
    } else {
      setSelectedDepots([...selectedDepots, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedDepots.length === filteredDepots.length) {
      setSelectedDepots([]);
    } else {
      setSelectedDepots(filteredDepots.map((depot) => depot._id));
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
              <Warehouse sx={{ fontSize: 40, color: "#1976d2" }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
                Liste des Dépôts
              </Typography>
            </Stack>

            {/* Barre de recherche et bouton Créer */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
              <TextField
                fullWidth
                label="Rechercher un dépôt"
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
                onClick={() => navigate("/Depot/create")}
                startIcon={<Warehouse />}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  backgroundColor: "#2e7d32",
                  "&:hover": {
                    backgroundColor: "#1b5e20",
                  },
                }}
              >
                Créer un dépôt
              </Button>
            </Box>

            {selectedDepots.length > 0 && (
              <Button
                variant="contained"
                color="error"
                sx={{ mb: 2, borderRadius: "8px" }}
                onClick={deleteSelectedDepots}
                startIcon={<Delete />}
              >
                Supprimer les dépôts sélectionnés ({selectedDepots.length})
              </Button>
            )}

            {/* Tableau des dépôts */}
            <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 2, borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedDepots.length === filteredDepots.length}
                        indeterminate={selectedDepots.length > 0 && selectedDepots.length < filteredDepots.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Code Dépôt</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Libellé</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredDepots.map((depot) => (
                    <TableRow 
                      key={depot._id}
                      sx={{ 
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:hover": { backgroundColor: "#f5f5f5" }
                      }}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedDepots.includes(depot._id)}
                          onChange={() => handleSelectDepot(depot._id)}
                        />
                      </TableCell>
                      <TableCell>{depot.code}</TableCell>
                      <TableCell>{depot.codeDepot}</TableCell>
                      <TableCell>{depot.libelle}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            onClick={() => handleOpenModal(depot)}
                            sx={{ color: "#1976d2" }}
                            size="small"
                            title="Voir les détails"
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            onClick={() => navigate(`/Depot/update/${depot._id}`)}
                            sx={{ color: "#ff9800" }}
                            size="small"
                            title="Modifier"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => handleOpenDialog(depot._id)}
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
          Êtes-vous sûr de vouloir supprimer ce dépôt ?
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
              deleteDepot(selectedDepotId);
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

      {/* Modal de détails du dépôt */}
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
            <Warehouse sx={{ color: "#1976d2" }} />
            <Typography variant="h6">
              Détails du Dépôt
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedDepot && (
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Badge sx={{ color: "#1976d2" }} />
                <Typography>
                  <strong>Code :</strong> {selectedDepot.code}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn sx={{ color: "#1976d2" }} />
                <Typography>
                  <strong>Code Dépôt :</strong> {selectedDepot.codeDepot}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Label sx={{ color: "#1976d2" }} />
                <Typography>
                  <strong>Libellé :</strong> {selectedDepot.libelle}
                </Typography>
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
            onClick={() => navigate(`/Depot/update/${selectedDepot._id}`)}
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