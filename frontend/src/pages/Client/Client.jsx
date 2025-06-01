import React, { useEffect, useState } from "react";
import axios from "axios";
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
  Box,
  Grid,
    Typography,
    CardContent,
  Card,
  Stack,
  Chip,
  Pagination,
  Avatar,
  Tooltip,
  useMediaQuery,
  useTheme,
  Divider
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
  Badge,
  Add,
  Close
} from "@mui/icons-material";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";
import { useNavigate } from "react-router-dom";

export default function Client() {
  const [clients, setClients] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClients, setSelectedClients] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const itemsPerPage = 4;

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
      setPage(1);
    } catch (error) {
      console.error("Error deleting clients:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

 const filteredClients = clients.filter((client) => {
  const searchTermLower = searchTerm.toLowerCase();
  return (
    client.nom_prenom?.toLowerCase().includes(searchTermLower) ||
    client.matricule_fiscale?.toLowerCase().includes(searchTermLower) ||
    (client.code && client.code.toString().toLowerCase().includes(searchTermLower))
  );
});

  const paginatedClients = filteredClients.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

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
      <Box height={70} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: isMobile ? 2 : 3,
          overflow: "auto",
          maxHeight: "calc(100vh - 70px)"
        }}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
            border: '1px solid',
            borderColor: 'divider'
          }}>
            <CardContent>
              {/* Header */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  <Person sx={{ 
                    mr: 1, 
                    verticalAlign: 'middle', 
                    color: 'primary.main' 
                  }} />
                  Gestion des Clients
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/Client/create")}
                  startIcon={<Add />}
                  size={isMobile ? "small" : "medium"}
                  sx={{ 
                    borderRadius: '12px',
                    textTransform: 'none',
                    px: 3,
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' }
                  }}
                >
                  Nouveau Client
                </Button>
              </Box>

              {/* Search and Bulk Actions */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                mb: 3,
                flexDirection: isMobile ? 'column' : 'row',
                gap: 2
              }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: '12px',
                      backgroundColor: 'background.paper',
                      '&:hover': { backgroundColor: 'action.hover' }
                    }
                  }}
                  sx={{
                    maxWidth: isMobile ? '100%' : '400px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderWidth: '1px',
                        borderColor: 'divider'
                      },
                      '&:hover fieldset': {
                        borderColor: 'primary.main'
                      }
                    }
                  }}
                />

                {selectedClients.length > 0 && (
                  <Button
                    variant="contained"
                    color="error"
                    onClick={deleteSelectedClients}
                    startIcon={<Delete />}
                    size={isMobile ? "small" : "medium"}
                    sx={{ 
                      borderRadius: '12px',
                      textTransform: 'none',
                      px: 3,
                      ml: isMobile ? 0 : 'auto',
                      boxShadow: 'none',
                      '&:hover': { boxShadow: 'none' }
                    }}
                  >
                    Supprimer ({selectedClients.length})
                  </Button>
                )}
              </Box>

              {/* Client Table */}
              <TableContainer 
                component={Paper} 
                sx={{ 
                  borderRadius: 2, 
                  boxShadow: 'none', 
                  border: '1px solid', 
                  borderColor: 'divider',
                  mb: 2
                }}
              >
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'background.default' }}>
                      <TableCell padding="checkbox" sx={{ width: '48px' }}>
                        <Checkbox
                          checked={selectedClients.length === filteredClients.length && filteredClients.length > 0}
                          indeterminate={selectedClients.length > 0 && selectedClients.length < filteredClients.length}
                          onChange={handleSelectAll}
                          size="small"
                        />
                      </TableCell>
                      {!isMobile && <TableCell sx={{ fontWeight: '600' }}>Code</TableCell>}
                      <TableCell sx={{ fontWeight: '600' }}>Client</TableCell>
                      {!isMobile && <TableCell sx={{ fontWeight: '600' }}>Matricule</TableCell>}
                      <TableCell sx={{ fontWeight: '600' }}>Contact</TableCell>
                      <TableCell align="right" sx={{ fontWeight: '600' }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedClients.map((client) => (
                      <TableRow 
                        key={client._id}
                        hover
                        sx={{ 
                          '&:last-child td': { borderBottom: 0 },
                          '& td': { py: isMobile ? 1 : 1.5 }
                        }}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedClients.includes(client._id)}
                            onChange={() => handleSelectClient(client._id)}
                            size="small"
                          />
                        </TableCell>
                        {!isMobile && <TableCell>{client.code}</TableCell>}
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ 
                              bgcolor: 'primary.main', 
                              width: 32, 
                              height: 32,
                              fontSize: '0.875rem'
                            }}>
                              {client.nom_prenom?.charAt(0) }
                            </Avatar>
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {client.nom_prenom}
                              </Typography>
                              {isMobile && client.code && (
                                <Typography variant="caption" color="text.secondary">
                                  {client.code}
                                </Typography>
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                        {!isMobile && <TableCell>{client.matricule_fiscale}</TableCell>}
                        <TableCell>
                          {isMobile ? (
                            <Box>
                              {client.telephone?.[0] && (
                                <Typography variant="body2">
                                  <Phone fontSize="small" sx={{ 
                                    verticalAlign: 'middle', 
                                    mr: 0.5,
                                    color: 'text.secondary'
                                  }} />
                                  {client.telephone[0]}
                                </Typography>
                              )}
                            </Box>
                          ) : (
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                              {client.telephone?.map((tel, index) => (
                                <Chip 
                                  key={index}
                                  label={tel}
                                  size="small"
                                  icon={<Phone fontSize="small" />}
                                  sx={{ mb: 0.5 }}
                                />
                              ))}
                            </Stack>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="Voir détails">
                              <IconButton
                                onClick={() => {
                                  setSelectedClient(client);
                                  setIsModalOpen(true);
                                }}
                                size="small"
                                sx={{ 
                                  color: 'text.secondary',
                                  '&:hover': { color: 'info.main' }
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Modifier">
                              <IconButton
                                onClick={() => navigate(`/Client/update/${client._id}`)}
                                size="small"
                                sx={{ 
                                  color: 'text.secondary',
                                  '&:hover': { color: 'warning.main' }
                                }}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Supprimer">
                              <IconButton
                                onClick={() => {
                                  setSelectedClientId(client._id);
                                  setOpenDialog(true);
                                }}
                                size="small"
                                sx={{ 
                                  color: 'text.secondary',
                                  '&:hover': { color: 'error.main' }
                                }}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

             {/* Pagination */}
{filteredClients.length > itemsPerPage && (
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'center',
    '& .MuiPagination-ul': { flexWrap: 'nowrap' }
  }}>
    <Pagination
      count={Math.ceil(filteredClients.length / itemsPerPage)}
      page={page}
      onChange={handlePageChange}
      shape="rounded"
      color="primary"
      size={isMobile ? "small" : "medium"}
      sx={{
        '& .MuiPaginationItem-root': {
          borderRadius: '8px',
          '&.Mui-selected': { fontWeight: '600' }
        }
      }}
    />
  </Box>
)}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        PaperProps={{
          sx: { 
            borderRadius: 3,
            width: isMobile ? '90vw' : '400px'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: '600' }}>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir supprimer ce client ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenDialog(false)}
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            sx={{ borderRadius: '12px', textTransform: 'none', px: 3 }}
          >
            Annuler
          </Button>
          <Button
            onClick={() => {
              deleteClient(selectedClientId);
              setOpenDialog(false);
            }}
            color="error"
            variant="contained"
            size={isMobile ? "small" : "medium"}
            sx={{ borderRadius: '12px', textTransform: 'none', px: 3 }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Client Details Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 3,
            width: isMobile ? '95vw' : '600px'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: '600',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person color="primary" />
            Détails du Client
          </Box>
          <IconButton onClick={() => setIsModalOpen(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedClient && (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar sx={{ 
                  bgcolor: 'primary.main', 
                  width: 56, 
                  height: 56,
                  fontSize: '1.25rem'
                }}>
                  {selectedClient.nom_prenom?.charAt(0) || 'C'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {selectedClient.nom_prenom}
                  </Typography>
                  {selectedClient.code && (
                    <Typography variant="body2" color="text.secondary">
                      Code: {selectedClient.code}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  INFORMATIONS PRINCIPALES
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Business fontSize="small" color="action" />
                      <Box>
                        <Typography component="span" color="text.secondary">Matricule: </Typography>
                        {selectedClient.matricule_fiscale || 'Non spécifié'}
                      </Box>
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Box>
                        <Typography component="span" color="text.secondary">Adresse: </Typography>
                        {selectedClient.adresse || 'Non spécifié'}
                      </Box>
                    </Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 1 }} />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  COORDONNÉES
                </Typography>
                <Grid container spacing={2}>
                  {selectedClient.telephone?.map((tel, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Phone fontSize="small" color="action" />
                        <Box>
                          <Typography component="span" color="text.secondary">
                            Téléphone {selectedClient.telephone.length > 1 ? index + 1 : ''}: 
                          </Typography> {tel}
                        </Box>
                      </Typography>
                    </Grid>
                  ))}
                  {selectedClient.email && (
                    <Grid item xs={12}>
                      <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Email fontSize="small" color="action" />
                        <Box>
                          <Typography component="span" color="text.secondary">Email: </Typography>
                          {selectedClient.email}
                        </Box>
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>

              {selectedClient.bankAccounts?.length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      COMPTES BANCAIRES
                    </Typography>
                    <Stack spacing={2}>
                      {selectedClient.bankAccounts.map((account, index) => (
                        <Card key={index} variant="outlined" sx={{ borderRadius: 2 }}>
                          <CardContent sx={{ p: 2 }}>
                            <Stack spacing={1}>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {account.banque?.libelle || 'Banque non spécifiée'}
                              </Typography>
                              <Typography variant="body2">
                                <Typography component="span" color="text.secondary">RIB: </Typography>
                                {account.RIB || 'Non spécifié'}
                              </Typography>
                              {account.adresseBanque && (
                                <Typography variant="body2">
                                  <Typography component="span" color="text.secondary">Adresse: </Typography>
                                  {account.adresseBanque}
                                </Typography>
                              )}
                              {account.isPrimary && (
                                <Chip 
                                  label="Compte principal" 
                                  size="small" 
                                  color="primary"
                                  sx={{ alignSelf: 'flex-start', mt: 1 }}
                                />
                              )}
                            </Stack>
                          </CardContent>
                        </Card>
                      ))}
                    </Stack>
                  </Box>
                </>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => navigate(`/Client/update/${selectedClient._id}`)}
            variant="contained"
            startIcon={<Edit />}
            size={isMobile ? "small" : "medium"}
            sx={{ borderRadius: '12px', textTransform: 'none', px: 3 }}
          >
            Modifier
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}