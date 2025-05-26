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
  Avatar,
  Chip,
  Divider,
  LinearProgress,
  Pagination,
  InputAdornment,
  Badge as MuiBadge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  AccountBalance as BankIcon,
  LocationOn as AddressIcon,
  CreditCard as AccountIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import Sidenav from '../../navbar/Sidenav';
import Navbar from '../../navbar/Navbar';

// Styles personnalisés
const StyledCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  }
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  }
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  fontWeight: 600,
  borderRadius: '8px'
}));

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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 8;

  const fetchBanques = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/banque/AllBanques');
      setBanques(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des banques:', error);
      showSnackbar('Erreur lors de la récupération des banques', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (selectedBanque) {
        await axios.put(`http://localhost:5000/banque/${selectedBanque._id}`, formData);
        showSnackbar('Banque modifiée avec succès');
      } else {
        await axios.post('http://localhost:5000/banque/createBanque', formData);
        showSnackbar('Banque créée avec succès');
      }
      await fetchBanques();
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette banque ?')) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5000/banque/${id}`);
        showSnackbar('Banque supprimée avec succès');
        await fetchBanques();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showSnackbar('Erreur lors de la suppression', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenDialog = (banque = null) => {
    setSelectedBanque(banque);
    setFormData({
      code_banque: banque?.code_banque || '',
      libelle: banque?.libelle || '',
      adresse: banque?.adresse || '',
      numero_Compte: banque?.numero_Compte || '',
    });
    setOpenDialog(true);
  };

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

  useEffect(() => {
    fetchBanques();
  }, []);

  const filteredBanques = banques.filter(banque =>
    banque.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banque.code_banque.toLowerCase().includes(searchTerm.toLowerCase()) ||
    banque.numero_Compte.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedBanques = filteredBanques.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
      <Navbar />
      <Sidenav />
      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10 }}>
        <StyledCard sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <BankIcon />
              </Avatar>
              <Typography variant="h5" fontWeight="bold">Gestion des Banques</Typography>
            </Stack>

            {/* Barre d'actions */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center', 
              justifyContent: 'space-between',
              gap: 2,
              mb: 3
            }}>
              <TextField
                fullWidth
                size="small"
                label="Rechercher une banque"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  maxWidth: '400px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )
                }}
              />
              
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<FilterIcon />}
                  sx={{ borderRadius: '12px', textTransform: 'none' }}
                >
                  Filtres
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchBanques}
                  sx={{ borderRadius: '12px', textTransform: 'none' }}
                >
                  Actualiser
                </Button>
                <Button
                  variant="contained"
                  onClick={() => handleOpenDialog()}
                  startIcon={<AddIcon />}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: 'none'
                    }
                  }}
                >
                  Nouvelle Banque
                </Button>
              </Stack>
            </Box>

            {/* Tableau des banques */}
            <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
              {loading && <LinearProgress />}
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Libellé</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Code Banque</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Adresse</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Numéro de Compte</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedBanques.length > 0 ? (
                    paginatedBanques.map((banque) => (
                      <TableRow 
                        key={banque._id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell>
                          <Typography fontWeight="medium">{banque.libelle}</Typography>
                        </TableCell>
                        <TableCell>{banque.code_banque}</TableCell>
                        <TableCell>{banque.adresse}</TableCell>
                        <TableCell>{banque.numero_Compte}</TableCell>
                        <TableCell>
                          <StatusChip 
                            label="Active" 
                            color="success" 
                            size="small" 
                            variant="outlined"
                            icon={<BankIcon fontSize="small" />}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Modifier">
                              <ActionButton
                                onClick={() => handleOpenDialog(banque)}
                                color="primary"
                              >
                                <EditIcon fontSize="small" />
                              </ActionButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <ActionButton
                                onClick={() => handleDelete(banque._id)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </ActionButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <BankIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                          <Typography color="text.secondary">
                            {searchTerm ? 'Aucune banque trouvée' : 'Aucune banque disponible'}
                          </Typography>
                          {searchTerm && (
                            <Button 
                              onClick={() => setSearchTerm('')} 
                              size="small" 
                              sx={{ mt: 1 }}
                            >
                              Effacer la recherche
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredBanques.length > rowsPerPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={Math.ceil(filteredBanques.length / rowsPerPage)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  shape="rounded"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </CardContent>
        </StyledCard>

        {/* Dialog pour créer/modifier une banque */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: '16px' }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <BankIcon />
            {selectedBanque ? 'Modifier la Banque' : 'Créer une Banque'}
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ py: 3 }}>
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
                InputProps={{
                  sx: { borderRadius: '12px' }
                }}
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
                InputProps={{
                  sx: { borderRadius: '12px' }
                }}
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
                InputProps={{
                  sx: { borderRadius: '12px' }
                }}
              />
              <TextField
                fullWidth
                label="Numéro de Compte"
                value={formData.numero_Compte}
                onChange={(e) => setFormData({ ...formData, numero_Compte: e.target.value })}
                margin="normal"
                required
                variant="outlined"
                InputProps={{
                  sx: { borderRadius: '12px' }
                }}
              />
            </Box>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ borderRadius: '12px' }}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{ borderRadius: '12px' }}
              disabled={loading}
            >
              {selectedBanque ? 'Enregistrer' : 'Créer'}
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
            sx={{ 
              borderRadius: '12px',
              boxShadow: theme.shadows[6]
            }}
            iconMapping={{
              success: <BankIcon fontSize="inherit" />,
              error: <CloseIcon fontSize="inherit" />
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default Banque;