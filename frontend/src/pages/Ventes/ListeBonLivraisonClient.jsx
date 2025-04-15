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
} from "@mui/material";
import {
  Visibility,
  Edit,
  Delete,
  Add,
  Receipt,
  
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



  return (
    <>
      <Navbar />
      <Box height={64} />
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
                        Liste des Bons de Livraison Client
                      </Typography>
                    </Stack>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<Add />}
                      onClick={() => navigate("/ventes/bonLivraison/creer")}
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
    </>
  );
} 