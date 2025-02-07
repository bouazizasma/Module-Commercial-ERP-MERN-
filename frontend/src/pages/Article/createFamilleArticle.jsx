import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Grid, Box } from "@mui/material";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";
import { useNavigate } from "react-router-dom"; // Add useNavigate

export default function CreateFamilleArticle() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
  const createFamilleArticle = async () => {
    try {
      await axios.post("http://localhost:5000/familleArticle/NewFA", formData);
      alert("Famille Article créée avec succès !");
      setFormData({
        codeFamille: "",
        designationFamille: "",
      });
      navigate("/FamilleArticle");
    } catch (error) {
      console.error("Erreur lors de la création du Famille Article :", error.response ? error.response.data : error);
      alert("Une erreur s'est produite lors de la création du Famille Article. Voir la console pour plus de détails.");
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
            <h2>Créer une Famille des Articles</h2>
          </Box>

          <form>
            <Grid container spacing={4}> {/* Augmentez l'espacement entre les champs */}
              <Grid item xs={10}> {/* Augmentez la largeur des champs */}
                <TextField
                  name="designationFamille"
                  label="Designation de famille"
                  fullWidth
                  margin="normal"
                  value={formData.designationFamille}
                  onChange={handleChange}
                  size="medium" // Utilisez "medium" pour des champs plus grands
                  sx={{
                    "& .MuiInputBase-root": {
                      height: "56px", // Ajustez la hauteur du champ
                    },
                  }}
                />
              </Grid>
            </Grid>
            <Button
              onClick={createFamilleArticle}
              color="primary"
              variant="contained"
              style={{ marginTop: "20px", float: "right" }}
              sx={{
                padding: "10px 20px", // Ajustez la taille du bouton
                fontSize: "16px", // Ajustez la taille de la police du bouton
              }}
            >
              Créer
            </Button>
          </form>
        </Box>
      </Box>
    </>
  );
}