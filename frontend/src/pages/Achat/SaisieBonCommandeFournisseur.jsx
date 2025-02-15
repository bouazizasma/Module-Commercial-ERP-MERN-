import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Paper, Grid, TextField, IconButton, Card, CardContent, Typography,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Autocomplete } from "@mui/material";
import jsPDF from "jspdf";
import 'jspdf-autotable';
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";

export default function BonCommandeFournisseur() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [depots, setDepots] = useState([]);
  const [selectedFournisseur, setSelectedFournisseur] = useState('');
  const [selectedArticle, setSelectedArticle] = useState('');
  const [selectedDepot, setSelectedDepot] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [prixUnitaire, setPrixUnitaire] = useState(0);
  const [lignes, setLignes] = useState([]);
  const [dateCommande, setDateCommande] = useState(new Date());
  const [adresse, setAdresse] = useState('');
  const [matriculeFiscale, setMatriculeFiscale] = useState('');
  const [totalHT, setTotalHT] = useState(0);
  const [totalTTC, setTotalTTC] = useState(0);

  useEffect(() => {
    axios.get("http://localhost:5000/fournisseur/fournisseurs").then(response => setFournisseurs(response.data));
    axios.get("http://localhost:5000/article/articles").then(response => setArticles(response.data));
    axios.get("http://localhost:5000/depot/depots").then(response => setDepots(response.data));
  }, []);

  useEffect(() => {
    const totalHT = lignes.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0);
    const totalTTC = totalHT * 1.2;
    setTotalHT(totalHT);
    setTotalTTC(totalTTC);
  }, [lignes]);

  const handleAddLigne = () => {
    if (!selectedArticle || quantite <= 0) {
      alert("Veuillez remplir tous les champs correctement !");
      return;
    }
    const article = articles.find(a => a._id === selectedArticle);
    setLignes([...lignes, { article: selectedArticle, libelle: article.libelle, quantite, prix_unitaire: article.prix_net }]);
    setQuantite(1);
    setPrixUnitaire(0);
  };

  const handleRemoveLigne = (index) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFournisseur || lignes.length === 0 || !selectedDepot) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    const bonCommande = {
      fournisseur: selectedFournisseur,
      lignes,
      total_ht: totalHT,
      total_ttc: totalTTC,
      depot: selectedDepot,
      dateCommande: dateCommande.toISOString(),
    };
    try {
      const response = await axios.post("http://localhost:5000/boncommandeF/create", bonCommande);
      alert('Bon de commande créé avec succès !');
      generatePDF(bonCommande);
      setSelectedFournisseur('');
      setSelectedArticle('');
      setLignes([]);
      setSelectedDepot('');
      setDateCommande(new Date());
    } catch (error) {
      console.error("Erreur lors de la création du bon de commande:", error);
      alert("Erreur lors de la création du bon de commande.");
    }
  };

  const generatePDF = (bonCommande) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Bon de Commande", 10, 10);
    doc.setFontSize(12);
    doc.text(`Commande N°: ${bonCommande.numero_commande}`, 10, 20);
    doc.text(`Date Commande: ${new Date(bonCommande.dateCommande).toLocaleDateString()}`, 10, 30);
    const fournisseur = fournisseurs.find(f => f._id === bonCommande.fournisseur);
    doc.text(`À l'intention de: ${fournisseur.raison_sociale}`, 10, 40);
    doc.text(`Adresse: ${fournisseur.adresse || 'N/A'}`, 10, 50);
    doc.text(`Téléphone: ${fournisseur.telephone || 'N/A'}`, 10, 60);
    doc.autoTable({
      startY: 70,
      head: [['Article', 'Quantité', 'Prix Unitaire', 'Total']],
      body: bonCommande.lignes.map(ligne => [
        ligne.libelle,
        ligne.quantite,
        `${ligne.prix_unitaire.toFixed(2)} TND`,
        `${(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND`
      ]),
    });
    doc.save("bon_de_commande.pdf");
  };

  return (
    <>
      <Navbar />
      <Box height={100} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto", maxHeight: "100vh" }}>
          <Typography variant="h4" sx={{ mb: 3 }}>Créer un bon de commande fournisseur</Typography>
{/* Fournisseur*/}
     <Card sx={{ mb: 3 }}>
  <CardContent>
    <Typography variant="h6" sx={{ textAlign: 'left' }}>Informations Fournisseur</Typography>
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <Autocomplete
          options={fournisseurs}
          getOptionLabel={(option) => option.raison_sociale}
          value={fournisseurs.find(f => f._id === selectedFournisseur) || null}
          onChange={(e, newValue) => {
            if (newValue) {
              setSelectedFournisseur(newValue._id);
              setAdresse(newValue.adresse || '');
              setMatriculeFiscale(newValue.matricule_fiscale || '');
            } else {
              setSelectedFournisseur('');
              setAdresse('');
              setMatriculeFiscale('');
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Fournisseur" fullWidth required />
          )}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField label="Adresse" value={adresse} fullWidth disabled />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <TextField label="Matricule Fiscale" value={matriculeFiscale} fullWidth disabled />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Date de commande"
            value={dateCommande}
            onChange={(newValue) => setDateCommande(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </LocalizationProvider>
      </Grid>
    </Grid>
  </CardContent>
     </Card>

{/*article */}
       <Card sx={{ p: 3, mb: 3 }}>
            <CardContent>
            <Typography variant="h6" sx={{ textAlign: 'left' }}>Informations Articles</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={4}>
                  <Autocomplete
                    options={articles}
                    getOptionLabel={(option) => option.libelle}
                    value={articles.find(a => a._id === selectedArticle) || null}
                    onChange={(e, newValue) => {
                      if (newValue) {
                        setSelectedArticle(newValue._id);
                        setPrixUnitaire(newValue.prix_net || 0);
                      } else {
                        setSelectedArticle('');
                        setPrixUnitaire(0);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Article" fullWidth required />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label="Quantité"
                    type="number"
                    value={quantite}
                    onChange={(e) => setQuantite(parseInt(e.target.value))}
                    fullWidth
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label="Prix unitaire"
                    type="number"
                    value={prixUnitaire}
                    fullWidth
                    required
                    disabled
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Autocomplete
                    options={depots}
                    getOptionLabel={(option) => option.libelle}
                    value={depots.find(d => d._id === selectedDepot) || null}
                    onChange={(e, newValue) => {
                      if (newValue) {
                        setSelectedDepot(newValue._id);
                      } else {
                        setSelectedDepot('');
                      }
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label="Dépôt" fullWidth required />
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={1}>
                  <IconButton color="primary" onClick={handleAddLigne}>
                    <AddCircleOutlineIcon fontSize="large" />
                  </IconButton>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

{/*lignes */}
          {lignes.length > 0 && (
            <Card sx={{ p: 3, mb: 3 }}>
              <CardContent>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Article</TableCell>
                        <TableCell>Quantité</TableCell>
                        <TableCell>Prix Unitaire</TableCell>
                        <TableCell>Total</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {lignes.map((ligne, index) => (
                        <TableRow key={index}>
                          <TableCell>{ligne.libelle}</TableCell>
                          <TableCell>{ligne.quantite}</TableCell>
                          <TableCell>{ligne.prix_unitaire} TND</TableCell>
                          <TableCell>{(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND</TableCell>
                          <TableCell>
                            <IconButton color="error" onClick={() => handleRemoveLigne(index)}>
                              <DeleteIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          )}

         {/* Partie fixe dans le footer */}
         <Box
  sx={{
    position: 'fixed', // Fixe l'élément
    bottom: 0, // Collé en bas de la page
    left: 300, // Commence à gauche
    right: 0, // S'étend jusqu'à droite
    width: '70%', // Occupe toute la largeur
    backgroundColor: 'background.paper', // Fond du footer
    boxShadow: 3, // Ombre pour un effet surélevé
    zIndex: 1000, // Assure que l'élément est au-dessus des autres
    p: 2, // Padding interne
  }}
>
  <Grid container alignItems="center" justifyContent="space-between">
    {/* Totaux HT et TTC au centre */}
    <Grid item>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Typography variant="h6">Total HT: {totalHT.toFixed(2)} TND</Typography>
        <Typography variant="h6">Total TTC: {totalTTC.toFixed(2)} TND</Typography>
      </Box>
    </Grid>

    {/* Bouton à droite */}
    <Grid item>
      <Button type="submit" variant="contained" color="primary" onClick={handleSubmit}>
        Créer le bon de commande
      </Button>
    </Grid>
  </Grid>
</Box>
        </Box>
      </Box>
    </>
  );
}