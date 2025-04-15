import React, { useState , useEffect} from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Grid,
  Box,
  Card,
  MenuItem,

  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";
import { useNavigate } from "react-router-dom";
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

export default function CreateClient() {
   const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom_prenom: "",
    matricule_fiscale: "",
    adresse: "",
    telephone: [],
    register_commerce: "",
    solde_initial: "",
    montant_rapprochement: "",
    code_rapprochement: "",
    rapBl: "",
    codeSecteur : "",
    libelleSecteur: "",
    solde_initial_bl: "",
    montant_reglement_bl: "",
    taux_retenu: "",
  });
    const [secteurs, setSecteurs] = useState([]);
  

    useEffect(() => {
      const fetchData = async () => {
        try {
          const [SecteursResponse] = await Promise.all([
            axios.get("http://localhost:5000/secteur/Secteurs"),
           
          ]);
          setSecteurs(SecteursResponse.data);
         
        } catch (error) {
          console.error("Erreur lors du chargement des données :", error);
        }
      };
      fetchData();
    }, []);

  const createClient = async () => {
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSend.append(key, formData[key]);
      });
      await axios.post("http://localhost:5000/client/newC", formData);
      alert("Client créé avec succès !");
      setFormData({
        nom_prenom: "",
        matricule_fiscale: "",
        adresse: "",
        telephone: [],
        register_commerce: "",
        solde_initial: "",
        montant_rapprochement: "",
        code_rapprochement: "",
        rapBl: "",
        codeSecteur : "",
        libelleSecteur: "",
        solde_initial_bl: "",
        montant_reglement_bl: "",
        taux_retenu: "",
      });
      navigate("/Client");

    } catch (error) {
      console.error("Erreur lors de la création du Client :", error.response ? error.response.data : error);
      alert("Une erreur s'est produite lors de la création du Client. Voir la console pour plus de détails.");
    }
  };

  /*const handleChange = (e) => {
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
  };*/

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
    // Gestion des changements pour codeSecteur et libelleSecteur
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
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <>
      <Navbar />
      <Box height={100} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: "auto", maxHeight: "100vh" }}>
          <h2>Créer un Client</h2>

          <form>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ textAlign: 'left' }}>Informations Générales</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={3}>
                    <TextField
                      name="nom_prenom"
                      label="Nom & Prenom"
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
                  <Grid item xs={3}>
                    <TextField
                      name="telephone2"
                      label="Téléphone 2"
                      fullWidth
                      value={formData.telephone2}
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
                          name="rapBl"
                          label="Rapprochement Bon Livraison"
                          fullWidth
                          value={formData.rapBl}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          name="solde_initial_bl"
                          label="Solde Initial Bon Livraison"
                          fullWidth
                          value={formData.solde_initial_bl}
                          onChange={handleChange}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          name="montant_reglement_bl"
                          label="Montant Reglement Bon Livraison"
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

            <Button
              onClick={createClient}
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