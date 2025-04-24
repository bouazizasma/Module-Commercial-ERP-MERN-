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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Visibility,
  Edit,
  Delete,
  Add,
  Receipt,
  Print,
  Download,
} from "@mui/icons-material";

import { useNavigate } from "react-router-dom";
import FileDownloadIcon from '@mui/icons-material/FileDownload';

import jsPDF from "jspdf";
import 'jspdf-autotable';
import autoTable from "jspdf-autotable";

export default function ListeBonLivraisonClient() {
  const [bonLivraisons, setBonLivraisons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [openPdfDialog, setOpenPdfDialog] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBonLivraisons();
  }, []);

  const fetchBonLivraisons = async () => {
    try {
      const response = await axios.get("http://localhost:5000/ventes/bons-Livraison");
      setBonLivraisons(response.data);
        // Récupérer les Clients
              const ClientsResponse = await axios.get("http://localhost:5000/client/clients");
              setClients(ClientsResponse.data);
      
      setLoading(false);
    } catch (error) {
      console.error("Erreur lors de la récupération des bons de Livraison:", error);
      setError("Erreur lors de la récupération des bons de Livraison");
      setLoading(false);
    }
  };

  const handleView = (id) => {
    navigate(`/ventes/bon-livraison/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/ventes/bon-livraison/edit/${id}`);
  };

  const getStatusChip = (statut) => {
    let color = "default";
  
    switch (statut) {
      case "Facturée":
        color = "success"; // Vert
        break;
      case "Annulée":
        color = "error"; // Rouge
        break;
      case "Livrée":
        color = "#f5f5f5"; // Orange
        break;
      case "Confirmée" :
        color ="warning";
        break;
      default :
        color = "info"; // Bleu
    }
  
    return <Chip label={statut} color={color} sx={{ fontWeight: "bold", fontSize: "0.9rem" }} />;
  };
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce bon de Livraison ?")) {
      try {
        await axios.delete(`http://localhost:5000/enteteVentes/${id}`);
        fetchBonLivraisons();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const handleDownload = (bonLivraison) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Bon Livraison", 10, 10);
    doc.setFontSize(12);
    doc.text(`Bon Livraison N°: ${bonLivraison.numero}`, 10, 20);
    doc.text(`Date  Livraison: ${new Date(bonLivraison.dateLivraison).toLocaleDateString()}`, 10, 30);

    const client = clients.find(c => c._id === bonLivraison.client._id);
    doc.text(`À l'intention de: ${client.nom_prenom}`, 10, 40);
    doc.text(`Adresse: ${client.adresse || 'N/A'}`, 10, 50);
    doc.text(`Matricule Fiscale: ${client.matricule_fiscale || 'N/A'}`, 10, 60);
    doc.text(`Téléphone: ${client.telephone || 'N/A'}`, 10, 70);
  
    doc.text(`Objet : Bon Livraison`  , 10, 90);
  
    // Tableau des articles commandés
    doc.autoTable({
      startY: 100,
      head: [['Article',  'Quantité', 'Prix Unitaire ', 'Total ']],
      body: bonLivraison.lignes.map(ligne => [
        ligne.article.libelle,
        ligne.quantite,
        `${ligne.prix_unitaire.toFixed(2)} DT`,
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} DT`
      ]),
    });
  
    // Totaux
    const totalHT = bonLivraison.lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2;
  
    doc.text(`Montant Total HT: ${totalHT.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 10);
    doc.text(`Total TTC : ${totalTTC.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 20);
    doc.text(`Montant Total TTC: ${totalTTC.toFixed(2)} DT`, 10, doc.autoTable.previous.finalY + 30);
  
    doc.save(`${bonLivraison.numero}.pdf`);
  };

  const generateFacturePDF = async (bonLivraison) => {
    try {
      await axios.post(`http://localhost:5000/ventes/${bonLivraison._id}/generate-Facture`);
      fetchBonLivraisons();

      setSnackbarMessage("Le bon de livraison a été généré avec succès !");
      setOpenSnackbar(true);
      setTimeout(() => {
        const pdf = new jsPDF('p', 'mm', 'a4');
      
        // Configuration du style
        pdf.setFont("helvetica");
        pdf.setFontSize(16);
        
        // En-tête
        pdf.text("Facture", 85, 20);
        
        // Informations client
        pdf.setFontSize(10);
        pdf.rect(10, 30, 95, 15);
        pdf.text(`Numero Facture: ${Date.now().toString()}`, 15, 37);
        pdf.text(`Client: ${bonLivraison.client?.nom_prenom || 'Non spécifié'}`, 15, 42);
        
        // Date et autres informations
        pdf.rect(10, 47, 95, 10);
        pdf.text(`Date: ${new Date(bonLivraison.dateLivraison).toLocaleDateString() || 'Non spécifiée'}`, 15, 53);
        
        // En-tête du tableau
        const headers = ['Désignation', 'Quantitée', 'P.U H.T', 'Remise%', 'P.U T.T.C', 'Net', 'TVA%'];
        let y = 65;
        
        // Dessiner l'en-tête du tableau
        pdf.rect(10, y-5, 190, 10);
        let x = 15;
        headers.forEach((header) => {
          pdf.text(header, x, y);
          x += 24;
        });
        
        // Contenu du tableau
        y += 10;
        bonLivraison.lignes.forEach((ligne) => {
          pdf.rect(10, y-5, 190, 10);
          x = 15;
          
          pdf.text(ligne.article?.libelle?.toString() || '', x, y);
          x += 24;
          pdf.text(ligne.quantite?.toString() || '0', x, y);
          x += 24;
          pdf.text(ligne.prix_unitaire?.toFixed(3) || '0.000', x, y);
          x += 24;
          pdf.text(ligne.remise?.toString() || '0', x, y);
          x += 24;
          pdf.text(ligne.prix_uTTC?.toFixed(3) || '0.000', x, y);
          x += 24;
          pdf.text((ligne.prix_unitaire * ligne.quantite)?.toFixed(3) || '0.000', x, y);
          x += 24;
          pdf.text(ligne.tva?.toString() || '0', x, y);
          y += 10;
        });
        
        // Totaux
        y += 10;
        pdf.rect(10, y, 190, 25);
        pdf.text(`TOTAL HT: ${bonLivraison.total_hors_Taxe?.toFixed(3) || '0.000'}`, 15, y+5);
        pdf.text(`REMISE: 0.000`, 15, y+10);
        pdf.text(`NET HT: ${bonLivraison.total_hors_Taxe?.toFixed(3) || '0.000'}`, 15, y+15);
        pdf.text(`MT TVA: ${(bonLivraison.total_ttc - bonLivraison.total_hors_Taxe)?.toFixed(3) || '0.000'}`, 15, y+20);
        
        // Timbre et total à payer
        pdf.text(`TIMBRE: ${bonLivraison.timbre?.toString() || '0.000'}`, 120, y+15);
        pdf.text(`A PAYER: ${bonLivraison.netapayer?.toFixed(3) || '0.000'}`, 120, y+20);
        
        // Montant en lettres
        y += 35;
        pdf.rect(10, y, 190, 10);
        pdf.text("Arrêtée la présente Facture à la somme de :", 15, y+5);
        
        // Zone signature
        y += 20;
        pdf.rect(10, y, 190, 30);
        pdf.text(`Notation: ${bonLivraison.notation || 'Non spécifié'}`, 15, y+5);
        pdf.text(`Chauffeur: ${bonLivraison.chauffeur || 'Non spécifié'}`, 75, y+5);
        pdf.text("Signature & Cachet", 135, y+5);
        
        // Véhicule
        pdf.text(`Véhicule: ${bonLivraison.vehicule?.matricule?.toString() || 'Non spécifié'}`, 75, y+20);
        
        const pdfBlob = pdf.output('blob');
        const pdfUrl = URL.createObjectURL(pdfBlob);
        setPdfUrl(pdfUrl);
        setOpenPdfDialog(true);
        
        return true;
      }, 2000);
  
    } catch (error) {
      console.error("Erreur lors de la génération de la facture:", error);
      throw error;
    }
  };

  const handlePrint = () => {
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl);
      printWindow.print();
    }
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `facture_${Date.now()}.pdf`;
      link.click();
    }
  };

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
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Receipt sx={{ fontSize: 40, color: "#1976d2" }} />
                      <Typography variant="h4" component="h1">
                        Liste des Bons de Livraison Client
                      </Typography>
                    </Stack>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Add />}
                      onClick={() => navigate("/SaisieBonLivraisonClient")}
                    >
                      Nouveau Bon de Livraison
                    </Button>
                  </Stack>

                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>N° Bon de Livraison</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Client</TableCell>
                          <TableCell>Montant HT</TableCell>
                          <TableCell>Montant TTC</TableCell>
                         <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Status</TableCell>
                         
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bonLivraisons.map((bonLivraison) => (
                          <TableRow key={bonLivraison._id}>
                            <TableCell>{bonLivraison.numero}</TableCell>
                            <TableCell>
                              {new Date(bonLivraison.dateLivraison).toLocaleDateString()}
                            </TableCell>
                            <TableCell>{bonLivraison.client?.nom_prenom}</TableCell>
                            <TableCell>
                  {(bonLivraison.montantHT || bonLivraison.total_hors_Taxe || 0).toFixed(2)} DT
                </TableCell>
                <TableCell>
                  {(bonLivraison.montantTTC || bonLivraison.total_ttc || 0).toFixed(2)} DT
                </TableCell>
                  <TableCell>
                                            <Chip 
                                              label={bonLivraison.statut} 
                                              color={bonLivraison.statut === "Facturée" ? "success" : 
                                                bonLivraison.statut === "Annulée" ? "error" : 
                                                bonLivraison.statut === "Livrée" ? "warning" : "info"}
                                              sx={{ 
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem',
                                                borderRadius: '4px',
                                                padding: '4px 8px'
                                              }}
                                            />
                                          </TableCell>
                            <TableCell>
                              <IconButton
                                color="primary"
                                onClick={() => handleView(bonLivraison._id)}
                                size="small"
                              >
                                <Visibility />
                              </IconButton>
                              <IconButton
                                color="primary"
                                onClick={() => handleEdit(bonLivraison._id)}
                                size="small"
                              >
                                <Edit />
                              </IconButton>
                              <IconButton
                                color="error"
                                onClick={() => handleDelete(bonLivraison._id)}
                                size="small"
                              >
                                <Delete />
                              </IconButton>
                              <IconButton
                              onClick={() => handleDownload(bonLivraison)}
                              sx={{ 
                              color: '#ed6c02',
                              '&:hover': { backgroundColor: 'rgba(237, 108, 2, 0.04)' }
                              }}
                               >
                              <FileDownloadIcon />
                              </IconButton>  
                              <IconButton 
                                color="primary" 
                                onClick={() => generateFacturePDF(bonLivraison)}
                                title="Générer Facture"
                              >
                                <Receipt />
                              </IconButton>
                              <IconButton 
                                color="primary" 
                                onClick={() => generateFacturePDF(bonLivraison)}
                                title="Imprimer"
                              >
                                <Print />
                              </IconButton>
                              <IconButton 
                                color="primary" 
                                onClick={() => generateFacturePDF(bonLivraison)}
                                title="Télécharger"
                              >
                                <Download />
                              </IconButton>
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

      <Dialog
        open={openPdfDialog}
        onClose={() => setOpenPdfDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Facture</DialogTitle>
        <DialogContent>
          <iframe
            src={pdfUrl}
            width="100%"
            height="500px"
            title="Facture"
          />
        </DialogContent>
        <DialogActions>
          <Button 
            startIcon={<Print />} 
            onClick={handlePrint}
            variant="contained"
            color="primary"
          >
            Imprimer
          </Button>
          <Button 
            startIcon={<Download />} 
            onClick={handleDownloadPdf}
            variant="contained"
            color="secondary"
          >
            Télécharger
          </Button>
          <Button onClick={() => setOpenPdfDialog(false)}>
            Fermer
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
} 