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


export default function Region() {
  const [regions, setRegions] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const navigate = useNavigate();

  const fetchRegion = async () => {
    try {
      const response = await axios.get("http://localhost:5000/region/Regions");
      setRegions(response.data);
    } catch (error) {
      console.error("Error fetching Region:", error);
    }
  };

  const deleteRegion = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/region/${id}`);
      fetchRegion();
    } catch (error) {
      console.error("Error deleting Region :", error);
    }
  };

  const handleOpenDialog = (id) => {
    setSelectedRegionId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedRegionId(null);
  };

  const handleOpenModal = (region) => {
    setSelectedRegion(region);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRegion(null);
  };

  useEffect(() => {
    fetchRegion();
  }, []);

  const filteredRegions = regions.filter((region) =>
    region.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.codeRegion.toLowerCase().includes(searchTerm.toLowerCase())
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
                Region
              </Typography>
            </Stack>

            {/* Barre de recherche et bouton Créer */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
              <TextField
                fullWidth
                label="Rechercher une Region"
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
                onClick={() => navigate("/Region/create")}
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
                Créer une Région
              </Button>
            </Box>

            {/* Tableau des Regions */}
            <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 2, borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Code Region</TableCell>

                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Désignation</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredRegions.map((region) => (
                    <TableRow 
                      key={region._id}
                      sx={{ 
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:hover": { backgroundColor: "#f5f5f5" }
                      }}
                    >
                      <TableCell>{region.code}</TableCell>
                      <TableCell>{region.codeRegion}</TableCell>
                      <TableCell>{region.libelle}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            onClick={() => handleOpenModal(region)}
                            sx={{ color: "#1976d2" }}
                            size="small"
                            title="Voir les détails"
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            onClick={() => navigate(`/Region/update/${region._id}`)}
                            sx={{ color: "#ff9800" }}
                            size="small"
                            title="Modifier"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => handleOpenDialog(region._id)}
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
          Êtes-vous sûr de vouloir supprimer cette Region ?
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
              deleteRegion(selectedRegionId);
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

      {/* Modal de détails de le region  */}
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
              Détails de la Region 
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRegion && (
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Label sx={{ color: "#1976d2" }} />
                <Typography>
                  <strong>Code :</strong> {selectedRegion.code}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Category sx={{ color: "#1976d2" }} />
                <Typography>
                  <strong>Libelle :</strong> {selectedRegion.libelle}
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
            onClick={() => navigate(`/Region/update/${selectedRegion._id}`)}
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
