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
  Typography,
  Card,
  Snackbar,
  Alert,
  CardContent,
  Pagination,
  Tooltip,
  Avatar,
  useMediaQuery,
  useTheme
} from "@mui/material";
import { Delete, Edit, Search, Add, Business, CheckCircle } from "@mui/icons-material";

export default function Fournisseur() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFournisseur, setSelectedFournisseur] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const itemsPerPage = 6;

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
      setOpenSnackbar(true);
      // Reset to first page if the last item on current page is deleted
      if (paginatedFournisseurs.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error) {
      console.error("Error deleting fournisseur:", error);
    }
  };

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  const filteredFournisseurs = fournisseurs.filter((fournisseur) =>
    fournisseur.raison_sociale.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fournisseur.matricule_fiscale.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedFournisseurs = filteredFournisseurs.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  // Calculate empty rows to maintain fixed height
  const emptyRows = itemsPerPage - Math.min(itemsPerPage, filteredFournisseurs.length - (page - 1) * itemsPerPage);

  return (
    <>
      <Navbar />
      <Box height={70} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: isMobile ? 1 : 3,
          overflow: "flex",
          maxHeight: "calc(100vh - 5px)"
        }}>
          <Card sx={{ 
            mb: 3, 
            boxShadow: 3, 
            borderRadius: 3,
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Header and Add Button */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 2,
                flexWrap: 'wrap',
                gap: 2
              }}>
                <Typography variant="h5" component="h1" sx={{ fontWeight: '600' }}>
                  <Business sx={{ mr: 1, verticalAlign: 'middle', color: 'primary.main' }} />
                  Fournisseurs
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/createFournisseur')}
                  startIcon={<Add />}
                  size={isMobile ? "small" : "medium"}
                  sx={{
                    borderRadius: '12px',
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    boxShadow: 'none',
                    '&:hover': { boxShadow: 'none' }
                  }}
                >
                  Ajouter
                </Button>
              </Box>

              {/* Search Bar */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1); // Reset to first page when searching
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
                />
              </Box>

              {/* Table with Fixed Height */}
              <TableContainer 
                component={Paper} 
                sx={{ 
                  borderRadius: 2, 
                  boxShadow: 'none', 
                  border: '1px solid', 
                  borderColor: 'divider',
                  flex: 1,
                  minHeight: `${itemsPerPage * 53}px`, // Fixed height based on itemsPerPage
                  position: 'relative'
                }}
              >
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'background.default' }}>
                      <TableCell sx={{ fontWeight: '600', py: 1 }}>Raison Sociale</TableCell>
                      {!isMobile && <TableCell sx={{ fontWeight: '600', py: 1 }}>Matricule</TableCell>}
                      {!isMobile && <TableCell sx={{ fontWeight: '600', py: 1 }}>Téléphone</TableCell>}
                      <TableCell sx={{ fontWeight: '600', py: 1 }}>Adresse</TableCell>
                      <TableCell sx={{ fontWeight: '600', py: 1 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedFournisseurs.map((fournisseur) => (
                      <TableRow 
                        key={fournisseur._id} 
                        hover
                        sx={{ '& td': { py: 1.5 } }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ 
                              bgcolor: 'primary.main', 
                              width: 32, 
                              height: 32,
                              fontSize: isMobile ? '0.75rem' : '1rem'
                            }}>
                              {fournisseur.raison_sociale.charAt(0)}
                            </Avatar>
                            {isMobile ? (
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {fournisseur.raison_sociale}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {fournisseur.matricule_fiscale}
                                </Typography>
                              </Box>
                            ) : (
                              fournisseur.raison_sociale
                            )}
                          </Box>
                        </TableCell>
                        {!isMobile && <TableCell>{fournisseur.matricule_fiscale}</TableCell>}
                        {!isMobile && <TableCell>{fournisseur.telephone}</TableCell>}
                        <TableCell>
                          {isMobile ? (
                            <Typography variant="body2">
                              {fournisseur.adresse.length > 20 
                                ? `${fournisseur.adresse.substring(0, 20)}...` 
                                : fournisseur.adresse}
                            </Typography>
                          ) : (
                            fournisseur.adresse
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Modifier">
                            <IconButton
                              onClick={() => navigate(`/updateFournisseur/${fournisseur._id}`)}
                              size="small"
                              sx={{ 
                                color: 'text.secondary',
                                '&:hover': { color: 'primary.main' }
                              }}
                            >
                              <Edit fontSize={isMobile ? "small" : "medium"} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Supprimer">
                            <IconButton
                              onClick={() => {
                                setSelectedFournisseur(fournisseur);
                                setOpenDialog(true);
                              }}
                              size="small"
                              sx={{ 
                                color: 'text.secondary',
                                '&:hover': { color: 'error.main' }
                              }}
                            >
                              <Delete fontSize={isMobile ? "small" : "medium"} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {/* Empty rows to maintain fixed height */}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={isMobile ? 3 : 5} />
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination - Always visible */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                mt: 3,
                '& .MuiPagination-ul': { flexWrap: 'nowrap' }
              }}>
                <Pagination
                  count={Math.ceil(filteredFournisseurs.length / itemsPerPage)}
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
            width: isMobile ? '90vw' : '400px',
            mx: isMobile ? 'auto' : undefined
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: '600' }}>Confirmer la suppression</DialogTitle>
        <DialogContent>
          <Typography>
            Voulez-vous vraiment supprimer "{selectedFournisseur?.raison_sociale}" ?
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
              deleteFournisseur(selectedFournisseur._id);
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

      {/* Success Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity="success"
          icon={<CheckCircle fontSize="inherit" />}
          sx={{ borderRadius: '12px' }}
        >
          Fournisseur supprimé avec succès
        </Alert>
      </Snackbar>
    </>
  );
}