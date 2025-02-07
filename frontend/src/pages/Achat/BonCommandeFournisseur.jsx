
import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
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
  Grid,
  TextField,
  IconButton,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline"; // Icône pour le bouton Ajouter
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
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
  const [isFournisseurSelected, setIsFournisseurSelected] = useState(false);
  const [isArticleSelected, setIsArticleSelected] = useState(false);

  const [dateCommande, setDateCommande] = useState(new Date());
  const [adresse, setAdresse] = useState(''); // État pour l'adresse
  const [matriculeFiscale, setMatriculeFiscale] = useState(''); // État pour le matricule fiscal
  useEffect(() => {
    axios.get("http://localhost:5000/fournisseur/fournisseurs").then(response => setFournisseurs(response.data));
    axios.get("http://localhost:5000/article/articles").then(response => setArticles(response.data));
    axios.get("http://localhost:5000/depot/depots").then(response => setDepots(response.data));

  }, []);
  const handleFournisseurChange = (e) => {
    const selectedId = e.target.value;
    setSelectedFournisseur(selectedId);
    setIsFournisseurSelected(true);
    // Récupérer les informations du fournisseur sélectionné
    const selectedFournisseurData = fournisseurs.find(f => f._id === selectedId);
    if (selectedFournisseurData) {
      setAdresse(selectedFournisseurData.adresse || ''); // Mettre à jour l'adresse
      setMatriculeFiscale(selectedFournisseurData.matricule_fiscale || ''); // Mettre à jour le matricule fiscal
    }
  };
  const handleArticleChange = (e) => {
    const selectedId = e.target.value;
    setSelectedArticle(selectedId);
    setIsArticleSelected(true);
    // Récupérer les informations du fournisseur sélectionné
    const selectedArticleData = articles.find(a => a._id === selectedId);
    if (selectedArticleData) {
      const prixs = selectedArticleData.prix_net ; 

      const prix = Number(prixs) || 0; 
      console.log("prix dans handleArticleChange:", prix); // Debug
      setPrixUnitaire(prix || 0 ); // Mettre à jour le prix 
    }
    else {
      setPrixUnitaire(20);
    }
  };
  const handleAddLigne = () => {
    if (!selectedArticle || quantite <= 0 ) {
      alert("Veuillez remplir tous les champs correctement !");
      return;
    }
    const article = articles.find(a => a._id === selectedArticle);
    setLignes([...lignes, { article: selectedArticle, libelle: article.libelle, quantite, prix_unitaire: article.prix_net }]);
    setSelectedArticle('');
    setQuantite(1);
    setPrixUnitaire(0);
  };
  const handleRemoveLigne = (index) => {
    setLignes(lignes.filter((_, i) => i !== index));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFournisseur || lignes.length === 0) {
      alert("Veuillez sélectionner un fournisseur et ajouter au moins un article.");
      return;
    }
    const total_ht = lignes.reduce((acc, ligne) => acc + (ligne.quantite * ligne.prix_unitaire), 0);
    const total_ttc = total_ht * 1.2;
    const bonCommande = {
      fournisseur: selectedFournisseur,
      lignes,
      total_ht,
      total_ttc
    };
    try {
      const response = await axios.post("http://localhost:5000/boncommandeF/create", bonCommande);
      console.log('Bon de commande créé:', response.data);
      alert('Bon de commande créé avec succès !');
      setSelectedFournisseur('');
      setIsFournisseurSelected(false);
      setLignes([]);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <>
      <Navbar />
      <Box height={100} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: "auto",
            maxHeight: "100vh",
          }}
        >
          <h1>Créer un bon de commande fournisseur</h1>
          <form onSubmit={handleSubmit}>
            {/* Partie fournisseur */}
            <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
              {/* Sélection du fournisseur */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  label="Fournisseur"
                  value={selectedFournisseur}
                  onChange={handleFournisseurChange}
                  fullWidth
                  required
                  disabled={isFournisseurSelected}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {fournisseurs.map(f => (
                    <option key={f._id} value={f._id}>{f.raison_sociale}</option>
                  ))}
                </TextField>
              </Grid>
              {/* Adresse du fournisseur */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Adresse"
                  type="string"
                  value={adresse}
                  fullWidth
                  required
                  disabled // Désactiver le champ pour empêcher la modification manuelle
                />
              </Grid>
              {/* Matricule Fiscale du fournisseur */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  label="Matricule Fiscale"
                  type="string"
                  value={matriculeFiscale}
                  fullWidth
                  required
                  disabled // Désactiver le champ pour empêcher la modification manuelle
                />
              </Grid>
               {/* Champ DatePicker */}
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
            {/* Sélection des détails de la ligne */}
            <Grid container spacing={2} alignItems="center" sx={{ marginBottom: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  label="Article"
                  value={selectedArticle}
                  onChange={handleArticleChange}
                  fullWidth
                  required
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="">Sélectionner un article</option>
                  {articles.map(a => (
                    <option key={a._id} value={a._id}>{a.libelle}</option>
                  ))}
                </TextField>
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
              {console.log("prixUnitaire avant affichage:", prixUnitaire)} {/* Debug */}

                <TextField
                  label="Prix unitaire"
                  type="number"
                  value={prixUnitaire}
                  fullWidth
                  required
                  disabled // Désactiver le champ pour empêcher la modification manuelle
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
          <TextField
                select
                label="Dépôt"
                  value={selectedDepot}
                  onChange={(e) => setSelectedDepot(e.target.value)}
                  fullWidth
                  required
                SelectProps={{
               native: true,
               }}
              >
            <option value="">Sélectionner un dépôt</option>
         {depots.map(d => (
           <option key={d._id} value={d._id}>{d.libelle}</option>
          ))}
        </TextField>
        </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <IconButton color="primary" onClick={handleAddLigne}>
                  <AddCircleOutlineIcon fontSize="large" />
                </IconButton>
              </Grid>
            </Grid>
            {/* Tableau des lignes de commande */}
            {lignes.length > 0 && (
              <TableContainer component={Paper} sx={{ marginTop: 3 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Article</TableCell>
                      <TableCell>Date</TableCell>
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
                        <TableCell>{dateCommande && <h3>Date sélectionnée: {dateCommande.toLocaleDateString()}</h3>}</TableCell>
                        <TableCell>{ligne.quantite}</TableCell>
                        <TableCell>{ligne.prix_unitaire} TND</TableCell>
                        <TableCell>{(ligne.quantite * ligne.prix_unitaire).toFixed(2)} TND</TableCell>
                        <TableCell>
                          <Button variant="contained" color="error" onClick={() => handleRemoveLigne(index)}>Supprimer</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            <Button type="submit" variant="contained" color="primary" sx={{ marginTop: 3 }}>
              Créer le bon de commande
            </Button>
          </form>
        </Box>
      </Box>
    </>
  );
}