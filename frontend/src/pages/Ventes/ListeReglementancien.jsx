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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Autocomplete,
  TextField,
  FormControl,
  Collapse,
  IconButton,
  TablePagination,
  Divider,
} from "@mui/material";
import { 
  AccountBalance, 
  Payment, 
  KeyboardArrowDown, 
  KeyboardArrowUp,
  Receipt,
  MonetizationOn,
  CheckCircle,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Composant pour la ligne détaillée
const Row = ({ paiement }) => {
  const [open, setOpen] = useState(false);

  // Montant Total = Montant Restant du paiement précédent (déjà calculé côté backend)
  const montantTotal = paiement.montantTotal || 0;

  // Montant Payé = Montant payé pour ce paiement
  const montantPaye = paiement.montantPaye || 0;

  // Montant Restant = Montant Total - Montant Payé
  const montantRestant = montantTotal - montantPaye;

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          {new Date(paiement.dateCreation).toLocaleDateString()}
        </TableCell>
        <TableCell>{paiement.fournisseurId?.raison_sociale || '-'}</TableCell>
        <TableCell>{paiement.montantPaye?.toFixed(2)} DT</TableCell>
        <TableCell>{paiement.caisseId?.libelle || '-'}</TableCell>
        <TableCell>
          <IconButton
            size="small"
            onClick={() => setOpen(!open)}
            sx={{ color: 'primary.main' }}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Détails du paiement
              </Typography>
              <Grid container spacing={2}>
                {/* Détails des chèques */}
                {paiement.details?.cheques?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <MonetizationOn color="primary" />
                          <Typography variant="subtitle1">
                            Paiements par chèque
                          </Typography>
                        </Stack>
                        <Box sx={{ mt: 1 }}>
                          {paiement.details.cheques.map((cheque, idx) => (
                            <Typography key={idx} variant="body2">
                              • Chèque N° {cheque.numeroChèque} - {cheque.montant.toFixed(2)} DT
                              <br />
                              &nbsp;&nbsp;&nbsp;&nbsp;Banque: {cheque.banque?.libelle || '-'} - Échéance: {new Date(cheque.dateEcheance).toLocaleDateString()}
                            </Typography>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Détails des effets */}
                {paiement.details?.effets?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Receipt color="primary" />
                          <Typography variant="subtitle1">
                            Paiements par effet
                          </Typography>
                        </Stack>
                        <Box sx={{ mt: 1 }}>
                          {paiement.details.effets.map((effet, idx) => (
                            <Typography key={idx} variant="body2">
                              • Effet N° {effet.titreDocument} - {effet.montant.toFixed(2)} DT
                              <br />
                              &nbsp;&nbsp;&nbsp;&nbsp;Banque: {effet.banque?.libelle || '-'} - Échéance: {new Date(effet.dateEcheance).toLocaleDateString()}
                            </Typography>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Détails des espèces */}
                {paiement.details?.especes?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Payment color="primary" />
                          <Typography variant="subtitle1">
                            Paiements en espèces
                          </Typography>
                        </Stack>
                        <Box sx={{ mt: 1 }}>
                          {paiement.details.especes.map((espece, idx) => (
                            <Typography key={idx} variant="body2">
                              • {espece.montant.toFixed(2)} DT
                            </Typography>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Factures concernées */}
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CheckCircle color="primary" />
                        <Typography variant="subtitle1">
                          Factures concernées
                        </Typography>
                      </Stack>
                      <Box sx={{ mt: 1 }}>
                        {paiement.facturesIds?.map((facture, idx) => (
                          <Typography key={idx} variant="body2">
                            • N° {facture.numero_facture} ({facture.montantTTC?.toFixed(2)} DT)
                          </Typography>
                        ))}
                        <Divider sx={{ my: 1 }} />
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Montant Total:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {montantTotal.toFixed(2)} DT
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Montant Payé:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="success.main">
                            {montantPaye.toFixed(2)} DT
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            Montant Restant:
                          </Typography>
                          <Typography variant="body2" fontWeight="bold" color="error.main">
                            {montantRestant.toFixed(2)} DT
                          </Typography>
                        </Stack>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
};

export default function ListeDesReglements() {
  const navigate = useNavigate();
  const [fournisseurs, setFournisseurs] = useState([]);
  const [selectedFournisseur, setSelectedFournisseur] = useState("");
  const [historiquePaiements, setHistoriquePaiements] = useState([]);
  const [tousLesPaiements, setTousLesPaiements] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Récupération des clients
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

  // Récupération de tous les paiements au chargement de la page
  useEffect(() => {
    const fetchTousLesPaiements = async () => {
      try {
        const response = await axios.get("http://localhost:5000/paiement/tous");
        setTousLesPaiements(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération de tous les paiements:", error);
      }
    };
    fetchTousLesPaiements();
  }, []);

  // Récupération de l'historique des paiements du fournisseur sélectionné
  useEffect(() => {
    const fetchHistorique = async () => {
      if (selectedFournisseur) {
        try {
          const response = await axios.get(`http://localhost:5000/paiement/fournisseur/${selectedFournisseur}`);
          setHistoriquePaiements(response.data);
        } catch (error) {
          console.error("Erreur lors de la récupération de l'historique:", error);
        }
      } else {
        setHistoriquePaiements([]);
      }
    };
    fetchHistorique();
  }, [selectedFournisseur]);

  const handleNouveauPaiement = () => {
    navigate("/PaiementFournisseur");
  };

  // Détermine les paiements à afficher
  const paiementsAAfficher = selectedFournisseur ? historiquePaiements : tousLesPaiements;

  // Gestion de la pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
            {/* En-tête */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={3}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Payment sx={{ fontSize: 40, color: "#1976d2" }} />
                    <Typography variant="h4" component="h1" sx={{ fontWeight: "bold" }}>
                      Liste des Paiements
                    </Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<Payment />}
                    onClick={handleNouveauPaiement}
                    sx={{ 
                      borderRadius: 2,
                      textTransform: 'none',
                      px: 3
                    }}
                  >
                    Effectuer un Paiement
                  </Button>
                </Stack>

                {/* Sélection du fournisseur */}
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <Autocomplete
                    options={fournisseurs}
                    getOptionLabel={(option) => option.raison_sociale}
                    value={fournisseurs.find((f) => f._id === selectedFournisseur) || null}
                    onChange={(event, newValue) => {
                      setSelectedFournisseur(newValue ? newValue._id : "");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Filtrer par fournisseur"
                        placeholder="Sélectionner un fournisseur pour filtrer"
                        variant="outlined"
                      />
                    )}
                  />
                </FormControl>
              </Card>
            </Grid>

            {/* Tableau des paiements */}
            <Grid item xs={12}>
              <Card sx={{ p: 2, borderRadius: 2 }}>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Fournisseur</TableCell>
                        <TableCell>Montant</TableCell>
                        <TableCell>Caisse</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paiementsAAfficher
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((paiement, index) => (
                          <Row key={index} paiement={paiement} />
                        ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={paiementsAAfficher.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableContainer>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}