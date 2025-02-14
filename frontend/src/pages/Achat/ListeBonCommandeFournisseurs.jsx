import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";

import {
  Card, CardContent, Typography, Grid, Button, TextField, MenuItem, Select, FormControl, InputLabel, IconButton, Drawer, Modal, Backdrop, Fade, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper
} from "@mui/material";
import { Stack } from "@mui/material";
import { FilterList, Search, Clear } from "@mui/icons-material";
import { InputAdornment } from "@mui/material";

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
  const [selectedBonCommande, setSelectedBonCommande] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // État pour la pagination
  const itemsPerPage = 5; // Nombre d'éléments par page
  const [editBonCommande, setEditBonCommande] = useState(null); // État pour le bon de commande en cours de modification
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // État pour contrôler l'affichage du formulaire de modification
  const [fournisseurs, setFournisseurs] = useState([]);
  const [articles, setArticles] = useState([]);
  const [depots, setDepots] = useState([]);

  // Récupération des données
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les bons de commande
        const bonsCommandeResponse = await axios.get("http://localhost:5000/boncommandeF/all");
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

  // Filtrage des bons de commande
  const filteredBonsCommande = useMemo(() => {
    return bonsCommande.filter((bonCommande) => {
      const matchesSearchTerm =
        bonCommande.numero_commande.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
  const handleDeleteBonCommande = async (id) => {
    try {
      const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer ce bon de commande ?");
      if (!confirmDelete) return;

      await axios.delete(`http://localhost:5000/boncommandeF/${id}`);
      setBonsCommande(bonsCommande.filter((bon) => bon._id !== id)); // Mettre à jour l'état local
      alert("Bon de commande supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression du bon de commande :", error);
      alert("Erreur lors de la suppression du bon de commande.");
    }
  };

  // Ouverture du formulaire de modification
  const handleEditBonCommande = (bonCommande) => {
    setEditBonCommande(bonCommande); // Stocker les données du bon de commande à modifier
    setEditLignes(bonCommande.lignes); // Initialiser les lignes modifiables
    setIsEditModalOpen(true); // Ouvrir le formulaire de modification
  };

  // Soumission du formulaire de modification
  const handleSubmitEdit = async (e, id) => {
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
          <h1>Liste des bons de commande fournisseur</h1>
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
              sx={{ ml: 5 }}
            >
              Filtre
            </Button>
          </Box>

          {/* Sidebar pour les filtres avancés */}
          <Drawer
            anchor="right"
            open={isFilterSidebarOpen}
            onClose={() => setIsFilterSidebarOpen(false)}
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
                  {[...new Set(bonsCommande.map((bon) => bon.fournisseur?.raison_sociale))].map((name, index) => (
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
                  {[...new Set(bonsCommande.flatMap((bon) => bon.lignes.map((ligne) => ligne.article.libelle)))].map((article, index) => (
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
                  {[...new Set(bonsCommande.map((bon) => new Date(bon.dateCommande).getFullYear().toString()))].map((year, index) => (
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

          {/* Affichage des bons de commande filtrés */}
          <Stack spacing={2}>
            {paginatedBonsCommande.map((bonCommande, index) => (
              <Card key={index} sx={{ width: "100%", boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.45)" }}>
                <CardContent>
                  <Typography variant="h5" component="div">
                    Bon de Commande N° {bonCommande.numero_commande}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }} color="text.secondary">
                    Date: {new Date(bonCommande.dateCommande).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    Fournisseur: {bonCommande.fournisseur ? bonCommande.fournisseur.raison_sociale : "Non spécifié"}
                  </Typography>
                  <Typography variant="body2">
                    Total HT: {bonCommande.total_hors_Taxe} TND
                  </Typography>
                  <Typography variant="body2">
                    Total TTC: {bonCommande.total_ttc} TND
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2, mr: 2 }}
                    onClick={() => handleOpenModal(bonCommande)}
                  >
                    Voir les détails
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    sx={{ mt: 2, mr: 2 }}
                    onClick={() => handleDeleteBonCommande(bonCommande._id)}
                  >
                    Supprimer
                  </Button>
                  <Button
                    variant="contained"
                    color="warning"
                    sx={{ mt: 2, mr: 2 }}
                    onClick={() => handleEditBonCommande(bonCommande)}
                  >
                    Modifier
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Stack>

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Button
              variant="contained"
              color="#00000F"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
              sx={{ mr: 2 }}
            >
              Précédent
            </Button>
            <Button
              variant="contained"
              color="#000000"
              disabled={currentPage * itemsPerPage >= filteredBonsCommande.length}
              onClick={() => setCurrentPage(currentPage + 1)}
            >
              Suivant
            </Button>
          </Box>

          {/* Affichage du numéro de page */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Typography variant="body1">
              Page {currentPage} sur {Math.ceil(filteredBonsCommande.length / itemsPerPage)}
            </Typography>
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
                {selectedBonCommande && (
                  <>
                    <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
                      Détails du Bon de Commande N° {selectedBonCommande.numero_commande}
                    </Typography>

                    {/* Informations de base */}
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Informations Générales
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Date de commande:</strong> {new Date(selectedBonCommande.dateCommande).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Fournisseur:</strong> {selectedBonCommande.fournisseur ? selectedBonCommande.fournisseur.raison_sociale : "Non spécifié"}
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Total HT:</strong> {selectedBonCommande.total_hors_Taxe} TND
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Total TTC:</strong> {selectedBonCommande.total_ttc} TND
                    </Typography>

                    {/* Lignes de commande */}
                    <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
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
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedBonCommande.lignes.map((ligne, index) => (
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

                    {/* Bouton pour modifier le bon de commande */}
                    <Button
                      variant="contained"
                      color="warning"
                      sx={{ mt: 2, mr: 65 }}
                      onClick={() => handleEditBonCommande(selectedBonCommande)}
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
                {editBonCommande && (
                  <>
                    <Typography variant="h4" component="h2" sx={{ mb: 3 }}>
                      Modifier le Bon de Commande N° {editBonCommande.numero_commande}
                    </Typography>

                    <form onSubmit={(e) => handleSubmitEdit(e, editBonCommande._id)}>
                      <Grid container spacing={2}>
                        {/* Champ Date de commande */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Date de commande"
                            type="date"
                            value={editBonCommande.dateCommande ? new Date(editBonCommande.dateCommande).toISOString().split('T')[0] : ""}
                            onChange={(e) =>
                              setEditBonCommande({
                                ...editBonCommande,
                                dateCommande: e.target.value,
                              })
                            }
                            InputLabelProps={{
                              shrink: true,
                            }}
                          />
                        </Grid>

                        {/* Champ Fournisseur */}
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Fournisseur</InputLabel>
                            <Select
                              value={editBonCommande.fournisseur?._id || ""}
                              onChange={(e) =>
                                setEditBonCommande({
                                  ...editBonCommande,
                                  fournisseur: fournisseurs.find((f) => f._id === e.target.value),
                                })
                              }
                            >
                              {fournisseurs.map((fournisseur) => (
                                <MenuItem key={fournisseur._id} value={fournisseur._id}>
                                  {fournisseur.raison_sociale}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Champ Dépôt */}
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth>
                            <InputLabel>Dépôt</InputLabel>
                            <Select
                              value={editBonCommande.depot?._id || ""}
                              onChange={(e) =>
                                setEditBonCommande({
                                  ...editBonCommande,
                                  depot: depots.find((d) => d._id === e.target.value),
                                })
                              }
                            >
                              {depots.map((depot) => (
                                <MenuItem key={depot._id} value={depot._id}>
                                  {depot.libelle}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>

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
                                      <FormControl fullWidth>
                                        <InputLabel>Article</InputLabel>
                                        <Select
                                          value={ligne.article?._id || ""}
                                          onChange={(e) => {
                                            const newLignes = [...editLignes];
                                            newLignes[index].article = articles.find((a) => a._id === e.target.value);
                                            setEditLignes(newLignes);
                                          }}
                                        >
                                          {articles.map((article) => (
                                            <MenuItem key={article._id} value={article._id}>
                                              {article.libelle}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </FormControl>
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        fullWidth
                                        type="number"
                                        value={ligne.quantite}
                                        onChange={(e) => {
                                          const newLignes = [...editLignes];
                                          newLignes[index].quantite = Number(e.target.value);
                                          newLignes[index].total_ht = newLignes[index].quantite * newLignes[index].prix_unitaire;
                                          newLignes[index].total_ttc = newLignes[index].total_ht * 1.2;
                                          setEditLignes(newLignes);
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <TextField
                                        fullWidth
                                        type="number"
                                        value={ligne.prix_unitaire}
                                        onChange={(e) => {
                                          const newLignes = [...editLignes];
                                          newLignes[index].prix_unitaire = Number(e.target.value);
                                          newLignes[index].total_ht = newLignes[index].quantite * newLignes[index].prix_unitaire;
                                          newLignes[index].total_ttc = newLignes[index].total_ht * 1.2;
                                          setEditLignes(newLignes);
                                        }}
                                      />
                                    </TableCell>
                                    <TableCell>{ligne.total_ht} TND</TableCell>
                                    <TableCell>{ligne.total_ttc} TND</TableCell>
                                    <TableCell>
                                      <IconButton
                                        color="error"
                                        onClick={() => {
                                          const newLignes = [...editLignes];
                                          newLignes.splice(index, 1);
                                          setEditLignes(newLignes);
                                        }}
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
                            onClick={() => setIsEditModalOpen(false)}
                          >
                            Annuler
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </>
                )}
              </Box>
            </Fade>
          </Modal>
        </Box>
      </Box>
    </>
  );
}