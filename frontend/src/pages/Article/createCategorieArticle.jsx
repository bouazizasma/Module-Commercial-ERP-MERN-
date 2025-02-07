import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Grid, Box } from "@mui/material";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";

export default function CreateCategorieArticle() {
  const [formData, setFormData] = useState({
    codeFamille: "",
    designationFamille: "",
  });

  // Gère les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Crée une nouvelle famille d'articles
  const createCategorieArticle = async () => {
    try {
      await axios.post("http://localhost:5000/categorieArticle/newCA", formData);
      alert("Categorie Article créée avec succès !");
      setFormData({
        codeCategorie: "",
        designationCategorie: "",
      });
    } catch (error) {
      console.error("Erreur lors de la création du Categorie Article :", error.response ? error.response.data : error);
      alert("Une erreur s'est produite lors de la création du Categorie Article. Voir la console pour plus de détails.");
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
            overflow: "auto", // Activer le scroll pour le contenu
            maxHeight: "100vh", // Fixer une hauteur maximale pour le contenu principal
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
            <h2>Créer une Categorie des Articles</h2>
          </Box>

          <form>
            <Grid container spacing={3}>
              <Grid item xs={10}>
                <TextField
                  name="designationCategorie"
                  label="Designation de Categorie"
                  fullWidth
                  margin="normal"
                  value={formData.designationCategorie}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            <Button
              onClick={createCategorieArticle}
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