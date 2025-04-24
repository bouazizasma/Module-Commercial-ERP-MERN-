import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidenav from "../../navbar/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../../navbar/Navbar";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Autocomplete,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  InputLabel,
  Alert,
  Snackbar,
  Divider,
  Stack,
  useTheme,
  FormGroup,
  Checkbox,
  Chip,
} from "@mui/material";
import {
  Payment,
  AccountBalance,
  Receipt,
  MonetizationOn,
  CheckCircle,
  Delete,
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

  return (
    <>
      <Navbar />
      <Box height={64} />
      <Box sx={{ 
        display: "flex", 
        backgroundColor: "#f5f5f5",
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
            backgroundColor: "#f5f5f5"
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: "4px",
            backgroundColor: "#888"
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f5f5f5"
          }
        }}>
          <Grid container spacing={3}>
            {/* Section Sélection Client */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Payment sx={{ fontSize: 40, color: "#1976d2" }} />
                    <Typography variant="h4" component="h1" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                      Règlement Client
                    </Typography>
                  </Stack>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleRetourListe}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3
                    }}
                  >
                    Retour à la liste
                  </Button>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                  {/* Client */}
                  <Autocomplete
                    options={clients}
                    getOptionLabel={option => option.nom_prenom || ""}
                    value={selectedClient}
                    onChange={handleClientChange}
                    renderInput={params => (
                      <TextField 
                        {...params} 
                        label="Client" 
                        fullWidth 
                        sx={{ flex: 1 }}
                      />
                    )}
                    sx={{ flex: 1 }}
                  />
                  
                  {/* Caisse */}
                  <Autocomplete
                    options={caisses}
                    getOptionLabel={option => option.libelle || ""}
                    value={caisses.find(c => c._id === selectedCaisse) || null}
                    onChange={handleCaisseChange}
                    renderInput={params => (
                      <TextField 
                        {...params} 
                        label="Caisse" 
                        fullWidth 
                        sx={{ flex: 1 }}
                      />
                    )}
                    sx={{ flex: 1 }}
                  />
                  
                  {/* Date */}
                  <TextField
                    fullWidth
                    type="date"
                    label="Date de Règlement"
                    InputLabelProps={{ shrink: true }}
                    value={paiementDetails.date || dateReglement}
                    onChange={e => setPaiementDetails({...paiementDetails, date: e.target.value})}
                    sx={{ flex: 1 }}
                  />
                </Stack>
              </Card>
            </Grid>

            {/* Section Liste des Documents */}
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}>
                Documents à Régler
                </Typography>

                {/* Tableau des Factures */}
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: "#1976d2", fontWeight: "bold" }}>
                  Factures
                </Typography>
                <TableContainer component={Paper} sx={{ boxShadow: 2, mb: 3 }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            indeterminate={selectedFactures.length > 0 && selectedFactures.length < factures.length}
                            checked={selectedFactures.length === factures.length}
                            onChange={(e) => setSelectedFactures(e.target.checked ? factures.map(f => f._id) : [])}
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>N° Facture</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Montant TTC</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Montant Payé</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Montant Restant</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Statut</TableCell>
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
                          <TableRow key={facture._id}>
                            <TableCell padding="checkbox">
                            <Checkbox
                                checked={selectedFactures.includes(facture._id)}
      onChange={() => handleFactureSelection(facture._id)}
    />
                            </TableCell>
                            <TableCell>{facture.numero}</TableCell>
                            <TableCell>{new Date(facture.dateFacture).toLocaleDateString()}</TableCell>
                            <TableCell>{facture.total_ttc?.toFixed(3)} DT</TableCell>
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

                {/* Tableau des Bons de Livraison */}
                <Typography variant="subtitle1" sx={{ mt: 2, mb: 1, color: "#1976d2", fontWeight: "bold" }}>
                  Bons de Livraison Non Facturés
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
            </Grid>
            

            {/* Section Récapitulatif */}
            <Grid item xs={12} md={4}>
              <Card sx={{ p: 8, borderRadius: 2, boxShadow: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}>
                  Récapitulatif
                </Typography>
                <Typography variant="h6" gutterBottom>
                  Total TTC: {totalMontant.toFixed(3)} DT
                </Typography>
                <Typography variant="h6" gutterBottom sx ={{color: "#FF0000"}}>
                  Montant Restant: {montantRestant.toFixed(3)} DT
                </Typography>
              </Card>
            </Grid>

            
 {/* Section Mode de Paiement */}
 <Grid item xs={12}>
              <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3, mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}>
                  Mode de Paiement
                </Typography>
                <RadioGroup
                  row
                  value={modePaiement}
                  onChange={handleModePaiementChange}
                  sx={{ mb: 2 }}
                >
                  <FormControlLabel 
                    value="ESPECE" 
                    control={<Radio color="primary" />} 
                    label="Espèce" 
                  />
                  <FormControlLabel 
                    value="CHEQUE" 
                    control={<Radio color="primary" />} 
                    label="Chèque" 
                  />
                  <FormControlLabel 
                    value="EFFET" 
                    control={<Radio color="primary" />} 
                    label="Effet" 
                  />
                </RadioGroup>
                
                {renderPaiementFields()}
                
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleAjoutPaiement}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3
                    }}
                  >
                    Ajouter Paiement
                  </Button>
                </Stack>
              </Card>
            </Grid>


            {/* Liste des paiements en attente */}
            {paiementsEnAttente.length > 0 && (
              <Grid item xs={12}>
                <Card sx={{ p: 2, borderRadius: 2, boxShadow: 3, mt: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ color: "#1976d2", fontWeight: "bold" }}>
                    Paiements en attente
                  </Typography>
                  <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleValiderPaiement}
                      sx={{ 
                        borderRadius: 2,
                        textTransform: 'none',
                        px: 3
                      }}
                    >
                      Valider tous les paiements
                    </Button>
                  </Stack>
                  <TableContainer component={Paper} sx={{ borderRadius: 2, mb: 3 }}>
                    <Table>
                      <TableHead sx={{ bgcolor: theme.palette.primary.main }}>
                        <TableRow>
                          <TableCell sx={{ color: 'white' }}>Date</TableCell>
                          <TableCell sx={{ color: 'white' }}>Type</TableCell>
                          <TableCell sx={{ color: 'white' }}>Montant</TableCell>
                          <TableCell sx={{ color: 'white' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {paiementsEnAttente.map((paiement) => (
                          <TableRow key={paiement.id}>
                            <TableCell>{new Date(paiement.dateCreation).toLocaleDateString()}</TableCell>
                            <TableCell>{paiement.modePaiement}</TableCell>
                            <TableCell>{paiement.montantChiffres ? parseFloat(paiement.montantChiffres).toFixed(3) : '0.000'} DT</TableCell>
                            <TableCell>
                              <IconButton
                                color="error"
                                onClick={() => handleSupprimerPaiement(paiement.id)}
                                size="small"
                              >
                                <Delete />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Grid>
            )}
          </Grid>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}