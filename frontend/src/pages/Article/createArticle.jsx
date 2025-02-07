import React, { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button,Input, Grid, Box, MenuItem, Checkbox, FormControlLabel, TextareaAutosize } from "@mui/material";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";
import { useNavigate } from "react-router-dom";

export default function CreateArticle() {
    const [loggedInUser, setLoggedInUser] = useState('');
  
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    libelle: "",
    libelleFamille: "",
    libeleCategorie: "",
    Nombre_unite: "",
    tva: "",
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
    series: [], 
    lib_fournisseur: "",
    Nature: "",
    image_article: "",
    prixmin: "",
    prixmax: "",
    user_Connectée: {loggedInUser}, 
    action_user_connecté: "", 
    date_modif: new Date().toISOString().split("T")[0], // Date actuelle
    prix_achat_initiale: "",
    tva_achat: "",
    dimension_article: false, // Checkbox pour les dimensions
    longueur: "",
    largeur: "",
    hauteur: "",
    movement_article: "",
  });

  const [familles, setFamilles] = useState([]); // Liste des familles d'articles
  const [categories, setCategories] = useState([]); // Liste des catégories d'articles
  const [fournisseurs, setFournisseurs] = useState([]); // Liste des fournisseurs

  // Charger les données pour les listes déroulantes
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

  // Gère les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
        }
    )   
);
  };
  const handleFileChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      image_article: e.target.files[0],
    }));
  };

 //create article 
 const createArticle = async () => {
  try {
    const formDataToSend = new FormData();

    // Ajouter les champs au FormData
    Object.keys(formData).forEach((key) => {
      if (key === "image_article" && formData[key]) {
        formDataToSend.append(key, formData[key]); // Ajouter l'image
      } else {
        formDataToSend.append(key, formData[key]); // Ajouter les autres champs
      }
    });

    //const user_Connectée = 
    // Envoyer la requête avec FormData
    const response = await axios.post("http://localhost:5000/article/newA", formDataToSend, {
      headers: {
        "Content-Type": "multipart/form-data", // Indiquer que c'est un formulaire multipart
      },
    });

    alert("Article créé avec succès !");
    navigate("/Articles");
  } catch (error) {
    console.error("Erreur lors de la création de l'article :", error.response ? error.response.data : error);
    alert("Une erreur s'est produite lors de la création de l'article. Voir la console pour plus de détails.");
  }
};

  return (
    <>
      {/* Barre latérale */}
      <Navbar />

      <Box height={100} />
      <Box sx={{ display: "flex" }}>
        {/* Sidenav */}
        <Sidenav />

        {/* Contenu */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            overflow: "auto",
            maxHeight: "100vh",
          }}
        >
          <Box
            sx={{
              position: "sticky",
              top: 0,
              zIndex: 2,
              backgroundColor: "#fff",
              paddingBottom: "10px",
              borderBottom: "1px solid #ddd",
            }}
          >
            <h2>Créer un Article</h2>
          </Box>

          <form>
            <Grid container spacing={3}>
             
             
              {/* Libelle Article */}
              <Grid item xs={4}>
                <TextField
                  name="libelle"
                  label="Libellé"
                  fullWidth
                  margin="normal"
                  value={formData.libelle}
                  onChange={handleChange}
                />
              </Grid>
              {/* Nature*/}
              <Grid item xs={4}>
                <TextField
                  name="Nature"
                  label="Nature"
                  fullWidth
                  margin="normal"
                  value={formData.Nature}
                  onChange={handleChange}
                />
              </Grid>
              {/* Type*/}
              <Grid item xs={4}>
                <TextField
                  name="type"
                  label="Type"
                  fullWidth
                  margin="normal"
                  value={formData.type}
                  onChange={handleChange}
                />
              </Grid>
                {/* prix_brut*/}
                <Grid item xs={4}>
                <TextField
                  name="prix_brut"
                  label="Prix Brut"
                  fullWidth
                  margin="normal"
                  value={formData.prix_brut}
                  onChange={handleChange}
                />
              </Grid>
               {/* remise*/}
               <Grid item xs={4}>
                <TextField
                  name="remise"
                  label="Remise %"
                  fullWidth
                  margin="normal"
                  value={formData.remise}
                  onChange={handleChange}
                />
              </Grid>
                {/* prix_net*/}
                <Grid item xs={4}>
                <TextField
                  name="prix_net"
                  label="Prix NET"
                  fullWidth
                  margin="normal"
                  value={formData.prix_net}
                  onChange={handleChange}
                />
              </Grid>
              {/* marge*/}
              <Grid item xs={4}>
                <TextField
                  name="marge"
                  label="Marge"
                  fullWidth
                  margin="normal"
                  value={formData.marge}
                  onChange={handleChange}
                />
              </Grid>
               {/* prixht*/}
               <Grid item xs={4}>
                <TextField
                  name="prixht"
                  label="Prix ht"
                  fullWidth
                  margin="normal"
                  value={formData.prixht}
                  onChange={handleChange}
                />
              </Grid>
               {/* prix_totale_concré*/}
               <Grid item xs={4}>
                <TextField
                  name="prix_totale_concre"
                  label="Prix Totale Concré"
                  fullWidth
                  margin="normal"
                  value={formData.prix_totale_concre}
                  onChange={handleChange}
                />
              </Grid>
                {/* gestion_configuration*/}
                <Grid item xs={4}>
                <TextField
                  name="gestion_configuration"
                  label="gestion_configuration "
                  fullWidth
                  margin="normal"
                  value={formData.gestion_configuration}
                  onChange={handleChange}
                />
              </Grid>
              {/* Liste déroulante pour Famille */}
              <Grid item xs={4}>
                <TextField
                  name="libelleFamille"
                  label="Famille de l'article"
                  fullWidth
                  margin="normal"
                  value={formData.libelleFamille}
                  onChange={handleChange}
                  select
                >
                  {familles.map((famille) => (
                    <MenuItem key={famille._id} value={famille._id}>
                      {famille.designationFamille}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Liste déroulante pour Catégorie */}
              <Grid item xs={4}>
                <TextField
                  name="libeleCategorie"
                  label="Catégorie de l'article"
                  fullWidth
                  margin="normal"
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
              <Grid item xs={4}>
                <TextField
                  name="lib_fournisseur"
                  label="Fournisseur"
                  fullWidth
                  margin="normal"
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
              <Grid item xs={4}>
                <TextField
                  name="Nombre_unite"
                  label="Nombre d'unités"
                  fullWidth
                  margin="normal"
                  value={formData.Nombre_unite}
                  onChange={handleChange}
                  type="number"
                />
              </Grid>
            {/* prixmin */}
                <Grid item xs={4}>
                <TextField
                  name="prixmin"
                  label="Prix Min"
                  fullWidth
                  margin="normal"
                  value={formData.prixmin}
                  onChange={handleChange}
                />
              </Grid>
              {/* prixmax */}
              <Grid item xs={4}>
                <TextField
                  name="prixmax"
                  label="Prix Max"
                  fullWidth
                  margin="normal"
                  value={formData.prixmax}
                  onChange={handleChange}
                />
              </Grid>
                {/* tva_achat */}
                <Grid item xs={4}>
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
              <Grid item xs={4}>
                <TextField
                  name="tva"
                  label="TVA"
                  fullWidth
                  margin="normal"
                  value={formData.tva}
                  onChange={handleChange}
                />
              </Grid>
               {/* configuration*/}
             <Grid item xs={4}>
                <TextareaAutosize
                  name="configuration"
                  placeholder="Configuration"
                  minRows={5}
                  style={{ width: "100%" }}
                  value={formData.configuration}
                  onChange={handleChange}
                />
              </Grid>

               {/* movement_article */}
               <Grid item xs={4}>
                <TextField
                  name="movement_article"
                  label="Movement Article"
                  fullWidth
                  margin="normal"
                  value={formData.movement_article}
                  onChange={handleChange}
                />
              </Grid>
                  {/* Checkbox pour activer la série */}
              <Grid item xs={12}>
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
              <Grid item xs={12}>
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
                  <Grid item xs={4}>
                    <TextField
                      name="longueur"
                      label="Longueur"
                      fullWidth
                      margin="normal"
                      value={formData.longueur}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      name="largeur"
                      label="Largeur"
                      fullWidth
                      margin="normal"
                      value={formData.largeur}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={4}>
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

              
              {/* Image */}
              <Grid item xs={4}>
             <Button
                  variant="contained"
                component="label"
                color="primary"
                 sx={{ textTransform: "none" }}
                >
              Choisir une image
             <input
              type="file"
              hidden
             accept="image/*"
            onChange={handleFileChange}
            />
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
            </Grid>



              {/* Bouton de soumission */}
              <Grid item xs={12}>
                <Button
                  onClick={createArticle}
                  color="primary"
                  variant="contained"
                  style={{ marginTop: "20px", float: "right" }}
                >
                  Créer
                </Button>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Box>
    </>
  );
}