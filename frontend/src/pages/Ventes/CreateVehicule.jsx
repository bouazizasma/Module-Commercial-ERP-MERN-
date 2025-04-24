import React, { useState } from "react";
import axios from "axios";
import { TextField, Button, Grid, Box } from "@mui/material";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";
import { useNavigate } from "react-router-dom";

import { Navigate } from "react-router-dom";

export default function CreateVehicule() {
      const navigate = useNavigate();
  const [formData, setFormData] = useState({
    code: "",
    codeVehicule: "",
    libelle: "",
    matricule:"",
  });

  // Gère les changements dans les champs du formulaire
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Crée une nouvelle Vehicule
  const createVehicule = async () => {
    try {
      await axios.post("http://localhost:5000/vehicule/newVehicule", formData);
      alert("Vehicule créé avec succès !");
      setFormData({
        code: "",
        codeVehicule: "",
        libelle: "",
        matricule: "",
       
      });
      navigate("/Vehicule")
    } catch (error) {
      console.error("Erreur lors de la création du Vehicule :", error.response ? error.response.data : error);
      alert("Une erreur s'est produite lors de la création du Vehicule. Voir la console pour plus de détails.");
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
            <h2>Créer une Vehicule</h2>
          </Box>

          <form>
            <Grid container spacing={3}>
             
              <Grid item xs={5}>
                <TextField
                  name="codeVehicule"
                  label="Code Vehicule"
                  fullWidth
                  margin="normal"
                  value={formData.codeVehicule}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  name="libelle"
                  label="Libelle"
                  fullWidth
                  margin="normal"
                  value={formData.libelle}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  name="matricule"
                  label="Matricule"
                  fullWidth
                  margin="normal"
                  value={formData.matricule}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            <Button
              onClick={createVehicule}
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