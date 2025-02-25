import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import { Visibility, Delete, Edit } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import {
  Card, CardContent, Typography, Grid, Button, TextField, MenuItem, Select, FormControl, InputLabel, IconButton, Drawer, Modal, Backdrop, Fade, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
 , Dialog, DialogTitle, DialogContent, DialogActions} from "@mui/material";
import { Stack } from "@mui/material";
import { FilterList, Search, Clear } from "@mui/icons-material";
import ReceiptIcon from '@mui/icons-material/Receipt';
import { InputAdornment } from "@mui/material";
import jsPDF from "jspdf";
import 'jspdf-autotable';
export default function ListeBonReceptionFournisseur() {
  const [bonsReception, setBonsReception] = useState([]);
  const [editLignes, setEditLignes] = useState([]); // État pour les lignes modifiables
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    fournisseur: "",
    year: "",
    month: "",
    article: "",
  });
  const [pdfUrl, setPdfUrl] = useState(""); 
  const [openPreviewModal, setOpenPreviewModal] = useState(false);
  const [error, setError] = useState(null);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [selectedBonReception, setSelectedBonReception] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // État pour la pagination
  const itemsPerPage = 5; // Nombre d'éléments par page
  const [editBon, setEditBonReception] = useState(null); // État pour le bon de reception en cours de modification
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // État pour contrôler l'affichage du formulaire de modification
  const [fournisseurs, setFournisseurs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [depots, setDepots] = useState([]);
  const navigate = useNavigate();

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les bons de commande
        const bonsReceptionResponse = await axios.get("http://localhost:5000/achat/BEF/all");
        setBonsReception(bonsReceptionResponse.data);

        // Récupérer les fournisseurs
        const fournisseursResponse = await axios.get("http://localhost:5000/fournisseur/fournisseurs");
        setFournisseurs(fournisseursResponse.data);

        // Récupérer les articles
        const articlesResponse = await axios.get("http://localhost:5000/article/articles");
        setArticles(articlesResponse.data);

        // Récupérer les dépôts
        const depotsResponse = await axios.get("http://localhost:5000/depot/depots");
        setDepots(depotsResponse.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
        setError("Erreur lors de la récupération des données. Veuillez réessayer.");
      }
    };

    fetchData();
  }, []);

  //handleDOWNLOAD

  const handleDownload = (bonReception) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Bon de Reception", 10, 10);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(bonReception.dateReception).toLocaleDateString()}`, 10, 20);
    doc.text(`Bon de Reception: ${bonReception.numero_Bon}`, 10, 30);

    const fournisseur = fournisseurs.find(f => f._id === bonReception.fournisseur._id);
    doc.text(`${fournisseur.raison_sociale}`, 10, 50);
    doc.text(`${fournisseur.adresse || 'N/A'}`, 10, 60);
    doc.text(`Tel: ${fournisseur.telephone || 'N/A'}`, 10, 70);
    //doc.text(`Email: ${fournisseur.email || 'N/A'}`, 10, 80);
  
    doc.text(`Objet : Reception`  , 10, 90);
  
    // Tableau des articles commandés
    doc.autoTable({
      startY: 100,
      head: [['Description', 'Unité', 'Quantité', 'Prix Unitaire HT', 'Total Net']],
      body: bonReception.lignes.map(ligne => [
        ligne.article.libelle,
        'DT',
        ligne.quantite,
        `${ligne.prix_unitaire.toFixed(2)} DT`,
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} DT`
      ]),
    });
  
    // Totaux
    const totalHT = bonReception.lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2;
  
    doc.text(`Montant Total HT: ${totalHT.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 10);
    doc.text(`Total TTC (20%): ${totalTTC.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 20);
    doc.text(`Montant Total TTC: ${totalTTC.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 30);
  
    doc.save(`bon_de_Reception_${bonReception.numero_Bon}.pdf`);
  };

  //handleDOWNLOADFACTURE 
  const handleDownloadFacture = async (bonReception) => {
    try {
      console.log("bonReception:", bonReception); // Debug
     console.log("bonReception._id:", bonReception._id); // Debug

      const response = await axios.post("http://localhost:5000/factureF/generer",
       {
        enteteAchatId: bonReception._id, // Assurez-vous que bonReception._id est bien défini
      },
      { headers: { "Content-Type": "application/json" }}
    );
  
      if (response.data.pdfUrl) {
        setPdfUrl(response.data.pdfUrl); // Stocker l'URL du PDF
        setOpenPreviewModal(true); // Ouvrir la modal de prévisualisation
      }
    } 
    
    catch (error) {
      console.error("Erreur lors de la génération de la facture :", error);
      alert("Erreur lors de la génération de la facture.");
    }
  };
  // Filtrage des bons de Reception
  const filteredBonsReception = useMemo(() => {
    return bonsReception.filter((bonReception) => {
      const matchesSearchTerm =
      bonReception.numero_Bon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bonReception.fournisseur && bonReception.fournisseur.raison_sociale.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bonReception.lignes && bonReception.lignes.some((ligne) =>
          ligne.article.libelle.toLowerCase().includes(searchTerm.toLowerCase())
        ));

      const matchesFilters =
        (!filters.fournisseur || (bonReception.fournisseur && bonReception.fournisseur.raison_sociale === filters.fournisseur)) &&
        (!filters.year || new Date(bonReception.dateReception).getFullYear().toString() === filters.year) &&
        (!filters.month || (new Date(bonReception.dateReception).getMonth() + 1).toString() === filters.month) &&
        (!filters.article || (bonReception.lignes && bonReception.lignes.some((ligne) => ligne.article.libelle === filters.article)));

      return matchesSearchTerm && matchesFilters;
    });
  }, [bonsReception, searchTerm, filters]);

  // Pagination
  const paginatedBonsReception = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBonsReception.slice(startIndex, endIndex);
  }, [filteredBonsReception, currentPage]);

  // Gestion de la recherche
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Réinitialiser à la première page lors d'une nouvelle recherche
  };

  // Suppression d'un bon de reception
  const handleDeleteBonReception = async (id) => {
    try {
      const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce bon de Réception ?");
      if (!confirmDelete) return;

      await axios.delete(`http://localhost:5000/achat/BEF${id}`);
      setBonsReception(bonsReception.filter((bon) => bon._id !== id)); // Mettre à jour l'état local
      alert("Bon de Reception supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression du bon de reception :", error);
      alert("Erreur lors de la suppression du bon de reception.");
    }
  };

  
