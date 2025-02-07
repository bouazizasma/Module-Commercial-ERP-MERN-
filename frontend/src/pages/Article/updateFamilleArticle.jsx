import React, { useEffect, useState } from "react";
import axios from "axios";
import { TextField, Button, Grid } from "@mui/material";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";
import { useParams, useNavigate } from "react-router-dom"; // Add useNavigate
import Box from "@mui/material/Box";

export default function UpdateFamilleArticle() {
  const { id } = useParams(); // Get the ID from the URL
  const navigate = useNavigate(); // Add useNavigate for redirection
  const [formData, setFormData] = useState({
    designationFamille: "",
  });
  
  // Fetch  by ID to populate the form
  useEffect(() => {
    const fetchfamilleArticle = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/familleArticle/${id}`);
        setFormData(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération :", error);
      }
    };
    fetchfamilleArticle();
  }, [id]);

  // Update 
  const updatefamilleArticle = async () => {
    try {
      await axios.put(`http://localhost:5000/familleArticle/${id}`, formData);
      alert("famille Article mis à jour avec succès !");
      navigate("/FamilleArticle"); // Redirect to the Fournisseur list after update
    } catch (error) {
      console.error("Erreur lors de la mise à jour du famille d'Article :", error.response ? error.response.data : error);
      alert("Une erreur s'est produite lors de la mise à jour du famille d'Article.");
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <>
    {/* Navbar fixe */}
          <Navbar />
          <Box height={100} />
         < Box sx={{ display: "flex" }}>
        {/* Sidenav */}
        <Sidenav />
        {/* Contenu principal */}
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
          <h2>Modifier une famille d'Article</h2>
          <form>
            <Grid container spacing={4}>
            <Grid item xs={10}>
                            <TextField
                              name="designationFamille"
                              label="La Designation Famille "
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
              onClick={updatefamilleArticle}
              color="warning"
              variant="contained"
              style={{ marginTop: "20px", float: "right" }}
              sx={{
                padding: "10px 20px", // Ajustez la taille du bouton
                fontSize: "16px", // Ajustez la taille de la police du bouton
              }}
            >
              Mettre à jour
            </Button>
          </form>
        </Box>
      </Box>
      </Box>

    </>
  );
}