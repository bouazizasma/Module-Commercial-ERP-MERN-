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
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du bénéficiaire"
                value={paiementDetails.beneficiaire || ""}
                onChange={(e) => setPaiementDetails({...paiementDetails, beneficiaire: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lieu"
                value={paiementDetails.lieu || ""}
                onChange={(e) => setPaiementDetails({...paiementDetails, lieu: e.target.value})}
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
                label="Titre du document"
                value={paiementDetails.titreDocument || ""}
                onChange={(e) => setPaiementDetails({...paiementDetails, titreDocument: e.target.value})}
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
                label="Nom du bénéficiaire"
                value={paiementDetails.beneficiaire || ""}
                onChange={(e) => setPaiementDetails({...paiementDetails, beneficiaire: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom du tiré"
                value={paiementDetails.tire || ""}
                onChange={(e) => setPaiementDetails({...paiementDetails, tire: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lieu"
                value={paiementDetails.lieu || ""}
                onChange={(e) => setPaiementDetails({...paiementDetails, lieu: e.target.value})}
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
                label="Nom du bénéficiaire"
                value={paiementDetails.beneficiaire || ""}
                onChange={(e) => setPaiementDetails({...paiementDetails, beneficiaire: e.target.value})}
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
            {/* Section Sélection Fournisseur */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <AccountBalance sx={{ fontSize: 40, color: "#1976d2" }} />
                    <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
                      Paiement Fournisseur
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
                  {/*Fournisseur */}
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
                          label="Sélectionner un fournisseur"
                          variant="outlined"
                        />
                      )}
                    />
                  </FormControl>
                  {/* Caisse*/}
                  <FormControl fullWidth sx={{ flex: 1 }}>
                    <Autocomplete
                      options={caisses} // Liste des caisses
                      getOptionLabel={(option) => option.libelle} // Afficher le libellé de la caisse
                      value={caisses.find((c) => c._id === selectedCaisse) || null} // Valeur sélectionnée
                      onChange={(event, newValue) => {
                        setSelectedCaisse(newValue ? newValue._id : ""); // Mettre à jour l'état de la caisse sélectionnée
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Sélectionner une caisse"
                          variant="outlined"
                        />
                      )}
                    />
                  </FormControl>
                  {/*Date*/}
                  <TextField
                    fullWidth
                    type="date"
                    label="Date"
                    InputLabelProps={{ shrink: true }}
                    value={paiementDetails.date || ""}
                    onChange={(e) => setPaiementDetails({...paiementDetails, date: e.target.value})}
                    sx={{ flex: 1 }}
                  />
                </Stack>
              </Card>
            </Grid>

            {/* Section Liste des Factures */}
            <Grid item xs={12} md={8}>
              <Card sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Liste des Factures
                </Typography>
                <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell padding="checkbox">
              <Checkbox />
            </TableCell>
            <TableCell>N° Facture</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Montant TTC</TableCell>
            <TableCell>Montant Payé</TableCell>
            <TableCell>Montant Restant</TableCell>
            <TableCell>Statut</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {factures.map((facture) => {
            const montantPaye = facture.paiementEffectuee || 0;
            const montantRestantFacture = Math.max(facture.montantTTC - montantPaye, 0); // Assure que le montant restant n'est pas négatif
            return (
              <TableRow key={facture._id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedFactures.includes(facture._id)}
                    onChange={() => handleFactureSelection(facture._id)}
                    disabled={facture.statut === "paye"}
                  />
                </TableCell>
                <TableCell>{facture.numero_facture}</TableCell>
                <TableCell>{new Date(facture.date_facture).toLocaleDateString()}</TableCell>
                <TableCell>{facture.montantTTC?.toFixed(2)} DT</TableCell>
                <TableCell>{montantPaye.toFixed(2)} DT</TableCell>
                <TableCell>{montantRestantFacture.toFixed(2)} DT</TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: facture.statut === "paye" ? "success.main" :
                             facture.statut === "partiellement_paye" ? "warning.main" : "error.main"
                    }}
                  >
                    {facture.statut === "paye" ? "Payée" :
                     facture.statut === "partiellement_paye" ? "P payée" : "Non payée"}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
              </Card>
            </Grid>

            {/* Section Total */}
          {/*  <Grid item xs={12} md={4}>
              <Card sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Récapitulatif
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Total TTC: {totalMontant.toFixed(2)} DT
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Montant Restant: {montantRestant.toFixed(2)} DT
                </Typography>
              </Card>
            </Grid> */}

            {/* Section Paiement */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Mode de Paiement
                </Typography>
                <RadioGroup
                  row
                  value={modePaiement}
                  onChange={(e) => setModePaiement(e.target.value)}
                >
                  <FormControlLabel value="ESPECE" control={<Radio />} label="Espèce" />
                  <FormControlLabel value="CHEQUE" control={<Radio />} label="Chèque" />
                  <FormControlLabel value="EFFET" control={<Radio />} label="Effet" />
                </RadioGroup>
                <Box sx={{ mt: 2 }}>
                  {renderPaiementFields()}
                </Box>
                <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={handleAjoutPaiement}
                  >
                    OK
                  </Button>
                </Stack>
              </Card>
            </Grid>

            {/* Liste des paiements en attente */}
            {paiementsEnAttente.length > 0 && (
              <Grid item xs={12}>
                <Card sx={{ p: 2, borderRadius: 2, mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
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
                            <TableCell>{paiement.montantChiffres ? parseFloat(paiement.montantChiffres).toFixed(2) : '0.00'} DT</TableCell>
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

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}