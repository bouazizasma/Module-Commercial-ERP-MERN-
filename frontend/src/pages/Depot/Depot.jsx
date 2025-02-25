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
  Grid
} from "@mui/material";
import { Visibility, Delete, Edit, Search } from "@mui/icons-material";

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
          <h1>Depots</h1>
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
              onClick={() => navigate("/Depot/create")}
            >
              Créer un dépôt
            </Button>
          </Box>

          {selectedDepots.length > 0 && (
            <Button
              variant="contained"
              color="error"
              sx={{ mb: 2 }}
              onClick={deleteSelectedDepots}
            >
              Supprimer les dépôts sélectionnés
            </Button>
          )}

          <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>
                    <Checkbox
                      checked={selectedDepots.length === filteredDepots.length}
                      indeterminate={
                        selectedDepots.length > 0 &&
                        selectedDepots.length < filteredDepots.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Code Depot</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Libelle</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDepots.map((depot) => (
                  <TableRow key={depot._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedDepots.includes(depot._id)}
                        onChange={() => handleSelectDepot(depot._id)}
                      />
                    </TableCell>
                    <TableCell>{depot.code}</TableCell>
                    <TableCell>{depot.codeDepot}</TableCell>
                    <TableCell>{depot.libelle}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpenModal(depot)}
                        sx={{ color: "black" }}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenDialog(depot._id)}
                        sx={{ color: "black" }}
                      >
                        <Delete />
                      </IconButton>
                      <IconButton
                        onClick={() => navigate(`/Depot/update/${depot._id}`)}
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

      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Supprimer le dépôt</DialogTitle>
        <DialogContent>
          <p>Êtes-vous sûr de vouloir supprimer ce dépôt ?</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} color="primary">
            Non
          </Button>
          <Button
            onClick={() => {
              deleteDepot(selectedDepotId);
              handleCloseDialog();
            }}
            color="secondary"
          >
            Oui
          </Button>
        </DialogActions>
      </Dialog>

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
            {selectedDepot && (
              <>
                <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: "bold", color: "#1976d2" }}>
                  Détails du Dépôt
                </Typography>
                <Card sx={{ mb: 3, p: 2, boxShadow: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#555" }}>
                    Informations Générales
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Code:</strong> {selectedDepot.code}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Code Depot:</strong> {selectedDepot.codeDepot}
                      </Typography>
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Libelle:</strong> {selectedDepot.libelle}
                      </Typography>
                    </Grid>
                  </Grid>
                </Card>
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