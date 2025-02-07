import React, { useEffect, useState } from "react";
import axios from "axios";
import { TextField, Button, Grid } from "@mui/material";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";
import { useParams, useNavigate } from "react-router-dom"; // Add useNavigate
import Box from "@mui/material/Box";

export default function UpdateClient() {
  const { id } = useParams(); // Get the ID from the URL
  const navigate = useNavigate(); // Add useNavigate for redirection
  const [formData, setFormData] = useState({
    raison_sociale: "",
        matricule_fiscale: "",
        adresse: "",
        telephone: [],
        fax: "",
        register_commerce: "",
        solde_initial: "",
        montant_rapprochement: "",
        code_rapprochement: "",
        rapBl: "",
        solde_initial_bl: "",
        montant_reglement_bl: "",
        taux_retenu: "",
  });
  
  // Fetch fournisseur by ID to populate the form
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/client/${id}`);
        setFormData(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération :", error);
      }
    };
    fetchClient();
  }, [id]);

  // Update fournisseur
  const updateClient = async () => {
    try {
      await axios.put(`http://localhost:5000/client/${id}`, formData);
      alert("Client mis à jour avec succès !");
      navigate("/client"); // Redirect to the Fournisseur list after update
    } catch (error) {
      console.error("Erreur lors de la mise à jour du client :", error.response ? error.response.data : error);
      alert("Une erreur s'est produite lors de la mise à jour du client.");
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "telephone1" || name === "telephone2") {
      setFormData((prev) => {
        const updatedTelephones = [...prev.telephone];
        if (name === "telephone1") {
          updatedTelephones[0] = value;
        } else {
          updatedTelephones[1] = value;
        }
        return { ...prev, telephone: updatedTelephones };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
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
          <h2>Modifier un Client</h2>
          <form>
            <Grid container spacing={3}>
              <Grid item xs={4}>
                <TextField
                  name="nom_prenom"
                  label="Nom Prenom"
                  fullWidth
                  margin="normal"
                  value={formData.nom_prenom}
                  onChange={handleChange}
                />
              </Grid>
            <Grid item xs={4}>
                            <TextField
                              name="matricule_fiscale"
                              label="Matricule Fiscale  "
                              fullWidth
                              margin="normal"
                              value={formData.matricule_fiscale}
                              onChange={handleChange}
                            />
                          </Grid>
              <Grid item xs={4}>
                <TextField
                  name="adresse"
                  label="Adresse"
                  fullWidth
                  margin="normal"
                  value={formData.adresse}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="telephone1"
                  label="Téléphone 1"
                  fullWidth
                  margin="normal"
                  value={formData.telephone[0] || ""}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="telephone2"
                  label="Téléphone 2"
                  fullWidth
                  margin="normal"
                  value={formData.telephone[1] || ""}
                  onChange={handleChange}
                />
              </Grid>
            
              <Grid item xs={4}>
                              <TextField
                                name="register_commerce"
                                label="Register Commerce"
                                fullWidth
                                margin="normal"
                                value={formData.register_commerce}
                                onChange={handleChange}
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <TextField
                                name="solde_initial"
                                label="Solde Initial"
                                fullWidth
                                margin="normal"
                                value={formData.solde_initial}
                                onChange={handleChange}
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <TextField
                                name="montant_rapprochement"
                                label="Montant Rapprochement"
                                fullWidth
                                margin="normal"
                                value={formData.montant_rapprochement}
                                onChange={handleChange}
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <TextField
                                name="code_rapprochement"
                                label="Code Rapprochement"
                                fullWidth
                                margin="normal"
                                value={formData.code_rapprochement}
                                onChange={handleChange}
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <TextField
                                name="rapBl"
                                label="Rapprochement Bon Livraison"
                                fullWidth
                                margin="normal"
                                value={formData.rapBl}
                                onChange={handleChange}
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <TextField
                                name="rapBl"
                                label="Rapprochement Bon Livraison"
                                fullWidth
                                margin="normal"
                                value={formData.rapBl}
                                onChange={handleChange}
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <TextField
                                name="solde_initial_bl"
                                label="Solde Initial Bon Livraison"
                                fullWidth
                                margin="normal"
                                value={formData.solde_initial_bl}
                                onChange={handleChange}
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <TextField
                                name="montant_reglement_bl"
                                label="Montant Reglement Bon Livraison"
                                fullWidth
                                margin="normal"
                                value={formData.montant_reglement_bl}
                                onChange={handleChange}
                              />
                            </Grid>
                            <Grid item xs={4}>
                              <TextField
                                name="taux_retenu"
                                label="Taux Retenu"
                                fullWidth
                                margin="normal"
                                value={formData.taux_retenu}
                                onChange={handleChange}
                              />
                            </Grid>

            </Grid>
            <Button
              onClick={updateClient}
              color="warning"
              variant="contained"
              style={{ marginTop: "20px", float: "right" }}
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