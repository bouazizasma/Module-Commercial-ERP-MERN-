import React, { useEffect, useState } from "react";
import axios from "axios";
import Box from "@mui/material/Box";

import { TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Grid } from "@mui/material";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav"; 
export default function CreateFournisseur() {
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

  // Fetch fournisseurs from the backend
  const fetchFournisseurs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/fournisseur/fournisseurs");
      setFournisseurs(response.data);
    } catch (error) {
      console.error("Error fetching fournisseurs:", error);
    }
  };

  // Create fournisseur
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
    } catch (error) {
       console.error("Erreur lors de la création du fournisseur :", error.response ? error.response.data : error);
       alert("Une erreur s'est produite lors de la création du fournisseur. Voir la console pour plus de détails.");
    }
 };
 

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Si le champ est telephone1 ou telephone2, mettez à jour le tableau 'telephone'
  if (name === "telephone1" || name === "telephone2") {
    setFormData((prev) => {
      const updatedTelephones = [...prev.telephone];
      if (name === "telephone1") {
        updatedTelephones[0] = value;  // Ajoutez ou mettez à jour le premier téléphone
      } else {
        updatedTelephones[1] = value;  // Ajoutez ou mettez à jour le second téléphone
      }

      return { ...prev, telephone: updatedTelephones };
    });
  } else {
    setFormData((prev) => ({ ...prev, [name]: value }));
  }
};

  // Fetch fournisseurs on component mount
  useEffect(() => {
    fetchFournisseurs();
  }, []);

  return (
    <>
    <Navbar />
    <Box height={100} />
      <Box sx={{ display: "flex" }}>
        {/* Sidenav */}
        <Sidenav />

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
            <h1> Créer un Fournisseur</h1>

          </Box>
          <form>
            <Grid container spacing={3}>
              {/* Ligne 1 */}
             {/*} <Grid item xs={4}>
                <TextField
                  name="code"
                  label="Code"
                  fullWidth
                  margin="normal"
                  value={formData.code}
                  onChange={handleChange}
                />
              </Grid> */}
              <Grid item xs={4}>
                <TextField
                  name="raison_sociale"
                  label="Raison Sociale"
                  fullWidth
                  margin="normal"
                  value={formData.raison_sociale}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="matricule_fiscale"
                  label="Matricule Fiscale"
                  fullWidth
                  margin="normal"
                  value={formData.matricule_fiscale}
                  onChange={handleChange}
                />
              </Grid>

              {/* Ligne 2 */}
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
                  value={formData.telephone1}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="telephone2"
                  label="Téléphone 2"
                  fullWidth
                  margin="normal"
                  value={formData.telephone2}
                  onChange={handleChange}
                />
              </Grid>

              {/* Ligne 3 */}
              <Grid item xs={4}>
                <TextField
                  name="fax"
                  label="Fax"
                  fullWidth
                  margin="normal"
                  value={formData.fax}
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

              {/* Ligne 4 */}
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
                  name="rapebe"
                  label="RAPEBE"
                  fullWidth
                  margin="normal"
                  value={formData.rapebe}
                  onChange={handleChange}
                />
              </Grid>
              {/* Ligne 5 */}
              <Grid item xs={4}>
                <TextField
                  name="solde_initial_ebe"
                  label="Solde Initial ebe"
                  fullWidth
                  margin="normal"
                  value={formData.solde_initial_ebe}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="montant_paie_ebe"
                  label="Montant paie ebe"
                  fullWidth
                  margin="normal"
                  value={formData.montant_paie_ebe}
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
              onClick={createFournisseur}
              color="success"
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
