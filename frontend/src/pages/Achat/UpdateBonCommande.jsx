import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Autocomplete,
} from "@mui/material";
import { Clear, AddCircleOutline } from "@mui/icons-material";
import Sidenav from "../../navbar/Sidenav";
import Navbar from "../../navbar/Navbar";

export default function UpdateBonCommande() {
  const { id } = useParams(); // Récupérer l'ID du bon de commande depuis l'URL
  const navigate = useNavigate(); // Pour la navigation
  const [bonCommande, setBonCommande] = useState(null); // État pour le bon de commande à modifier
  const [editLignes, setEditLignes] = useState([]); // État pour les lignes modifiables
  const [fournisseurs, setFournisseurs] = useState([]); // Liste des fournisseurs
  const [articles, setArticles] = useState([]); // Liste des articles
  const [depots, setDepots] = useState([]); // Liste des dépôts
  const [error, setError] = useState(null); // Gestion des erreurs

  // Récupérer les données initiales
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer le bon de commande
        const bonCommandeResponse = await axios.get(`http://localhost:5000/achat/BCF${id}`);
        setBonCommande(bonCommandeResponse.data);
        setEditLignes(bonCommandeResponse.data.lignes);

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
  }, [id]);

  // Gestion des changements dans les champs du bon de commande
  const handleBonCommandeChange = (field, value) => {
    setBonCommande((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Gestion des changements dans les lignes de commande
  const handleLigneChange = (index, field, value) => {
    const newLignes = [...editLignes];
    newLignes[index][field] = value;

    // Recalculer les totaux si la quantité ou le prix unitaire change
    if (field === "quantite" || field === "prix_unitaire") {
      newLignes[index].total_ht = newLignes[index].quantite * newLignes[index].prix_unitaire;
      newLignes[index].total_ttc = newLignes[index].total_ht * 1.2;
    }

    setEditLignes(newLignes);
  };

  // Supprimer une ligne de commande
  const handleDeleteLigne = (index) => {
    const newLignes = [...editLignes];
    newLignes.splice(index, 1);
    setEditLignes(newLignes);
  };

  // Ajouter une nouvelle ligne de commande
  const handleAddLigne = () => {
    setEditLignes([...editLignes, { article: "", quantite: 1, prix_unitaire: 0, total_ht: 0, total_ttc: 0 }]);
  };

  // Soumettre le formulaire de modification
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Calculer les totaux
      const total_hors_Taxe = editLignes.reduce((acc, ligne) => acc + ligne.total_ht, 0);
      const total_ttc = total_hors_Taxe * 1.2;

      // Mettre à jour le bon de commande
      const updatedBonCommande = {
        ...bonCommande,
        lignes: editLignes,
        total_hors_Taxe,
        total_ttc,
        date_modification: new Date(), // Ajouter la date de modification
        fournisseur: bonCommande.fournisseur?._id, // Envoyer l'ID du fournisseur
        depot: bonCommande.depot?._id, // Envoyer l'ID du dépôt
      };

      // Envoyer la requête de mise à jour
      await axios.put(`http://localhost:5000/achat/BCF/${id}`, updatedBonCommande);
      alert("Bon de commande mis à jour avec succès !");
      navigate("/ListeBonCommandeFournisseur"); // Rediriger vers la liste des bons de commande
    } catch (error) {
      console.error("Erreur lors de la mise à jour du bon de commande :", error);
      alert("Erreur lors de la mise à jour du bon de commande.");
    }
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!bonCommande) {
    return <div>Chargement...</div>;
  }

  return (
    <>
      <Navbar />
      <Box height={70} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto", maxHeight: "100vh" }}>
          <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
            Modifier le Bon de Commande N° {bonCommande.numero_commande}
          </Typography>

          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Champ Date de commande */}
              <Grid item xs={4} sm={3}>
                <TextField
                  fullWidth
                  label="Date de commande"
                  type="date"
                  value={bonCommande.dateCommande ? new Date(bonCommande.dateCommande).toISOString().split('T')[0] : ""}
                  onChange={(e) => handleBonCommandeChange("dateCommande", e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {/* Champ Fournisseur */}
              <Grid item xs={4} sm={3}>
                <Autocomplete
                  options={fournisseurs}
                  getOptionLabel={(option) => option.raison_sociale}
                  value={fournisseurs.find((f) => f._id === bonCommande.fournisseur?._id) || null}
                  onChange={(e, newValue) =>
                    handleBonCommandeChange("fournisseur", newValue)
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Fournisseur" fullWidth />
                  )}
                />
              </Grid>

              {/* Champ Dépôt */}
              <Grid item xs={4} sm={3}>
                <Autocomplete
                  options={depots}
                  getOptionLabel={(option) => option.libelle}
                  value={depots.find((d) => d._id === bonCommande.depot?._id) || null}
                  onChange={(e, newValue) =>
                    handleBonCommandeChange("depot", newValue)
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Dépôt" fullWidth />
                  )}
                />
              </Grid>

              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutline />}
                onClick={handleAddLigne}
                sx={{ mb: 2, ml: 110 }}
              >
                D'autre article
              </Button>

              {/* Liste des articles modifiables */}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Articles Commandés
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
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {editLignes.map((ligne, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Autocomplete
                              options={articles}
                              getOptionLabel={(option) => option.libelle}
                              value={articles.find((a) => a._id === ligne.article?._id) || null}
                              onChange={(e, newValue) => {
                                const newLignes = [...editLignes];
                                newLignes[index].article = newValue;
                                newLignes[index].prix_unitaire = newValue?.prix_net || 0; // Récupérer le prix_net de l'article
                                newLignes[index].total_ht = newLignes[index].quantite * newLignes[index].prix_unitaire;
                                newLignes[index].total_ttc = newLignes[index].total_ht * 1.2;
                                setEditLignes(newLignes);
                              }}
                              renderInput={(params) => (
                                <TextField {...params} label="Article" fullWidth />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              type="number"
                              value={ligne.quantite}
                              onChange={(e) => handleLigneChange(index, "quantite", Number(e.target.value))}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              fullWidth
                              type="number"
                              value={ligne.prix_unitaire}
                              onChange={(e) => handleLigneChange(index, "prix_unitaire", Number(e.target.value))}
                            />
                          </TableCell>
                          <TableCell>{ligne.total_ht} TND</TableCell>
                          <TableCell>{ligne.total_ttc} TND</TableCell>
                          <TableCell>
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteLigne(index)}
                            >
                              <Clear />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Grid>

              {/* Boutons du formulaire */}
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2, mr: 2 }}
                >
                  Enregistrer
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ mt: 2 }}
                  onClick={() => navigate("/ListeBonCommandeFournisseur")}
                >
                  Annuler
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Box>
    </>
  );
}