import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Grid,
  Box,
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

export default function UpdateClient() {
  const { id } = useParams(); // Get the ID from the URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    raison_sociale: "",
    matricule_fiscale: "",
    adresse: "",
    telephone: [],
    register_commerce: "",
    solde_initial: "",
    montant_rapprochement: "",
    code_rapprochement: "",
    rapBl: "",
    solde_initial_bl: "",
    montant_reglement_bl: "",
    taux_retenu: "",
  });

  // Fetch client by ID to populate the form
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/client/${id}`);
        setFormData(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération du client :", error);
      }
    };
    fetchClient();
  }, [id]);

  // Update client
  const updateClient = async () => {
    try {
      await axios.put(`http://localhost:5000/client/${id}`, formData);
      alert("Client mis à jour avec succès !");
      navigate("/client"); // Redirect to the Client list after update
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
      <Navbar />
      <Box height={100} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto", maxHeight: "100vh" }}>
          <h2>Modifier un Client</h2>

          <form>
            {/* Informations Générales */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ textAlign: "left" }}>
                  Informations Générales
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={3}>
                    <TextField
                      name="nom_prenom"
                      label="Nom&Prenom"
                      fullWidth
                      value={formData.nom_prenom}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      name="matricule_fiscale"
                      label="Matricule Fiscale"
                      fullWidth
                      value={formData.matricule_fiscale}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      name="adresse"
                      label="Adresse"
                      fullWidth
                      value={formData.adresse}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      name="telephone1"
                      label="Téléphone 1"
                      fullWidth
                      value={formData.telephone[0] || ""}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      name="telephone2"
                      label="Téléphone 2"
                      fullWidth
                      value={formData.telephone[1] || ""}
                      onChange={handleChange}
                    />
                  </Grid>
                 
                </Grid>
              </CardContent>
            </Card>

            {/* Informations Complémentaires */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Informations Complémentaires</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={3}>
                        <TextField
                          name="register_commerce"
                          label="Register Commerce"
                          fullWidth
                          value={formData.register_commerce}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          name="solde_initial"
                          label="Solde Initial"
                          fullWidth
                          value={formData.solde_initial}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          name="montant_rapprochement"
                          label="Montant Rapprochement"
                          fullWidth
                          value={formData.montant_rapprochement}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          name="code_rapprochement"
                          label="Code Rapprochement"
                          fullWidth
                          value={formData.code_rapprochement}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          name="rapBl"
                          label="Rapprochement BL"
                          fullWidth
                          value={formData.rapBl}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          name="solde_initial_bl"
                          label="Solde Initial BL"
                          fullWidth
                          value={formData.solde_initial_bl}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          name="montant_reglement_bl"
                          label="Montant Règlement BL"
                          fullWidth
                          value={formData.montant_reglement_bl}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          name="taux_retenu"
                          label="Taux Retenu"
                          fullWidth
                          value={formData.taux_retenu}
                          onChange={handleChange}
                        />
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>

            {/* Bouton de mise à jour */}
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
    </>
  );
}