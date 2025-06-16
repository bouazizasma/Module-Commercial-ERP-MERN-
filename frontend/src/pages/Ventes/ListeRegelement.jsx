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
  Tooltip,
  Chip,
  Fade,
  InputAdornment,
} from "@mui/material";
import {
  AccountBalance,
  Payment,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Receipt,
  MonetizationOn,
  CheckCircle,
  Business as BusinessIcon,
  Search as SearchIcon,
  Add as AddIcon,
  CalendarToday as CalendarTodayIcon,
  AccountBalanceWallet as WalletIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Composant pour la ligne détaillée
const Row = ({ reglement }) => {
  const [open, setOpen] = useState(false);

  // Montant Total = Montant Restant du règlement précédent (déjà calculé côté backend)
  const montantTotal = reglement.montantTotal || 0;

  // Montant Payé = Montant payé pour ce règlement
  const montantPaye = reglement.montantPaye || 0;

  // Montant Restant = Montant Total - Montant Payé
  const montantRestant = montantTotal - montantPaye;

  return (
    <>
      <TableRow sx={{
        '& > *': { borderBottom: 'unset' },
        '&:nth-of-type(odd)': {
          backgroundColor: '#f8f9fa',
        },
        '&:hover': {
          backgroundColor: '#e3f2fd',
          transform: 'scale(1.01)',
          transition: 'all 0.2s ease'
        },
        transition: 'all 0.2s ease'
      }}>
        <TableCell sx={{ fontWeight: 'medium' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarTodayIcon sx={{ fontSize: 16, color: '#2c3e50' }} />
            {new Date(reglement.dateCreation).toLocaleDateString()}
          </Stack>
        </TableCell>
        <TableCell sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <BusinessIcon sx={{ fontSize: 16, color: '#2c3e50' }} />
            {reglement.clientId?.nom_prenom || '-'}
          </Stack>
        </TableCell>
        <TableCell sx={{ fontWeight: 'bold', color: '#95a5a6' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            {reglement.montantPaye?.toFixed(2)} DT
          </Stack>
        </TableCell>
        <TableCell sx={{ fontWeight: 'medium' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <WalletIcon sx={{ fontSize: 16, color: '#2c3e50' }} />
            {reglement.caisseId?.libelle || '-'}
          </Stack>
        </TableCell>
        <TableCell>
          <Tooltip title={open ? "Masquer les détails" : "Voir les détails"}>
            <IconButton
              size="small"
              onClick={() => setOpen(!open)}
              sx={{
                color: '#2c3e50',
                '&:hover': {
                  backgroundColor: '#e3f2fd',
                  transform: 'scale(1.1)',
                  color: '#34495e'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{
              margin: 1,
              p: 2,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
            }}>
              <Typography variant="h6" gutterBottom component="div" sx={{
                fontWeight: 'bold',
                color: '#2c3e50',
                mb: 3
              }}>
                Détails du règlement
              </Typography>
              <Grid container spacing={3}>
                {/* Détails des chèques */}
                {reglement.details?.cheques?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(149, 165, 166, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
                      }
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                          <MonetizationOn sx={{ color: '#95a5a6' }} />
                          <Typography variant="subtitle1" sx={{
                            fontWeight: 'bold',
                            color: '#2c3e50'
                          }}>
                            Paiements par chèque
                          </Typography>
                        </Stack>
                        <Box sx={{ mt: 1 }}>
                          {reglement.details.cheques.map((cheque, idx) => (
                            <Typography key={idx} variant="body2">
                              • Chèque N° {cheque.numeroCheque} - {cheque.montant.toFixed(2)} DT
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
                {reglement.details?.effets?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(52, 73, 94, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
                      }
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                          <Receipt sx={{ color: '#2c3e50' }} />
                          <Typography variant="subtitle1" sx={{
                            fontWeight: 'bold',
                            color: '#2c3e50'
                          }}>
                            Paiements par effet
                          </Typography>
                        </Stack>
                        <Box sx={{ mt: 1 }}>
                          {reglement.details.effets.map((effet, idx) => (
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
                {reglement.details?.especes?.length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Card sx={{
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(76, 175, 80, 0.2)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
                      }
                    }}>
                      <CardContent sx={{ p: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                          <Payment sx={{ color: '#4caf50' }} />
                          <Typography variant="subtitle1" sx={{
                            fontWeight: 'bold',
                            color: '#2c3e50'
                          }}>
                            Paiements en espèces
                          </Typography>
                        </Stack>
                        <Box sx={{ mt: 1 }}>
                          {reglement.details.especes.map((espece, idx) => (
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
                  <Card sx={{
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                    border: '1px solid rgba(52, 73, 94, 0.2)',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
                    }
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <CheckCircle sx={{ color: '#4caf50' }} />
                        <Typography variant="subtitle1" sx={{
                          fontWeight: 'bold',
                          color: '#2c3e50'
                        }}>
                          Factures concernées
                        </Typography>
                      </Stack>
                      <Box sx={{ mt: 1 }}>
                        {reglement.facturesIds?.map((facture, idx) => (
                          <Typography key={idx} variant="body2" sx={{ mb: 0.5, color: '#666' }}>
                            • N° {facture.numero} ({facture.total_ttc?.toFixed(2)} DT)
                          </Typography>
                        ))}
                        <Divider sx={{ my: 2, background: 'linear-gradient(90deg, #95a5a6, #7f8c8d)' }} />
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                          <Typography variant="body2" sx={{ color: '#666', fontWeight: 'medium' }}>
                            Montant Total:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2c3e50' }}>
                            {montantTotal.toFixed(2)} DT
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                          <Typography variant="body2" sx={{ color: '#666', fontWeight: 'medium' }}>
                            Montant Payé:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                            {montantPaye.toFixed(2)} DT
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" sx={{ mt: 0.5 }}>
                          <Typography variant="body2" sx={{ color: '#666', fontWeight: 'medium' }}>
                            Montant Restant:
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#e74c3c' }}>
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

export default function ListeRegelement() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [historiqueReglements, setHistoriqueReglements] = useState([]);
  const [tousLesReglements, setTousLesReglements] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Récupération des clients
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get("http://localhost:5000/client/clients");
        setClients(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des clients:", error);
      }
    };
    fetchClients();
  }, []);

  // Récupération de tous les règlements au chargement de la page
  useEffect(() => {
    const fetchTousLesReglements = async () => {
      try {
        const response = await axios.get("http://localhost:5000/ReglementClient/tous");
        setTousLesReglements(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération de tous les règlements:", error);
      }
    };
    fetchTousLesReglements();
  }, []);

  // Récupération de l'historique des règlements du client sélectionné
  useEffect(() => {
    const fetchHistorique = async () => {
      if (selectedClient) {
        try {
          const response = await axios.get(`http://localhost:5000/ReglementClient/client/${selectedClient}`);
          setHistoriqueReglements(response.data);
        } catch (error) {
          console.error("Erreur lors de la récupération de l'historique:", error);
        }
      } else {
        setHistoriqueReglements([]);
      }
    };
    fetchHistorique();
  }, [selectedClient]);

  const handleNouveauReglement = () => {
    navigate("/ReglementClient");
  };

  // Détermine les règlements à afficher
  const reglementsAAfficher = selectedClient ? historiqueReglements : tousLesReglements;

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
            backgroundColor: "#f8f9fa"
          },
          "&::-webkit-scrollbar-thumb": {
            borderRadius: "4px",
            backgroundColor: "#95a5a6"
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f8f9fa"
          }
        }}>
          <Grid container spacing={3}>
            {/* En-tête modernisé */}
            <Grid item xs={12}>
              <Fade in={true} timeout={800}>
                <Card sx={{
                  p: 3,
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                  }
                }}>
                  {/* Header principal moderne */}
                  <Box sx={{
                    textAlign: 'center',
                    mb: 4,
                    p: 3,
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    color: 'white'
                  }}>
                    <Payment sx={{ fontSize: 48, mb: 2 }} />
                    <Typography variant="h5" sx={{
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                      mb: 1
                    }}>
                      Liste des Règlements Clients
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                      Consultez et gérez tous vos règlements clients
                    </Typography>
                  </Box>

                  {/* Bouton d'action moderne */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<AddIcon />}
                      onClick={handleNouveauReglement}
                      sx={{
                        background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                        color: 'white',
                        px: 4,
                        py: 2,
                        borderRadius: 3,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        boxShadow: '0 8px 25px rgba(149, 165, 166, 0.4)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #7f8c8d 0%, #95a5a6 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 12px 35px rgba(149, 165, 166, 0.5)'
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Effectuer un Règlement
                    </Button>
                  </Box>

                  {/* Section Filtres modernisée */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SearchIcon sx={{
                      fontSize: 32,
                      mr: 2,
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      borderRadius: '50%',
                      p: 1,
                      color: 'white'
                    }} />
                    <Typography variant="h5" sx={{
                      fontWeight: 'bold',
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      Filtres de Recherche
                    </Typography>
                  </Box>

                  {/* Sélection du client modernisée */}
                  <Autocomplete
                    options={clients}
                    getOptionLabel={(option) => option.nom_prenom}
                    value={clients.find((c) => c._id === selectedClient) || null}
                    onChange={(event, newValue) => {
                      setSelectedClient(newValue ? newValue._id : "");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Filtrer par client"
                        placeholder="Sélectionner un client pour filtrer"
                        variant="outlined"
                        sx={{
                          backgroundColor: 'white',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            '&:hover': {
                              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.15)'
                            }
                          }
                        }}
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment position="start">
                              <BusinessIcon sx={{ color: '#2c3e50', fontSize: 20 }} />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Card>
              </Fade>
            </Grid>

            {/* Tableau des règlements modernisé */}
            <Grid item xs={12}>
              <Fade in={true} timeout={1000}>
                <Card sx={{
                  borderRadius: 3,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.15)'
                  }
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h5" sx={{
                      fontWeight: 'bold',
                      color: '#2c3e50',
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      <Receipt sx={{ mr: 2, color: '#95a5a6' }} />
                      Historique des Règlements ({reglementsAAfficher.length})
                    </Typography>

                    <TableContainer component={Paper} sx={{
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      overflow: 'hidden'
                    }}>
                      <Table>
                        <TableHead sx={{
                          background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)'
                        }}>
                          <TableRow>
                            <TableCell sx={{
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '1rem'
                            }}>
                              Date
                            </TableCell>
                            <TableCell sx={{
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '1rem'
                            }}>
                              Client
                            </TableCell>
                            <TableCell sx={{
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '1rem'
                            }}>
                              Montant
                            </TableCell>
                            <TableCell sx={{
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '1rem'
                            }}>
                              Caisse
                            </TableCell>
                            <TableCell sx={{
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '1rem'
                            }}>
                              Actions
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {reglementsAAfficher
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((reglement, index) => (
                              <Row key={index} reglement={reglement} />
                            ))}
                        </TableBody>
                      </Table>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={reglementsAAfficher.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        sx={{
                          borderTop: '1px solid #e0e0e0',
                          backgroundColor: '#f8f9fa'
                        }}
                      />
                    </TableContainer>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </>
  );
}