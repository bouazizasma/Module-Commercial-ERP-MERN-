import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Grid,
  Box,
  MenuItem,
  Checkbox,
  FormControlLabel,
  TextareaAutosize,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";
import { useNavigate } from "react-router-dom";

export default function CreateArticle() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    libelle: "",
    Nature: "",
    type: "",
    prix_brut: "",
    remise: "",
    prix_net: "",
    marge: "",
    prixht: "",
    prix_totale_concre: "",
    gestion_configuration: "",
    configuration: "",
    serie: false,
    dimension_article: false,
    longueur: "",
    largeur: "",
    hauteur: "",
    image_article: "",
  });

  const [familles, setFamilles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const famillesResponse = await axios.get("http://localhost:5000/familleArticle/familleArticle");
        setFamilles(famillesResponse.data);

        const categoriesResponse = await axios.get("http://localhost:5000/categorieArticle/CategorieArticles");
        setCategories(categoriesResponse.data);

        const fournisseursResponse = await axios.get("http://localhost:5000/fournisseur/fournisseurs");
        setFournisseurs(fournisseursResponse.data);
      } catch (error) {
        console.error("Erreur lors du chargement des données :", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image_article: e.target.files[0],
    }));
  };

  const createArticle = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });

      await axios.post("http://localhost:5000/article/newA", formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Article créé avec succès !");
      navigate("/Articles");
    } catch (error) {
      console.error("Erreur lors de la création de l'article :", error.response ? error.response.data : error);
      alert("Une erreur s'est produite lors de la création de l'article.");
    }
  };

  return (
    <>
      <Navbar />
      <Box height={100} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto", maxHeight: "100vh" }}>
          <h2>Créer un Article</h2>

          <form>
{/* Info Générales*/}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6">Informations Générales</Typography>
                <Grid container spacing={3}>
                  {/* Libelle Article*/}
                  <Grid item xs={3}>
                    <TextField
                      name="libelle"
                      label="Libellé"
                      fullWidth
                      value={formData.libelle}
                      onChange={handleChange}
                    />
                  </Grid>
                  {/* Nature */}
                  <Grid item xs={3}>
                    <TextField
                      name="Nature"
                      label="Nature"
                      fullWidth
                      value={formData.Nature}
                      onChange={handleChange}
                    />
                  </Grid>
                  {/* Type */}
                  <Grid item xs={3}>
                    <TextField
                      name="type"
                      label="Type"
                      fullWidth
                      value={formData.type}
                      onChange={handleChange}
                    />
                  </Grid>
           {/* Liste déroulante pour Famille */}
                  <Grid item xs={3}>
                    <TextField
                      name="libelleFamille"
                      label="Famille de l'article"
                      fullWidth
                      select
                      value={formData.libelleFamille}
                      onChange={handleChange}
                    >
                      {familles.map((famille) => (
                        <MenuItem key={famille._id} value={famille._id}>
                          {famille.designationFamille}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
            {/* Liste déroulante pour Catégorie */}
            <Grid item xs={3}>
                <TextField
                  name="libeleCategorie"
                  label="Catégorie de l'article"
                  fullWidth
                  value={formData.libeleCategorie}
                  onChange={handleChange}
                  select
                >
                  {categories.map((categorie) => (
                    <MenuItem key={categorie._id} value={categorie._id}>
                      {categorie.designationCategorie}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
               {/* Liste déroulante pour Fournisseur */}
               <Grid item xs={3}>
                <TextField
                  name="lib_fournisseur"
                  label="Fournisseur"
                  fullWidth
                  value={formData.lib_fournisseur}
                  onChange={handleChange}
                  select
                >
                  {fournisseurs.map((fournisseur) => (
                    <MenuItem key={fournisseur._id} value={fournisseur._id}>
                      {fournisseur.raison_sociale}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              {/* Quantitee */}
              <Grid item xs={3}>
                <TextField
                  name="Nombre_unite"
                  label="Nombre d'unités"
                  fullWidth
                  value={formData.Nombre_unite}
                  onChange={handleChange}
                  type="number"
                />
              </Grid>

                </Grid>
              </CardContent>
            </Card>
{/* Prix et Remises*/}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Prix et Remises</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      {/* prix brut */}
                      <Grid item xs={3}>
                        <TextField
                          name="prix_brut"
                          label="Prix Brut"
                          fullWidth
                          value={formData.prix_brut}
                          onChange={handleChange}
                        />
                      </Grid>
                      {/* Remise */}
                      <Grid item xs={3}>
                        <TextField
                          name="remise"
                          label="Remise %"
                          fullWidth
                          value={formData.remise}
                          onChange={handleChange}
                        />
                      </Grid>
                      {/* Prix net  */ }
                      <Grid item xs={3}>
                        <TextField
                          name="prix_net"
                          label="Prix NET"
                          fullWidth
                          value={formData.prix_net}
                          onChange={handleChange}
                        />
                      </Grid>
                       {/* marge*/}
              <Grid item xs={3}>
                <TextField
                  name="marge"
                  label="Marge"
                  fullWidth
                  value={formData.marge}
                  onChange={handleChange}
                />
              </Grid>
               {/* prixht*/}
               <Grid item xs={3}>
                <TextField
                  name="prixht"
                  label="Prix ht"
                  fullWidth
                  value={formData.prixht}
                  onChange={handleChange}
                />
              </Grid>
               {/* prix_totale_concré*/}
               <Grid item xs={3}>
                <TextField
                  name="prix_totale_concre"
                  label="Prix Totale Concré"
                  fullWidth
                  value={formData.prix_totale_concre}
                  onChange={handleChange}
                />
              </Grid>
            {/* prixmin */}
                <Grid item xs={3}>
                <TextField
                  name="prixmin"
                  label="Prix Min"
                  fullWidth
                  value={formData.prixmin}
                  onChange={handleChange}
                />
              </Grid>
              {/* prixmax */}
              <Grid item xs={3}>
                <TextField
                  name="prixmax"
                  label="Prix Max"
                  fullWidth
                  value={formData.prixmax}
                  onChange={handleChange}
                />
              </Grid>


                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>

{/* TVA */ }
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6">TVA</Typography>
                <Grid container spacing={3}>
                 
             {/* tva_achat */}
           <Grid item xs={3}>
                <TextField
                  name="tva_achat"
                  label="Tva Achat"
                  fullWidth
                  margin="normal"
                  value={formData.tva_achat}
                  onChange={handleChange}
                />
              </Grid>

              {/* tva */}
              <Grid item xs={3}>
                <TextField
                  name="tva"
                  label="TVA"
                  fullWidth
                  margin="normal"
                  value={formData.tva}
                  onChange={handleChange}
                />
              </Grid>
           

                </Grid>
              </CardContent>
            </Card>
{/* Détails*/}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Détails</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                       {/* movement_article */}
                 <Grid item xs={3}>
                <TextField
                  name="movement_article"
                  label="Movement Article"
                  fullWidth
                  value={formData.movement_article}
                  onChange={handleChange}
                />
              </Grid>
                {/* Checkbox pour activer la série */}
                <Grid item xs={3}>
               <FormControlLabel
                   control={
                 <Checkbox
                 name="serie"
                 checked={formData.serie}
                onChange={handleChange}
                />
                }
               label="Série"
                />
             </Grid>
           {/* Checkbox pour les dimensions */}
   <Grid item xs={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      name="dimension_article"
                      checked={formData.dimension_article}
                      onChange={handleChange}
                    />
                  }
                  label="Avec dimensions"
                />
              </Grid>
              {/* Champs conditionnels pour les dimensions */}
              {formData.dimension_article && (
                <>
                  <Grid item xs={3}>
                    <TextField
                      name="longueur"
                      label="Longueur"
                      fullWidth
                      margin="normal"
                      value={formData.longueur}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      name="largeur"
                      label="Largeur"
                      fullWidth
                      margin="normal"
                      value={formData.largeur}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      name="hauteur"
                      label="Hauteur"
                      fullWidth
                      margin="normal"
                      value={formData.hauteur}
                      onChange={handleChange}
                    />
                  </Grid>
                </>
              )}
                    


                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
{/* Image*/}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6">Image de l'Article</Typography>
                <Button variant="contained" component="label" sx={{ textTransform: "none" }}>
                  Choisir une image
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
                {formData.image_article && (
                  <Box mt={2}>
                    <img
                      src={URL.createObjectURL(formData.image_article)}
                      alt="Aperçu"
                      style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
            <Button
              onClick={createArticle}
              color="primary"
              variant="contained"
              style={{ marginTop: "20px", float: "right" }}
            >
              Créer
            </Button>
          </form>
        </Box>
      </Box>
    </>
  );
}
