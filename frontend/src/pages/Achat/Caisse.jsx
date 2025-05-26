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
  InputAdornment,
  Pagination,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  AccountBalanceWallet as WalletIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Height
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import Sidenav from '../../navbar/Sidenav';
import Navbar from '../../navbar/Navbar';

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  color: theme.palette.text.secondary,
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.04)'
  }
}));

const ModernCard = styled(Card)(({ theme }) => ({
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  }
}));

const Caisse = () => {
  const theme = useTheme();
  const [caisses, setCaisses] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCaisse, setSelectedCaisse] = useState(null);
  const [formData, setFormData] = useState({ libelle: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchCaisses();
  }, []);

  const fetchCaisses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/caisse/AllCaisses');
      setCaisses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors de la récupération des caisses:', error);
      showSnackbar('Erreur lors de la récupération des caisses', 'error');
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
      if (selectedCaisse) {
        await axios.put(`http://localhost:5000/caisse/${selectedCaisse._id}`, formData);
        showSnackbar('Caisse modifiée avec succès');
      } else {
        await axios.post('http://localhost:5000/caisse/createCaisse', formData);
        showSnackbar('Caisse créée avec succès');
      }
      await fetchCaisses();
      handleCloseDialog();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      showSnackbar('Erreur lors de la sauvegarde', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette caisse ?')) {
      try {
        setLoading(true);
        await axios.delete(`http://localhost:5000/caisse/${id}`);
        showSnackbar('Caisse supprimée avec succès');
        await fetchCaisses();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        showSnackbar('Erreur lors de la suppression', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenDialog = (caisse = null) => {
    setSelectedCaisse(caisse);
    setFormData({
      libelle: caisse?.libelle || '',
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCaisse(null);
    setFormData({ libelle: '' });
  };

  const filteredCaisses = caisses.filter(caisse =>
    caisse.libelle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCaisses = filteredCaisses.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  return (
    <>
       <Navbar />
                   <Box height={150} />

    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f9fafb' }}>
   
      
      <Sidenav />
      <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 10 }}>
        <ModernCard sx={{ mb: 3 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <WalletIcon />
                </Avatar>
                <Typography variant="h5" fontWeight="bold">Gestion des Caisses</Typography>
              </Stack>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenDialog()}
                sx={{
                  borderRadius: '12px',
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                    bgcolor: theme.palette.primary.dark
                  }
                }}
              >
                Nouvelle Caisse
              </Button>
            </Stack>
          </CardContent>
        </ModernCard>

        <ModernCard>
          <CardContent>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Rechercher une caisse..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { borderRadius: '12px' }
              }}
              sx={{ mb: 3 }}
            />

            {loading ? (
              <LinearProgress sx={{ my: 2 }} />
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <StyledTableCell>Libellé</StyledTableCell>
                        <StyledTableCell align="right">Statut</StyledTableCell>
                        <StyledTableCell align="right">Actions</StyledTableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedCaisses.length > 0 ? (
                        paginatedCaisses.map((caisse) => (
                          <TableRow key={caisse._id} hover>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar sx={{ bgcolor: theme.palette.success.light }}>
                                  <WalletIcon sx={{ color: theme.palette.success.main }} />
                                </Avatar>
                                <Typography fontWeight="medium">{caisse.libelle}</Typography>
                              </Stack>
                            </TableCell>
                            <TableCell align="right">
                              <Chip
                                icon={<CheckCircleIcon fontSize="small" />}
                                label="Active"
                                color="success"
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Tooltip title="Modifier">
                                <ActionButton
                                  onClick={() => handleOpenDialog(caisse)}
                                  color="primary"
                                >
                                  <EditIcon />
                                </ActionButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <ActionButton
                                  onClick={() => handleDelete(caisse._id)}
                                  color="error"
                                >
                                  <DeleteIcon />
                                </ActionButton>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                              <CancelIcon color="disabled" sx={{ fontSize: 48, mb: 1 }} />
                              <Typography color="textSecondary">
                                Aucune caisse trouvée
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {filteredCaisses.length > rowsPerPage && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                    <Pagination
                      count={Math.ceil(filteredCaisses.length / rowsPerPage)}
                      page={page}
                      onChange={(e, value) => setPage(value)}
                      shape="rounded"
                      color="primary"
                    />
                  </Box>
                )}
              </>
            )}
          </CardContent>
        </ModernCard>

        {/* Dialog pour créer/modifier une caisse */}
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          PaperProps={{
            sx: {
              borderRadius: '16px',
              width: '100%',
              maxWidth: '500px'
            }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: theme.palette.primary.main, 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <WalletIcon />
            {selectedCaisse ? 'Modifier la Caisse' : 'Créer une Caisse'}
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ py: 4 }}>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Libellé de la caisse"
                value={formData.libelle}
                onChange={(e) => setFormData({ ...formData, libelle: e.target.value })}
                margin="normal"
                required
                variant="outlined"
                sx={{ mb: 3 }}
                InputProps={{
                  sx: { borderRadius: '12px' }
                }}
              />
            </Box>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 3 }}>
            <Button
              onClick={handleCloseDialog}
              variant="outlined"
              sx={{ 
                borderRadius: '12px',
                textTransform: 'none',
                px: 3,
                py: 1
              }}
            >
              Annuler
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              sx={{ 
                borderRadius: '12px',
                textTransform: 'none',
                px: 3,
                py: 1,
                boxShadow: 'none',
                '&:hover': {
                  boxShadow: 'none'
                }
              }}
            >
              {selectedCaisse ? 'Enregistrer' : 'Créer'}
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
              success: <CheckCircleIcon fontSize="inherit" />,
              error: <CancelIcon fontSize="inherit" />
            }}
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