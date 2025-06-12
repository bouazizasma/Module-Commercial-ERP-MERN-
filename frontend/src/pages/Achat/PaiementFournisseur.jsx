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

export default function PaiementFournisseur() {
  const theme = useTheme(); // Obtenez le thème ici
  const [fournisseurs, setFournisseurs] = useState([]);
  const [selectedFournisseur, setSelectedFournisseur] = useState("");
  const [factures, setFactures] = useState([]);
  const [selectedFactures, setSelectedFactures] = useState([]);
  const [totalMontant, setTotalMontant] = useState(0);
  const [modePaiement, setModePaiement] = useState("ESPECE");
  const [paiementDetails, setPaiementDetails] = useState({});
  const [historiquePaiements, setHistoriquePaiements] = useState([]);
  const [montantRestant, setMontantRestant] = useState(0);
  const [paiementsEnAttente, setPaiementsEnAttente] = useState([]);
  const [banques, setBanques] = useState([]); // Pour stocker la liste des banques
  const [selectedBanque, setSelectedBanque] = useState(""); // Pour stocker la banque sélectionnée
  const [caisses, setCaisses] = useState([]); // Pour stocker la liste des caisses
  const [selectedCaisse, setSelectedCaisse] = useState(""); // Pour stocker la caisse sélectionnée
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });
  const [modesPaiement, setModesPaiement] = useState([]);
  const navigate = useNavigate();

  // Récupération des fournisseurs
  useEffect(() => {
    const fetchFournisseurs = async () => {
      try {
        const response = await axios.get("http://localhost:5000/fournisseur/fournisseurs");
        setFournisseurs(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des fournisseurs:", error);
      }
    };
    fetchFournisseurs();
  }, []);

  // Récupération des factures du fournisseur sélectionné
  useEffect(() => {
    const fetchFactures = async () => {
      if (selectedFournisseur) {
        try {
          // Récupérer les factures
          const facturesResponse = await axios.get(`http://localhost:5000/factureF/factures/fournisseur/${selectedFournisseur}`);
          // Récupérer tous les paiements du fournisseur
          const paiementsResponse = await axios.get(`http://localhost:5000/paiement/fournisseur/${selectedFournisseur}`);
          
          // Calculer les montants payés pour chaque facture
          const facturesAvecPaiements = facturesResponse.data.map(facture => {
            // Trouver tous les paiements pour cette facture
            const paiementsFacture = paiementsResponse.data.filter(paiement => {
              // Vérifier si le paiement concerne cette facture en vérifiant dans facturesIds
              return paiement.facturesIds && paiement.facturesIds.some(f => f._id === facture._id);
            });
            
            // Calculer le montant total payé pour cette facture
            const montantPaye = paiementsFacture.reduce((sum, paiement) => 
              sum + parseFloat(paiement.montantPaye || 0), 0
            );

            // Calculer le montant restant et déterminer le statut
            const montantRestant = facture.montantTTC - montantPaye;

            let statut = "non_paye";
            
            if (montantPaye >= facture.montantTTC) {
              statut = "paye";
            } else if (montantPaye > 0) {
              statut = "partiellement_paye";
            }

            return {
              ...facture,
              montantPaye,
              montantRestant,
              statut
            };
          });

          setFactures(facturesAvecPaiements);
          setHistoriquePaiements(paiementsResponse.data);
        } catch (error) {
          console.error("Erreur lors de la récupération des données:", error.response?.data || error.message);
        }
      }
    };
    fetchFactures();
  }, [selectedFournisseur]);

  // Calcul du total des factures sélectionnées
  /*useEffect(() => {
    // Calculer le montant total TTC des factures sélectionnées
    const total = selectedFactures.reduce((sum, factureId) => {
      const facture = factures.find(f => f._id === factureId);
      return sum + (facture ? facture.montantTTC : 0);
    }, 0);
    setTotalMontant(total);

    // Calculer le montant restant en tenant compte des paiements déjà effectués
    const montantRestantTotal = selectedFactures.reduce((sum, factureId) => {
      const facture = factures.find(f => f._id === factureId);
      if (facture) {
        // Utiliser directement le montant restant calculé lors du chargement des factures
        return sum + facture.montantRestant;
      }
      return sum;
    }, 0);

    // Soustraire les paiements en attente
    const montantPaiementsEnAttente = paiementsEnAttente.reduce((sum, paiement) => 
      sum + parseFloat(paiement.montantChiffres || 0), 0
    );
    
    setMontantRestant(montantRestantTotal - montantPaiementsEnAttente);
  }, [selectedFactures, factures, paiementsEnAttente]);

  */
 /*
  useEffect(() => {
    // Calculer le montant total TTC des factures sélectionnées
    const total = selectedFactures.reduce((sum, factureId) => {
      const facture = factures.find(f => f._id === factureId);
      return sum + (facture ? facture.montantTTC : 0);
    }, 0);
    setTotalMontant(total);
  
    // Calculer le montant restant en tenant compte des paiements déjà effectués
    const montantRestantTotal = selectedFactures.reduce((sum, factureId) => {
      const facture = factures.find(f => f._id === factureId);
      if (facture) {
        const montantRestantFacture = facture.montantTTC - (facture.montantPaye || 0);
        // Ignorer les factures dont le montant restant est 0
        return montantRestantFacture > 0 ? sum + montantRestantFacture : sum;
      }
      return sum;
    }, 0);
  
    // Soustraire les paiements en attente
    const montantPaiementsEnAttente = paiementsEnAttente.reduce((sum, paiement) => 
      sum + parseFloat(paiement.montantChiffres || 0), 0
    );
    
    setMontantRestant(montantRestantTotal - montantPaiementsEnAttente);
  }, [selectedFactures, factures, paiementsEnAttente]);*/
  useEffect(() => {
  if (selectedFactures.length === 0) {
    setTotalMontant(0);
    setMontantRestant(0);
    return;
  }

  // Calculer le montant total TTC des factures sélectionnées
  const total = selectedFactures.reduce((sum, factureId) => {
    const facture = factures.find(f => f._id === factureId);
    return sum + (facture ? facture.montantTTC : 0);
  }, 0);
  setTotalMontant(total);

  // Calculer le montant restant en tenant compte des paiements déjà effectués
  const montantRestantTotal = selectedFactures.reduce((sum, factureId) => {
    const facture = factures.find(f => f._id === factureId);
    if (facture) {
       const montantPayeFac = facture.paiementEffectuee || 0;
      const montantRestantFacture = (facture.montantTTC - montantPayeFac|| 0);
      return sum + Math.max(montantRestantFacture, 0); 
    }
    return sum;
  }, 0);

  setMontantRestant(montantRestantTotal);
  console.log("HEdha houwa le montant ressstant",montantRestantTotal , montantRestant );

}, [selectedFactures, factures]);
  //récupérer les banques 
  useEffect(() => {
    const fetchBanques = async () => {
      try {
        const response = await axios.get("http://localhost:5000/banque/AllBanques");
        setBanques(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des banques:", error);
      }
    };
    fetchBanques();
  }, []);
  //recuperer caisses 
  useEffect(() => {
    const fetchCaisses = async () => {
      try {
        const response = await axios.get("http://localhost:5000/caisse/AllCaisses");
        setCaisses(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des caisses:", error);
      }
    };
    fetchCaisses();
  }, []);
  const handleFactureSelection = (factureId) => {
    const facture = factures.find(f => f._id === factureId);
    if (facture && facture.statut === "paye") {
      setSnackbar({
        open: true,
        message: "Cette facture est déjà payée",
        severity: "warning"
      });
      return;
    }
    setSelectedFactures(prev => 
      prev.includes(factureId)
        ? prev.filter(id => id !== factureId)
        : [...prev, factureId]
    );
  };

  // handle caisse 
  const handleCaisseChange = (event) => {
    const caisseId = event.target.value;
    setSelectedCaisse(caisseId);

    // Mettre à jour les détails du paiement avec la caisse sélectionnée
    setPaiementDetails({
      ...paiementDetails,
      caisseId: caisseId,
    });
  };
  //banques 
  const handleBanqueChange = (event) => {
    const banqueId = event.target.value;
    const selectedBanque = banques.find((banque) => banque._id === banqueId);
    setSelectedBanque(banqueId);
  
    // Mettre à jour les champs automatiquement
    setPaiementDetails({
      ...paiementDetails,
      numeroCompte: selectedBanque.numero_Compte,
      codeBanque: selectedBanque.code_banque,
    });
  };
  // Ajout d'un paiement à la liste d'attente
  /*const handleAjoutPaiement = () => {
    if (!paiementDetails.montantChiffres) {
      alert("Veuillez saisir un montant");
      return;
    }

    if (!paiementDetails.date) {
      alert("Veuillez sélectionner une date");
      return;
    }

    const montantPaiement = parseFloat(paiementDetails.montantChiffres);
    if (montantPaiement > montantRestant) {
      alert("Le montant du paiement ne peut pas être supérieur au montant restant");
      return;
    }

    const nouveauPaiement = {
      id: Date.now(),
      ...paiementDetails,
      modePaiement,
      statut: "en_attente",
      dateCreation: new Date(paiementDetails.date),
    };

    setPaiementsEnAttente([...paiementsEnAttente, nouveauPaiement]);
    setMontantRestant(prev => prev - montantPaiement);
    setPaiementDetails({ date: paiementDetails.date });
  };
*/
/*
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
  if (montantPaiement > montantRestant) {
    alert("Le montant du paiement ne peut pas être supérieur au montant restant");
    return;
  }

  // Copie des factures sélectionnées pour éviter de modifier l'état directement
  const facturesMiseAJour = [...factures];

  // Montant restant à répartir sur les factures
  let montantRestantAPayer = montantPaiement;

  // Parcourir les factures sélectionnées
  for (const facture of facturesMiseAJour) {
    if (montantRestantAPayer <= 0) break; // Si tout le montant a été réparti, on arrête

    // Calculer le montant restant pour cette facture
    const montantRestantFacture = facture.montantTTC - (facture.montantPaye || 0);

    if (montantRestantFacture > 0) {
      // Si le montant restant de la facture est supérieur à 0
      if (montantRestantAPayer >= montantRestantFacture) {
        // Si le montant à payer est supérieur au montant restant de la facture
        facture.montantPaye = facture.montantTTC; // La facture est entièrement payée
        montantRestantAPayer -= montantRestantFacture; // On déduit le montant utilisé
      } else {
        // Si le montant à payer est inférieur au montant restant de la facture
        facture.montantPaye = (facture.montantPaye || 0) + montantRestantAPayer; // On ajoute le montant payé
        montantRestantAPayer = 0; // Tout le montant a été utilisé
      }

      // Mettre à jour le statut de la facture
      if (facture.montantPaye >= facture.montantTTC) {
        facture.statut = "paye";
      } else if (facture.montantPaye > 0) {
        facture.statut = "partiellement_paye";
      }
    }
  }

  // Mettre à jour l'état des factures
  setFactures(facturesMiseAJour);

  // Ajouter le paiement à la liste des paiements en attente
  const nouveauPaiement = {
    id: Date.now(),
    ...paiementDetails,
    modePaiement,
    dateCreation: new Date(paiementDetails.date),
  };

  setPaiementsEnAttente([...paiementsEnAttente, nouveauPaiement]);

  // Mettre à jour le montant restant global
  setMontantRestant(prev => prev - montantPaiement);

  // Réinitialiser les détails du paiement
  setPaiementDetails({ date: paiementDetails.date });
};  */
//handle Ajout Paiement :
const handleAjoutPaiement = () => {
  if (!paiementDetails.montantChiffres) {
    alert("Veuillez saisir un montant");
    return;
  }

  const montantPaiement = parseFloat(paiementDetails.montantChiffres);
  
  // Calculer le nouveau montant restant après paiement
  const nouveauMontantRestant = montantRestant - montantPaiement;
  
  if (nouveauMontantRestant < 0) {
    alert("Le montant du paiement ne peut pas être supérieur au montant restant");
    return;
  }

  // Ajouter le paiement à la liste d'attente
  const nouveauPaiement = {
    id: Date.now(),
    ...paiementDetails,
    modePaiement,
    dateCreation: new Date(paiementDetails.date),
  };

  setPaiementsEnAttente([...paiementsEnAttente, nouveauPaiement]);
  setMontantRestant(nouveauMontantRestant);
  setPaiementDetails({}); // Réinitialiser les détails
};
// Suppression d'un paiement en attente
  /*const handleSupprimerPaiement = (paiementId) => {
    const paiementASupprimer = paiementsEnAttente.find(p => p.id === paiementId);
    if (paiementASupprimer) {
      // Remettre le montant dans le montant restant
      setMontantRestant(prev => prev + parseFloat(paiementASupprimer.montantChiffres));
      // Supprimer le paiement de la liste d'attente
      setPaiementsEnAttente(paiementsEnAttente.filter(p => p.id !== paiementId));
    }
  };*/

const handleSupprimerPaiement = (paiementId) => {
  const paiementASupprimer = paiementsEnAttente.find(p => p.id === paiementId);
  if (paiementASupprimer) {
    const montantARestaurer = parseFloat(paiementASupprimer.montantChiffres);
    setMontantRestant(prev => prev + montantARestaurer);
    setPaiementsEnAttente(paiementsEnAttente.filter(p => p.id !== paiementId));
  }
};
  //chnage Fournisseur 
const handleFournisseurChange = (event) => {
  const fournisseurId = event.target.value;
  setSelectedFournisseur(fournisseurId);
  resetPage(); // Réinitialiser la page
};

  // Validation d'un paiement spécifique
 /* const handleValiderPaiement = async () => {
    try {
      for (const paiementEnAttente of paiementsEnAttente) {
        const paiement = {
          fournisseurId: selectedFournisseur,
          caisseId: selectedCaisse,
          facturesIds: selectedFactures,
          montantTotal: totalMontant,
          montantPaye: parseFloat(paiementEnAttente.montantChiffres),
          modePaiement: paiementEnAttente.modePaiement,
          details: {
            ...paiementEnAttente,
            montantChiffres: parseFloat(paiementEnAttente.montantChiffres),
            banque: paiementEnAttente.modePaiement === "CHEQUE" ? selectedBanque : null,
            numeroChèque: paiementEnAttente.modePaiement === "CHEQUE" ? paiementEnAttente.numeroChèque : null,
            titreDocument: paiementEnAttente.modePaiement === "EFFET" ? paiementEnAttente.titreDocument : null,
          },
          dateCreation: paiementEnAttente.dateCreation,
        };

        await axios.post("http://localhost:5000/paiement/create", paiement);
      }

      // Mettre à jour l'historique du fournisseur spécifique
      const response = await axios.get(`http://localhost:5000/paiement/fournisseur/${selectedFournisseur}`);
      setHistoriquePaiements(response.data);

      // Réinitialiser les champs
      setSelectedFactures([]);
      setPaiementDetails({ date: paiementDetails.date });
      setModePaiement("ESPECE");
      setPaiementsEnAttente([]);
      setMontantRestant(totalMontant);

      setSnackbar({
        open: true,
        message: "Paiements effectués avec succès",
        severity: "success"
      });

    } catch (error) {
      console.error("Erreur lors de la validation des paiements :", error);
      setSnackbar({
        open: true,
        message: "Erreur lors des paiements",
        severity: "error"
      });
    }
  };
*/

/*const handleValiderPaiement = async () => {
  try {
    const paiement = {
      fournisseurId: selectedFournisseur,
      caisseId: selectedCaisse,
      facturesIds: selectedFactures,
      montantTotal: totalMontant,
      montantPaye: paiementsEnAttente.reduce((sum, p) => sum + parseFloat(p.montantChiffres || 0), 0),
      modePaiement: "MULTIPLE", // Mode de paiement multiple
      details: {
        cheques: paiementsEnAttente
          .filter(p => p.modePaiement === "CHEQUE")
          .map(cheque => ({
            numeroChèque: cheque.numeroChèque,
            montant: parseFloat(cheque.montantChiffres),
            dateEcheance: cheque.dateEcheance,
            banque: selectedBanque
          })),
        effets: paiementsEnAttente
          .filter(p => p.modePaiement === "EFFET")
          .map(effet => ({
            titreDocument: effet.titreDocument,
            montant: parseFloat(effet.montantChiffres),
            dateEcheance: effet.echeance,
            banque: selectedBanque
          })),
        especes: paiementsEnAttente
          .filter(p => p.modePaiement === "ESPECE")
          .map(espece => ({
            montant: parseFloat(espece.montantChiffres)
          }))
      },
      dateCreation: new Date().toISOString(),
    };

    await axios.post("http://localhost:5000/paiement/create", paiement);

    // Mettre à jour l'historique du fournisseur spécifique
    const response = await axios.get(`http://localhost:5000/paiement/fournisseur/${selectedFournisseur}`);
    setHistoriquePaiements(response.data);

    // Réinitialiser les champs
    setSelectedFactures([]);
    setPaiementDetails({ date: paiementDetails.date });
    setModePaiement("ESPECE");
    setPaiementsEnAttente([]);
    setMontantRestant(totalMontant);

    setSnackbar({
      open: true,
      message: "Paiements effectués avec succès",
      severity: "success"
    });

  } catch (error) {
    console.error("Erreur lors de la validation des paiements :", error);
    setSnackbar({
      open: true,
      message: "Erreur lors des paiements",
      severity: "error"
    });
  }
};*/

const handleValiderPaiement = async () => {
  try {
    // Calculer le montant total payé
    const montantTotalPaye = paiementsEnAttente.reduce(
      (sum, p) => sum + parseFloat(p.montantChiffres || 0), 
      0
    );

    const paiement = {
      fournisseurId: selectedFournisseur,
      caisseId: selectedCaisse,
      facturesIds: selectedFactures,
      montantTotal: totalMontant,
      montantPaye: montantTotalPaye,
      modePaiement: "MULTIPLE",
      details: {
        cheques: paiementsEnAttente
          .filter(p => p.modePaiement === "CHEQUE")
          .map(cheque => ({
            numeroChèque: cheque.numeroChèque,
            montant: parseFloat(cheque.montantChiffres),
            dateEcheance: cheque.dateEcheance,
            banque: selectedBanque
          })),
        effets: paiementsEnAttente
          .filter(p => p.modePaiement === "EFFET")
          .map(effet => ({
            titreDocument: effet.titreDocument,
            montant: parseFloat(effet.montantChiffres),
            dateEcheance: effet.echeance,
            banque: selectedBanque
          })),
        especes: paiementsEnAttente
          .filter(p => p.modePaiement === "ESPECE")
          .map(espece => ({
            montant: parseFloat(espece.montantChiffres)
          }))
      },
      dateCreation: new Date().toISOString(),
    };

    await axios.post("http://localhost:5000/paiement/create", paiement);

    // Réinitialiser les états après validation
    setSelectedFactures([]);
    setPaiementDetails({});
    setPaiementsEnAttente([]);
    setMontantRestant(0);
    setTotalMontant(0);


    
    setSnackbar({
      open: true,
      message: "Paiements effectués avec succès",
      severity: "success"
    });

  } catch (error) {
    console.error("Erreur lors de la validation des paiements :", error);
    setSnackbar({
      open: true,
      message: "Erreur lors des paiements",
      severity: "error"
    });
  }
};
  //les radiosBox
  const renderPaiementFields = () => {
    switch (modePaiement) {
      case "CHEQUE":
        return (
            <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Banque</InputLabel>
          <Select
            value={selectedBanque}
            onChange={handleBanqueChange}
            label="Banque"
          >
            {banques.map((banque) => (
              <MenuItem key={banque._id} value={banque._id}>
                {banque.libelle}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Code de banque"
          value={paiementDetails.codeBanque || ""}
          InputProps={{ readOnly: true }} // Champ en lecture seule
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Numéro de compte"
          value={paiementDetails.numeroCompte || ""}
          InputProps={{ readOnly: true }} // Champ en lecture seule
        />
      </Grid>
     
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Numéro de chèque"
                value={paiementDetails.numeroChèque || ""}
                onChange={(e) => setPaiementDetails({...paiementDetails, numeroChèque: e.target.value})}
              />
            </Grid>         
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Montant en chiffres"
                type="number"
                value={paiementDetails.montantChiffres || ""}
                onChange={(e) => setPaiementDetails({...paiementDetails, montantChiffres: e.target.value})}
              />
            </Grid>
      
          
          </Grid>
        );

      case "EFFET":
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Banque</InputLabel>
          <Select
            value={selectedBanque}
            onChange={handleBanqueChange}
            label="Banque"
          >
            {banques.map((banque) => (
              <MenuItem key={banque._id} value={banque._id}>
                {banque.libelle}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Code de banque"
          value={paiementDetails.codeBanque || ""}
          InputProps={{ readOnly: true }} // Champ en lecture seule
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Numéro de compte"
          value={paiementDetails.numeroCompte || ""}
          InputProps={{ readOnly: true }} // Champ en lecture seule
        />
      </Grid>
     
   
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Montant en chiffres"
                type="number"
                value={paiementDetails.montantChiffres || ""}
                onChange={(e) => setPaiementDetails({...paiementDetails, montantChiffres: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="date"
                label="Échéance"
                InputLabelProps={{ shrink: true }}
                value={paiementDetails.echeance || ""}
                onChange={(e) => setPaiementDetails({...paiementDetails, echeance: e.target.value})}
              />
            </Grid>
          </Grid>
        );

      case "ESPECE":
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} >
              <TextField
                fullWidth
                label="Montant en chiffres"
                type="number"
                value={paiementDetails.montantChiffres || ""}
                onChange={(e) => setPaiementDetails({...paiementDetails, montantChiffres: e.target.value})}
              />
            </Grid>
        
          </Grid>
        );

      default:
        return null;
    }
  };

  //restPages 
  const resetPage = () => {
    setFactures([]); // Réinitialiser les factures
    setSelectedFactures([]); // Réinitialiser les factures sélectionnées
    setTotalMontant(0); // Réinitialiser le montant total
    setMontantRestant(0); // Réinitialiser le montant restant
    setPaiementsEnAttente([]); // Réinitialiser les paiements en attente
    setPaiementDetails({}); // Réinitialiser les détails du paiement
    setHistoriquePaiements([]); // Réinitialiser l'historique des paiements
    setModePaiement("ESPECE"); // Réinitialiser le mode de paiement
    setSelectedCaisse(""); // Réinitialiser la caisse sélectionnée

  };

  // Fonction pour fermer le Snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Récupération de l'historique des paiements du fournisseur
  useEffect(() => {
    const fetchHistorique = async () => {
      if (selectedFournisseur) {
        try {
          const response = await axios.get(`http://localhost:5000/paiement/fournisseur/${selectedFournisseur}`);
          setHistoriquePaiements(response.data);
        } catch (error) {
          console.error("Erreur lors de la récupération de l'historique:", error);
        }
      }
    };
    fetchHistorique();
  }, [selectedFournisseur]); // Déclencher quand le fournisseur change


  // Modification de handleModePaiementChange
  const handleModePaiementChange = (event) => {
    const mode = event.target.value;
    if (modesPaiement.includes(mode)) {
      setModesPaiement(modesPaiement.filter(m => m !== mode));
    } else {
      setModesPaiement([...modesPaiement, mode]);
    }
  };
  // Dans le rendu, ajouter les checkboxes pour les modes de paiement
  const renderModePaiement = () => (
    <FormControl component="fieldset">
      <Typography variant="subtitle1">Mode de paiement</Typography>
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={modesPaiement.includes("ESPECE")}
              onChange={handleModePaiementChange}
              value="ESPECE"
            />
          }
          label="Espèces"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={modesPaiement.includes("CHEQUE")}
              onChange={handleModePaiementChange}
              value="CHEQUE"
            />
          }
          label="Chèque"
        />
      </FormGroup>
    </FormControl>
  );

  // Ajouter les champs pour les montants selon le mode de paiement
  const renderMontantFields = () => (
    <>
      {modesPaiement.includes("ESPECE") && (
        <TextField
          label="Montant en espèces"
          type="number"
          value={paiementDetails.montantEspeces || ""}
          onChange={(e) => setPaiementDetails({
            ...paiementDetails,
            montantEspeces: parseFloat(e.target.value)
          })}
          fullWidth
          margin="normal"
        />
      )}
      {modesPaiement.includes("CHEQUE") && (
        <>
          <TextField
            label="Montant du chèque"
            type="number"
            value={paiementDetails.montantCheque || ""}
            onChange={(e) => setPaiementDetails({
              ...paiementDetails,
              montantCheque: parseFloat(e.target.value)
            })}
            fullWidth
            margin="normal"
          />
          <TextField
            label="Numéro du chèque"
            value={paiementDetails.numeroChèque || ""}
            onChange={(e) => setPaiementDetails({
              ...paiementDetails,
              numeroChèque: e.target.value
            })}
            fullWidth
            margin="normal"
          />
        </>
      )}
    </>
  );

  const handleRetourListe = () => {
    navigate("/ListePaiements");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Créer un seul paiement avec tous les détails
      const paiementData = {
        fournisseurId: selectedFournisseur,
        caisseId: selectedCaisse,
        montantPaye: totalMontant,
        modePaiement: "MULTIPLE",
        details: {
          // Détails des chèques
          cheques: paiementsEnAttente
            .filter(p => p.modePaiement === "CHEQUE")
            .map(cheque => ({
              numeroChèque: cheque.numeroChèque,
              montant: parseFloat(cheque.montantChiffres),
              dateEcheance: cheque.dateEcheance,
              banque: selectedBanque
            })),
          // Détails des effets
          effets: paiementsEnAttente
            .filter(p => p.modePaiement === "EFFET")
            .map(effet => ({
              titreDocument: effet.titreDocument,
              montant: parseFloat(effet.montantChiffres),
              dateEcheance: effet.echeance,
              banque: selectedBanque
            })),
          // Détails des espèces
          especes: paiementsEnAttente
            .filter(p => p.modePaiement === "ESPECE")
            .map(espece => ({
              montant: parseFloat(espece.montantChiffres)
            }))
        },
        facturesIds: selectedFactures
      };

      const response = await axios.post("http://localhost:5000/paiement/ajouter", paiementData);


      // Réinitialiser le formulaire
      setSelectedFournisseur("");
      setSelectedFactures([]);
      setSelectedCaisse("");
      setPaiementsEnAttente([]);
      setPaiementDetails({});
      setSnackbar({
        open: true,
        message: "Paiement enregistré avec succès",
        severity: "success"
      });
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du paiement:", error);
      setSnackbar({
        open: true,
        message: "Erreur lors de l'enregistrement du paiement",
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
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
                      <AccountBalance sx={{ fontSize: 40, color: 'white' }} />
                    </Box>
                    <Box>
                      <Typography variant="h5" component="h1" sx={{
                        fontWeight: "bold",
                        textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                        mb: 1
                      }}>
                        Paiement Fournisseur
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9 }}>
                        Effectuer un paiement 
                      </Typography>
                    </Box>
                  </Stack>
                  <Tooltip title="Retour à la liste des paiements">
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
            {/* Section Sélection Fournisseur */}
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
                    Informations de Paiement
                  </Typography>

                  <Stack direction="row" spacing={3} alignItems="center" mb={3}>
                    {/* Fournisseur avec icône */}
                    <FormControl fullWidth sx={{ flex: 1 }}>
                      <Autocomplete
                        options={fournisseurs}
                        getOptionLabel={(option) => option.raison_sociale}
                        value={fournisseurs.find((f) => f._id === selectedFournisseur) || null}
                        onChange={(event, newValue) => {
                          setSelectedFournisseur(newValue ? newValue._id : "");
                          resetPage();
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="🏢 Sélectionner un fournisseur"
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
                      value={paiementDetails.date || ""}
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
                            <Checkbox sx={{ color: 'white' }} />
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
                          const montantPaye = facture.paiementEffectuee || 0;
                          const montantRestantFacture = Math.max(facture.montantTTC - montantPaye, 0);
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
                                    disabled={facture.statut === "paye"}
                                    sx={{
                                      color: '#495057',
                                      '&.Mui-checked': {
                                        color: '#2c3e50'
                                      }
                                    }}
                                  />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                                  {facture.numero_facture}
                                </TableCell>
                                <TableCell>{new Date(facture.date_facture).toLocaleDateString('fr-FR')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>
                                  {facture.montantTTC?.toFixed(2)} DT
                                </TableCell>
                                <TableCell sx={{ color: '#27ae60', fontWeight: 'bold' }}>
                                  {montantPaye.toFixed(2)} DT
                                </TableCell>
                                <TableCell sx={{ color: '#e74c3c', fontWeight: 'bold' }}>
                                  {montantRestantFacture.toFixed(2)} DT
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={facture.statut === "paye" ? "✅ Payée" :
                                           facture.statut === "partiellement_paye" ? "⚠️ Partielle" : "❌ Non payée"}
                                    size="small"
                                    sx={{
                                      backgroundColor: facture.statut === "paye" ? '#27ae60' :
                                                     facture.statut === "partiellement_paye" ? '#f39c12' : '#e74c3c',
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

            {/* Section Total */}
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
                  {/* Effet de brillance */}
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
                        {totalMontant.toFixed(2)} DT
                      </Typography>
                    </Box>

                    <Box sx={{ p: 2, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                        Montant Restant
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                        {montantRestant.toFixed(2)} DT
                      </Typography>
                    </Box>

                    {/* Barre de progression */}
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

            {/* Section Paiement */}
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
                    onChange={(e) => setModePaiement(e.target.value)}
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