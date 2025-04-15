import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Drawer,
  AppBar,
  Toolbar,
  Stack,
  Chip,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Visibility,
  Edit,
  Delete,
  Add,
  Receipt,
  Close as CloseIcon,
  Person as PersonIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
  Payment as PaymentIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import jsPDF from "jspdf";
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import 'jspdf-autotable';
import { useNavigate } from "react-router-dom";

export default function ListeBonCommandeClient() {
  const [bonCommandes, setBonCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [clients, setClients] = useState([]);
  const [articles, setArticles] = useState([]);
  
  
  const navigate = useNavigate();
  useEffect(() => {
    fetchBonCommandes();
  }, []);

  const fetchBonCommandes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/ventes/bons-commande");
      setBonCommandes(response.data);
      
     // Récupérer les Clients
      const ClientsResponse = await axios.get("http://localhost:5000/client/clients");
      setClients(ClientsResponse.data);

      // Récupérer les articles
     const articlesResponse = await axios.get("http://localhost:5000/article/articles");
      setArticles(articlesResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des bons de commande:", error);
      setError("Erreur lors de la récupération des bons de commande");
      setLoading(false);
    }};

 /* const handleView = async (id) => {
    try {
      const response = await axios.get(`http://localhost:5000/ventes/bons-commande/${id}`);
      console.log("Données reçues:", response.data); // Pour déboguer
      setSelectedCommande(response.data);
      setOpenDialog(true);
    } catch (error) {
      console.error("Erreur lors de la récupération des détails de la commande:", error);
    }
  };*/


  const handleView = async (id) => {
    try {
        const response = await axios.get(`http://localhost:5000/ventes/bons-commande/${id}`);
        console.log("Données reçues:", response.data); // Vérifiez la structure des données
        
        // Assurez-vous que la réponse contient bien les données attendues
        if (response.data) {
            setSelectedCommande({
                ...response.data,
               // client: response.data.client || {},
                lignes: response.data.lignes || []
            });
            setOpenDialog(true);
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des détails de la commande:", error);
    }
};


  const handleEdit = (id) => {
    navigate(`/ventes/bon-commande/edit/${id}`);
  };

  //generer bon livraison 

  const handleGenerateBonLivraison = async (bonCommandeId) => {
    try {
      await axios.post(`http://localhost:5000/ventes/${bonCommandeId}/generate-bon-livraison`);
      fetchBonCommandes(); // Rafraîchir la liste des bons de commandes
    } catch (error) {
      console.error("Erreur lors de la génération du bon de livraison:", error);
      alert("Erreur lors de la génération du bon de livraison");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce bon de commande ?")) {
      try {
        await axios.delete(`http://localhost:5000/ventes/BCC/${id}`);
        fetchBonCommandes();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };


const handleDownload = (bonCommande) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("BCC", 10, 10);
    doc.setFontSize(12);
    doc.text(`Bon Commande N°: ${bonCommande.numero}`, 10, 20);
    doc.text(`Date Commande: ${new Date(bonCommande.dateCommande).toLocaleDateString()}`, 10, 30);

    const client = clients.find(c => c._id === bonCommande.client._id);
    doc.text(`À l'intention de: ${client.nom_prenom}`, 10, 40);
    doc.text(`Adresse: ${client.adresse || 'N/A'}`, 10, 50);
    doc.text(`Matricule Fiscale: ${client.matricule_fiscale || 'N/A'}`, 10, 60);
    doc.text(`Téléphone: ${client.telephone || 'N/A'}`, 10, 70);
  
    doc.text(`Objet : BON COMMANDE`  , 10, 90);
  
    // Tableau des articles commandés
    doc.autoTable({
      startY: 100,
      head: [['Article',  'Quantité', 'Prix Unitaire ', 'Total ']],
      body: bonCommande.lignes.map(ligne => [
        ligne.article.libelle,
        ligne.quantite,
        `${ligne.prix_unitaire.toFixed(2)} DT`,
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} DT`
      ]),
    });
  
    // Totaux
    const totalHT = bonCommande.lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2;
  
    doc.text(`Montant Total HT: ${totalHT.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 10);
    doc.text(`Total TTC : ${totalTTC.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 20);
    doc.text(`Montant Total TTC: ${totalTTC.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 30);
  
    doc.save(`${bonCommande.numero}.pdf`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "En attente":
        return "#f5f5f5";
      case "Confirmée":
        return "warning";
      case "Annulée":
        return "error";
      case "Livrée":
        return "success";
      case "facturée":
        return "primary";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "en_attente":
        return "En attente";
      case "confirmée":
        return "Confirmée";
      case "annulée":
        return "Annulée";
      case "livrée":
        return "Livrée";
      case "facturée":
        return "Facturée";
      default:
        return status;
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCommande(null);
    setActiveTab(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <>
      <Navbar />
      <Box height={250} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Receipt sx={{ fontSize: 40, color: "#1976d2" }} />
                      <Typography variant="h4" component="h1">
                        Liste des Bons de Commande Client
                      </Typography>
                    </Stack>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Add />}
                      onClick={() => navigate("/SaisieBonCommandeClient")}>

                      Nouveau Bon de Commande
                    </Button>
                  </Stack>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>N° Bon de Commande</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Client</TableCell>
                          <TableCell>Montant HT</TableCell>
                          <TableCell>Montant TTC</TableCell>
                          <TableCell>Statut</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bonCommandes.map((bonCommande) => (
                          <TableRow key={bonCommande._id}>
                            <TableCell>{bonCommande.numero}</TableCell>
                            <TableCell>
                              {new Date(bonCommande.dateCommande).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{bonCommande.client?.nom_prenom}</TableCell>
                            <TableCell>
                  {(bonCommande.montantHT || bonCommande.total_hors_Taxe || 0).toFixed(2)} DT
                </TableCell>
                <TableCell>
                  {(bonCommande.montantTTC || bonCommande.total_ttc || 0).toFixed(2)} DT
                </TableCell>
                            <TableCell>
                              <Chip
                                label={getStatusLabel(bonCommande.statut)}
                                color={getStatusColor(bonCommande.statut)}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <IconButton
                                color="primary"
                                onClick={() => handleView(bonCommande._id)}
                                size="small"
                              >
                                <Visibility />
                              </IconButton>
                              <IconButton
                                color="primary"
                                onClick={() => handleEdit(bonCommande._id)}
                                size="small"
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDelete(bonCommande._id)}
                                size="small"
                              >
                                <Delete />
                              </IconButton>
                               <IconButton
                                onClick={() => handleDownload(bonCommande)}
                                sx={{ 
                                  color: '#ed6c02',
                                  '&:hover': { backgroundColor: 'rgba(237, 108, 2, 0.04)' }
                                }}
                              >
                                <FileDownloadIcon />
                              </IconButton> 

                              {bonCommande.statut === "En attente" && (
                               <>
                               <IconButton
                               color="info"
                               onClick={() => handleGenerateBonLivraison(bonCommande._id)}
                               size="small"
                              title="Générer un bon de livraison"
                              >
                               <Receipt />
                               </IconButton>
                               </>
                               )}

                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Drawer pour afficher les détails de la commande */}
      <Drawer
        anchor="right"
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: '80%', md: '60%' },
            maxWidth: '800px',
            bgcolor: '#f8f9fa',
          }
        }}
      >
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="div" sx={{ color: "#1976d2" }}>
                Commande n°{selectedCommande?.numero || selectedCommande?.numero_bc}
              </Typography>
              <Chip
                label={getStatusLabel(selectedCommande?.statut)}
                color={getStatusColor(selectedCommande?.statut)}
                size="small"
                sx={{ ml: 2 }}
              />
            </Stack>
            <IconButton onClick={handleCloseDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 3 }}>
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            sx={{ 
              borderBottom: 1, 
              borderColor: 'divider', 
              mb: 2,
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'bold',
              }
            }}
          >
            <Tab label="Informations générales" />
            <Tab label={`Produits (${selectedCommande?.lignes?.length || 0})`} />
            <Tab label="Événements" />
            <Tab label="Documents" />
          </Tabs>

          {activeTab === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 2, color: "#1976d2", fontWeight: 'bold' }}>
                Coordonnées
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Stack spacing={2}>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                      <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography>{selectedCommande?.client?.nom_prenom || selectedCommande?.client?.nom}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                      <LocationOnIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography>{selectedCommande?.client?.adresse || "Non spécifié"}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                      <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography>{selectedCommande?.client?.telephone || "Non spécifié"}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 1, bgcolor: 'white', borderRadius: 1 }}>
                      <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography>{selectedCommande?.client?.email || "Non spécifié"}</Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ mb: 2, color: "#1976d2", fontWeight: 'bold' }}>
                Facturation
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={2}>
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Total H.T.</Typography>
                      <Typography variant="h6">{(selectedCommande?.montantHT || selectedCommande?.total_hors_Taxe || 0).toFixed(2)} DT</Typography>
                    </Box>
                    <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary">Dont TVA à 19%</Typography>
                      <Typography variant="h6">
                        {((selectedCommande?.montantTTC || selectedCommande?.total_ttc || 0) - 
                          (selectedCommande?.montantHT || selectedCommande?.total_hors_Taxe || 0)).toFixed(2)} DT
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                    <Typography variant="body2" color="text.secondary">Montant total des articles (T.T.C.)</Typography>
                    <Typography variant="h6" color="primary">
                      {(selectedCommande?.montantTTC || selectedCommande?.total_ttc || 0).toFixed(2)} DT
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ mb: 2, color: "#1976d2", fontWeight: 'bold' }}>
                Options de commande
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                    <Stack spacing={1}>
                      <Typography variant="body2">Date de commande: {new Date(selectedCommande?.dateCommande).toLocaleDateString()}</Typography>
                      <Typography variant="body2">Dépôt: {selectedCommande?.depot?.libelle || "Non spécifié"}</Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ mb: 2, color: "#1976d2", fontWeight: 'bold' }}>
                Méthode de livraison
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                    <Stack spacing={1}>
                      <Typography variant="body2">Mode de livraison: {selectedCommande?.modeLivraison || "Non spécifié"}</Typography>
                      <Typography variant="body2" color="text.secondary">Frais de livraison: 0,00 DT</Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" sx={{ mb: 2, color: "#1976d2", fontWeight: 'bold' }}>
                Méthode de paiement
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 1 }}>
                    <Stack spacing={1}>
                      <Typography variant="body2">Mode de paiement: {selectedCommande?.modePaiement || "Non spécifié"}</Typography>
                      <Typography variant="body2">Conditions de paiement: {selectedCommande?.conditionsPaiement || "Non spécifié"}</Typography>
                    </Stack>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}

          {activeTab === 1 && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Article</TableCell>
                    <TableCell align="right">Quantité</TableCell>
                    <TableCell align="right">Prix unitaire</TableCell>
                    <TableCell align="right">Total</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedCommande?.lignes?.map((ligne, index) => (
                    <TableRow key={index}>
                      <TableCell>{ligne.article?.libelle || ligne.libelle}</TableCell>
                      <TableCell align="right">{ligne.quantite || 0}</TableCell>
                      <TableCell align="right">{ligne.prix_unitaire?.toFixed(2)} DT</TableCell>
                      <TableCell align="right">{(ligne.quantite * ligne.prix_unitaire)?.toFixed(2)} DT</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeTab === 2 && (
            <List>
              <ListItem>
                <ListItemText
                  primary="Commande créée"
                  secondary={new Date(selectedCommande?.dateCommande).toLocaleString()}
                />
              </ListItem>
            </List>
          )}

          {activeTab === 3 && (
            <List>
              <ListItem>
                <ListItemText
                  primary="Bon de commande"
                  secondary="Télécharger le bon de commande"
                />
              </ListItem>
            </List>
          )}
        </Box>
      </Drawer>
    </>
  );
} 