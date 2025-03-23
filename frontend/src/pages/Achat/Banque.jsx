import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  Card,
  CardContent,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Stack,
  Alert,
  Snackbar,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import axios from 'axios';
import Sidenav from '../../navbar/Sidenav';
import Navbar from '../../navbar/Navbar';

const Banque = () => {
  const theme = useTheme();
  const [banques, setBanques] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBanque, setSelectedBanque] = useState(null);
  const [formData, setFormData] = useState({
    code_banque: '',
    libelle: '',
    adresse: '',
    numero_Compte: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch all banques on component mount
  useEffect(() => {
    fetchBanques();
  }, []);

  // Fetch banques from the backend
  const fetchBanques = async () => {
    try {
      const response = await axios.get('http://localhost:5000/banque/AllBanques');
      setBanques(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des banques:', error);
      showSnackbar('Erreur lors de la récupération des banques', 'error');
    }
  };

  // Show snackbar notification
  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Handle form submission (create or update banque)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedBanque) {
        await axios.put(`http://localhost:5000/banque/${selectedBanque._id}`, formData);
        showSnackbar('Banque modifiée avec succès');
      } else {
        await axios.post('http://localhost:5000/banque/createBanque', formData);
        showSnackbar('Banque créée avec succès');
      }
      fetchBanques();
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    }
  };

  // Handle delete banque
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette banque ?')) {
      try {
        await axios.delete(`http://localhost:5000/banque/${id}`);
        showSnackbar('Banque supprimée avec succès');
        fetchBanques();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showSnackbar('Erreur lors de la suppression', 'error');
      }
    }
  };

  // Open dialog for creating or editing a banque
  const handleOpenDialog = (banque = null) => {
    if (banque) {
      setSelectedBanque(banque);
      setFormData({
        code_banque: banque.code_banque,
        libelle: banque.libelle,
        adresse: banque.adresse,
        numero_Compte: banque.numero_Compte,
      });
    } else {
      setSelectedBanque(null);
      setFormData({
        code_banque: '',
        libelle: '',
        adresse: '',
        numero_Compte: '',
      });
    }
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedBanque(null);
    setFormData({
      code_banque: '',
      libelle: '',
      adresse: '',
      numero_Compte: '',
    });
  };

  return (
    <>
      <Navbar />
      <Box sx={{ display: 'flex', bgcolor: '#f5f5f5', minHeight: '100vh' }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
          <Card sx={{ mb: 3, borderRadius: 2 }}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h4">Liste des Banques</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    px: 3,
                  }}
                >
                  Nouvelle Banque
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>Libellé</TableCell>
                  <TableCell sx={{ color: 'white' }}>Code Banque</TableCell>
                  <TableCell sx={{ color: 'white' }}>Adresse</TableCell>
                  <TableCell sx={{ color: 'white' }}>Numéro de Compte</TableCell>
                  <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {banques.map((banque) => (
                  <TableRow key={banque._id}>
                    <TableCell>{banque.libelle}</TableCell>
                    <TableCell>{banque.code_banque}</TableCell>
                    <TableCell>{banque.adresse}</TableCell>
                    <TableCell>{banque.numero_Compte}</TableCell>
                    <TableCell>
                      <Tooltip title="Modifier">
                        <IconButton
                          onClick={() => handleOpenDialog(banque)}
                          sx={{ color: theme.palette.warning.main }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          onClick={() => handleDelete(banque._id)}
                          sx={{ color: theme.palette.error.main }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Dialog pour créer/modifier une banque */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            PaperProps={{ sx: { borderRadius: 2 } }}
          >
            <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
              {selectedBanque ? 'Modifier la Banque' : 'Créer une Banque'}
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
              <Box component="form" onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="Libellé"
                  value={formData.libelle}
                  onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                  margin="normal"
                  required
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Code Banque"
                  value={formData.code_banque}
                  onChange={(e) => setFormData({ ...formData, code_banque: e.target.value })}
                  margin="normal"
                  required
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Adresse"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  margin="normal"
                  required
                  variant="outlined"
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="Numéro de Compte"
                  value={formData.numero_Compte}
                  onChange={(e) => setFormData({ ...formData, numero_Compte: e.target.value })}
                  margin="normal"
                  required
                  variant="outlined"
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button
                onClick={handleCloseDialog}
                variant="outlined"
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                sx={{ borderRadius: 2, textTransform: 'none' }}
              >
                {selectedBanque ? 'Modifier' : 'Créer'}
              </Button>
            </DialogActions>
          </Dialog>

          {/* Snackbar pour les notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              onClose={handleCloseSnackbar}
              severity={snackbar.severity}
              variant="filled"
              sx={{ borderRadius: 2 }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Box>
    </>
  );
};

export default Banque;