const handleEditBonReception = (bonReception) => {
  setEditBonReception(bonReception); // Stocker les données du bon de Reception à modifier
  setEditLignes(bonReception.lignes); // Initialiser les lignes modifiables
  setIsEditModalOpen(true); // Activer le mode édition
};

  // Gestion des filtres
  const handleFilterChange = (filterName, value) => {
    setFilters((prevFilters) => ({ ...prevFilters, [filterName]: value }));
    setCurrentPage(1); // Réinitialiser à la première page lors d'un changement de filtre
  };

  // Réinitialisation des filtres
  const resetFilters = () => {
    setSearchTerm("");
    setFilters({
      fournisseur: "",
      year: "",
      month: "",
      article: "",
    });
    setCurrentPage(1); // Réinitialiser à la première page lors de la réinitialisation des filtres
  };

  // Ouverture de la modal de détails
  const handleOpenModal = (bonReception) => {
    setSelectedBonReception(bonReception);
    setIsModalOpen(true);
  };

  // Fermeture de la modal de détails
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBonReception(null);
  };

  // Affichage des filtres actifs
  const activeFilters = Object.entries(filters).filter(([key, value]) => value !== "");

  if (error) {
    return <div>{error}</div>;
  }
  return (
    <>
      <Navbar />
      <Box height={150} />
      <Box sx={{ overflow: "auto", flexGrow: 1, p: 3, display: "flex", backgroundColor: "#FFFFFF" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: "auto",
            backgroundColor: "#FFFFFF",
            maxWidth: "none",
            maxHeight: "100vh",
            width: "100%",
          }}
        >
        <Box sx={{ flexGrow: 1, p: 3 }}>
     <h1>Liste des bons de Reception fournisseur</h1>
       <Box height={50} />

 {/* Barre de recherche et bouton Filtre */}
 <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
    <TextField
      fullWidth
      label="Rechercher"
      variant="outlined"
      value={searchTerm}
      onChange={(e) => handleSearch(e.target.value)}
      sx={{
        mb: 2,
        borderRadius: "20px",
        "& .MuiOutlinedInput-root": {
          borderRadius: "40px",
        },
        width: "400px",
      }}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton>
              <Search />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
    <Box width={150} />

    {/* Bouton pour ouvrir la sidebar des filtres */}
    <Button
      onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
      startIcon={<FilterList />}
      sx={{ ml: 30}}
    >
      Filtre
    </Button>
  </Box>
  {/* Sidebar pour les filtres avancés */}
  <Drawer
    anchor="right" // Position de la sidebar (à droite)
    open={isFilterSidebarOpen} // Contrôle l'ouverture/fermeture
    onClose={() => setIsFilterSidebarOpen(false)} // Fermer la sidebar
  >
    <Box sx={{ width: 300, p: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Filtres Avancés
      </Typography>

      {/* Filtre par fournisseur */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Fournisseur</InputLabel>
        <Select
          value={filters.fournisseur}
          onChange={(e) => handleFilterChange("fournisseur", e.target.value)}
        >
          <MenuItem value="">Tous</MenuItem>
          {[...new Set(bonsReception.map((bon) => bon.fournisseur?.raison_sociale))].map((name, index) => (
            <MenuItem key={index} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Filtre par article */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Article</InputLabel>
        <Select
          value={filters.article}
          onChange={(e) => handleFilterChange("article", e.target.value)}
        >
          <MenuItem value="">Tous</MenuItem>
          {[...new Set(bonsReception.flatMap((bon) => bon.lignes.map((ligne) => ligne.article.libelle)))].map((article, index) => (
            <MenuItem key={index} value={article}>
              {article}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Filtre par année */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Année</InputLabel>
        <Select
          value={filters.year}
          onChange={(e) => handleFilterChange("year", e.target.value)}
        >
          <MenuItem value="">Toutes</MenuItem>
          {[...new Set(bonsReception.map((bon) => new Date(bon.dateReception).getFullYear().toString()))].map((year, index) => (
            <MenuItem key={index} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Filtre par mois */}
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Mois</InputLabel>
        <Select
          value={filters.month}
          onChange={(e) => handleFilterChange("month", e.target.value)}
        >
          <MenuItem value="">Tous</MenuItem>
          {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map((month, index) => (
            <MenuItem key={index} value={month}>
              {month}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Bouton pour réinitialiser les filtres */}
      <Button
        onClick={resetFilters}
        startIcon={<Clear />}
        fullWidth
        variant="outlined"
        sx={{ mt: 2 }}
      >
        Réinitialiser les filtres
      </Button>
    </Box>
  </Drawer>

  {/* Tableau des bons de réception */}
  <TableContainer component={Paper} sx={{ mt: 3, boxShadow: 3 }}>
    <Table sx={{ minWidth: 550 }} aria-label="simple table">
      <TableHead>
        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
          <TableCell sx={{ fontWeight: "bold" }}>Numéro de réception</TableCell>
          <TableCell sx={{ fontWeight: "bold" }}>Date de réception</TableCell>
          <TableCell sx={{ fontWeight: "bold" }}>Fournisseur</TableCell>
          <TableCell sx={{ fontWeight: "bold" }}>Total HT</TableCell>
          <TableCell sx={{ fontWeight: "bold" }}>Total TTC</TableCell>
          <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
          <TableCell sx={{ fontWeight: "bold" }}>Facturer</TableCell>

        </TableRow>
      </TableHead>
      <TableBody>
        {paginatedBonsReception.map((bonReception, index) => (
          <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
            <TableCell>{bonReception.numero_Bon}</TableCell>
            <TableCell>{new Date(bonReception.dateReception).toLocaleDateString()}</TableCell>
            <TableCell>{bonReception.fournisseur ? bonReception.fournisseur.raison_sociale : "Non spécifié"}</TableCell>
            <TableCell>{bonReception.total_hors_Taxe} TND</TableCell>
            <TableCell>{bonReception.total_ttc} TND</TableCell>
            <TableCell>
  {/* Icône pour "Détails" */}
  <IconButton
    onClick={() => handleOpenModal(bonReception)}
    sx={{ color: "black" }} // Couleur noire
  >
    <Visibility />
  </IconButton>

  {/* Icône pour "Supprimer" */}
  <IconButton
    onClick={() => handleDeleteBonReception(bonReception._id)}
    sx={{ color: "black" }} // Couleur noire
  >
    <Delete />
  </IconButton>

  {/* Icône pour "Modifier" */}
  <IconButton
    onClick={() => navigate(`/ListeBonReceptionFournisseur/update/${bonReception._id}`)}
    sx={{ color: "black" }} // Couleur noire
  >
    <Edit />
  </IconButton>
  {/* Icone pour Download */}
  <IconButton
  onClick={() => handleDownload(bonReception)}
  sx={{ color: "black" }} // Couleur noire
>
  <FileDownloadIcon />
</IconButton>
  </TableCell>
   {/* Facturer */}
  <TableCell>
<IconButton
  onClick={() => handleDownloadFacture(bonReception)}
  sx={{ color: "black" }} // Couleur noire
>
  <ReceiptIcon />
</IconButton>
</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>

  {/* Pagination */}
  <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
    <Button
      variant="contained"
      disabled={currentPage === 1}
      onClick={() => setCurrentPage(currentPage - 1)}
      sx={{ mr: 2 }}
    >
      Précédent
    </Button>
    <Button
      variant="contained"
      disabled={currentPage * itemsPerPage >= filteredBonsReception.length}
      onClick={() => setCurrentPage(currentPage + 1)}
    >
      Suivant
    </Button>
  </Box>
  <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
    <Typography variant="body1">
      Page {currentPage} sur {Math.ceil(filteredBonsReception.length / itemsPerPage)}
    </Typography>
  </Box>
</Box>
          {/* Pop-up pour afficher les détails du bon de Reception */}
          <Modal
            open={isModalOpen}
            onClose={handleCloseModal}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
          >
            <Fade in={isModalOpen}>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "80%",
                  maxWidth: "800px",
                  bgcolor: "#FFFFFF",
                  boxShadow: 24,
                  p: 4,
                  borderRadius: 2,
                  maxHeight: "90vh",
                  overflowY: "auto",
                }}
              >
                {selectedBonReception && (
                  <>
                    <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
                      Détails du Bon de Reception N° {selectedBonReception.numero_Bon}
                    </Typography>

                    {/* Informations de base */}
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Informations Générales
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Date de Reception:</strong> {new Date(selectedBonReception.dateReception).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Fournisseur:</strong> {selectedBonReception.fournisseur ? selectedBonReception.fournisseur.raison_sociale : "Non spécifié"}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Total HT:</strong> {selectedBonReception.total_hors_Taxe} TND
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Total TTC:</strong> {selectedBonReception.total_ttc} TND
                    </Typography>

                    {/* Lignes de bon Reception */}
                    <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                      Articles Réceptionnées
                    </Typography>
                    <TableContainer component={Paper}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Article</TableCell>
                            <TableCell>Quantité</TableCell>
                            <TableCell>Prix Unitaire</TableCell>
                            <TableCell>Total HT</TableCell>
                            <TableCell>Total TTC</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedBonReception.lignes.map((ligne, index) => (
                            <TableRow key={index}>
                              <TableCell>{ligne.article ? ligne.article.libelle : 'Article inconnu'}</TableCell>
                              <TableCell>{ligne.quantite}</TableCell>
                              <TableCell>{ligne.prix_unitaire} TND</TableCell>
                              <TableCell>{ligne.total_ht} TND</TableCell>
                              <TableCell>{ligne.total_ttc} TND</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* Bouton pour modifier le bon de Reception */}
                    <Button
                      variant="contained"
                      color="warning"
                      sx={{ mt: 2, mr: 65 }}
                      onClick={() => handleEditBonReception(selectedBonReception)}
                    >
                      Modifier
                    </Button>
                    {/* Bouton pour fermer la pop-up */}
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleCloseModal}
                      sx={{ mt: 2 }}
                    >
                      Fermer
                    </Button>
                  </>
                )}
              </Box>
            </Fade>
          </Modal>
{/* Prévisualisation de facture */}
          <Dialog open={openPreviewModal} onClose={() => setOpenPreviewModal(false)} maxWidth="md" fullWidth>
  <DialogTitle>Prévisualisation de la Facture</DialogTitle>
  <DialogContent>
    <iframe
      src={pdfUrl}
      width="100%"
      height="500px"
      style={{ border: "none" }}
      title="Prévisualisation de la Facture"
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setOpenPreviewModal(false)}>Fermer</Button>
    <Button
      onClick={() => {
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.download = `facture_${selectedBonReception?.numero_Bon}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }}
      color="primary"
    >
      Télécharger
    </Button>
  </DialogActions>
</Dialog>

        
        
          
        
        </Box>
      </Box>
    </>
  );
}