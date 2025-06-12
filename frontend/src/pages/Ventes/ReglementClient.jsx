import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Stack,
  Autocomplete,
  Divider,
  IconButton,
  useTheme,
  Snackbar,
  Alert,
  FormGroup,
  Fade,
  Zoom,
  Slide,
  Avatar,
  Chip,
  LinearProgress,
  Tooltip,
  Badge
} from "@mui/material";
import {
  Payment,
  AccountBalance,
  Receipt,
  MonetizationOn,
  CheckCircle,
  Delete,
  Business,
  AttachMoney,
  CreditCard,
  AccountBalanceWallet,
  TrendingUp,
  Schedule,
  CheckCircleOutline,
  ErrorOutline,
  WarningAmber,
  Add,
  Save,
  Refresh,
  FilterList,
  Search
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function ReglementClient() {
  const theme = useTheme();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [factures, setFactures] = useState([]);
  const [selectedFactures, setSelectedFactures] = useState([]);
  const [paiementsEnAttente, setPaiementsEnAttente] = useState([]);
  const [totalMontant, setTotalMontant] = useState(0);
  const [montantRestant, setMontantRestant] = useState(0);
  const [bonsLivraison, setBonsLivraison] = useState([]);
  const [selectedBonsLivraison, setSelectedBonsLivraison] = useState([]);
  const [dateReglement, setDateReglement] = useState(new Date().toISOString().slice(0, 10));
  const [modePaiement, setModePaiement] = useState("ESPECE");
  const [banques, setBanques] = useState([]);
  const [selectedBanque, setSelectedBanque] = useState(null);
  const [comptesBancaires, setComptesBancaires] = useState([]);
  const [selectedCompte, setSelectedCompte] = useState(null);
  const [numeroCheque, setNumeroCheque] = useState("");
  const [dateEcheance, setDateEcheance] = useState("");
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [caisses, setCaisses] = useState([]);
  const [selectedCaisse, setSelectedCaisse] = useState("");
  const [paiementDetails, setPaiementDetails] = useState({});
  const [historiquePaiements, setHistoriquePaiements] = useState([]);
  const [documentType, setDocumentType] = useState("factures"); // "factures" ou "bonsLivraison"
  const navigate = useNavigate();

  useEffect(() => {
    fetchClients();
    fetchCaisses();
    fetchBanques();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchDocumentsClient();
      fetchBanquesClient();
      fetchHistoriquePaiements();
    }
  }, [selectedClient]);

  useEffect(() => {
    if (selectedBanque) {
      fetchComptesBancaires();
    }
  }, [selectedBanque]);

  useEffect(() => {
    calculateAmounts();
  }, [selectedFactures, selectedBonsLivraison, paiementsEnAttente]);

  const calculateAmounts = () => {
    // Réinitialisation des totaux
    let total = 0;
    let totalPaye = 0;
    let montantRestantTotal = 0;
  
    // Calcul pour les factures sélectionnées
    if (selectedFactures.length > 0) {
      selectedFactures.forEach(factureId => {
      const facture = factures.find(f => f._id === factureId);
      if (facture) {
          const montantTTC = parseFloat(facture.total_ttc) || 0;
          const montantPaye = parseFloat(facture.montantPaye) || 0;
          
          total += montantTTC;
          totalPaye += montantPaye;
          montantRestantTotal += Math.max(montantTTC - montantPaye, 0);
        }
      });
    }
    // Calcul pour les bons de livraison sélectionnés
    else if (selectedBonsLivraison.length > 0) {
      selectedBonsLivraison.forEach(bonId => {
        const bon = bonsLivraison.find(b => b._id === bonId);
        if (bon && !bon.estFacture) {
          const montantTTC = parseFloat(bon.total_ttc) || 0;
          const montantPaye = parseFloat(bon.montantPaye) || 0;
          
          total += montantTTC;
          totalPaye += montantPaye;
          montantRestantTotal += Math.max(montantTTC - montantPaye, 0);
        }
      });
    }
  
    // Soustraire les paiements en attente
    const montantPaiementsEnAttente = paiementsEnAttente.reduce(
      (sum, paiement) => sum + parseFloat(paiement.montantChiffres || 0), 
      0
    );

    // Limiter à 3 décimales pour éviter les erreurs d'arrondi
    total = parseFloat(total.toFixed(3));
    montantRestantTotal = parseFloat(Math.max(montantRestantTotal - montantPaiementsEnAttente, 0).toFixed(3));
    const montantPayeTotal = parseFloat((total - montantRestantTotal).toFixed(3));

    setTotalMontant(total);
    setMontantRestant(montantRestantTotal);
  };

const fetchClients = async () => {
    try {
      const response = await axios.get("http://localhost:5000/client/clients");
      setClients(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de la récupération des clients",
        severity: "error"
      });
    }
  };

  const fetchCaisses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/caisse/AllCaisses");
      setCaisses(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des caisses:", error);
    }
  };

  const fetchBanques = async () => {
    try {
      const response = await axios.get("http://localhost:5000/banque/AllBanques");
      setBanques(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des banques:", error);
    }
  };

  const fetchDocumentsClient = async () => {
    try {
      const [facturesRes, bonsLivraisonRes] = await Promise.all([
        axios.get(`http://localhost:5000/ventes/factures/client/${selectedClient._id}`),
        axios.get(`http://localhost:5000/ventes/bonslivraison/non-factures/${selectedClient._id}`)
      ]);
  
      setFactures(facturesRes.data);
      setBonsLivraison(bonsLivraisonRes.data);
      
      // Ajout de logs pour vérification
      console.log("Factures reçues:", facturesRes.data);
      console.log("BL reçus:", bonsLivraisonRes.data);
        } catch (error) {
      console.error("Erreur lors de la récupération des documents:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de la récupération des documents",
        severity: "error"
      });
    }
  };

  const fetchBanquesClient = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/client/${selectedClient._id}/banques`
      );
      setBanques(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des banques:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de la récupération des banques",
        severity: "error"
      });
    }
  };

  const fetchComptesBancaires = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/client/${selectedClient._id}/banque/${selectedBanque._id}/comptes`);
      setComptesBancaires(response.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des comptes bancaires:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de la récupération des comptes bancaires",
        severity: "error"
      });
    }
  };

  const fetchHistoriquePaiements = async () => {
    if (selectedClient?._id) {
      try {
        const response = await axios.get(
          `http://localhost:5000/ReglementClient/client/${selectedClient._id}`,
          {
            validateStatus: function (status) {
              return status < 500; // Résoudre seulement si le code d'état est inférieur à 500
            }
          }
        );
        
        if (response.status === 200) {
          setHistoriquePaiements(response.data);
        } else {
          console.error("Erreur côté serveur:", response.data);
        }
      } catch (error) {
        console.error("Erreur réseau:", error);
      }
    }
  };

  const handleClientChange = (event, newValue) => {
    setSelectedClient(newValue);
    setSelectedFactures([]);
    setFactures([]);
    setBonsLivraison([]);
    setSelectedBonsLivraison([]);
    setMontantRestant(0);
    setTotalMontant(0);
  };

  const handleDocumentTypeChange = (event) => {
    setDocumentType(event.target.value);
    setSelectedFactures([]);
    setSelectedBonsLivraison([]);
  };

  const handleFactureSelection = (factureId) => {
    setSelectedFactures(prev => {
      const newSelection = prev.includes(factureId)
        ? prev.filter(id => id !== factureId)
        : [...prev, factureId];
      // Désélectionner les bons de livraison si on sélectionne une facture
      if (newSelection.length > 0) {
        setSelectedBonsLivraison([]);
      }
      return newSelection;
    });
  };

  const handleBonLivraisonSelection = (bonId) => {
    setSelectedBonsLivraison(prev => {
      const newSelection = prev.includes(bonId)
        ? prev.filter(id => id !== bonId)
        : [...prev, bonId];
      // Désélectionner les factures si on sélectionne un bon de livraison
      if (newSelection.length > 0) {
        setSelectedFactures([]);
      }
      return newSelection;
    });
  };

  const handleBanqueChange = (event, newValue) => {
    setSelectedBanque(newValue);
    setSelectedCompte(null);
    setPaiementDetails({
      ...paiementDetails,
      RIB: newValue?.RIB,
      codeBanque: newValue?.code_banque,
    });
  };

  const handleCompteChange = (event, newValue) => {
    setSelectedCompte(newValue);
    setPaiementDetails({
      ...paiementDetails,
      RIB: newValue?.RIB, // Utilisez RIB comme numéro de compte
      codeBanque: selectedBanque?.code_banque
  });
  };

  const handleCaisseChange = (event, newValue) => {
    setSelectedCaisse(newValue ? newValue._id : "");
    setPaiementDetails({
      ...paiementDetails,
      caisseId: newValue ? newValue._id : "",
    });
  };

  const handleModePaiementChange = (event) => {
    setModePaiement(event.target.value);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAjoutPaiement = () => {
    if (!paiementDetails.montantChiffres) {
      alert("Veuillez saisir un montant");
      return;
    }

    if (!paiementDetails.date) {
      alert("Veuillez sélectionner une date");
      return;
    }

    const montantPaiement = parseFloat(paiementDetails.montantChiffres);
   

    const nouveauPaiement = {
      id: Date.now(),
      ...paiementDetails,
      modePaiement,
      dateCreation: new Date(paiementDetails.date),
    };

    setPaiementsEnAttente([...paiementsEnAttente, nouveauPaiement]);
    setMontantRestant(prev => prev - montantPaiement);
    setPaiementDetails({ date: paiementDetails.date });
  };

  const handleSupprimerPaiement = (paiementId) => {
    const paiementASupprimer = paiementsEnAttente.find(p => p.id === paiementId);
    if (paiementASupprimer) {
      setMontantRestant(prev => prev + parseFloat(paiementASupprimer.montantChiffres));
      setPaiementsEnAttente(paiementsEnAttente.filter(p => p.id !== paiementId));
    }
  };

  const handleValiderPaiement = async () => {
    try {
      setLoading(true);
      
      // 1. RAFRAÎCHIR LES DONNÉES AVANT TOUT CALCUL
      await fetchDocumentsClient(); // Recharge les factures et BL depuis le serveur
      
      // 2. RECALCULER LES MONTANTS AVEC LES DONNÉES FRAÎCHES
      calculateAmounts();

      // Vérification des données requises
      if (!selectedClient?._id) {
        throw new Error("Veuillez sélectionner un client");
      }
      if (!selectedCaisse) {
        throw new Error("Veuillez sélectionner une caisse");
      }
      if (selectedFactures.length === 0 && selectedBonsLivraison.length === 0) {
        throw new Error("Veuillez sélectionner au moins une facture ou un bon de livraison");
      }
      if (selectedFactures.length > 0 && selectedBonsLivraison.length > 0) {
        throw new Error("Vous ne pouvez pas sélectionner des factures et des bons de livraison en même temps");
      }

      // Ajouter des logs pour vérifier les valeurs
      console.log("Montants avant envoi:", {
        total: totalMontant,
        restant: montantRestant,
        paye: totalMontant - montantRestant
      });

      const paiementData = {
        clientId: selectedClient._id,
        facturesIds: selectedFactures,
        blNonFactureesIds: selectedBonsLivraison,
        montantTotal: totalMontant,
        montantRestant: montantRestant,
        montantPaye: totalMontant - montantRestant,
        modePaiement,
        caisseId: selectedCaisse,
        dateCreation: dateReglement,
        details: {
          ...paiementDetails,
          cheques: modePaiement === "CHEQUE" || modePaiement === "MULTIPLE" ? [{
            numeroCheque,
            montant: totalMontant - montantRestant,
            dateEcheance,
            banque: selectedBanque?._id,
            rib: selectedCompte?.rib
          }] : [],
          effets: modePaiement === "EFFET" || modePaiement === "MULTIPLE" ? [{
            titreDocument: numeroCheque,
            montant: totalMontant - montantRestant,
            dateEcheance,
            banque: selectedBanque?._id,
            rib: selectedCompte?.rib
          }] : [],
          especes: modePaiement === "ESPECE" || modePaiement === "MULTIPLE" ? [{
            montant: totalMontant - montantRestant
          }] : []
        }
      };

      const response = await axios.post("http://localhost:5000/ReglementClient/create", paiementData);
  
      setSnackbar({
        open: true,
        message: "Paiement enregistré avec succès",
        severity: "success"
      });

      // Réinitialiser les sélections
      setSelectedFactures([]);
      setSelectedBonsLivraison([]);
      setPaiementsEnAttente([]);
      setTotalMontant(0);
      setMontantRestant(0);
      setPaiementDetails({});
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du paiement:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || error.message || "Erreur lors de l'enregistrement du paiement",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPaiementFields = () => {
    switch (modePaiement) {
      case "CHEQUE":
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={12}>
              <Autocomplete
                options={banques}
                getOptionLabel={option => option.libelle || ""}
                value={selectedBanque}
                onChange={handleBanqueChange}
                renderInput={params => <TextField {...params} label="Banque" fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={12}>
    <TextField
        fullWidth
        label="Code de banque"
        value={selectedBanque?.code_banque || ""}
        InputProps={{ readOnly: true }}
    />
</Grid>
            <Grid item xs={12} md={12}>
    <Autocomplete
        options={comptesBancaires}
        getOptionLabel={option => option.RIB || ""}
        value={selectedCompte}
        onChange={handleCompteChange}
        renderInput={params => <TextField {...params} label="Compte Bancaire" fullWidth />}
        disabled={!selectedBanque}
    />
</Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Numéro de Chèque"
                value={paiementDetails.numeroChèque || ""}
                onChange={e => setPaiementDetails({...paiementDetails, numeroChèque: e.target.value})}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Montant en chiffres"
                type="number"
                value={paiementDetails.montantChiffres || ""}
                onChange={e => setPaiementDetails({...paiementDetails, montantChiffres: e.target.value})}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nom du bénéficiaire"
                value={paiementDetails.beneficiaire || ""}
                onChange={e => setPaiementDetails({...paiementDetails, beneficiaire: e.target.value})}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Lieu"
                value={paiementDetails.lieu || ""}
                onChange={e => setPaiementDetails({...paiementDetails, lieu: e.target.value})}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Date d'Échéance"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={paiementDetails.dateEcheance || ""}
                onChange={e => setPaiementDetails({...paiementDetails, dateEcheance: e.target.value})}
                fullWidth
              />
            </Grid>
          </Grid>
        );

      case "EFFET":
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={banques}
                getOptionLabel={option => option.libelle || ""}
                value={selectedBanque}
                onChange={handleBanqueChange}
                renderInput={params => <TextField {...params} label="Banque" fullWidth />}
              />
            </Grid>
            <Grid item xs={12} md={6}>
    <TextField
        fullWidth
        label="Code de banque"
        value={selectedBanque?.code_banque || ""}
        InputProps={{ readOnly: true }}
    />
</Grid>
            <Grid item xs={12} md={6}>
    <Autocomplete
        options={comptesBancaires}
        getOptionLabel={option => option.RIB || ""}
        value={selectedCompte}
        onChange={handleCompteChange}
        renderInput={params => <TextField {...params} label="Compte Bancaire" fullWidth />}
        disabled={!selectedBanque}
    />
</Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Titre du document"
                value={paiementDetails.titreDocument || ""}
                onChange={e => setPaiementDetails({...paiementDetails, titreDocument: e.target.value})}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nom du tiré"
                value={paiementDetails.tire || ""}
                onChange={e => setPaiementDetails({...paiementDetails, tire: e.target.value})}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Lieu"
                value={paiementDetails.lieu || ""}
                onChange={e => setPaiementDetails({...paiementDetails, lieu: e.target.value})}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Échéance"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={paiementDetails.echeance || ""}
                onChange={e => setPaiementDetails({...paiementDetails, echeance: e.target.value})}
                fullWidth
              />
            </Grid>
          </Grid>
        );

      case "ESPECE":
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="Montant en chiffres"
                type="number"
                value={paiementDetails.montantChiffres || ""}
                onChange={e => setPaiementDetails({...paiementDetails, montantChiffres: e.target.value})}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Nom du bénéficiaire"
                value={paiementDetails.beneficiaire || ""}
                onChange={e => setPaiementDetails({...paiementDetails, beneficiaire: e.target.value})}
                fullWidth
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  const handleRetourListe = () => {
    navigate("/ListeReglementsClients");
  };

  // Fonction pour réinitialiser la page
  const resetPage = () => {
    setSelectedFactures([]);
    setFactures([]);
    setBonsLivraison([]);
    setSelectedBonsLivraison([]);
    setPaiementsEnAttente([]);
    setPaiementDetails({});
    setTotalMontant(0);
    setMontantRestant(0);
  };

  return (
    <>
      <Navbar />
      <Box height={64} />
      <Box sx={{
        display: "flex",
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        minHeight: "calc(100vh - 64px)",
        overflow: "hidden"
      }}>
        <Sidenav />
        <Box component="main" sx={{
          flexGrow: 1,
          p: 3,
          overflow: "auto",
          height: "calc(100vh - 64px)",
          "&::-webkit-scrollbar": {
            width: "8px",
            backgroundColor: "rgba(0,0,0,0.1)"
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: "8px",
            background: "linear-gradient(135deg, #495057 0%, #6c757d 100%)"
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "rgba(0,0,0,0.05)"
          }
        }}>
          {/* Header moderne avec animation */}
          <Fade in={true} timeout={800}>
            <Box sx={{
              mb: 4,
              p: 4,
              background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Effet de particules en arrière-plan */}
              <Box sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                animation: 'pulse 3s ease-in-out infinite alternate'
              }} />

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                  <Stack direction="row" alignItems="center" spacing={3}>
                    <Box sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      background: 'rgba(255,255,255,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backdropFilter: 'blur(10px)',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}>
                      <Payment sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" component="h1" sx={{
                        fontWeight: "bold",
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                        mb: 1
                      }}>
                        Règlement Client
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9 }}>
                        Effectuer un règlement
                      </Typography>
                    </Box>
                  </Stack>
                  <Tooltip title="Retour à la liste des règlements">
                    <Button
                      variant="contained"
                      onClick={handleRetourListe}
                      sx={{
                        borderRadius: 3,
                        textTransform: 'none',
                        px: 2,
                        py: 1,
                        background: 'rgba(255,255,255,0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        color: 'white',
                        fontWeight: 'bold',
                        '&:hover': {
                          background: 'rgba(255,255,255,0.3)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      ← Retour à la liste
                    </Button>
                  </Tooltip>
                </Stack>
              </Box>
            </Box>
          </Fade>

          <Grid container spacing={3}>
            {/* Section Sélection Client */}
            <Grid item xs={12}>
              <Zoom in={true} timeout={600}>
                <Card sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}>

                  <Typography variant="h6" sx={{
                    mb: 3,
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Business sx={{ color: '#495057' }} />
                    Informations de Règlement
                  </Typography>

                  <Stack direction="row" spacing={3} alignItems="center" mb={3}>
                    {/* Client avec icône */}
                    <FormControl fullWidth sx={{ flex: 1 }}>
                      <Autocomplete
                        options={clients}
                        getOptionLabel={(option) => option.nom_prenom}
                        value={clients.find((c) => c._id === selectedClient) || null}
                        onChange={(event, newValue) => {
                          setSelectedClient(newValue ? newValue._id : "");
                          resetPage();
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="🏢 Sélectionner un client"
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(52, 73, 94, 0.2)'
                                },
                                '&.Mui-focused': {
                                  boxShadow: '0 4px 12px rgba(52, 73, 94, 0.3)'
                                }
                              }
                            }}
                          />
                        )}
                      />
                    </FormControl>

                    {/* Caisse avec icône */}
                    <FormControl fullWidth sx={{ flex: 1 }}>
                      <Autocomplete
                        options={caisses}
                        getOptionLabel={(option) => option.libelle}
                        value={caisses.find((c) => c._id === selectedCaisse) || null}
                        onChange={(event, newValue) => {
                          setSelectedCaisse(newValue ? newValue._id : "");
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="💰 Sélectionner une caisse"
                            variant="outlined"
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 3,
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(52, 73, 94, 0.2)'
                                },
                                '&.Mui-focused': {
                                  boxShadow: '0 4px 12px rgba(52, 73, 94, 0.3)'
                                }
                              }
                            }}
                          />
                        )}
                      />
                    </FormControl>

                    {/* Date avec style moderne */}
                    <TextField
                      fullWidth
                      type="date"
                      label="📅 Date"
                      InputLabelProps={{ shrink: true }}
                      value={paiementDetails.date || dateReglement}
                      onChange={(e) => setPaiementDetails({...paiementDetails, date: e.target.value})}
                      sx={{
                        flex: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(52, 73, 94, 0.2)'
                          },
                          '&.Mui-focused': {
                            boxShadow: '0 4px 12px rgba(52, 73, 94, 0.3)'
                          }
                        }
                      }}
                    />
                  </Stack>
                </Card>
              </Zoom>
            </Grid>

            {/* Section Liste des Factures */}
            <Grid item xs={12} md={8}>
              <Slide direction="up" in={true} timeout={800}>
                <Card sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <Typography variant="h6" sx={{
                    mb: 3,
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <Receipt sx={{ color: '#495057' }} />
                    Liste des Factures
                  </Typography>
                  {/* Tableau des Factures */}
                  <Typography variant="h6" sx={{
                    mb: 3,
                    color: '#2c3e50',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <MonetizationOn sx={{ mr: 1, color: '#52c41a' }} />
                    Factures ({factures.length})
                  </Typography>

                  <TableContainer component={Paper} sx={{
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden',
                    mb: 4
                  }}>
                    <Table>
                      <TableHead sx={{
                        background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)'
                      }}>
                        <TableRow>
                          <TableCell padding="checkbox" sx={{ color: 'white' }}>
                            <Checkbox
                              indeterminate={selectedFactures.length > 0 && selectedFactures.length < factures.length}
                              checked={factures.length > 0 && selectedFactures.length === factures.length}
                              onChange={(e) => setSelectedFactures(e.target.checked ? factures.map(f => f._id) : [])}
                              sx={{ color: 'white' }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                            N° Facture
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                            Date
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                            Montant TTC
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                            Montant Payé
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                            Montant Restant
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                            Statut
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {factures.map((facture) => {
                          const montantPaye = facture.montantPaye || 0;
                          const montantRestant = Math.max(facture.total_ttc - montantPaye, 0);
                          let statut = "non_paye";
                          if (montantPaye >= facture.total_ttc) {
                            statut = "paye";
                          } else if (montantPaye > 0) {
                            statut = "partiellement_paye";
                          }
                          return (
                            <TableRow
                              key={facture._id}
                              sx={{
                                '&:nth-of-type(odd)': {
                                  backgroundColor: '#f8f9fa',
                                },
                                '&:hover': {
                                  backgroundColor: '#e3f2fd',
                                  transform: 'scale(1.01)',
                                  transition: 'all 0.2s ease'
                                },
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <TableCell padding="checkbox">
                                <Checkbox
                                  checked={selectedFactures.includes(facture._id)}
                                  onChange={() => handleFactureSelection(facture._id)}
                                />
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'medium' }}>
                                <Chip
                                  label={facture.numero}
                                  size="small"
                                  sx={{
                                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'medium' }}>
                                {new Date(facture.dateFacture).toLocaleDateString()}
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'medium' }}>
                                {facture.total_ttc?.toFixed(3)} DT
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'medium', color: '#52c41a' }}>
                                {montantPaye.toFixed(3)} DT
                              </TableCell>
                              <TableCell sx={{ fontWeight: 'bold', color: '#f5222d' }}>
                                {montantRestant.toFixed(3)} DT
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={statut === "non_paye" ? "Non payé" :
                                         statut === "partiellement_paye" ? "Partiellement payé" : "Payé"}
                                  color={
                                    statut === "paye" ? "success" :
                                    statut === "partiellement_paye" ? "warning" : "error"
                                  }
                                  size="small"
                                  sx={{ fontWeight: 'bold' }}
                                />
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Tableau des Bons de Livraison */}
                  <Typography variant="h6" sx={{
                    mb: 3,
                    color: '#2c3e50',
                    fontWeight: 'bold',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Receipt sx={{ mr: 1, color: '#1890ff' }} />
                    Bons de Livraison Non Facturés ({bonsLivraison.length})
                  </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedBonsLivraison.length > 0 && selectedBonsLivraison.length < bonsLivraison.length}
                            checked={selectedBonsLivraison.length === bonsLivraison.length}
                            onChange={(e) => setSelectedBonsLivraison(e.target.checked ? bonsLivraison.map(b => b._id) : [])}
                          />
                          </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>N° Bon</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Montant TTC</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Montant Payé</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Montant Restant</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {bonsLivraison.map((bon) => {
                        const montantPaye = bon.montantPaye || 0;
                        const montantRestant = Math.max(bon.total_ttc - montantPaye, 0);
                        let statut = "non_paye";
                        if (montantPaye >= bon.total_ttc) {
                          statut = "paye";
                        } else if (montantPaye > 0) {
                          statut = "partiellement_paye";
                        }
                        return (
                        <TableRow key={bon._id}>
                            <TableCell padding="checkbox">
                          <Checkbox
                                checked={selectedBonsLivraison.includes(bon._id)}
                                onChange={() => handleBonLivraisonSelection(bon._id)}
/>
                          </TableCell>
                          <TableCell>{bon.numero}</TableCell>
                          <TableCell>{new Date(bon.dateLivraison).toLocaleDateString()}</TableCell>
                          <TableCell>{bon.total_ttc.toFixed(3)} DT</TableCell>
                            <TableCell>{montantPaye.toFixed(3)} DT</TableCell>
                            <TableCell>{montantRestant.toFixed(3)} DT</TableCell>
                            <TableCell>
                              <Chip
                                label={statut}
                                color={
                                  statut === "paye"
                                    ? "success"
                                    : statut === "partiellement_paye"
                                    ? "warning"
                                    : "error"
                                }
                                size="small"
                              />
                            </TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
                </Card>
              </Slide>
            </Grid>

            {/* Section Récapitulatif */}
            <Grid item xs={12} md={4}>
              <Fade in={true} timeout={1000}>
                <Card sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <Typography variant="h6" sx={{
                    mb: 3,
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <TrendingUp sx={{ color: '#495057' }} />
                    Récapitulatif
                  </Typography>

                  <Stack spacing={2}>
                    <Box sx={{
                      p: 2,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                      color: 'white',
                      textAlign: 'center',
                      boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)'
                    }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {totalMontant.toFixed(2)} DT
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        💰 Total TTC
                      </Typography>
                    </Box>

                    <Box sx={{
                      p: 2,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                      color: 'white',
                      textAlign: 'center',
                      boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)'
                    }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {montantRestant.toFixed(2)} DT
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        📊 Montant Restant
                      </Typography>
                    </Box>

                    <Box sx={{
                      p: 2,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                      color: 'white',
                      textAlign: 'center',
                      boxShadow: '0 4px 15px rgba(52, 152, 219, 0.3)'
                    }}>
                      <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {paiementsEnAttente.reduce((sum, p) => sum + parseFloat(p.montantChiffres || 0), 0).toFixed(2)} DT
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        ⏳ En attente
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              </Fade>
            </Grid>

            {/* Section Mode de Paiement */}
            <Grid item xs={12}>
              <Fade in={true} timeout={1200}>
                <Card sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <Typography variant="h6" sx={{
                    mb: 3,
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <CreditCard sx={{ color: '#495057' }} />
                    Mode de Paiement
                  </Typography>

                  <RadioGroup
                    value={modePaiement}
                    onChange={handleModePaiementChange}
                    sx={{ mb: 3 }}
                  >
                    <Stack direction="row" spacing={3}>
                      <FormControlLabel
                        value="ESPECE"
                        control={<Radio sx={{ color: '#27ae60' }} />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachMoney sx={{ color: '#27ae60' }} />
                            💵 Espèces
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value="CHEQUE"
                        control={<Radio sx={{ color: '#3498db' }} />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AccountBalance sx={{ color: '#3498db' }} />
                            🏦 Chèque
                          </Box>
                        }
                      />
                      <FormControlLabel
                        value="EFFET"
                        control={<Radio sx={{ color: '#f39c12' }} />}
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Receipt sx={{ color: '#f39c12' }} />
                            📄 Effet
                          </Box>
                        }
                      />
                    </Stack>
                  </RadioGroup>

                  <Box sx={{
                    p: 3,
                    borderRadius: 3,
                    border: '1px solid rgba(52, 73, 94, 0.1)'
                  }}>
                    {renderPaiementFields()}
                  </Box>

                  <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                    <Tooltip title="Ajouter ce paiement à la liste">
                      <Button
                        variant="contained"
                        onClick={handleAjoutPaiement}
                        sx={{
                          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                          borderRadius: 3,
                          px: 4,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 'bold',
                          boxShadow: '0 4px 15px rgba(52, 73, 94, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 20px rgba(52, 73, 94, 0.4)'
                          },
                          transition: 'all 0.3s ease'
                        }}
                        startIcon={<Add />}
                      >
                        Ajouter Paiement
                      </Button>
                    </Tooltip>
                  </Stack>
                </Card>
              </Fade>
            </Grid>


            {/* Liste des paiements en attente */}
            {paiementsEnAttente.length > 0 && (
              <Grid item xs={12}>
                <Zoom in={true} timeout={1400}>
                  <Card sx={{
                    p: 3,
                    borderRadius: 3,
                    background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                    color: 'white',
                    boxShadow: '0 8px 32px rgba(149, 165, 166, 0.3)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 40px rgba(149, 165, 166, 0.4)'
                    },
                    transition: 'all 0.3s ease'
                  }}>
                    {/* Effet de brillance */}
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 120,
                      height: 120,
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      transform: 'translate(30%, -30%)'
                    }} />

                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                        <Typography variant="h6" sx={{
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                        }}>
                          <Schedule sx={{ fontSize: 28 }} />
                          Paiements en attente ({paiementsEnAttente.length})
                        </Typography>

                        <Tooltip title="Valider tous les paiements en attente">
                          <Button
                            variant="contained"
                            onClick={handleValiderPaiement}
                            sx={{
                              background: 'rgba(255,255,255,0.2)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255,255,255,0.3)',
                              color: 'white',
                              borderRadius: 3,
                              textTransform: 'none',
                              px: 4,
                              py: 1.5,
                              fontWeight: 'bold',
                              '&:hover': {
                                background: 'rgba(255,255,255,0.3)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                              },
                              transition: 'all 0.3s ease'
                            }}
                            startIcon={<CheckCircleOutline />}
                          >
                            Valider tous les paiements
                          </Button>
                        </Tooltip>
                      </Stack>

                      <TableContainer component={Paper} sx={{
                        borderRadius: 3,
                        overflow: 'hidden',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                      }}>
                        <Table>
                          <TableHead sx={{
                            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
                          }}>
                            <TableRow>
                              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>📅 Date</TableCell>
                              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>💳 Type</TableCell>
                              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>💰 Montant</TableCell>
                              <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>⚡ Actions</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {paiementsEnAttente.map((paiement, index) => (
                              <Fade in={true} timeout={1500 + index * 100} key={paiement.id}>
                                <TableRow sx={{
                                  '&:hover': {
                                    backgroundColor: 'rgba(52, 73, 94, 0.05)',
                                    transform: 'scale(1.01)',
                                    transition: 'all 0.2s ease'
                                  },
                                  '&:nth-of-type(even)': {
                                    backgroundColor: 'rgba(0,0,0,0.02)'
                                  }
                                }}>
                                  <TableCell sx={{ fontWeight: 'bold' }}>
                                    {new Date(paiement.dateCreation).toLocaleDateString('fr-FR')}
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      label={paiement.modePaiement}
                                      size="small"
                                      sx={{
                                        backgroundColor: paiement.modePaiement === 'ESPECE' ? '#27ae60' :
                                                       paiement.modePaiement === 'CHEQUE' ? '#f39c12' : '#e74c3c',
                                        color: 'white',
                                        fontWeight: 'bold'
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', color: '#27ae60' }}>
                                    {paiement.montantChiffres ? parseFloat(paiement.montantChiffres).toFixed(2) : '0.00'} DT
                                  </TableCell>
                                  <TableCell>
                                    <Tooltip title="Supprimer ce paiement">
                                      <IconButton
                                        onClick={() => handleSupprimerPaiement(paiement.id)}
                                        size="small"
                                        sx={{
                                          color: '#e74c3c',
                                          backgroundColor: 'rgba(231, 76, 60, 0.1)',
                                          '&:hover': {
                                            backgroundColor: 'rgba(231, 76, 60, 0.2)',
                                            transform: 'scale(1.1)'
                                          },
                                          transition: 'all 0.2s ease'
                                        }}
                                      >
                                        <Delete />
                                      </IconButton>
                                    </Tooltip>
                                  </TableCell>
                                </TableRow>
                              </Fade>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  </Card>
                </Zoom>
              </Grid>
            )}
        </Grid>
        </Box>
      </Box>

      {/* Snackbar moderne */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        TransitionComponent={Slide}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: "100%",
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            },
            '& .MuiAlert-message': {
              fontWeight: 'bold'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Styles CSS pour les animations */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            opacity: 0.6;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200px 0;
          }
          100% {
            background-position: calc(200px + 100%) 0;
          }
        }

        .floating-animation {
          animation: float 3s ease-in-out infinite;
        }

        .shimmer-effect {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          background-size: 200px 100%;
          animation: shimmer 2s infinite;
        }
      `}</style>
    </>
  );
}