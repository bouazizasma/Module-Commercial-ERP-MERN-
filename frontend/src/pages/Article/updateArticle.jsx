import React, { useEffect, useState } from "react";
import axios from "axios";
import { Buffer } from "buffer";
import {
  TextField,
  Button,
  Grid,
  Box,
  MenuItem,
  Checkbox,
  FormControlLabel,
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
import { useParams, useNavigate } from "react-router-dom";

export default function UpdateArticle() {
  const { id } = useParams();
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
    libelleFamille: "",
    libeleCategorie: "",
    lib_fournisseur: "",
    tva_achat: "",
    tva: "",
    prixmin: "",
    prixmax: "",
    movement_article: "",
    Nombre_unite: "",
  });

  const [familles, setFamilles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/article/${id}`);
        const articleData = response.data;
        setFormData({
          ...articleData,
          libelleFamille: articleData.libelleFamille?._id || "", // Utilisez l'ID de la famille
          libeleCategorie: articleData.libeleCategorie?._id || "", // Utilisez l'ID de la catégorie
        });
      } catch (error) {
        console.error("Erreur lors de la récupération :", error);
      }
    };

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

    fetchArticle();
    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image_article: file, // Stocke le fichier sélectionné
      }));
    }
  };

  const updateArticle = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "image_article") {
          // Envoyer uniquement si c'est un nouveau fichier
          if (formData[key] instanceof File) {
            formDataToSend.append(key, formData[key]);
          }
        } else if (key === "libelleFamille" || key === "libeleCategorie" || key === "lib_fournisseur") {
          formDataToSend.append(key, formData[key].toString());
        } else if (
          key === "prix_achat_initiale" ||
          key === "prix_brut" ||
          key === "remise" ||
          key === "prix_net" ||
          key === "marge" ||
          key === "prixht" ||
          key === "prix_totale_concre" ||
          key === "prixmin" ||
          key === "prixmax" ||
          key === "tva_achat" ||
          key === "tva" ||
          key === "Nombre_unite" ||
          key === "longueur" ||
          key === "largeur" ||
          key === "hauteur"
        ) {
          // Convertir les champs numériques en nombres
          formDataToSend.append(key, formData[key] === "" ? null : Number(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
  
      await axios.put(`http://localhost:5000/article/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      alert("Article mis à jour avec succès !");
      navigate("/articles");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'article :", error.response ? error.response.data : error);
      alert("Une erreur s'est produite lors de la mise à jour de l'article.");
    }
  };
 {/*} const updateArticle = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        if (key === "libelleFamille" || key === "libeleCategorie" || key === "lib_fournisseur") {
          formDataToSend.append(key, formData[key].toString());
        } else if (key === "prix_achat_initiale" || key === "prix_brut" || key === "remise" || key === "prix_net" || key === "marge" || key === "prixht" || key === "prix_totale_concre" || key === "prixmin" || key === "prixmax" || key === "tva_achat" || key === "tva" || key === "Nombre_unite" || key === "longueur" || key === "largeur" || key === "hauteur") {
          // Convert numeric fields to numbers
          formDataToSend.append(key, formData[key] === "" ? null : Number(formData[key]));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
  
      await axios.put(`http://localhost:5000/article/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      alert("Article mis à jour avec succès !");
      navigate("/articles");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du article :", error.response ? error.response.data : error);
      alert("Une erreur s'est produite lors de la mise à jour du article.");
    }
  };
*/}
  return (
    <>
      <Navbar />
      <Box height={100} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto", maxHeight: "100vh" }}>
          <h2>Modifier un Article</h2>

          <form>
            {/* Informations Générales */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6">Informations Générales</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={3}>
                    <TextField
                      name="libelle"
                      label="Libellé"
                      fullWidth
                      value={formData.libelle}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      name="Nature"
                      label="Nature"
                      fullWidth
                      value={formData.Nature}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      name="type"
                      label="Type"
                      fullWidth
                      value={formData.type}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={3}>
                  <TextField
                  name="libelleFamille"
                  label="Famille de l'article"
                  fullWidth
                  select
                  value={formData.libelleFamille || ""}
                  onChange={handleChange}
                   >
              {familles.map((famille) => (
             <MenuItem key={famille._id} value={famille._id}> 
               {famille.designationFamille}
                </MenuItem>
  ))}
</TextField>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      name="libeleCategorie"
                      label="Catégorie de l'article"
                      fullWidth
                      select
                      value={formData.libeleCategorie || ""}
                      onChange={handleChange}
                      
                    >
                      {categories.map((categorie) => (
                        <MenuItem key={categorie._id} value={categorie._id}>
                          {categorie.designationCategorie}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      name="lib_fournisseur"
                      label="Fournisseur"
                      fullWidth
                      select
                      value={formData.lib_fournisseur}
                      onChange={handleChange}
                    >
                      {fournisseurs.map((fournisseur) => (
                        <MenuItem key={fournisseur._id} value={fournisseur._id}>
                          {fournisseur.raison_sociale}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
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

            {/* Prix et Remises */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Prix et Remises</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={3}>
                        <TextField
                          name="prix_brut"
                          label="Prix Brut"
                          fullWidth
                          value={formData.prix_brut}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          name="remise"
                          label="Remise %"
                          fullWidth
                          value={formData.remise}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          name="prix_net"
                          label="Prix NET"
                          fullWidth
                          value={formData.prix_net}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          name="marge"
                          label="Marge"
                          fullWidth
                          value={formData.marge}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          name="prixht"
                          label="Prix ht"
                          fullWidth
                          value={formData.prixht}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          name="prix_totale_concre"
                          label="Prix Totale Concré"
                          fullWidth
                          value={formData.prix_totale_concre}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          name="prixmin"
                          label="Prix Min"
                          fullWidth
                          value={formData.prixmin}
                          onChange={handleChange}
                        />
                      </Grid>
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

            {/* TVA */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6">TVA</Typography>
                <Grid container spacing={3}>
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

            {/* Détails */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Détails</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={3}>
                        <TextField
                          name="movement_article"
                          label="Movement Article"
                          fullWidth
                          value={formData.movement_article}
                          onChange={handleChange}
                        />
                      </Grid>
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

            {/* Image de l'article */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
              <Typography variant="body1" sx={{ mb: 1 }}>
                        <strong>Image:</strong>
                      </Typography>
                      {formData.image_article ? (
  // Cas 1 : Image existante (Buffer)
  typeof formData.image_article === "object" && !(formData.image_article instanceof File) ? (
    <img
      src={`data:image/jpeg;base64,${Buffer.from(formData.image_article).toString("base64")}`}
      style={{ width: "100px", height: "100px", borderRadius: "5px" }}
      alt="Article"
    />
  ) : (
    // Cas 2 : Nouvelle image (File)
    <img
      src={URL.createObjectURL(formData.image_article)}
      alt="Aperçu"
      style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "8px" }}
    />
  )
) : (
  <span>Pas d'image</span>
)}
                <Button variant="contained" component="label" sx={{ textTransform: "none" }}>
                  Choisir une image
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
                {formData.image_article instanceof File && (
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
              onClick={updateArticle}
              color="warning"
              variant="contained"
              style={{ marginTop: "20px", float: "right" }}
            >
              Mettre à jour
            </Button>
          </form>
        </Box>
      </Box>
    </>
  );
}