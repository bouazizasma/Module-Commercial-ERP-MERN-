import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Grid,
  Box,
  Card,
  CardContent,
  MenuItem,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,

} from "@mui/material";
import {
  Inventory,
  AttachMoney,
  LocalShipping,
  Category,
  Business,
  Image,
  Settings,
  Straight,
} from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";
import { useParams, useNavigate } from "react-router-dom";

export default function UpdateClient() {
  const { id } = useParams(); // Get the ID from the URL
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom_prenom : "",
    raison_sociale: "",
    matricule_fiscale: "",
    adresse: "",
    telephone: [],
    register_commerce: "",
    solde_initial: "",
    montant_rapprochement: "",
    code_rapprochement: "",
    codeSecteur : "",
    libelleSecteur: "",
    rapBl: "",
    register_commerce:"",
    solde_initial_bl: "",
    montant_reglement_bl: "",
    taux_retenu: "",
  });

      const [secteurs, setSecteurs] = useState([]);
  
  // Fetch client by ID to populate the form
  /*useEffect(() => {
    const fetchClient = async () => {
      try {

        const [ClientResponse, SecteursResponse] = await Promise.all([
          axios.get(`http://localhost:5000/client/${id}`),
          axios.get("http://localhost:5000/secteur/Secteurs"),

        ]);

        const clientData = ClientResponse.data;
        setFormData(clientData.data);
        setSecteurs(SecteursResponse.data);
      } catch (error) {
        console.error("Erreur lors de la récupération du client :", error);
      }
    };
    fetchClient();
  }, [id]);*/

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const [ClientResponse, SecteursResponse] = await Promise.all([
          axios.get(`http://localhost:5000/client/${id}`),
          axios.get("http://localhost:5000/secteur/Secteurs"),
        ]);
  
        // Vérifiez la structure de la réponse
        console.log("Réponse client:", ClientResponse.data);
        
        // Si la réponse est directement les données du client
        setFormData(ClientResponse.data.client || ClientResponse.data); // Adaptez selon la structure réelle
        
        setSecteurs(SecteursResponse.data);
      } catch (error) {
        console.error("Erreur lors de la récupération du client :", error);
      }
    };
    fetchClient();
  }, [id]);

  // Update client
 /* const updateClient = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });
      await axios.put(`http://localhost:5000/client/${id}`, formData);
      alert("Client mis à jour avec succès !");
      navigate("/client"); // Redirect to the Client list after update
    } catch (error) {
      console.error("Erreur lors de la mise à jour du client :", error.response ? error.response.data : error);
      alert("Une erreur s'est produite lors de la mise à jour du client.");
    }
  };

  */

  /*const updateClient = async () => {
    try {
      // Préparez les données à envoyer
      const dataToSend = {
        ...formData,
        telephone: formData.telephone.filter(tel => tel) // Filtre les téléphones vides
      };
  
      const response = await axios.put(`http://localhost:5000/client/${id}`, dataToSend);
      
      if (response.data) {
        alert("Client mis à jour avec succès !");
        navigate("/client");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          "Une erreur s'est produite lors de la mise à jour";
      console.error("Erreur détaillée:", error.response?.data || error);
      alert(errorMessage);
    }
  };
*/
 
const updateClient = async () => {
  try {
    // Préparez les données à envoyer
    const dataToSend = {
      ...formData,
      telephone: formData.telephone.filter(tel => tel) // Filtre les téléphones vides
    };

    // Supprimez les champs inutiles avant l'envoi
    delete dataToSend._id;
    delete dataToSend.__v;

    const response = await axios.put(`http://localhost:5000/client/${id}`, dataToSend);
    
    if (response.data) {
      alert("Client mis à jour avec succès !");
      navigate("/client");
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || "Une erreur s'est produite lors de la mise à jour";
    console.error("Erreur détaillée:", error.response?.data || error);
    alert(errorMessage);
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
    } 
    else if (name === "codeSecteur" || name === "libelleSecteur") {
      const selectedSecteur = secteurs.find(secteur => 
        name === "codeSecteur" 
          ? secteur.codeSecteur === value 
          : secteur.libelle === value
      );
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        codeSecteur: selectedSecteur?.codeSecteur || (name === "codeSecteur" ? value : prev.codeSecteur),
        libelleSecteur: selectedSecteur?.libelle || (name === "libelleSecteur" ? value : prev.libelleSecteur)
      }));
    } 
    
    else {
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
                    {/* Pour le code Secteur */}
              <Grid item xs={3}>
       <TextField
  fullWidth
  select
  label="Code Secteur"
  name="codeSecteur"
  value={formData.codeSecteur}
  onChange={handleChange}
  required
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <Category color="primary" />
      </InputAdornment>
    ),
  }}
>
  {secteurs.map((secteur) => (
    <MenuItem key={secteur._id} value={secteur.codeSecteur}>
      {secteur.codeSecteur}
    </MenuItem>
  ))}
        </TextField>
          </Grid>

      {/* Pour le libellé Secteur */}
      <Grid item xs={3}>
<TextField
  fullWidth
  select
  label="Libelle Secteur"
  name="libelleSecteur"
  value={formData.libelleSecteur}
  onChange={handleChange}
  required
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <Category color="primary" />
      </InputAdornment>
    ),
  }}
>
  {secteurs.map((secteur) => (
    <MenuItem key={secteur._id} value={secteur.libelle}>
      {secteur.libelle}
    </MenuItem>
  ))}
</TextField>
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