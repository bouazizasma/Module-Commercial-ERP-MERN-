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

export default function Fournisseur() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFournisseurId, setSelectedFournisseurId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFournisseurs, setSelectedFournisseurs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const navigate = useNavigate();

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/fournisseur/fournisseurs");
      setFournisseurs(response.data);
    } catch (error) {
      console.error("Error fetching fournisseurs:", error);
    }
  };

  const deleteFournisseur = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/fournisseur/${id}`);
      fetchFournisseurs();
    } catch (error) {
      console.error("Error deleting fournisseur:", error);
    }
  };

  const deleteSelectedFournisseurs = async () => {
    try {
      await Promise.all(selectedFournisseurs.map((id) => axios.delete(`http://localhost:5000/fournisseur/${id}`)));
      fetchFournisseurs();
      setSelectedFournisseurs([]);
    } catch (error) {
      console.error("Error deleting fournisseurs:", error);
    }
  };

  const handleOpenDialog = (id) => {
    setSelectedFournisseurId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFournisseurId(null);
  };

  const handleOpenModal = (fournisseur) => {
    setSelectedFournisseur(fournisseur);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFournisseur(null);
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const filteredFournisseurs = fournisseurs.filter((fournisseur) =>
    fournisseur.raison_sociale.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectFournisseur = (id) => {
    if (selectedFournisseurs.includes(id)) {
      setSelectedFournisseurs(selectedFournisseurs.filter((fournisseurId) => fournisseurId !== id));
    } else {
      setSelectedFournisseurs([...selectedFournisseurs, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedFournisseurs.length === filteredFournisseurs.length) {
      setSelectedFournisseurs([]);
    } else {
      setSelectedFournisseurs(filteredFournisseurs.map((fournisseur) => fournisseur._id));
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
          <h1>Fournisseurs</h1>
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
              onClick={() => navigate("/Fournisseur/create")}
            >
              Créer un fournisseur
            </Button>
          </Box>

          {selectedFournisseurs.length > 0 && (
            <Button
              variant="contained"
              color="error"
              sx={{ mb: 2 }}
              onClick={deleteSelectedFournisseurs}
            >
              Supprimer les fournisseurs sélectionnés
            </Button>
          )}

          <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 3 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>
                    <Checkbox
                      checked={selectedFournisseurs.length === filteredFournisseurs.length}
                      indeterminate={
                        selectedFournisseurs.length > 0 &&
                        selectedFournisseurs.length < filteredFournisseurs.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Raison Sociale</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Matricule Fiscale</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Adresse</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFournisseurs.map((fournisseur) => (
                  <TableRow key={fournisseur._id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedFournisseurs.includes(fournisseur._id)}
                        onChange={() => handleSelectFournisseur(fournisseur._id)}
                      />
                    </TableCell>
                    <TableCell>{fournisseur.code}</TableCell>
                    <TableCell>{fournisseur.raison_sociale}</TableCell>
                    <TableCell>{fournisseur.matricule_fiscale}</TableCell>
                    <TableCell>{fournisseur.adresse}</TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => handleOpenModal(fournisseur)}
                        sx={{ color: "black" }}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        onClick={() => handleOpenDialog(fournisseur._id)}
                        sx={{ color: "black" }}
                      >
                        <Delete />
                      </IconButton>
                      <IconButton
                        onClick={() => navigate(`/Fournisseur/update/${fournisseur._id}`)}
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
              handleCloseDialog();
            }}
            color="secondary"
          >
            Oui
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal pour afficher les détails du fournisseur */}
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
      {selectedFournisseur && (
        <>
          {/* Titre de la pop-up */}
          <Typography variant="h4" component="h2" sx={{ mb: 3, fontWeight: "bold", color: "#1976d2" }}>
            Détails du Fournisseur
          </Typography>

          {/* Section Informations Générales */}
          <Card sx={{ mb: 3, p: 2, boxShadow: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#555" }}>
              Informations Générales
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Code:</strong> {selectedFournisseur.code}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Raison Sociale:</strong> {selectedFournisseur.raison_sociale}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Matricule Fiscale:</strong> {selectedFournisseur.matricule_fiscale}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Adresse:</strong> {selectedFournisseur.adresse}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Téléphone:</strong> {selectedFournisseur.telephone.join(" | ")}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Fax:</strong> {selectedFournisseur.fax}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Register Commerce:</strong> {selectedFournisseur.register_commerce}
                </Typography>
              </Grid>
            </Grid>
          </Card>

          {/* Section Informations Financières */}
          <Card sx={{ mb: 3, p: 2, boxShadow: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#555" }}>
              Informations Financières
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Solde Initial:</strong> {selectedFournisseur.solde_initial}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Montant Rapprochement:</strong> {selectedFournisseur.montant_rapprochement}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Code Rapprochement:</strong> {selectedFournisseur.code_rapprochement}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Rapebe:</strong> {selectedFournisseur.rapebe}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Solde Initial Ebe:</strong> {selectedFournisseur.solde_initial_ebe}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Montant Paie Ebe:</strong> {selectedFournisseur.montant_paie_ebe}
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  <strong>Taux Retenu:</strong> {selectedFournisseur.taux_retenu}
                </Typography>
              </Grid>
            </Grid>
          </Card>

          {/* Bouton de fermeture */}
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