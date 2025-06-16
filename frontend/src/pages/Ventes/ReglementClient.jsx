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
  Fade,
  Zoom,
  Slide,
  LinearProgress,
  Tooltip,
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
  Schedule,
  CheckCircleOutline,
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
  const [documentType, setDocumentType] = useState("factures");
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
    let total = 0;
    let totalPaye = 0;
    let montantRestantTotal = 0;
  
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
    } else if (selectedBonsLivraison.length > 0) {
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
  
    const montantPaiementsEnAttente = paiementsEnAttente.reduce(
      (sum, paiement) => sum + parseFloat(paiement.montantChiffres || 0), 
      0
    );

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
              return status < 500;
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
      RIB: newValue?.RIB,
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
      await fetchDocumentsClient();
      calculateAmounts();
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
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={banques}
                getOptionLabel={option => option.libelle || ""}
                value={selectedBanque}
                onChange={handleBanqueChange}
                renderInput={params => (
                  <TextField 
                    {...params} 
                    label="🏦 Banque" 
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
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="🔢 Code de banque"
                value={selectedBanque?.code_banque || ""}
                InputProps={{ readOnly: true }}
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
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={comptesBancaires}
                getOptionLabel={option => option.RIB || ""}
                value={selectedCompte}
                onChange={handleCompteChange}
                renderInput={params => (
                  <TextField 
                    {...params} 
                    label="🏧 Compte Bancaire" 
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
                disabled={!selectedBanque}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="📝 Numéro de Chèque"
                value={paiementDetails.numeroChèque || ""}
                onChange={e => setPaiementDetails({...paiementDetails, numeroChèque: e.target.value})}
                fullWidth
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
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="💰 Montant en chiffres"
                type="number"
                value={paiementDetails.montantChiffres || ""}
                onChange={e => setPaiementDetails({...paiementDetails, montantChiffres: e.target.value})}
                fullWidth
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
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="👤 Nom du bénéficiaire"
                value={paiementDetails.beneficiaire || ""}
                onChange={e => setPaiementDetails({...paiementDetails, beneficiaire: e.target.value})}
                fullWidth
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
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="📍 Lieu"
                value={paiementDetails.lieu || ""}
                onChange={e => setPaiementDetails({...paiementDetails, lieu: e.target.value})}
                fullWidth
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
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="📅 Date d'Échéance"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={paiementDetails.dateEcheance || ""}
                onChange={e => setPaiementDetails({...paiementDetails, dateEcheance: e.target.value})}
                fullWidth
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
                renderInput={params => (
                  <TextField 
                    {...params} 
                    label="🏦 Banque" 
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
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="🔢 Code de banque"
                value={selectedBanque?.code_banque || ""}
                InputProps={{ readOnly: true }}
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
            </Grid>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={comptesBancaires}
                getOptionLabel={option => option.RIB || ""}
                value={selectedCompte}
                onChange={handleCompteChange}
                renderInput={params => (
                  <TextField 
                    {...params} 
                    label="🏧 Compte Bancaire" 
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
                disabled={!selectedBanque}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="📄 Titre du document"
                value={paiementDetails.titreDocument || ""}
                onChange={e => setPaiementDetails({...paiementDetails, titreDocument: e.target.value})}
                fullWidth
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
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="👤 Nom du tiré"
                value={paiementDetails.tire || ""}
                onChange={e => setPaiementDetails({...paiementDetails, tire: e.target.value})}
                fullWidth
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
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="📍 Lieu"
                value={paiementDetails.lieu || ""}
                onChange={e => setPaiementDetails({...paiementDetails, lieu: e.target.value})}
                fullWidth
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
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="📅 Échéance"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={paiementDetails.echeance || ""}
                onChange={e => setPaiementDetails({...paiementDetails, echeance: e.target.value})}
                fullWidth
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
            </Grid>
          </Grid>
        );
      case "ESPECE":
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                label="💰 Montant en chiffres"
                type="number"
                value={paiementDetails.montantChiffres || ""}
                onChange={e => setPaiementDetails({...paiementDetails, montantChiffres: e.target.value})}
                fullWidth
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
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="👤 Nom du bénéficiaire"
                value={paiementDetails.beneficiaire || ""}
                onChange={e => setPaiementDetails({...paiementDetails, beneficiaire: e.target.value})}
                fullWidth
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
                        Gérer les paiements clients
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
                    <FormControl fullWidth sx={{ flex: 1 }}>
                      <Autocomplete
                        options={clients}
                        getOptionLabel={option => option.nom_prenom || ""}
                        value={selectedClient}
                        onChange={handleClientChange}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label="👤 Sélectionner un client"
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
                    <FormControl fullWidth sx={{ flex: 1 }}>
                      <Autocomplete
                        options={caisses}
                        getOptionLabel={option => option.libelle || ""}
                        value={caisses.find(c => c._id === selectedCaisse) || null}
                        onChange={handleCaisseChange}
                        renderInput={params => (
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
                    <TextField
                      fullWidth
                      type="date"
                      label="📅 Date de Règlement"
                      InputLabelProps={{ shrink: true }}
                      value={paiementDetails.date || dateReglement}
                      onChange={e => setPaiementDetails({...paiementDetails, date: e.target.value})}
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
                    Documents à Régler
                  </Typography>
                  <Typography variant="subtitle1" sx={{
                    mt: 2,
                    mb: 1,
                    fontWeight: 'bold',
                    color: '#2c3e50'
                  }}>
                    Factures
                  </Typography>
                  <TableContainer component={Paper} sx={{
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden'
                  }}>
                    <Table>
                      <TableHead sx={{
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
                      }}>
                        <TableRow>
                          <TableCell padding="checkbox" sx={{ color: 'white' }}>
                            <Checkbox
                              sx={{ color: 'white' }}
                              indeterminate={selectedFactures.length > 0 && selectedFactures.length < factures.length}
                              checked={selectedFactures.length === factures.length}
                              onChange={(e) => setSelectedFactures(e.target.checked ? factures.map(f => f._id) : [])}
                            />
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>N° Facture</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Montant TTC</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Montant Payé</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Montant Restant</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {factures.map((facture, index) => {
                          const montantPaye = facture.montantPaye || 0;
                          const montantRestant = Math.max(facture.total_ttc - montantPaye, 0);
                          let statut = "non_paye";
                          if (montantPaye >= facture.total_ttc) {
                            statut = "paye";
                          } else if (montantPaye > 0) {
                            statut = "partiellement_paye";
                          }
                          return (
                            <Fade in={true} timeout={1000 + index * 100} key={facture._id}>
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
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    checked={selectedFactures.includes(facture._id)}
                                    onChange={() => handleFactureSelection(facture._id)}
                                    sx={{
                                      color: '#495057',
                                      '&.Mui-checked': {
                                        color: '#2c3e50'
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>{facture.numero}</TableCell>
                                <TableCell>{new Date(facture.dateFacture).toLocaleDateString('fr-FR')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{facture.total_ttc?.toFixed(3)} DT</TableCell>
                                <TableCell sx={{ color: '#27ae60', fontWeight: 'bold' }}>{montantPaye.toFixed(3)} DT</TableCell>
                                <TableCell sx={{ color: '#e74c3c', fontWeight: 'bold' }}>{montantRestant.toFixed(3)} DT</TableCell>
                                <TableCell>
                                  <Chip
                                    label={statut === "paye" ? "✅ Payée" :
                                           statut === "partiellement_paye" ? "⚠️ Partielle" : "❌ Non payée"}
                                    size="small"
                                    sx={{
                                      backgroundColor: statut === "paye" ? '#27ae60' :
                                                     statut === "partiellement_paye" ? '#f39c12' : '#e74c3c',
                                      color: 'white',
                                      fontWeight: 'bold',
                                      borderRadius: 2
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            </Fade>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Typography variant="subtitle1" sx={{
                    mt: 2,
                    mb: 1,
                    fontWeight: 'bold',
                    color: '#2c3e50'
                  }}>
                    Bons de Livraison Non Facturés
                  </Typography>
                  <TableContainer component={Paper} sx={{
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    overflow: 'hidden'
                  }}>
                    <Table>
                      <TableHead sx={{
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
                      }}>
                        <TableRow>
                          <TableCell padding="checkbox" sx={{ color: 'white' }}>
                            <Checkbox
                              sx={{ color: 'white' }}
                              indeterminate={selectedBonsLivraison.length > 0 && selectedBonsLivraison.length < bonsLivraison.length}
                              checked={selectedBonsLivraison.length === bonsLivraison.length}
                              onChange={(e) => setSelectedBonsLivraison(e.target.checked ? bonsLivraison.map(b => b._id) : [])}
                            />
                          </TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>N° Bon</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Date</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Montant TTC</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Montant Payé</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Montant Restant</TableCell>
                          <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Statut</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {bonsLivraison.map((bon, index) => {
                          const montantPaye = bon.montantPaye || 0;
                          const montantRestant = Math.max(bon.total_ttc - montantPaye, 0);
                          let statut = "non_paye";
                          if (montantPaye >= bon.total_ttc) {
                            statut = "paye";
                          } else if (montantPaye > 0) {
                            statut = "partiellement_paye";
                          }
                          return (
                            <Fade in={true} timeout={1000 + index * 100} key={bon._id}>
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
                                <TableCell padding="checkbox">
                                  <Checkbox
                                    checked={selectedBonsLivraison.includes(bon._id)}
                                    onChange={() => handleBonLivraisonSelection(bon._id)}
                                    sx={{
                                      color: '#495057',
                                      '&.Mui-checked': {
                                        color: '#2c3e50'
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>{bon.numero}</TableCell>
                                <TableCell>{new Date(bon.dateLivraison).toLocaleDateString('fr-FR')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{bon.total_ttc.toFixed(3)} DT</TableCell>
                                <TableCell sx={{ color: '#27ae60', fontWeight: 'bold' }}>{montantPaye.toFixed(3)} DT</TableCell>
                                <TableCell sx={{ color: '#e74c3c', fontWeight: 'bold' }}>{montantRestant.toFixed(3)} DT</TableCell>
                                <TableCell>
                                  <Chip
                                    label={statut === "paye" ? "✅ Payée" :
                                           statut === "partiellement_paye" ? "⚠️ Partielle" : "❌ Non payée"}
                                    size="small"
                                    sx={{
                                      backgroundColor: statut === "paye" ? '#27ae60' :
                                                     statut === "partiellement_paye" ? '#f39c12' : '#e74c3c',
                                      color: 'white',
                                      fontWeight: 'bold',
                                      borderRadius: 2
                                    }}
                                  />
                                </TableCell>
                              </TableRow>
                            </Fade>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Card>
              </Slide>
            </Grid>

            <Grid item xs={12} md={4}>
              <Slide direction="left" in={true} timeout={1000}>
                <Card sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                  color: 'white',
                  boxShadow: '0 8px 32px rgba(52, 73, 94, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px) scale(1.02)',
                    boxShadow: '0 12px 40px rgba(52, 73, 94, 0.4)'
                  },
                  transition: 'all 0.3s ease'
                }}>
                  <Box sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: 100,
                    height: 100,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    transform: 'translate(30%, -30%)'
                  }} />
                  <Box sx={{ position: 'relative', zIndex: 1 }}>
                    <Typography variant="h6" sx={{
                      mb: 3,
                      fontWeight: 'bold',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                    }}>
                      <AttachMoney sx={{ fontSize: 28 }} />
                      Récapitulatif
                    </Typography>
                    <Box sx={{ mb: 2, p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Total TTC
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                        {totalMontant.toFixed(3)} DT
                      </Typography>
                    </Box>
                    <Box sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Montant Restant
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                        {montantRestant.toFixed(3)} DT
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" sx={{ mb: 1, opacity: 0.9 }}>
                        Progression du paiement
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={totalMontant > 0 ? ((totalMontant - montantRestant) / totalMontant) * 100 : 0}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(255,255,255,0.2)',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: 'white',
                            borderRadius: 4
                          }
                        }}
                      />
                      <Typography variant="caption" sx={{ mt: 1, display: 'block', opacity: 0.9 }}>
                        {totalMontant > 0 ? Math.round(((totalMontant - montantRestant) / totalMontant) * 100) : 0}% payé
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Slide>
            </Grid>

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
                    fontWeight: 'medium',
                    color: '#2c3e50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}>
                    <CreditCard sx={{ color: '#495057' }} />
                    Mode de Paiement
                  </Typography>
                  <RadioGroup
                    row
                    value={modePaiement}
                    onChange={handleModePaiementChange}
                    sx={{ mb: 3 }}
                  >
                    <FormControlLabel
                      value="ESPECE"
                      control={<Radio sx={{ color: '#495057', '&.Mui-checked': { color: '#2c3e50' } }} />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AccountBalanceWallet sx={{ color: '#27ae60' }} />
                          <Typography sx={{ fontWeight: 'medium' }}>Espèce</Typography>
                        </Box>
                      }
                      sx={{
                        mr: 3,
                        p: 2,
                        borderRadius: 2,
                        border: modePaiement === 'ESPECE' ? '2px solid #2c3e50' : '2px solid transparent',
                        backgroundColor: modePaiement === 'ESPECE' ? 'rgba(52, 73, 94, 0.1)' : 'transparent',
                        transition: 'all 0.3s ease'
                      }}
                    />
                    <FormControlLabel
                      value="CHEQUE"
                      control={<Radio sx={{ color: '#495057', '&.Mui-checked': { color: '#2c3e50' } }} />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Receipt sx={{ color: '#f39c12' }} />
                          <Typography sx={{ fontWeight: 'medium' }}>Chèque</Typography>
                        </Box>
                      }
                      sx={{
                        mr: 3,
                        p: 2,
                        borderRadius: 2,
                        border: modePaiement === 'CHEQUE' ? '2px solid #2c3e50' : '2px solid transparent',
                        backgroundColor: modePaiement === 'CHEQUE' ? 'rgba(52, 73, 94, 0.1)' : 'transparent',
                        transition: 'all 0.3s ease'
                      }}
                    />
                    <FormControlLabel
                      value="EFFET"
                      control={<Radio sx={{ color: '#495057', '&.Mui-checked': { color: '#2c3e50' } }} />}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule sx={{ color: '#e74c3c' }} />
                          <Typography sx={{ fontWeight: 'medium' }}>Effet</Typography>
                        </Box>
                      }
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        border: modePaiement === 'EFFET' ? '2px solid #2c3e50' : '2px solid transparent',
                        backgroundColor: modePaiement === 'EFFET' ? 'rgba(52, 73, 94, 0.1)' : 'transparent',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  </RadioGroup>
                  <Box sx={{
                    mt: 3,
                    p: 3,
                    backgroundColor: 'rgba(52, 73, 94, 0.05)',
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
                        startIcon={<CheckCircle />}
                      >
                        Ajouter Paiement
                      </Button>
                    </Tooltip>
                  </Stack>
                </Card>
              </Fade>
            </Grid>

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
                                    {paiement.montantChiffres ? parseFloat(paiement.montantChiffres).toFixed(3) : '0.000'} DT
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