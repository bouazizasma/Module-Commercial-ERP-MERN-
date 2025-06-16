import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import { Visibility, Delete, Edit, Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { Chip, Tooltip, Divider } from "@mui/material";
import {  Card, CardContent, Typography, Grid, Button, TextField, MenuItem, Select,
  FormControl, InputLabel, IconButton, Drawer, Modal, Backdrop, Fade, Table, TableBody,
   TableCell, TableContainer, TableHead, TableRow, Paper, Autocomplete, Collapse} from "@mui/material";
import { Stack } from "@mui/material";
import { FilterList, Search, Clear, ExpandMore, ExpandLess } from "@mui/icons-material";
import { InputAdornment } from "@mui/material";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";
// Nouvelles icônes pour un design moderne
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import BusinessIcon from '@mui/icons-material/Business';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssessmentIcon from '@mui/icons-material/Assessment';
// Composant moderne de suppression
import ModernDeleteDialog from '../../components/ModernDeleteDialog';
import { set } from "date-fns";
export default function ListeBonCommandeFournisseur() {
  const [bonsCommande, setBonsCommande] = useState([]);
  const [editLignes, setEditLignes] = useState([]); // État pour les lignes modifiables
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    fournisseur: "",
    year: "",
    month: "",
    article: "",
    
  }); 
  const [error, setError] = useState(null);
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBonCommande, setSelectedBonCommande] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // État pour la pagination
  const itemsPerPage = 5; // Nombre d'éléments par page
  const [editBonCommande, setEditBonCommande] = useState(null); // État pour le bon de commande en cours de modification
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // État pour contrôler l'affichage du formulaire de modification
  const [fournisseurs, setFournisseurs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [depots, setDepots] = useState([]);
  const navigate = useNavigate();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [bonCommandeToDelete, setBonCommandeToDelete] = useState(null);

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les bons de commande
        const bonsCommandeResponse = await axios.get("http://localhost:5000/achat/BCF/all");
        setBonsCommande(bonsCommandeResponse.data);

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

  {/*const handleDownload = (bonCommande) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Bon de Commande", 10, 10);
    doc.setFontSize(12);
    doc.text(`Commande N°: ${bonCommande.numero_commande}`, 10, 20);
    doc.text(`Date Commande: ${new Date(bonCommande.dateCommande).toLocaleDateString()}`, 10, 30);
    const fournisseur = fournisseurs.find(f => f._id === bonCommande.fournisseur._id);
    doc.text(`À l'intention de: ${fournisseur.raison_sociale}`, 10, 40);
    doc.text(`Adresse: ${fournisseur.adresse || 'N/A'}`, 10, 50);
    doc.text(`Téléphone: ${fournisseur.telephone || 'N/A'}`, 10, 60);
    doc.autoTable({
      startY: 70,
      head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
      body: bonCommande.lignes.map(ligne => [
        ligne.article.libelle,
        ligne.quantite,
        `${ligne.prix_unitaire.toFixed(2)} TND`,
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND`
      ]),
    });
    doc.save(`bon_de_commande_${bonCommande.numero_commande}.pdf`);
  }; 
  */}

  const handleDownload= (bonCommande) => {
  // Vérifications initiales
  if (!bonCommande.numero_Bon) {
    console.error("numero_Bon is undefined in bonCommande:", bonCommande);
    return;
  }
  if (!bonCommande.fournisseur) {
    console.error("Fournisseur is undefined in bonCommande:", bonCommande);
    return;
  }

  const doc = new jsPDF();
  const fournisseur = bonCommande.fournisseur;
  const dateFormatted = new Date(bonCommande.dateCommande).toLocaleDateString('fr-FR');
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  
  // Couleurs professionnelles
  const primaryColor = '#2c3e50'; // Bleu foncé professionnel
  const secondaryColor = '#3498db'; // Bleu plus clair
  const accentColor = '#e74c3c'; // Rouge pour les accents
  
  // En-tête avec logo et informations
  doc.setFillColor(primaryColor);
  doc.rect(0, 0, pageWidth, 20, 'F');
  
  // Texte en-tête en blanc
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text("BON DE COMMANDE", margin, 15);
  
  // Réinitialisation des couleurs
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  
  // Section informations commande
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text("Informations de la commande", margin, 45);
  
  doc.setDrawColor(secondaryColor);
  doc.line(margin, 47, 60, 47);
  
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  
  // Colonne gauche - informations commande
  doc.text(`Commande N°: ${bonCommande.numero_Bon}`, margin, 55);
  doc.text(`Date Commande: ${dateFormatted}`, margin, 60);
  
  // Colonne droite - informations fournisseur
  doc.text(`Fournisseur: ${fournisseur.raison_sociale}`, pageWidth/2, 55);
  doc.text(`Adresse: ${fournisseur.adresse || 'N/A'}`, pageWidth/2, 60);
  doc.text(`Téléphone: ${fournisseur.telephone || 'N/A'}`, pageWidth/2, 65);
  
  // Tableau des articles
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text("Détails de la commande", margin, 80);
  doc.setDrawColor(secondaryColor);
  doc.line(margin, 82, 60, 82);
  
  doc.autoTable({
    startY: 85,
    head: [
      [
        { 
          content: 'Article',
          styles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' }
        },
        { 
          content: 'Quantité',
          styles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' }
        },
        { 
          content: 'Prix Unitaire',
          styles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' }
        },
        { 
          content: 'Total',
          styles: { fillColor: primaryColor, textColor: 255, fontStyle: 'bold' }
        }
      ]
    ],
    body: bonCommande.lignes.map(ligne => [
      ligne.article.libelle,
      ligne.quantite,
      `${ligne.prix_unitaire.toFixed(2)} DT`,
      `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} DT`
    ]),
    styles: {
      cellPadding: 5,
      fontSize: 10,
      valign: 'middle',
      halign: 'center'
    },
    columnStyles: {
      0: { halign: 'left' }, // Article aligné à gauche
      1: { halign: 'center' }, // Quantité centrée
      2: { halign: 'right' }, // Prix à droite
      3: { halign: 'right' } // Total à droite
    },
    margin: { top: 10 }
  });
  
  // Calcul du total
  const total = bonCommande.lignes.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0);
  
  // Ajout du total
  doc.setFontSize(12);
  doc.setTextColor(primaryColor);
  doc.setFont('helvetica', 'bold');
  doc.text("Total général:", pageWidth - 130, doc.autoTable.previous.finalY + 20);
  doc.setTextColor(0, 0, 0);
  doc.text(`${total.toFixed(2)} DT`, pageWidth - margin, doc.autoTable.previous.finalY + 20, { align: 'right' });
  
  // Pied de page
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("Merci pour votre confiance", pageWidth/2, footerY, { align: 'center' });
  doc.text(`Document généré le ${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, footerY, { align: 'right' });
  
  // Ligne de séparation pied de page
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
     doc.save(`bon_de_commande_${bonCommande.numero_Bon}.pdf`);

};
  // Filtrage des bons de commande
  const filteredBonsCommande = useMemo(() => {
    return bonsCommande.filter((bonCommande) => {
      const matchesSearchTerm =
        bonCommande.numero_Bon.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (bonCommande.fournisseur && bonCommande.fournisseur.raison_sociale.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (bonCommande.lignes && bonCommande.lignes.some((ligne) =>
          ligne.article.libelle.toLowerCase().includes(searchTerm.toLowerCase())
        ));

      const matchesFilters =
        (!filters.fournisseur || (bonCommande.fournisseur && bonCommande.fournisseur.raison_sociale === filters.fournisseur)) &&
        (!filters.year || new Date(bonCommande.dateCommande).getFullYear().toString() === filters.year) &&
        (!filters.month || (new Date(bonCommande.dateCommande).getMonth() + 1).toString() === filters.month) &&
        (!filters.article || (bonCommande.lignes && bonCommande.lignes.some((ligne) => ligne.article.libelle === filters.article)));

      return matchesSearchTerm && matchesFilters;
    });
  }, [bonsCommande, searchTerm, filters]);

  // Pagination
  const paginatedBonsCommande = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredBonsCommande.slice(startIndex, endIndex);
  }, [filteredBonsCommande, currentPage]);

  // Gestion de la recherche
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // Réinitialiser à la première page lors d'une nouvelle recherche
  };

  // Suppression d'un bon de commande
  
  
 
  const handleDeleteBonCommande = (bonCommande) => {
    setBonCommandeToDelete(bonCommande);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setDeleteLoading(true);
    try {
      await axios.delete(`http://localhost:5000/achat/BCF/${bonCommandeToDelete._id}`);
      setBonsCommande(bonsCommande.filter((bon) => bon._id !== bonCommandeToDelete._id));
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la suppression du bon de commande :", error);
      alert("Erreur lors de la suppression du bon de commande.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Ouverture du formulaire de modification
 {/*} const handleEditBonCommande = (bonCommande) => {
    setEditBonCommande(bonCommande); // Stocker les données du bon de commande à modifier
    setEditLignes(bonCommande.lignes); // Initialiser les lignes modifiables
    setIsEditModalOpen(true); // Ouvrir le formulaire de modification
  };
*/}

{/*const handleEditBonCommande = (bonCommande) => {
  setEditBonCommande(bonCommande); // Stocker les données du bon de commande à modifier
  setEditLignes(bonCommande.lignes); // Initialiser les lignes modifiables
  setIsEditing(true); // Activer le mode édition
}; */}
const handleEditBonCommande = (bonCommande) => {
  setEditBonCommande(bonCommande); // Stocker les données du bon de commande à modifier
  setEditLignes(bonCommande.lignes); // Initialiser les lignes modifiables
  setIsEditModalOpen(true); // Activer le mode édition
};

const getStatusChip = (statut) => {
  let color = "default";

  switch (statut) {
    case "Livrée":
      color = "success"; // Vert
      break;
    case "Annulée":
      color = "error"; // Rouge
      break;
    case "En attente":
      color = "#f5f5f5"; // Orange
      break;
    case "Confirmée" :
      color ="warning";
      break;
    default:
      color = "info"; // Bleu
  }

  return <Chip label={statut} color={color} sx={{ fontWeight: "bold", fontSize: "0.9rem" }} />;
};
  // Soumission du formulaire de modification
 {/*} const handleSubmitEdit = async (e, id) => {
    e.preventDefault();
    try {
      const total_hors_Taxe = editLignes.reduce((acc, ligne) => acc + ligne.total_ht, 0);
      const total_ttc = total_hors_Taxe * 1.2;

      const updatedBonCommande = {
        ...editBonCommande,
        lignes: editLignes,
        total_hors_Taxe,
        total_ttc,
        date_modification: new Date(), // Ajouter la date de modification
      };

      const response = await axios.put(`http://localhost:5000/boncommandeF/${id}`, updatedBonCommande);
      setBonsCommande((prev) =>
        prev.map((bon) => (bon._id === id ? response.data : bon))
      );
      setIsEditModalOpen(false);
      alert("Bon de commande mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du bon de commande :", error);
      alert("Erreur lors de la mise à jour du bon de commande.");
    }
  };
*/}
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
  const handleOpenModal = (bonCommande) => {
    setSelectedBonCommande(bonCommande);
    setIsModalOpen(true);
  };

  // Fermeture de la modal de détails
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBonCommande(null);
  };

  // Affichage des filtres actifs
  const activeFilters = Object.entries(filters).filter(([key, value]) => value !== "");

  if (error) {
    return <div>{error}</div>;
  }
  return (
    <>
      <Navbar />
      <Box height={120} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: "auto",
            maxHeight: "100vh",
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            minHeight: '100vh'
          }}
        >
          {/* Header moderne avec statistiques */}
          <Fade in={true} timeout={800}>
            <Box sx={{
              textAlign: 'center',
              mb: 2,
              p: 1,
              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              color: 'white'
            }}>
              <ShoppingCartIcon sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h5" sx={{
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                mb: 1
              }}>
                Bons de Commande Fournisseurs
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                                           gérez vos Bons de  Commandes facilement
                                        </Typography>     
             

            </Box>
          </Fade>

          {/* Section Recherche et Filtres modernisée */}
          <Fade in={true} timeout={1000}>
            <Card sx={{
              p: 2,
              mb: 2,
              borderRadius: 3,
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              border: '1px solid rgba(255,255,255,0.2)',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
              }
            }}>
              <CardContent>
            

                {/* Section Liste des Bons de Commande */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <InventoryIcon sx={{
                      fontSize: 32,
                      mr: 2,
                      background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                      borderRadius: '50%',
                      p: 1,
                      color: 'white'
                    }} />
                    <Typography variant="h5" sx={{
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Liste des Bons de Commande ({filteredBonsCommande.length})
                    </Typography>
                     <Button
                    variant="contained"
                    onClick={() => navigate('/BonCommandeFournisseur')}
                    startIcon={<Add />}
                    sx={{
                      borderRadius: 2,
                       height: '35px',
                        width: '279px',
                        left: '245px',
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      fontWeight: 'bold',
                      px: 3,
                      py: 1.5,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(44, 62, 80, 0.4)'
                      }
                    }}
                  >
                    Créer Bon de commande
                  </Button>
                  </Box>
                
                </Box>
                <Divider sx={{ mb: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
       
                  {/* Barre de recherche fine avec bouton filtrer */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    placeholder="Rechercher par numéro, fournisseur ou article..."
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    sx={{
                      backgroundColor: 'white',
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        height: '35px',
                        left:'445px',
                        width: '380px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.15)'
                        },
                        '&.Mui-focused': {
                          boxShadow: '0 4px 12px rgba(52, 73, 94, 0.25)'
                        }
                      }
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search sx={{ color: '#2c3e50' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<FilterList />}
                    onClick={() => setShowFilters(!showFilters)}
                    sx={{
                      left: '410px',
                      height: '35px',
                      minWidth: '20px',
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      fontWeight: 'bold',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(44, 62, 80, 0.4)'
                      }
                    }}
                  >
                    Filtrer
                    {showFilters ? <ExpandLess sx={{ ml: 1 }} /> : <ExpandMore sx={{ ml: 1 }} />}
                  </Button>
                </Box>    
                </Box>

              {/* Section des filtres avec animation */}
                <Collapse in={showFilters} timeout={300}>
                  <Box sx={{
                    p: 3,
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid #e9ecef',
                    mb: 2
                  }}>
                    <Typography variant="h6" sx={{
                      mb: 3,
                      color: '#2c3e50',
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <FilterList sx={{ mr: 1 }} />
                      Filtres avancés
                    </Typography>

                    <Grid container spacing={3}>
                      {/* Filtre Fournisseur avec Autocomplete */}
                      <Grid item xs={12} sm={6} md={3}>
                        <Autocomplete
                          options={[...new Set(bonsCommande.map((bon) => bon.fournisseur?.raison_sociale).filter(Boolean))]}
                          value={filters.fournisseur || null}
                          onChange={(event, newValue) => handleFilterChange("fournisseur", newValue || "")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Fournisseur"
                              variant="outlined"
                              size="small"
                              sx={{
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                            />
                          )}
                          sx={{ width: '100%' }}
                        />
                      </Grid>

                      {/* Filtre Article avec Autocomplete */}
                      <Grid item xs={12} sm={6} md={3}>
                        <Autocomplete
                          options={[...new Set(bonsCommande.flatMap((bon) => bon.lignes.map((ligne) => ligne.article.libelle)))]}
                          value={filters.article || null}
                          onChange={(event, newValue) => handleFilterChange("article", newValue || "")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Article"
                              variant="outlined"
                              size="small"
                              sx={{
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                            />
                          )}
                          sx={{ width: '100%' }}
                        />
                      </Grid>

                      {/* Filtre Année avec Autocomplete */}
                      <Grid item xs={12} sm={6} md={3}>
                        <Autocomplete
                          options={[...new Set(bonsCommande.map((bon) => new Date(bon.dateCommande).getFullYear().toString()))].sort((a, b) => b.localeCompare(a))}
                          value={filters.year || null}
                          onChange={(event, newValue) => handleFilterChange("year", newValue || "")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Année"
                              variant="outlined"
                              size="small"
                              sx={{
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                            />
                          )}
                          sx={{ width: '100%' }}
                        />
                      </Grid>

                      {/* Filtre Mois avec Autocomplete */}
                      <Grid item xs={12} sm={6} md={3}>
                        <Autocomplete
                          options={[
                            { value: '1', label: 'Janvier' },
                            { value: '2', label: 'Février' },
                            { value: '3', label: 'Mars' },
                            { value: '4', label: 'Avril' },
                            { value: '5', label: 'Mai' },
                            { value: '6', label: 'Juin' },
                            { value: '7', label: 'Juillet' },
                            { value: '8', label: 'Août' },
                            { value: '9', label: 'Septembre' },
                            { value: '10', label: 'Octobre' },
                            { value: '11', label: 'Novembre' },
                            { value: '12', label: 'Décembre' }
                          ]}
                          getOptionLabel={(option) => option.label}
                          value={filters.month ? { value: filters.month, label: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'][parseInt(filters.month) - 1] } : null}
                          onChange={(event, newValue) => handleFilterChange("month", newValue?.value || "")}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Mois"
                              variant="outlined"
                              size="small"
                              sx={{
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: 2,
                                }
                              }}
                            />
                          )}
                          sx={{ width: '100%' }}
                        />
                      </Grid>
                    </Grid>

                    {/* Bouton pour réinitialiser les filtres */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                      <Button
                        onClick={resetFilters}
                        startIcon={<Clear />}
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          borderColor: '#2c3e50',
                          color: '#2c3e50',
                          fontWeight: 'bold',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: '#34495e',
                            backgroundColor: 'rgba(52, 73, 94, 0.1)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(52, 73, 94, 0.3)'
                          }
                        }}
                      >
                        Réinitialiser les filtres
                      </Button>
                    </Box>
                  </Box>
                </Collapse>
                <TableContainer component={Paper} sx={{
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  overflow: 'hidden'
                }}>
                  <Table>
                    <TableHead sx={{
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
                    }}>
                      <TableRow>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          Numéro 
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          Date 
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem'}}>
                          Fournisseur
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem'}}>
                          Total HT
                        </TableCell>
                        <TableCell sx={{ color: 'white',fontWeight: 'bold', fontSize: '0.9rem' }}>
                          Total TTC
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem' }}>
                          Status
                        </TableCell>
                        <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.9rem'}}>
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedBonsCommande.map((bonCommande, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            '&:nth-of-type(odd)': {
                              backgroundColor: '#f8f9fa',
                            },
                            '&:hover': {
                              backgroundColor: '#e3f2fd',
                              transform: 'scale(1.01)',
                              transition: 'all 0.2s ease'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <TableCell sx={{ fontWeight: 'medium', color: '#2c3e50' }}>
                            {bonCommande.numero_Bon}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: '#2c3e50' }} />
                            {new Date(bonCommande.dateCommande).toLocaleDateString()}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium' }}>
                            <BusinessIcon sx={{ fontSize: 16, mr: 1, color: '#2c3e50' }} />
                            {bonCommande.fournisseur ? bonCommande.fournisseur.raison_sociale : "Non spécifié"}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium', color: '#95a5a6' }}>
                            {bonCommande.total_hors_Taxe.toFixed(2)} TND
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'medium', color: '#2c3e50' }}>
                            {bonCommande.total_ttc.toFixed(2)} TND
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={bonCommande.statut}
                              color={bonCommande.statut === "Livrée" ? "success" :
                                     bonCommande.statut === "Annulée" ? "error" :
                                     bonCommande.statut === "En attente" ? "warning" : "info"}
                              sx={{
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                borderRadius: 2,
                                padding: '4px 8px'
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={1}>
                              <Tooltip title="Voir les détails">
                                <IconButton
                                  onClick={() => handleOpenModal(bonCommande)}
                                  sx={{
                                    color: '#667eea',
                                    '&:hover': {
                                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Supprimer">
                                <IconButton
                                  onClick={() => handleDeleteBonCommande(bonCommande._id)}
                                  sx={{
                                    color: '#f44336',
                                    '&:hover': {
                                      backgroundColor: 'rgba(244, 67, 54, 0.1)',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Modifier">
                                <IconButton
                                  onClick={() => navigate(`/ListeBonCommandeFournisseur/update/${bonCommande._id}`)}
                                  sx={{
                                    color: '#4caf50',
                                    '&:hover': {
                                      backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Télécharger PDF">
                                <IconButton
                                  onClick={() => handleDownload(bonCommande)}
                                  sx={{
                                    color: '#ff9800',
                                    '&:hover': {
                                      backgroundColor: 'rgba(255, 152, 0, 0.1)',
                                      transform: 'scale(1.1)'
                                    },
                                    transition: 'all 0.3s ease'
                                  }}
                                >
                                  <FileDownloadIcon />
                                </IconButton>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Divider entre tableau et pagination */}
                <Divider sx={{ my: 3, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />

                {/* Section Pagination intégrée */}
                <Box sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  mt: 2
                }}>
              <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                <Button
                  variant="contained"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    fontWeight: 'bold',
                    px: 3,
                    '&:hover': {
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                    },
                    '&:disabled': {
                      background: '#e0e0e0',
                      color: '#9e9e9e'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Précédent
                </Button>
                <Button
                  variant="contained"
                  disabled={currentPage * itemsPerPage >= filteredBonsCommande.length}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  sx={{
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    fontWeight: 'bold',
                    px: 3,
                    '&:hover': {
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                    },
                    '&:disabled': {
                      background: '#e0e0e0',
                      color: '#9e9e9e'
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  Suivant
                </Button>
              </Box>
              <Typography variant="body1" sx={{
                color: '#667eea',
                fontWeight: 'medium',
                fontSize: '1.1rem'
              }}>
                Page {currentPage} sur {Math.ceil(filteredBonsCommande.length / itemsPerPage)}
              </Typography>
            </Box>
              </CardContent>
            </Card>
          </Fade>
        </Box>
      </Box>

      {/* Pop-up pour afficher les détails du bon de commande */}
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
              width: "90%",
              maxWidth: "1000px",
              bgcolor: "#FFFFFF",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {selectedBonCommande && (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h4" component="h2" sx={{ color: '#1976d2', fontWeight: 'bold' }}>
                    Détails du Bon de Commande N° {selectedBonCommande.numero_Bon}
                  </Typography>
                  <IconButton onClick={handleCloseModal} sx={{ color: '#666' }}>
                    <Clear />
                  </IconButton>
                </Box>

                {/* Informations de base */}
                <Card sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                      Informations Générales
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong style={{ color: '#666' }}>Date de commande:</strong>{" "}
                          {new Date(selectedBonCommande.dateCommande).toLocaleDateString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong style={{ color: '#666' }}>Fournisseur:</strong>{" "}
                          {selectedBonCommande.fournisseur ? selectedBonCommande.fournisseur.raison_sociale : "Non spécifié"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong style={{ color: '#666' }}>Total HT:</strong>{" "}
                          {selectedBonCommande.total_hors_Taxe.toFixed(2)} TND
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong style={{ color: '#666' }}>Total TTC:</strong>{" "}
                          {selectedBonCommande.total_ttc.toFixed(2)} TND
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body1" sx={{ mb: 1 }}>
                          <strong style={{ color: '#666' }}>Statut:</strong>{" "}
                          <Chip 
                            label={selectedBonCommande.statut} 
                            color={selectedBonCommande.statut === "Livrée" ? "success" : 
                                   selectedBonCommande.statut === "Annulée" ? "error" : 
                                   selectedBonCommande.statut === "En attente" ? "warning" : "info"}
                            sx={{ 
                              fontWeight: 'bold',
                              fontSize: '0.9rem',
                              borderRadius: '4px',
                              padding: '4px 8px'
                            }}
                          />
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>

                {/* Lignes de commande */}
                <Card sx={{ mb: 3, backgroundColor: '#f8f9fa' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, color: '#1976d2', fontWeight: 'bold' }}>
                      Articles Commandés
                    </Typography>
                    <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 2 }}>
                      <Table>
                        <TableHead>
                          <TableRow sx={{ backgroundColor: '#e3f2fd' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Article</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Quantité</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Prix Unitaire</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Total HT</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Total TTC</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedBonCommande.lignes.map((ligne, index) => (
                            <TableRow 
                              key={index}
                              sx={{ 
                                '&:hover': { 
                                  backgroundColor: '#f5f5f5',
                                  transition: 'background-color 0.2s'
                                }
                              }}
                            >
                              <TableCell>{ligne.article ? ligne.article.libelle : 'Article inconnu'}</TableCell>
                              <TableCell>{ligne.quantite}</TableCell>
                              <TableCell>{ligne.prix_unitaire.toFixed(2)} TND</TableCell>
                              <TableCell>{ligne.total_ht.toFixed(2)} TND</TableCell>
                              <TableCell>{ligne.total_ttc.toFixed(2)} TND</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </CardContent>
                </Card>

                {/* Boutons d'action */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => handleEditBonCommande(selectedBonCommande)}
                    sx={{ 
                      borderRadius: '8px',
                      borderColor: '#1976d2',
                      color: '#1976d2',
                      '&:hover': {
                        borderColor: '#1565c0',
                        backgroundColor: 'rgba(25, 118, 210, 0.04)',
                      }
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={handleCloseModal}
                    sx={{ 
                      borderRadius: '8px',
                      backgroundColor: '#d32f2f',
                      '&:hover': { backgroundColor: '#c62828' }
                    }}
                  >
                    Fermer
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>

      {/* Formulaire de modification */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={isEditModalOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: "1000px",
              bgcolor: "#FFFFFF",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            {editBonCommande && (
              <Box>
                <Typography variant="h4" component="h2" sx={{ mb: 3, color: '#1976d2', fontWeight: 'bold' }}>
                  Modifier le Bon de Commande N° {editBonCommande.numero_Bon}
                </Typography>
                {/* Contenu du formulaire de modification */}
              </Box>
            )}
          </Box>
        </Fade>
      </Modal>

      {/* Modal de confirmation de suppression moderne */}
       <ModernDeleteDialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Suppression de bon de commande"
                message="Êtes-vous sûr de vouloir supprimer ce bon de commande ?"
                itemDetails={bonCommandeToDelete ? {
                  title: bonCommandeToDelete.numero_Bon,
                }
                  : null
                }
              />

    </>
  );
}