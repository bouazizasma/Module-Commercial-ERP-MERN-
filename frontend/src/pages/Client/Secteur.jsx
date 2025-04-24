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
  Stack,
} from "@mui/material";
import { 
  Category,
  Delete, 
  Edit, 
  Search,
  Visibility,
  Label
} from "@mui/icons-material";
import LocationOnIcon from '@mui/icons-material/LocationOn';


export default function Secteur() {
  const [secteurs, setSecteurs] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSecteurId, setSelectedSecteurId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSecteur, setSelectedSecteur] = useState(null);
  const navigate = useNavigate();

  const fetchSecteur = async () => {
    try {
      const response = await axios.get("http://localhost:5000/secteur/Secteurs");
      setSecteurs(response.data);
    } catch (error) {
      console.error("Error fetching Secteur:", error);
    }
  };

  const deleteSecteur = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/secteur/${id}`);
      fetchSecteur();
    } catch (error) {
      console.error("Error deleting Secteur :", error);
    }
  };

  const handleOpenDialog = (id) => {
    setSelectedSecteurId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedSecteurId(null);
  };

  const handleOpenModal = (secteur) => {
    setSelectedSecteur(secteur);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSecteur(null);
  };

  useEffect(() => {
    fetchSecteur();
  }, []);

  const filteredSecteurs = secteurs.filter((secteur) =>
    secteur.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    secteur.codeSecteur.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <Box height={150} />
      <Box sx={{ overflow: "auto", flexGrow: 1, p: 3, display: "flex", backgroundColor: "#f5f5f5" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: "auto",
            backgroundColor: "#f5f5f5",
            maxWidth: "none",
            maxHeight: "100vh",
            width: "100%",
          }}
        >
          <Card sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <LocationOnIcon sx={{ fontSize: 40, color: "#1976d2" }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
                Secteur
              </Typography>
            </Stack>

            {/* Barre de recherche et bouton Créer */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
              <TextField
                fullWidth
                label="Rechercher un Secteur"
                variant="outlined"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  maxWidth: "400px",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search sx={{ color: "#1976d2" }} />
                    </InputAdornment>
                  ),
                }}
              />
              <Button
                variant="contained"
                onClick={() => navigate("/Secteur/create")}
                startIcon={<LocationOnIcon />}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  backgroundColor: "#2e7d32",
                  "&:hover": {
                    backgroundColor: "#1b5e20",
                  },
                }}
              >
                Créer un Secteur
              </Button>
            </Box>

            {/* Tableau des Secteurs */}
            <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 2, borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Code Secteur</TableCell>

                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Désignation</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredSecteurs.map((secteur) => (
                    <TableRow 
                      key={secteur._id}
                      sx={{ 
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:hover": { backgroundColor: "#f5f5f5" }
                      }}
                    >
                      <TableCell>{secteur.code}</TableCell>
                      <TableCell>{secteur.codeSecteur}</TableCell>
                      <TableCell>{secteur.libelle}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            onClick={() => handleOpenModal(secteur)}
                            sx={{ color: "#1976d2" }}
                            size="small"
                            title="Voir les détails"
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            onClick={() => navigate(`/Secteur/update/${secteur._id}`)}
                            sx={{ color: "#ff9800" }}
                            size="small"
                            title="Modifier"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => handleOpenDialog(secteur._id)}
                            sx={{ color: "#d32f2f" }}
                            size="small"
                            title="Supprimer"
                          >
                            <Delete />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
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
        <DialogTitle sx={{ backgroundColor: "#f8f9fa", pb: 2 }}>
          Confirmation de suppression
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          Êtes-vous sûr de vouloir supprimer cet Secteur ?
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog} 
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            Annuler
          </Button>
          <Button
            onClick={() => {
              deleteSecteur(selectedSecteurId);
              handleCloseDialog();
            }}
            variant="contained"
            color="error"
            sx={{ borderRadius: "8px" }}
          >
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de détails de le secteur  */}
      <Dialog
        open={isModalOpen}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: "#f8f9fa",
          borderBottom: "1px solid #e0e0e0",
          pb: 2
        }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Category sx={{ color: "#1976d2" }} />
            <Typography variant="h6">
              Détails de le secteur 
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedSecteur && (
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Label sx={{ color: "#1976d2" }} />
                <Typography>
                  <strong>Code :</strong> {selectedSecteur.code}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Category sx={{ color: "#1976d2" }} />
                <Typography>
                  <strong>Libelle :</strong> {selectedSecteur.libelle}
                </Typography>
              </Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, borderTop: "1px solid #e0e0e0" }}>
          <Button 
            onClick={handleCloseModal}
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            Fermer
          </Button>
          <Button
            onClick={() => navigate(`/Secteur/update/${selectedSecteur._id}`)}
            variant="contained"
            startIcon={<Edit />}
            sx={{ borderRadius: "8px" }}
          >
            Modifier
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
