import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  TextField,
  Button,
  Grid,
  Box,
  Card,
  MenuItem,
  Checkbox,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputAdornment,
  useMediaQuery,
  useTheme,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  Phone as PhoneIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon,
  AccountBalance as AccountBalanceIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import Navbar from "../../navbar/Navbar";
import Sidenav from "../../navbar/Sidenav";
import { useParams, useNavigate } from "react-router-dom";

export default function UpdateClient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    nom_prenom: "",
    matricule_fiscale: "",
    adresse: "",
    telephone: ["", ""],
    register_commerce: "",
    solde_initial: "",
    montant_rapprochement: "",
    code_rapprochement: "",
    rapBl: "",
    codeSecteur: "",
    libelleSecteur: "",
    solde_initial_bl: "",
    montant_reglement_bl: "",
    taux_retenu: "",
  });

  const [secteurs, setSecteurs] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [banques, setBanques] = useState([]);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const [ClientResponse, SecteursResponse, BanquesResponse] = await Promise.all([
          axios.get(`http://localhost:5000/client/${id}`),
          axios.get("http://localhost:5000/secteur/Secteurs"),
          axios.get("http://localhost:5000/banqueClient/AllBanques")
        ]);

        const clientData = ClientResponse.data.client || ClientResponse.data;
        setFormData({
          ...clientData,
          telephone: clientData.telephone || ["", ""]
        });
        setBankAccounts(clientData.bankAccounts || []);
        setSecteurs(SecteursResponse.data);
        setBanques(BanquesResponse.data);
      } catch (error) {
        console.error("Erreur lors de la récupération du client :", error);
      }
    };
    fetchClient();
  }, [id]);

  const handleBankAccountChange = (index, field, value) => {
    const updatedAccounts = [...bankAccounts];
    updatedAccounts[index][field] = value;
    
    if (field === 'isPrimary' && value) {
      updatedAccounts.forEach((acc, i) => {
        if (i !== index) acc.isPrimary = false;
      });
    }
    
    setBankAccounts(updatedAccounts);
  };

  const addBankAccount = () => {
    setBankAccounts([...bankAccounts, {
      banque: '',
      RIB: '',
      adresseBanque: '',
      isPrimary: bankAccounts.length === 0
    }]);
  };

  const removeBankAccount = (index) => {
    const updatedAccounts = [...bankAccounts];
    updatedAccounts.splice(index, 1);
    setBankAccounts(updatedAccounts);
  };

  const updateClient = async () => {
    try {
      const dataToSend = {
        ...formData,
        bankAccounts: bankAccounts.filter(acc => acc.banque && acc.RIB),
        telephone: formData.telephone.filter(tel => tel)
      };

      delete dataToSend._id;
      delete dataToSend.__v;

      await axios.put(`http://localhost:5000/client/${id}`, dataToSend);
      alert("Client mis à jour avec succès !");
      navigate("/client");
    } catch (error) {
      console.error("Erreur:", error);
      alert("Erreur lors de la mise à jour");
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
    } else if (name === "codeSecteur" || name === "libelleSecteur") {
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
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  return (
    <>
      <Navbar />
      <Box height={70} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ 
          flexGrow: 1, 
          p: isMobile ? 2 : 3,
          overflow: "auto",
          maxHeight: "calc(100vh - 70px)"
        }}>
          <Typography variant="h5" sx={{ 
            mb: 3, 
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <EditIcon color="primary" />
            Modifier Client
          </Typography>

          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ 
                mb: 2, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <PersonIcon fontSize="small" color="primary" />
                Informations Générales
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="nom_prenom"
                    label="Nom & Prénom"
                    fullWidth
                    size="small"
                    value={formData.nom_prenom}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="matricule_fiscale"
                    label="Matricule Fiscale"
                    fullWidth
                    size="small"
                    value={formData.matricule_fiscale}
                    onChange={handleChange}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="adresse"
                    label="Adresse"
                    fullWidth
                    size="small"
                    value={formData.adresse}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="telephone1"
                    label="Téléphone 1"
                    fullWidth
                    size="small"
                    value={formData.telephone[0] || ''}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    name="telephone2"
                    label="Téléphone 2"
                    fullWidth
                    size="small"
                    value={formData.telephone[1] || ''}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Code Secteur"
                    name="codeSecteur"
                    value={formData.codeSecteur}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon fontSize="small" color="action" />
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
                
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Libellé Secteur"
                    name="libelleSecteur"
                    value={formData.libelleSecteur}
                    onChange={handleChange}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CategoryIcon fontSize="small" color="action" />
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

          {/* INFORMATIONS COMPLEMENTAIRES */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Accordion defaultExpanded={!isMobile} sx={{ boxShadow: 'none' }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Informations Complémentaires
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={2}>
                    {[
                      { name: "register_commerce", label: "Register Commerce" },
                      { name: "solde_initial", label: "Solde Initial" },
                      { name: "montant_rapprochement", label: "Montant Rapprochement" },
                      { name: "code_rapprochement", label: "Code Rapprochement" },
                      { name: "rapBl", label: "Rapprochement BL" },
                      { name: "solde_initial_bl", label: "Solde Initial BL" },
                      { name: "montant_reglement_bl", label: "Montant Règlement BL" },
                      { name: "taux_retenu", label: "Taux Retenu" }
                    ].map((field, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <TextField
                          name={field.name}
                          label={field.label}
                          fullWidth
                          size="small"
                          value={formData[field.name]}
                          onChange={handleChange}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </CardContent>
          </Card>

          {/* COMPTES BANCAIRES */}
          <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" sx={{ 
                mb: 2, 
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <AccountBalanceIcon fontSize="small" color="primary" />
                Comptes Bancaires
              </Typography>
              
              {bankAccounts.map((account, index) => (
                <Card key={index} variant="outlined" sx={{ 
                  mb: 2, 
                  borderRadius: 2,
                  borderColor: account.isPrimary ? 'primary.main' : 'divider'
                }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          select
                          fullWidth
                          size="small"
                          label="Banque"
                          value={account.banque}
                          onChange={(e) => handleBankAccountChange(index, 'banque', e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <BusinessIcon fontSize="small" color="action" />
                              </InputAdornment>
                            ),
                          }}
                        >
                          {banques.map((banque) => (
                            <MenuItem key={banque._id} value={banque._id}>
                              {banque.libelle} ({banque.code_banque})
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="RIB"
                          value={account.RIB}
                          onChange={(e) => handleBankAccountChange(index, 'RIB', e.target.value)}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={2}>
                        <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                          <Tooltip title="Compte principal">
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Checkbox
                                checked={account.isPrimary}
                                onChange={(e) => handleBankAccountChange(index, 'isPrimary', e.target.checked)}
                                color="primary"
                                size="small"
                              />
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Principal
                              </Typography>
                            </Box>
                          </Tooltip>
                        </Box>
                      </Grid>
                      
                      <Grid item xs={12} sm={8}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Adresse Banque"
                          value={account.adresseBanque}
                          onChange={(e) => handleBankAccountChange(index, 'adresseBanque', e.target.value)}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="Supprimer ce compte">
                          <IconButton
                            onClick={() => removeBankAccount(index)}
                            size="small"
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              ))}
              
              <Button 
                variant="outlined" 
                startIcon={<AddIcon />}
                onClick={addBankAccount}
                size="small"
                sx={{ mt: 1 }}
              >
                Ajouter un compte
              </Button>
            </CardContent>
          </Card>

          {/* BOUTONS D'ACTION */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => navigate("/client")}
              size={isMobile ? "small" : "medium"}
              sx={{ borderRadius: '8px' }}
            >
              Annuler
            </Button>
            <Button
              onClick={updateClient}
              color="primary"
              variant="contained"
              startIcon={<CheckIcon />}
              size={isMobile ? "small" : "medium"}
              sx={{ borderRadius: '8px' }}
            >
              Mettre à jour
            </Button>
          </Box>
        </Box>
      </Box>
    </>
  );
}