import React, { useEffect, useState } from 'react';
import Box from "@mui/material/Box";
import InputAdornment from '@mui/material/InputAdornment';
import {
  Stack,
  FormControl,
  InputLabel,
  Select,
  Paper,
  IconButton,
  Collapse,
  Divider,
} from '@mui/material';
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { format, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Sidenav from "../navbar/Sidenav";
import Navbar from "../navbar/Navbar";
import { Bar, Line } from 'react-chartjs-2';
import Tabs from '@mui/material/Tabs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

import Tab from '@mui/material/Tab';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

// Enregistrement des composants nécessaires pour Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = styled(Card)(({ theme }) => ({
  borderRadius: '12px',
  boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
  transition: 'all 0.3s ease',
  height: '100%',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 25px 0 rgba(0,0,0,0.15)'
  }
}));

const DashboardContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  minHeight: '100vh',
  backgroundColor: '#f5f5f5',
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column'
  }
}));

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    padding: theme.spacing(2)
  }
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: '100%',
  minHeight: 300,
  [theme.breakpoints.down('sm')]: {
    minHeight: 250
  }
}));

const ModernTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
  '&:hover': {
    backgroundColor: theme.palette.action.selected,
  }
}));

function Dashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [bonsReception, setBonsReception] = useState([]);
  const [bonsLivraison, setBonsLivraison] = useState([]);
  const [articles, setArticles] = useState([]);
  const [paiement, setPaiement] = useState([]);
  const [reglement, setreglement] = useState([]);

  const [availableMonths, setAvailableMonths] = useState([]);
  const [showPaiementDetails, setShowPaiementDetails] = useState(false);
  const [paiementTableMonth, setPaiementTableMonth] = useState('');
