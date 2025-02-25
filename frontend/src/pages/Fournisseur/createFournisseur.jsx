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
import { useNavigate } from "react-router-dom";

export default function CreateFournisseur() {
    const navigate = useNavigate();
  
  const [fournisseurs, setFournisseurs] = useState([]);
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
    rapebe: "",
    solde_initial_ebe: "",
    montant_paie_ebe: "",
    taux_retenu: "",
  });

  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/fournisseur/fournisseurs");
      setFournisseurs(response.data);
    } catch (error) {
      console.error("Error fetching fournisseurs:", error);
    }
  };

  const createFournisseur = async () => {
    try {
      await axios.post("http://localhost:5000/fournisseur/newF", formData);
      alert("Fournisseur créé avec succès !");
      fetchFournisseurs();
      setFormData({
        raison_sociale: "",
        matricule_fiscale: "",
        adresse: "",
        telephone: [],
        fax: "",
        register_commerce: "",
        solde_initial: "",
        montant_rapprochement: "",
        code_rapprochement: "",
        rapebe: "",
        solde_initial_ebe: "",
        montant_paie_ebe: "",
        taux_retenu: "",
      });
      navigate("/Fournisseur");
    } catch (error) {
      console.error("Erreur lors de la création du fournisseur :", error.response ? error.response.data : error);
      alert("Une erreur s'est produite lors de la création du fournisseur. Voir la console pour plus de détails.");
    }
  };

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

  useEffect(() => {
    fetchFournisseurs();
  }, []);

  return (
    <>
      <Navbar />
      <Box height={100} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto", maxHeight: "100vh" }}>
          <h2>Créer un Fournisseur</h2>

          <form>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ textAlign: 'left' }}>Informations Générales</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={3}>
                    <TextField
                      name="raison_sociale"
                      label="Raison Sociale"
                      fullWidth
                      value={formData.raison_sociale}
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
                      value={formData.telephone1}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      name="telephone2"
                      label="Téléphone 2"
                      fullWidth
                      value={formData.telephone2}
                      onChange={handleChange}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      name="fax"
                      label="Fax"
                      fullWidth
                      value={formData.fax}
                      onChange={handleChange}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

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
                          name="rapebe"
                          label="RAPEBE"
                          fullWidth
                          value={formData.rapebe}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          name="solde_initial_ebe"
                          label="Solde Initial ebe"
                          fullWidth
                          value={formData.solde_initial_ebe}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          name="montant_paie_ebe"
                          label="Montant paie ebe"
                          fullWidth
                          value={formData.montant_paie_ebe}
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

            <Button
              onClick={createFournisseur}
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