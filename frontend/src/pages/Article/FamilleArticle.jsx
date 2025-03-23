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
  FolderSpecial,
  Delete, 
  Edit, 
  Search,
  Visibility,
  Label
} from "@mui/icons-material";

export default function FamilleArticle() {
  const [familleArticles, setFamilleArticles] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedFamilleArticleId, setSelectedFamilleArticleId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFamille, setSelectedFamille] = useState(null);
  const navigate = useNavigate();

  const fetchFamilleArticle = async () => {
    try {
      const response = await axios.get("http://localhost:5000/familleArticle/familleArticle");
      setFamilleArticles(response.data);
    } catch (error) {
      console.error("Error fetching FamilleArticle:", error);
    }
  };

  const deleteFamilleArticle = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/familleArticle/${id}`);
      fetchFamilleArticle();
    } catch (error) {
      console.error("Error deleting FamilleArticle:", error);
    }
  };

  const handleOpenDialog = (id) => {
    setSelectedFamilleArticleId(id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedFamilleArticleId(null);
  };

  const handleOpenModal = (famille) => {
    setSelectedFamille(famille);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedFamille(null);
  };

  useEffect(() => {
    fetchFamilleArticle();
  }, []);

  const filteredFamilles = familleArticles.filter((famille) =>
    famille.designationFamille.toLowerCase().includes(searchTerm.toLowerCase()) ||
    famille.code.toLowerCase().includes(searchTerm.toLowerCase())
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
              <FolderSpecial sx={{ fontSize: 40, color: "#1976d2" }} />
              <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
                Familles d'Articles
              </Typography>
            </Stack>

            {/* Barre de recherche et bouton Créer */}
            <Box sx={{ display: "flex", alignItems: "center", mb: 3, gap: 2 }}>
              <TextField
                fullWidth
                label="Rechercher une famille"
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
                onClick={() => navigate("/FamilleArticle/create")}
                startIcon={<FolderSpecial />}
                sx={{
                  borderRadius: "8px",
                  textTransform: "none",
                  backgroundColor: "#2e7d32",
                  "&:hover": {
                    backgroundColor: "#1b5e20",
                  },
                }}
              >
                Créer une famille
              </Button>
            </Box>

            {/* Tableau des familles */}
            <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 2, borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8f9fa" }}>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Code</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Désignation</TableCell>
                    <TableCell sx={{ fontWeight: "bold", color: "#1976d2" }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredFamilles.map((famille) => (
                    <TableRow 
                      key={famille._id}
                      sx={{ 
                        "&:last-child td, &:last-child th": { border: 0 },
                        "&:hover": { backgroundColor: "#f5f5f5" }
                      }}
                    >
                      <TableCell>{famille.code}</TableCell>
                      <TableCell>{famille.designationFamille}</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            onClick={() => handleOpenModal(famille)}
                            sx={{ color: "#1976d2" }}
                            size="small"
                            title="Voir les détails"
                          >
                            <Visibility />
                          </IconButton>
                          <IconButton
                            onClick={() => navigate(`/FamilleArticle/update/${famille._id}`)}
                            sx={{ color: "#ff9800" }}
                            size="small"
                            title="Modifier"
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            onClick={() => handleOpenDialog(famille._id)}
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
          Êtes-vous sûr de vouloir supprimer cette famille d'article ?
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
              deleteFamilleArticle(selectedFamilleArticleId);
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

      {/* Modal de détails de la famille */}
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
            <FolderSpecial sx={{ color: "#1976d2" }} />
            <Typography variant="h6">
              Détails de la Famille
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedFamille && (
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Label sx={{ color: "#1976d2" }} />
                <Typography>
                  <strong>Code :</strong> {selectedFamille.code}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FolderSpecial sx={{ color: "#1976d2" }} />
                <Typography>
                  <strong>Désignation :</strong> {selectedFamille.designationFamille}
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
            onClick={() => navigate(`/FamilleArticle/update/${selectedFamille._id}`)}
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
