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
  Grid,
  Snackbar,
  Alert,
  CardContent
} from "@mui/material";
import { Visibility, Delete, Edit, Search, Add, Business, Phone, Email, LocationOn, CheckCircle } from "@mui/icons-material";

export default function Fournisseur() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFournisseurId, setSelectedFournisseurId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFournisseurs, setSelectedFournisseurs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
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
    fournisseur.raison_sociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fournisseur.matricule_fiscale.toLowerCase().includes(searchTerm.toLowerCase())
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

  const handleDeleteClick = (fournisseur) => {
    setSelectedFournisseur(fournisseur);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteFournisseur(selectedFournisseur._id);
      setOpenDialog(false);
      setOpenSnackbar(true);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <Navbar />
      <Box height={70} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto", maxHeight: "100vh" }}>
          <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" component="h1" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                  <Business sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Gestion des Fournisseurs
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate('/createFournisseur')}
                  startIcon={<Add />}
                  sx={{ 
                    borderRadius: '8px',
                    backgroundColor: '#1976d2',
                    '&:hover': { backgroundColor: '#1565c0' }
                  }}
                >
                  Nouveau Fournisseur
                </Button>
              </Box>

              {/* Barre de recherche */}
              <Card sx={{ mb: 3, backgroundColor: '#f8f9fa', boxShadow: 2 }}>
                <CardContent>
                  <TextField
                    fullWidth
                    label="Rechercher un fournisseur"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search color="primary" />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                      }
                    }}
                  />
                </CardContent>
              </Card>

              {/* Tableau des fournisseurs */}
              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Raison Sociale</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Matricule Fiscale</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Téléphone</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Adresse</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredFournisseurs.map((fournisseur) => (
                      <TableRow key={fournisseur._id} hover>
                        <TableCell>{fournisseur.raison_sociale}</TableCell>
                        <TableCell>{fournisseur.matricule_fiscale}</TableCell>
                        <TableCell>{fournisseur.telephone}</TableCell>
                        <TableCell>{fournisseur.email}</TableCell>
                        <TableCell>{fournisseur.adresse}</TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => navigate(`/updateFournisseur/${fournisseur._id}`)}
                            sx={{ mr: 1 }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(fournisseur)}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
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
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer le fournisseur "{selectedFournisseur?.raison_sociale}" ?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenDialog(false)}
            sx={{ 
              color: '#666',
              '&:hover': { backgroundColor: '#f5f5f5' }
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            sx={{ 
              borderRadius: '8px',
              '&:hover': { backgroundColor: '#d32f2f' }
            }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar de notification */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        TransitionComponent={Fade}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ 
            width: '100%',
            backgroundColor: '#4caf50',
            color: 'white',
            '& .MuiAlert-icon': {
              color: 'white',
            },
            '& .MuiAlert-action': {
              color: 'white',
            },
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <CheckCircle sx={{ fontSize: 28 }} />
          <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
            Le fournisseur a été supprimé avec succès !
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
}