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

const Caisse = () => {
  const theme = useTheme();
  const [caisses, setCaisses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCaisse, setSelectedCaisse] = useState(null);
  const [formData, setFormData] = useState({
    libelle: '',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch all caisses on component mount
  useEffect(() => {
    fetchCaisses();
  }, []);

  // Fetch caisses from the backend
  const fetchCaisses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/caisse/AllCaisses');
      setCaisses(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des caisses:', error);
      showSnackbar('Erreur lors de la récupération des caisses', 'error');
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

  // Handle form submission (create or update caisse)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCaisse) {
        await axios.put(`http://localhost:5000/caisse/${selectedCaisse._id}`, formData);
        showSnackbar('Caisse modifiée avec succès');
      } else {
        await axios.post('http://localhost:5000/caisse/createCaisse', formData);
        showSnackbar('Caisse créée avec succès');
      }
      fetchCaisses();
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    }
  };

  // Handle delete caisse
  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette caisse ?')) {
      try {
        await axios.delete(`http://localhost:5000/caisse/${id}`);
        showSnackbar('Caisse supprimée avec succès');
        fetchCaisses();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showSnackbar('Erreur lors de la suppression', 'error');
      }
    }
  };

  // Open dialog for creating or editing a caisse
  const handleOpenDialog = (caisse = null) => {
    if (caisse) {
      setSelectedCaisse(caisse);
      setFormData({
        libelle: caisse.libelle,
      });
    } else {
      setSelectedCaisse(null);
      setFormData({
        libelle: '',
      });
    }
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCaisse(null);
    setFormData({
      libelle: '',
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
                <Typography variant="h4">Liste des Caisses</Typography>
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
                  Nouvelle Caisse
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
                <TableRow>
                  <TableCell sx={{ color: 'white' }}>Libellé</TableCell>
                  <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {caisses.map((caisse) => (
                  <TableRow key={caisse._id}>
                    <TableCell>{caisse.libelle}</TableCell>
                    <TableCell>
                      <Tooltip title="Modifier">
                        <IconButton
                          onClick={() => handleOpenDialog(caisse)}
                          sx={{ color: theme.palette.warning.main }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Supprimer">
                        <IconButton
                          onClick={() => handleDelete(caisse._id)}
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

          {/* Dialog pour créer/modifier une caisse */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            PaperProps={{ sx: { borderRadius: 2 } }}
          >
            <DialogTitle sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
              {selectedCaisse ? 'Modifier la Caisse' : 'Créer une Caisse'}
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
                {selectedCaisse ? 'Modifier' : 'Créer'}
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

export default Caisse;