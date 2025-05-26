import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";
import Navbar from "../../navbar/Navbar";
import {
  Table,
  CardContent,
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
  Avatar,
  Chip,
  Divider,
  LinearProgress,
  Pagination,
  Tooltip,
  Badge as MuiBadge
} from "@mui/material";
import { 
  Visibility, 
  Delete, 
  Edit, 
  Search, 
  Warehouse,
  LocationOn,
  Badge,
  Label,
  Add,
  FilterList,
  Refresh,
  Close
} from "@mui/icons-material";
import { styled } from '@mui/material/styles';

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

export default function Depot() {
  const [depots, setDepots] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDepotId, setSelectedDepotId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepots, setSelectedDepots] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepot, setSelectedDepot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(8);
  const navigate = useNavigate();

  const fetchDepots = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/depot/depots");
      setDepots(response.data);
    } catch (error) {
      console.error("Error fetching depots:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteDepot = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`http://localhost:5000/depot/${id}`);
      await fetchDepots();
    } catch (error) {
      console.error("Error deleting depot:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSelectedDepots = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedDepots.map((id) => axios.delete(`http://localhost:5000/depot/${id}`)));
      await fetchDepots();
      setSelectedDepots([]);
    } catch (error) {
      console.error("Error deleting depots:", error);
    } finally {
      setLoading(false);
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
    depot.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    depot.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    depot.codeDepot.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedDepots = filteredDepots.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handleSelectDepot = (id) => {
    if (selectedDepots.includes(id)) {
      setSelectedDepots(selectedDepots.filter((depotId) => depotId !== id));
    } else {
      setSelectedDepots([...selectedDepots, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedDepots.length === paginatedDepots.length) {
      setSelectedDepots([]);
    } else {
      setSelectedDepots(paginatedDepots.map((depot) => depot._id));
    }
  };

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
                <Warehouse />
              </Avatar>
              <Typography variant="h5" fontWeight="bold">Gestion des Dépôts</Typography>
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
                label="Rechercher un dépôt"
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
                      <Search color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <Close fontSize="small" />
                    </IconButton>
                  )
                }}
              />
              
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  sx={{ borderRadius: '12px', textTransform: 'none' }}
                >
                  Filtres
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={fetchDepots}
                  sx={{ borderRadius: '12px', textTransform: 'none' }}
                >
                  Actualiser
                </Button>
                <Button
                  variant="contained"
                  onClick={() => navigate("/Depot/create")}
                  startIcon={<Add />}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    boxShadow: 'none',
                    '&:hover': {
                      boxShadow: 'none'
                    }
                  }}
                >
                  Nouveau Dépôt
                </Button>
              </Stack>
            </Box>

            {selectedDepots.length > 0 && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                mb: 2,
                p: 2,
                bgcolor: 'action.selected',
                borderRadius: '12px'
              }}>
                <MuiBadge badgeContent={selectedDepots.length} color="primary">
                  <Typography variant="subtitle1">
                    {selectedDepots.length} dépôt(s) sélectionné(s)
                  </Typography>
                </MuiBadge>
                <Tooltip title="Supprimer les sélectionnés">
                  <IconButton
                    color="error"
                    onClick={deleteSelectedDepots}
                    sx={{ ml: 'auto' }}
                  >
                    <Delete />
                  </IconButton>
                </Tooltip>
              </Box>
            )}

            {/* Tableau des dépôts */}
            <TableContainer component={Paper} sx={{ borderRadius: '12px', overflow: 'hidden' }}>
              {loading && <LinearProgress />}
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell padding="checkbox" sx={{ width: '60px' }}>
                      <Checkbox
                        checked={selectedDepots.length === paginatedDepots.length && paginatedDepots.length > 0}
                        indeterminate={selectedDepots.length > 0 && selectedDepots.length < paginatedDepots.length}
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Code Dépôt</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Libellé</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                    <TableCell sx={{ fontWeight: 600, textAlign: 'right' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedDepots.length > 0 ? (
                    paginatedDepots.map((depot) => (
                      <TableRow 
                        key={depot._id}
                        hover
                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedDepots.includes(depot._id)}
                            onChange={() => handleSelectDepot(depot._id)}
                          />
                        </TableCell>
                        <TableCell>{depot.code}</TableCell>
                        <TableCell>{depot.codeDepot}</TableCell>
                        <TableCell>
                          <Typography fontWeight="medium">{depot.libelle}</Typography>
                        </TableCell>
                        <TableCell>
                          <StatusChip 
                            label="Actif" 
                            color="success" 
                            size="small" 
                            variant="outlined"
                            icon={<Badge fontSize="small" />}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Tooltip title="Voir détails">
                              <ActionButton
                                onClick={() => handleOpenModal(depot)}
                                color="primary"
                              >
                                <Visibility fontSize="small" />
                              </ActionButton>
                            </Tooltip>
                            <Tooltip title="Modifier">
                              <ActionButton
                                onClick={() => navigate(`/Depot/update/${depot._id}`)}
                                color="warning"
                              >
                                <Edit fontSize="small" />
                              </ActionButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <ActionButton
                                onClick={() => handleOpenDialog(depot._id)}
                                color="error"
                              >
                                <Delete fontSize="small" />
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
                          <Warehouse sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                          <Typography color="text.secondary">
                            {searchTerm ? 'Aucun dépôt trouvé' : 'Aucun dépôt disponible'}
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

            {filteredDepots.length > rowsPerPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={Math.ceil(filteredDepots.length / rowsPerPage)}
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

        {/* Dialog de confirmation de suppression */}
        <Dialog 
          open={openDialog} 
          onClose={handleCloseDialog}
          PaperProps={{
            sx: { borderRadius: '16px', width: '100%', maxWidth: '500px' }
          }}
        >
          <DialogTitle sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2
          }}>
            <Delete />
            Confirmation de suppression
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ py: 3 }}>
            <Typography>
              Êtes-vous sûr de vouloir supprimer ce dépôt ? Cette action est irréversible.
            </Typography>
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleCloseDialog} 
              variant="outlined"
              sx={{ borderRadius: '12px' }}
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
              sx={{ borderRadius: '12px' }}
              disabled={loading}
            >
              Confirmer
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
            <Warehouse />
            Détails du Dépôt
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ py: 3 }}>
            {selectedDepot && (
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Badge color="primary" />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Code
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedDepot.code}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOn color="primary" />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Code Dépôt
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedDepot.codeDepot}
                    </Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Label color="primary" />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Libellé
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      {selectedDepot.libelle}
                    </Typography>
                  </Box>
                </Box>
              </Stack>
            )}
          </DialogContent>
          <Divider />
          <DialogActions sx={{ p: 2 }}>
            <Button 
              onClick={handleCloseModal}
              variant="outlined"
              sx={{ borderRadius: '12px' }}
            >
              Fermer
            </Button>
            <Button
              onClick={() => navigate(`/Depot/update/${selectedDepot._id}`)}
              variant="contained"
              startIcon={<Edit />}
              sx={{ borderRadius: '12px' }}
            >
              Modifier
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}