const [activeTab, setActiveTab] = useState(0); // 0: Espèces, 1: Chèques, 2: Effets
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Fonctions pour filtrer les paiements par type
  const getEspeces = (paiements) => {
    return paiements.flatMap(p => 
      p.details?.especes?.map(e => ({
        ...e,
        type: 'Espèce',
        creationDate: p.dateCreation
      })) || []
    );
  };

  const getCheques = (paiements) => {
    return paiements.flatMap(p => 
      p.details?.cheques?.map(c => ({
        ...c,
        type: 'Chèque',
        creationDate: p.dateCreation
      })) || []
    );
  };

  const getEffets = (paiements) => {
    return paiements.flatMap(p => 
      p.details?.effets?.map(ef => ({
        ...ef,
        type: 'Effet',
        creationDate: p.dateCreation
      })) || []
    );
  };
  const paiementTableMonths = Array.from(
    new Set(paiement.map(p => p.dateCreation ? format(parseISO(p.dateCreation), 'yyyy-MM') : null).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a));

  const filteredPaiementTable = paiement.filter(p => {
    if (!paiementTableMonth) return true;
    if (!p.dateCreation) return false;
    return format(parseISO(p.dateCreation), 'yyyy-MM') === paiementTableMonth;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bonsReceptionRes, bonsLivraisonRes, articlesRes, paiementRes] = await Promise.all([
          axios.get('http://localhost:5000/achat/BEF/all'),
          axios.get('http://localhost:5000/ventes/bons-Livraison'),
          axios.get('http://localhost:5000/article/articles'),
          axios.get('http://localhost:5000/paiement/tous'),
        ]);

        setBonsReception(bonsReceptionRes.data);
        setBonsLivraison(bonsLivraisonRes.data);
        setArticles(articlesRes.data);
        setPaiement(paiementRes.data);

        const monthsSet = new Set();
        
        bonsLivraisonRes.data.forEach(bon => {
          if (bon.date) {
            const date = parseISO(bon.date);
            monthsSet.add(format(date, 'yyyy-MM'));
          }
        });
        
        paiementRes.data.forEach(paiement => {
          if (paiement.dateCreation) {
            const date = parseISO(paiement.dateCreation);
            monthsSet.add(format(date, 'yyyy-MM'));
          }
        });

        bonsReceptionRes.data.forEach(bon => {
          if (bon.dateReception) {
            const date = parseISO(bon.dateReception);
            monthsSet.add(format(date, 'yyyy-MM'));
          }
        });

        const monthsArray = Array.from(monthsSet).sort((a, b) => b.localeCompare(a));
        setAvailableMonths(monthsArray);

        if (monthsArray.length > 0 && !selectedMonth) {
          setSelectedMonth(monthsArray[0]);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données:', error);
      }
    };

    fetchData();
  }, []);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const filteredBonsLivraison = bonsLivraison.filter(bon => {
    if (!bon.dateLivraison) return false;
    const bonDate = format(parseISO(bon.dateLivraison), 'yyyy-MM');
    return bonDate === selectedMonth;
  });

  const filteredPaiement = paiement.filter(paiement => {
    if (!paiement.dateCreation) return false;
    const bonDate = format(parseISO(paiement.dateCreation), 'yyyy-MM');
    return bonDate === selectedMonth;
  });

 

  const filteredBonsReception = bonsReception.filter(bon => {
    if (!bon.dateReception) return false;
    const bonDate = format(parseISO(bon.dateReception), 'yyyy-MM');
    return bonDate === selectedMonth;
  });

  const chiffreAffaire = filteredBonsLivraison.reduce((acc, bon) => 
    acc + (bon.lignes?.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0) || 0), 0
  );

  const TotalDespaiement = filteredPaiement.reduce((acc, p) => 
    acc + (p.details?.especes?.reduce((s, e) => s + e.montant, 0) || 0) +
    (p.details?.cheques?.reduce((s, c) => s + c.montant, 0) || 0) +
    (p.details?.effets?.reduce((s, ef) => s + ef.montant, 0) || 0)
  , 0);

  const depenses = filteredBonsReception.reduce((acc, bon) => 
    acc + (bon.lignes?.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0) || 0), 0
  );

  const articlesVendus = filteredBonsLivraison.reduce((acc, bon) => 
    acc + (bon.lignes?.reduce((sum, ligne) => sum + ligne.quantite, 0) || 0), 0
  );

  const articlesAchetés = filteredBonsReception.reduce((acc, bon) => 
    acc + (bon.lignes?.reduce((sum, ligne) => sum + ligne.quantite, 0) || 0), 0
  );

  return (
    <React.Fragment>
      <Navbar />
      <Box height={550} />
      <Box sx={{ 
        display: "flex", 
        backgroundColor: "#f5f5f5",
        minHeight: "calc(100vh - 80px)",
        overflow: "hidden"
      }}>
        <DashboardContainer>
          <Sidenav />
          <MainContent>
  <Box sx={{
  display: 'flex',
  justifyContent: 'flex-end', 
  mb: 2,
  position: 'sticky',
  top: 0,
  zIndex: 8,
  backgroundColor: '#f5f5f5',
  py: 1,
  px: 2,
  borderRadius: '12px'
}}>
  <FormControl size="small" sx={{
    minWidth: 180,
    '& .MuiOutlinedInput-root': {
      borderRadius: '20px', // Bords plus arrondis
      backgroundColor: theme.palette.background.paper,
      boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
      transition: 'all 0.2s ease',
      '&:hover': {
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
      },
      '&.Mui-focused': {
        boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
      },
      '& .MuiSelect-select': {
        py: '8px',
        px: '14px',
        fontSize: '0.875rem'
      }
    },
    '& .MuiInputLabel-root': {
      transform: 'translate(14px, 9px) scale(1)',
      fontSize: '0.875rem',
      '&.Mui-focused, &.MuiInputLabel-shrink': {
        transform: 'translate(14px, -9px) scale(0.85)',
        color: theme.palette.primary.main,
      }
    }
  }}>
    <InputLabel>Période</InputLabel>
    <Select
      value={selectedMonth}
      onChange={handleMonthChange}
      label="Période"
      MenuProps={{
        PaperProps: {
          sx: {
            borderRadius: '12px',
            marginTop: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '& .MuiMenuItem-root': {
              fontSize: '0.875rem',
              padding: '8px 16px',
              minHeight: 'auto',
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
              '&.Mui-selected': {
                backgroundColor: `${theme.palette.primary.light}20`,
                fontWeight: 500
              }
            }
          }
        }
      }}
    >
      <MenuItem value="">
        <em>Toutes périodes</em>
      </MenuItem>
      {availableMonths.map((month) => (
        <MenuItem 
          key={month} 
          value={month}
          sx={{
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span>{format(parseISO(`${month}-01`), 'MMM yyyy', { locale: fr })}</span>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
              ml: 1
            }}
          >
            {format(parseISO(`${month}-01`), 'MM/yy')}
          </Typography>
        </MenuItem>
      ))}
    </Select>
  </FormControl>
</Box>
       
{/*Les Cards  */}
          <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                onClick={() => setShowPaiementDetails(!showPaiementDetails)}
                sx={{ cursor: 'pointer', border: showPaiementDetails ? '2px solid #4e73df' : 'none' }}
              >
                <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                  <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    color="text.secondary" 
                    gutterBottom
                  >
                    Paiement
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"} 
                    component="div" 
                    sx={{ fontWeight: 'light' }}
                  >
                    {TotalDespaiement.toLocaleString('fr-FR')} DT
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard>
                <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                  <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    color="text.secondary" 
                    gutterBottom
                  >
                Règlement
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"} 
                    component="div" 
                    sx={{ fontWeight: 'light' }}
                  >
                    {depenses.toLocaleString('fr-FR')} DT
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard>
                <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                  <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    color="text.secondary" 
                    gutterBottom
                  >
                    Articles vendus
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"} 
                    component="div" 
                    sx={{ fontWeight: 'light' }}
                  >
                    {articlesVendus}
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard>
                <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                  <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    color="text.secondary" 
                    gutterBottom
                  >
                    Articles Achetées
                  </Typography>
                  <Typography 
                    variant={isMobile ? "h6" : "h5"} 
                    component="div" 
                    sx={{ fontWeight: 'light' }}
                  >
                    {articlesAchetés}
                  </Typography>
                </CardContent>
              </StatCard>
            </Grid>
          </Grid>
{/*Les Charts Ventes  */}

          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                p: isMobile ? 1 : 2, 
                height: isMobile ? 350 : 400,
                display: 'flex',
                backgroundColor:'#f5f5f5' ,
                flexDirection: 'column'
              }}>
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"} 
                  gutterBottom
                  sx={{ px: isMobile ? 1 : 2, pt: isMobile ? 1 : 2 }}
                >
                  Ventes par article
                </Typography>
                <ChartContainer>
                  <Bar
                    data={{
                      labels: filteredBonsLivraison.reduce((acc, bon) => {
                        bon.lignes?.forEach(ligne => {
                          const existingArticle = acc.find(item => item.nom === ligne.article?.libelle);
                          if (existingArticle) {
                            existingArticle.quantite += ligne.quantite;
                          } else {
                            acc.push({
                              nom: ligne.article?.libelle || 'Article inconnu',
                              quantite: ligne.quantite
                            });
                          }
                        });
                        return acc;
                      }, []).map(item => item.nom),
                      datasets: [{
                        label: 'Quantité vendue',
                        data: filteredBonsLivraison.reduce((acc, bon) => {
                          bon.lignes?.forEach(ligne => {
                            const existingArticle = acc.find(item => item.nom === ligne.article?.libelle);
                            if (existingArticle) {
                              existingArticle.quantite += ligne.quantite;
                            } else {
                              acc.push({
                                nom: ligne.article?.libelle || 'Article inconnu',
                                quantite: ligne.quantite
                              });
                            }
                          });
                          return acc;
                        }, []).map(item => item.quantite),
                        backgroundColor: 'rgba(78, 115, 223, 0.8)',
                        borderColor: 'rgba(78, 115, 223, 1)',
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: isMobile ? 'bottom' : 'top',
                          labels: {
                            boxWidth: isMobile ? 12 : 40,
                            padding: isMobile ? 10 : 20,
                            font: {
                              size: isMobile ? 11 : 12
                            }
                          }
                        },
                        title: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Quantité',
                            font: {
                              size: isMobile ? 11 : 12
                            }
                          },
                          ticks: {
                            font: {
                              size: isMobile ? 10 : 11
                            }
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Articles',
                            font: {
                              size: isMobile ? 11 : 12
                            }
                          },
                          ticks: {
                            font: {
                              size: isMobile ? 10 : 11
                            },
                            maxRotation: isMobile ? 45 : 0,
                            minRotation: isMobile ? 45 : 0
                          }
                        }
                      }
                    }}
                  />
                </ChartContainer>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                p: isMobile ? 1 : 2, 
                height: isMobile ? 350 : 400,
                display: 'flex',
                backgroundColor:'#f5f5f5' ,

                flexDirection: 'column'
              }}>
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"} 
                  gutterBottom
                  sx={{ px: isMobile ? 1 : 2, pt: isMobile ? 1 : 2 }}
                >
                  Chiffre d'affaire par semaine
                </Typography>
                <ChartContainer>
                  <Line
                    data={{
                      labels: filteredBonsLivraison.reduce((acc, bon) => {
                        const date = parseISO(bon.dateLivraison);
                        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
                        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
                        const weekLabel = `Semaine du ${format(weekStart, 'dd/MM')} au ${format(weekEnd, 'dd/MM')}`;
                        
                        if (!acc.find(item => item.label === weekLabel)) {
                          acc.push({
                            label: weekLabel,
                            montant: 0
                          });
                        }
                        return acc;
                      }, []).map(item => item.label),
                      datasets: [{
                        label: 'Chiffre d\'affaire',
                        data: filteredBonsLivraison.reduce((acc, bon) => {
                          const date = parseISO(bon.dateLivraison);
                          const weekStart = startOfWeek(date, { weekStartsOn: 1 });
                          const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
                          const weekLabel = `Semaine du ${format(weekStart, 'dd/MM')} au ${format(weekEnd, 'dd/MM')}`;
                          
                          const weekData = acc.find(item => item.label === weekLabel);
                          if (weekData) {
                            weekData.montant += bon.lignes?.reduce((sum, ligne) => 
                              sum + (ligne.quantite * ligne.prix_unitaire), 0) || 0;
                          } else {
                            acc.push({
                              label: weekLabel,
                              montant: bon.lignes?.reduce((sum, ligne) => 
                                sum + (ligne.quantite * ligne.prix_unitaire), 0) || 0
                            });
                          }
                          return acc;
                        }, []).map(item => item.montant),
                        borderColor: 'rgba(78, 115, 223, 1)',
                        backgroundColor: 'rgba(78, 115, 223, 0.2)',
                        tension: 0.4,
                        fill: true
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: isMobile ? 'bottom' : 'top',
                          labels: {
                            boxWidth: isMobile ? 12 : 40,
                            padding: isMobile ? 10 : 20,
                            font: {
                              size: isMobile ? 11 : 12
                            }
                          }
                        },
                        title: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Montant (DT)',
                            font: {
                              size: isMobile ? 11 : 12
                            }
                          },
                          ticks: {
                            font: {
                              size: isMobile ? 10 : 11
                            }
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Semaines',
                            font: {
                              size: isMobile ? 11 : 12
                            }
                          },
                          ticks: {
                            font: {
                              size: isMobile ? 10 : 11
                            },
                            maxRotation: isMobile ? 45 : 0,
                            minRotation: isMobile ? 45 : 0
                          }
                        }
                      }
                    }}
                  />
                </ChartContainer>
              </Card>
            </Grid>
          </Grid>
          {/*Les Charts Achats  */}
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                p: isMobile ? 1 : 2, 
                height: isMobile ? 350 : 400,
                display: 'flex',
                backgroundColor:'#f5f5f5' ,
                flexDirection: 'column'
              }}>
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"} 
                  gutterBottom
                  sx={{ px: isMobile ? 1 : 2, pt: isMobile ? 1 : 2 }}
                >
                  Achats par article
                </Typography>
                <ChartContainer>
                  <Bar
                    data={{
                      labels: filteredBonsReception.reduce((acc, bon) => {
                        bon.lignes?.forEach(ligne => {
                          const existingArticle = acc.find(item => item.nom === ligne.article?.libelle);
                          if (existingArticle) {
                            existingArticle.quantite += ligne.quantite;
                          } else {
                            acc.push({
                              nom: ligne.article?.libelle || 'Article inconnu',
                              quantite: ligne.quantite
                            });
                          }
                        });
                        return acc;
                      }, []).map(item => item.nom),
                      datasets: [{
                        label: 'Quantité Acheté',
                        data: filteredBonsReception.reduce((acc, bon) => {
                          bon.lignes?.forEach(ligne => {
                            const existingArticle = acc.find(item => item.nom === ligne.article?.libelle);
                            if (existingArticle) {
                              existingArticle.quantite += ligne.quantite;
                            } else {
                              acc.push({
                                nom: ligne.article?.libelle || 'Article inconnu',
                                quantite: ligne.quantite
                              });
                            }
                          });
                          return acc;
                        }, []).map(item => item.quantite),
                        backgroundColor: 'rgba(78, 115, 223, 0.8)',
                        borderColor: 'rgba(78, 115, 223, 1)',
                        borderWidth: 1
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: isMobile ? 'bottom' : 'top',
                          labels: {
                            boxWidth: isMobile ? 12 : 40,
                            padding: isMobile ? 10 : 20,
                            font: {
                              size: isMobile ? 11 : 12
                            }
                          }
                        },
                        title: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Quantité',
                            font: {
                              size: isMobile ? 11 : 12
                            }
                          },
                          ticks: {
                            font: {
                              size: isMobile ? 10 : 11
                            }
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Articles',
                            font: {
                              size: isMobile ? 11 : 12
                            }
                          },
                          ticks: {
                            font: {
                              size: isMobile ? 10 : 11
                            },
                            maxRotation: isMobile ? 45 : 0,
                            minRotation: isMobile ? 45 : 0
                          }
                        }
                      }
                    }}
                  />
                </ChartContainer>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{ 
                p: isMobile ? 1 : 2, 
                height: isMobile ? 350 : 400,
                display: 'flex',
                backgroundColor:'#f5f5f5' ,

                flexDirection: 'column'
              }}>
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"} 
                  gutterBottom
                  sx={{ px: isMobile ? 1 : 2, pt: isMobile ? 1 : 2 }}
                >
                  Dépenses par semaine
                </Typography>
                <ChartContainer>
                  <Line
                    data={{
                      labels: filteredBonsReception.reduce((acc, bon) => {
                        const date = parseISO(bon.dateReception);
                        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
                        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
                        const weekLabel = `Semaine du ${format(weekStart, 'dd/MM')} au ${format(weekEnd, 'dd/MM')}`;
                        
                        if (!acc.find(item => item.label === weekLabel)) {
                          acc.push({
                            label: weekLabel,
                            montant: 0
                          });
                        }
                        return acc;
                      }, []).map(item => item.label),
                      datasets: [{
                        label: 'Dépenses',
                        data: filteredBonsReception.reduce((acc, bon) => {
                          const date = parseISO(bon.dateReception);
                          const weekStart = startOfWeek(date, { weekStartsOn: 1 });
                          const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
                          const weekLabel = `Semaine du ${format(weekStart, 'dd/MM')} au ${format(weekEnd, 'dd/MM')}`;
                          
                          const weekData = acc.find(item => item.label === weekLabel);
                          if (weekData) {
                            weekData.montant += bon.lignes?.reduce((sum, ligne) => 
                              sum + (ligne.quantite * ligne.prix_unitaire), 0) || 0;
                          } else {
                            acc.push({
                              label: weekLabel,
                              montant: bon.lignes?.reduce((sum, ligne) => 
                                sum + (ligne.quantite * ligne.prix_unitaire), 0) || 0
                            });
                          }
                          return acc;
                        }, []).map(item => item.montant),
                        borderColor: 'rgba(78, 115, 223, 1)',
                        backgroundColor: 'rgba(78, 115, 223, 0.2)',
                        tension: 0.4,
                        fill: true
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: isMobile ? 'bottom' : 'top',
                          labels: {
                            boxWidth: isMobile ? 12 : 40,
                            padding: isMobile ? 10 : 20,
                            font: {
                              size: isMobile ? 11 : 12
                            }
                          }
                        },
                        title: {
                          display: false
                        }
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Montant (DT)',
                            font: {
                              size: isMobile ? 11 : 12
                            }
                          },
                          ticks: {
                            font: {
                              size: isMobile ? 10 : 11
                            }
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Semaines',
                            font: {
                              size: isMobile ? 11 : 12
                            }
                          },
                          ticks: {
                            font: {
                              size: isMobile ? 10 : 11
                            },
                            maxRotation: isMobile ? 45 : 0,
                            minRotation: isMobile ? 45 : 0
                          }
                        }
                      }
                    }}
                  />
                </ChartContainer>
              </Card>
            </Grid>
          </Grid>
             </MainContent>
        </DashboardContainer>
      </Box>

        <Box 
        sx={{ 
          position: 'fixed',
          bottom: 0,
          left: 280,
          right: 0,
          zIndex: 1200,
          transition: 'all 0.3s ease',
          transform: showPaiementDetails ? 'translateY(0)' : 'translateY(100%)',
          boxShadow: '0 -5px 20px rgba(0, 0, 0, 0.11)',
          maxHeight: '70vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box 
          sx={{ 
            backgroundColor:  'rgba(112, 106, 136, 0.73)',
            color: theme.palette.primary.contrastText,
            p: 1,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer'
          }}
          onClick={() => setShowPaiementDetails(!showPaiementDetails)}
        >
          <Typography variant="h6" sx={{ ml: 2 }}>
            Détails des paiements
          </Typography>
          <IconButton color="inherit">
            {showPaiementDetails ? <ExpandMoreIcon /> : <ExpandLessIcon />}
          </IconButton>
        </Box>

        <Box sx={{ flex: 1, overflow: 'auto', backgroundColor: 'background.paper' }}>
          <Box sx={{ p: 2 }}>
            <FormControl size="small" sx={{ 
  minWidth: 200, 
  mb: 2,
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    backgroundColor: theme.palette.background.paper,
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    },
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${theme.palette.primary.light}`,
    }
  },
  '& .MuiSelect-select': {
    padding: '10px 14px',
    display: 'flex',
    alignItems: 'center'
  },
  '& .MuiInputLabel-root': {
    transform: 'translate(14px, 10px) scale(1)',
    '&.MuiInputLabel-shrink': {
      transform: 'translate(14px, -9px) scale(0.75)',
      backgroundColor: theme.palette.background.paper,
      padding: '0 4px',
      borderRadius: '4px'
    }
  }
}}>
  <InputLabel 
    sx={{
      color: theme.palette.text.secondary,
      '&.Mui-focused': {
        color: theme.palette.primary.main,
      }
    }}
  >
    Filtrer par mois
  </InputLabel>
  <Select
    value={paiementTableMonth}
    onChange={e => setPaiementTableMonth(e.target.value)}
    label="Filtrer par mois"
    MenuProps={{
      PaperProps: {
        sx: {
          borderRadius: '12px',
          marginTop: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
          '& .MuiMenuItem-root': {
            padding: '10px 16px',
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            },
            '&.Mui-selected': {
              backgroundColor: `${theme.palette.primary.light}20`,
              '&:hover': {
                backgroundColor: `${theme.palette.primary.light}30`,
              }
            }
          }
        }
      }
    }}
  >
    <MenuItem value="" sx={{ color: theme.palette.text.secondary }}>
      <em>Tous les mois</em>
    </MenuItem>
    {paiementTableMonths.map(month => (
      <MenuItem 
        key={month} 
        value={month}
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          '&:not(:last-child)': {
            borderBottom: `1px solid ${theme.palette.divider}`
          }
        }}
      >
        <span>{format(parseISO(`${month}-01`), 'MMMM yyyy', { locale: fr })}</span>
        <Typography 
          variant="caption" 
          sx={{ 
            color: theme.palette.text.secondary,
            ml: 1 
          }}
        >
          {format(parseISO(`${month}-01`), 'MM/yyyy')}
        </Typography>
      </MenuItem>
    ))}
  </Select>
</FormControl>

            {/* Onglets */}
            <Paper elevation={0} sx={{ mb: 2, borderRadius: 1 }}>
              <Tabs 
                value={activeTab} 
                onChange={handleTabChange} 
                variant="fullWidth"
                indicatorColor="secondary"
                textColor="secondary"
              >
                <Tab label="Espèces" />
                <Tab label="Chèques" />
                <Tab label="Effets" />
              </Tabs>
            </Paper>

            {/* Contenu des onglets */}
            <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: '50vh' }}>
                <Table stickyHeader size="small" aria-label="Détails des paiements">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>Montant</TableCell>
                      {activeTab == 2 && (
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>Date d'échéance</TableCell>
                      )}
                      <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>Date </TableCell>
                      {activeTab === 1 && (
                        <TableCell sx={{ fontWeight: 'bold', backgroundColor: theme.palette.grey[100] }}>Banque</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPaiementTable.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={activeTab === 0 ? 3 : activeTab === 1 ? 5 : 4} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">
                            Aucun paiement trouvé pour ce mois
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      (() => {
                        let data = [];
                        switch(activeTab) {
                          case 0: // Espèces
                            data = getEspeces(filteredPaiementTable);
                            return data.map((e, i) => (
                              <ModernTableRow key={`espece-${i}`}>
                                <TableCell>Espèce</TableCell>
                                <TableCell>{e.montant.toLocaleString('fr-FR')} DT</TableCell>
                                <TableCell>
                                  {e.creationDate ? format(parseISO(e.creationDate), 'dd/MM/yyyy') : '-'}
                                </TableCell>
                              </ModernTableRow>
                            ));
                          case 1: // Chèques
                            data = getCheques(filteredPaiementTable);
                            return data.map((c, i) => (
                              <ModernTableRow key={`cheque-${i}`}>
                                <TableCell>Chèque</TableCell>
                                <TableCell>{c.montant.toLocaleString('fr-FR')} DT</TableCell>
                                <TableCell>
                                  {c.creationDate ? format(parseISO(c.creationDate), 'dd/MM/yyyy') : '-'}
                                </TableCell>
                                <TableCell>
                                  {c.banque ? c.banque.libelle : '-'}
                                </TableCell>
                              </ModernTableRow>
                            ));
                          case 2: // Effets
                            data = getEffets(filteredPaiementTable);
                            return data.map((ef, i) => (
                              <ModernTableRow key={`effet-${i}`}>
                                <TableCell>Effet</TableCell>
                                <TableCell>{ef.montant.toLocaleString('fr-FR')} DT</TableCell>
                                <TableCell>
                                  {ef.dateEcheance ? format(parseISO(ef.dateEcheance), 'dd/MM/yyyy') : '-'}
                                </TableCell>
                                <TableCell>
                                  {ef.creationDate ? format(parseISO(ef.creationDate), 'dd/MM/yyyy') : '-'}
                                </TableCell>
                              </ModernTableRow>
                            ));
                          default:
                            return null;
                        }
                      })()
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Box>
      </Box>
    </React.Fragment>
  );
}

export default Dashboard;