import React, { useState, useEffect } from 'react';
import {
  InputAdornment,
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Badge,
  Pagination,
  Stack,
  Fade,
  Zoom,
  Slide,
  useTheme
} from '@mui/material';
import {
  Search,
  Add,
  ArrowUpward,
  ArrowDownward,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Inventory,
  Warehouse,
  ExitToApp,
  Input,
  ArrowOutward as ArrowOutwardIcon,
  TrendingUp,
  Timeline,
  History,
  ExpandMore,
  LocalShipping,
  CheckCircle,
  PendingActions,
  TrendingDown as TrendingDownIcon,
  CallReceived as CallReceivedIcon,
  Clear
} from '@mui/icons-material';
import axios from 'axios';
import Sidenav from "../../navbar/Sidenav";
import Navbar from "../../navbar/Navbar";
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
} from 'chart.js';

// Enregistrement des composants nécessaires pour Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ChartTooltip,
  Legend,
  ArcElement
);

// Ajout des animations CSS
const globalStyles = `
  @keyframes pulse {
    0% { opacity: 0.8; }
    50% { opacity: 1; }
    100% { opacity: 0.8; }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes shimmer {
    0% { background-position: -200px 0; }
    100% { background-position: calc(200px + 100%) 0; }
  }
`;

// Injection des styles globaux
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = globalStyles;
  document.head.appendChild(styleSheet);
}

const getStockStatus = (article) => {
  const quantite = article.Nombre_unite;
  const quantiteMin = article.quantiteMin || 0; 
  if (quantite === 0) return { label: 'Épuisé', color: 'error' };
  if (quantite <= quantiteMin) return { label: 'Stock bas', color: 'warning' };
  return { label: 'En stock', color: 'success' };
};
const ConsulterStock = () => {
  const [articles, setArticles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mouvements, setMouvements] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [periode, setPeriode] = useState('7j'); // '7j', '1m' ou '1a'
  const [chartData, setChartData] = useState(null);
  const [bonsReception, setBonsReception] = useState([]);
  const [bonsLivraison, setBonsLivraison] = useState([]);
  const [selectedBon, setSelectedBon] = useState(null);
  const [page, setPage] = useState(1);
  // Pagination séparée pour chaque section
  const [articlesPage, setArticlesPage] = useState(1);
  const [receptionPage, setReceptionPage] = useState(1);
  const [livraisonPage, setLivraisonPage] = useState(1);
  const [chartKey, setChartKey] = useState(0);

  // Tri des articles
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const itemsPerPage = 6;

  useEffect(() => {
    fetchArticles();
    fetchBonsReception();
    fetchBonsLivraison();
    fetchMouvements();
    setChartKey(prev => prev + 1); 
  }, [periode]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get('http://localhost:5000/article/articles');
      setArticles(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des articles:', error);
    }
  };

  const fetchBonsReception = async () => {
    try {
      const response = await axios.get('http://localhost:5000/achat/BEF/all');
      setBonsReception(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des bons de réception:', error);
    }
  };

  const fetchBonsLivraison = async () => {
    try {
      const response = await axios.get('http://localhost:5000/ventes/bons-Livraison');
      setBonsLivraison(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des bons de Livraison:', error);
    }
  };
  
  const fetchMouvements = async () => {
    try {
      const response = await axios.get('http://localhost:5000/stock/mouvements');
      setMouvements(response.data);
      prepareChartData(response.data); // Préparez les données du graphique
    } catch (error) {
      console.error('Erreur lors de la récupération des mouvements:', error);
    }
  };

  const prepareChartData = (mouvementsData) => {
    const filteredData = filterDataByPeriod(mouvementsData);
    const labels = filteredData.map(m => new Date(m.date).toLocaleDateString());
    const entreeData = filteredData.map(m => m.type === 'entree' ? m.quantite : 0);
    const sortieData = filteredData.map(m => m.type === 'sortie' ? m.quantite : 0);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Entrées',
          data: entreeData,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.1,
          fill: true
        },
        {
          label: 'Sorties',
          data: sortieData,
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          tension: 0.1,
          fill: true
        }
      ]
    });
  };
  
  // Fonction de tri
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Fonction de filtrage et tri des articles
  const getFilteredAndSortedArticles = () => {
    let filtered = articles.filter(article =>
      article.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (article.quantiteMin && article.quantiteMin.toString().includes(searchTerm)) ||
      (article.quantiteMax && article.quantiteMax.toString().includes(searchTerm)) ||
      (article.Nombre_unite && article.Nombre_unite.toString().includes(searchTerm))
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Gestion des valeurs nulles/undefined
        if (aValue == null) aValue = 0;
        if (bValue == null) bValue = 0;

        // Conversion en nombres pour les champs numériques
        if (['quantiteMin', 'quantiteMax', 'Nombre_unite'].includes(sortConfig.key)) {
          aValue = Number(aValue) || 0;
          bValue = Number(bValue) || 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  };

  const filteredArticles = getFilteredAndSortedArticles();

  // Pagination pour les articles
  const paginatedArticles = filteredArticles.slice(
    (articlesPage - 1) * itemsPerPage,
    articlesPage * itemsPerPage
  );

  // Statistiques
  const totalArticles = articles.length;
  const totalTTCPARBonDeReception = articles.reduce((acc, art) => acc + (art.quantite * art.prix_unitaire), 0);
  const totalTTCPARBonDeLivraison = articles.reduce((acc, art) => acc + (art.quantite * art.prix_unitaire), 0);
  const totalStock = articles.reduce((acc, a) => acc + (a.Nombre_unite || 0), 0);
  const outOfStock = articles.filter(a => a.Nombre_unite === 0).length;
  const lowStock = articles.filter(a => a.Nombre_unite <= a.quantiteMin && a.Nombre_unite !== 0).length;
  const InStock = articles.filter(a => a.Nombre_unite > a.quantiteMin).length;

  const dernierMouvement = mouvements[0] ? new Date(mouvements[0].date).toLocaleDateString() : 'Aucun';

  const handlePageChange = (event, value) => {
    setPage(value);
    setSelectedBon(null);
  };

  const paginatedBons = bonsReception.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  const paginatedBonsLivraison = bonsLivraison.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );
  
  const filterDataByPeriod = (data) => {
    const now = new Date();
    let startDate = new Date();

    switch(periode) {
      case '7j':
        startDate.setDate(now.getDate() - 7);
        break;
      case '1m':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '1a':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }

    return data.filter(item => new Date(item.date) >= startDate);
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
                    <Inventory sx={{ fontSize: 40, color: 'white' }} />
                  </Box>
                  <Box>
                    <Typography variant="h5" component="h1" sx={{
                      fontWeight: "bold",
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                      mb: 1
                    }}>
                      Consultation du Stock
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.9 }}>
                      Gestion et suivi des stocks en temps réel
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Fade>

          <Fade in={true} timeout={1000}>
            <Tabs
              value={selectedTab}
              onChange={(e, newValue) => setSelectedTab(newValue)}
              sx={{
                mb: 4,
                '& .MuiTabs-root': {
                  borderRadius: 3,
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                },
                '& .MuiTab-root': {
                  mx: 1,
                  minWidth: 0,
                  padding: '12px 24px',
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 'bold',
                  color: '#2c3e50',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(52, 73, 94, 0.1)',
                    transform: 'translateY(-2px)'
                  },
                  '&.Mui-selected': {
                    color: 'white',
                    background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                    boxShadow: '0 4px 15px rgba(52, 73, 94, 0.3)'
                  }
                },
                '& .MuiTabs-flexContainer': {
                  gap: 2,
                  justifyContent: 'center'
                },
                '& .MuiTabs-indicator': {
                  display: 'none'
                }
              }}
            >
              <Tab
                icon={<Timeline />}
                label="Vue d'ensemble"
                sx={{
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.5rem',
                    mb: 0.5
                  }
                }}
              />
              <Tab
                icon={<TrendingDownIcon />}
                label="Entrées"
                sx={{
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.5rem',
                    mb: 0.5
                  }
                }}
              />
              <Tab
                icon={<TrendingUp />}
                label="Sorties"
                sx={{
                  '& .MuiSvgIcon-root': {
                    fontSize: '1.5rem',
                    mb: 0.5
                  }
                }}
              />
            </Tabs>
          </Fade>
          {/* Cartes de synthèse modernisées */}
          <Zoom in={true} timeout={1200}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              {/* Carte Articles totaux */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  borderLeft: '4px solid #2c3e50',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  borderRadius: '16px',
                  height: '100%',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(52, 73, 94, 0.2)'
                  }
                }}>
                  <CardContent sx={{ position: 'relative', p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                          Articles totaux
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                          {totalArticles}
                        </Typography>
                      </Box>
                      <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(52, 73, 94, 0.3)'
                      }}>
                        <Inventory sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2, background: 'linear-gradient(90deg, #2c3e50, transparent)' }} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Carte Stock total */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  borderLeft: '4px solid #34495e',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  borderRadius: '16px',
                  height: '100%',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(52, 73, 94, 0.2)'
                  }
                }}>
                  <CardContent sx={{ position: 'relative', p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                          Stock total
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                          {totalStock}
                        </Typography>
                      </Box>
                      <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(52, 73, 94, 0.3)'
                      }}>
                        <Warehouse sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2, background: 'linear-gradient(90deg, #34495e, transparent)' }} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Carte Total entrées */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  borderLeft: '4px solid #e74c3c',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  borderRadius: '16px',
                  height: '100%',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(231, 76, 60, 0.2)'
                  }
                }}>
                  <CardContent sx={{ position: 'relative', p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                          Total Des Achats
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                          {bonsReception.reduce((acc, bon) =>
                            acc + (bon.lignes?.reduce((sum, ligne) => sum + ligne.quantite, 0) || 0), 0)}
                        </Typography>
                      </Box>
                      <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)'
                      }}>
                        <CallReceivedIcon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2, background: 'linear-gradient(90deg, #e74c3c, transparent)' }} />
                  </CardContent>
                </Card>
              </Grid>

              {/* Carte Total sorties */}
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{
                  borderLeft: '4px solid #27ae60',
                  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                  borderRadius: '16px',
                  height: '100%',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 12px 40px rgba(39, 174, 96, 0.2)'
                  }
                }}>
                  <CardContent sx={{ position: 'relative', p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                          Total Des Ventes
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                          {bonsLivraison.reduce((acc, bon) =>
                            acc + (bon.lignes?.reduce((sum, ligne) => sum + ligne.quantite, 0) || 0), 0)}
                        </Typography>
                      </Box>
                      <Box sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #27ae60 0%, #2ecc71 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 15px rgba(39, 174, 96, 0.3)'
                      }}>
                        <ArrowOutwardIcon sx={{ color: 'white', fontSize: 28 }} />
                      </Box>
                    </Box>
                    <Divider sx={{ my: 2, background: 'linear-gradient(90deg, #27ae60, transparent)' }} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Zoom>

          {/* Vue d'ensemble avec graphiques */}
       
          {/* Vue d'ensemble avec graphiques */}
          {selectedTab === 0 && (
         <Box sx={{ mb: 3 }}>
         <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
        {/* Recherche + btn ajouter article */}
        <Box sx={{ mb: 4 }}>
          {/* Barre de recherche modernisée et professionnelle */}
          <Box sx={{
            display: 'flex',
            gap: 3,
            alignItems: 'center',
            flexWrap: 'wrap',
            mb: 3
          }}>
            <Box sx={{
              position: 'relative',
              flexGrow: 1,
              minWidth: '320px',
              maxWidth: '600px'
            }}>
              <TextField
                placeholder="Rechercher par nom, code, quantité..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                fullWidth
                size="medium"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)',
                    border: '2px solid transparent',
                    background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #2c3e50, #34495e) border-box',
                    transition: 'all 0.3s ease',
                    '& fieldset': {
                      border: 'none',
                    },
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(52, 73, 94, 0.15)',
                      background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #34495e, #2c3e50) border-box',
                    },
                    '&.Mui-focused': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 12px 35px rgba(52, 73, 94, 0.25)',
                      background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #2c3e50, #34495e) border-box',
                    },
                  },
                  '& .MuiInputBase-input': {
                    padding: '14px 16px',
                    fontSize: '1rem',
                    fontWeight: 500,
                    color: '#2c3e50',
                    '&::placeholder': {
                      color: '#6c757d',
                      opacity: 0.8
                    }
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 1,
                        boxShadow: '0 4px 12px rgba(52, 73, 94, 0.3)'
                      }}>
                        <Search sx={{ color: 'white', fontSize: 20 }} />
                      </Box>
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setSearchTerm('')}
                        size="small"
                        sx={{
                          color: '#6c757d',
                          '&:hover': {
                            color: '#2c3e50',
                            backgroundColor: 'rgba(52, 73, 94, 0.1)'
                          }
                        }}
                      >
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />

              {/* Indicateur de résultats */}
              {searchTerm && (
                <Box sx={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  mt: 1,
                  p: 1,
                  backgroundColor: 'rgba(52, 73, 94, 0.9)',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  zIndex: 10
                }}>
                  {filteredArticles.length} résultat{filteredArticles.length > 1 ? 's' : ''} trouvé{filteredArticles.length > 1 ? 's' : ''}
                </Box>
              )}
            </Box>

            <Button
              variant="contained"
              startIcon={<Add />}
              sx={{
                borderRadius: '16px',
                textTransform: 'none',
                background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                boxShadow: '0 6px 20px rgba(52, 73, 94, 0.3)',
                px: 4,
                py: 2,
                fontWeight: 'bold',
                fontSize: '1rem',
                minWidth: '200px',
                '&:hover': {
                  background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                  boxShadow: '0 8px 25px rgba(52, 73, 94, 0.4)',
                  transform: 'translateY(-3px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              Ajouter un article
            </Button>
          </Box>

          {/* Tableau modernisé */}
          <Slide direction="up" in={true} timeout={1400}>
            <Paper sx={{
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              overflow: 'hidden',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'
            }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      '& th': {
                        fontWeight: 700,
                        color: 'white',
                        borderBottom: 'none',
                        fontSize: '1rem',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor: 'rgba(255,255,255,0.1)'
                        }
                      }
                    }}>
                    <TableCell onClick={() => handleSort('libelle')}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                          Nom de l'article
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                          {sortConfig.key === 'libelle' && sortConfig.direction === 'asc' ? (
                            <ArrowUpward sx={{ fontSize: 16, color: '#f39c12' }} />
                          ) : sortConfig.key === 'libelle' && sortConfig.direction === 'desc' ? (
                            <ArrowDownward sx={{ fontSize: 16, color: '#f39c12' }} />
                          ) : (
                            <ArrowUpward sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell onClick={() => handleSort('quantiteMin')}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                          Stock Minimum
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                          {sortConfig.key === 'quantiteMin' && sortConfig.direction === 'asc' ? (
                            <ArrowUpward sx={{ fontSize: 16, color: '#f39c12' }} />
                          ) : sortConfig.key === 'quantiteMin' && sortConfig.direction === 'desc' ? (
                            <ArrowDownward sx={{ fontSize: 16, color: '#f39c12' }} />
                          ) : (
                            <ArrowUpward sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell onClick={() => handleSort('quantiteMax')}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                          Stock Maximum
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                          {sortConfig.key === 'quantiteMax' && sortConfig.direction === 'asc' ? (
                            <ArrowUpward sx={{ fontSize: 16, color: '#f39c12' }} />
                          ) : sortConfig.key === 'quantiteMax' && sortConfig.direction === 'desc' ? (
                            <ArrowDownward sx={{ fontSize: 16, color: '#f39c12' }} />
                          ) : (
                            <ArrowUpward sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell onClick={() => handleSort('Nombre_unite')}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                          Stock Actuel
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1 }}>
                          {sortConfig.key === 'Nombre_unite' && sortConfig.direction === 'asc' ? (
                            <ArrowUpward sx={{ fontSize: 16, color: '#f39c12' }} />
                          ) : sortConfig.key === 'Nombre_unite' && sortConfig.direction === 'desc' ? (
                            <ArrowDownward sx={{ fontSize: 16, color: '#f39c12' }} />
                          ) : (
                            <ArrowUpward sx={{ fontSize: 16, color: 'rgba(255,255,255,0.5)' }} />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'white' }}>
                        Statut
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                
                <TableBody>
                  {paginatedArticles.map((article) => {
                    const status = getStockStatus(article);
                    const statusColors = {
                      'Épuisé': { bgcolor: '#fff0f0', color: '#ff3d3d' },
                      'Stock bas': { bgcolor: '#fff8e6', color: '#ff9800' },
                      'En stock': { bgcolor: '#f0fff4', color: '#4caf50' }
                    };

                    return (
                      <TableRow
                        key={article._id}
                        hover
                        sx={{
                          '&:last-child td': { borderBottom: 0 },
                          '&:hover': {
                            backgroundColor: 'rgba(52, 73, 94, 0.05)',
                            transform: 'scale(1.01)',
                            transition: 'all 0.2s ease'
                          },
                          '& td': {
                            borderBottom: '1px solid rgba(52, 73, 94, 0.1)'
                          }
                        }}
                      >
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>{article.libelle}</TableCell>
                        <TableCell sx={{ color: '#6c757d' }}>{article.quantiteMin || 'N/A'}</TableCell>
                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>{article.Nombre_unite}</TableCell>
                        <TableCell sx={{ color: '#6c757d' }}>{article.quantiteMax}</TableCell>
                        <TableCell>
                          <Chip
                            label={status.label}
                            size="small"
                            sx={{
                              backgroundColor: statusColors[status.label].bgcolor,
                              color: statusColors[status.label].color,
                              fontWeight: 600,
                              borderRadius: '8px',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination pour les articles */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              mt: 3,
              p: 2,
              borderTop: '1px solid rgba(52, 73, 94, 0.1)'
            }}>
              <Pagination
                count={Math.ceil(filteredArticles.length / itemsPerPage)}
                page={articlesPage}
                onChange={(event, value) => setArticlesPage(value)}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: '12px',
                    fontWeight: 'bold',
                    color: '#2c3e50',
                    border: '2px solid transparent',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(52, 73, 94, 0.1)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(52, 73, 94, 0.2)'
                    },
                    '&.Mui-selected': {
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      color: 'white',
                      border: '2px solid #2c3e50',
                      boxShadow: '0 4px 15px rgba(52, 73, 94, 0.3)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 20px rgba(52, 73, 94, 0.4)'
                      }
                    }
                  }
                }}
              />
            </Box>
          </Paper>
        </Slide>
        </Box>
      </Grid>

      <Grid item xs={12} md={4}>
        <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
            <Card sx={{ 
              bgcolor: 'background.paper',
              boxShadow: 3,
              borderRadius: 2
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: 'error.light', 
                    mr: 2,
                    width: 40, 
                    height: 40 
                  }}>
                    <TrendingDownIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Stock épuisé
                    </Typography>
                    <Typography variant="h5" color="error.main">
                      {outOfStock}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Card sx={{ 
              bgcolor: 'background.paper',
              boxShadow: 3,
              borderRadius: 2
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ 
                    bgcolor: 'warning.light', 
                    mr: 2,
                    width: 40, 
                    height: 40 
                  }}>
                    <PendingActions />
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Stock Bas
                    </Typography>
                    <Typography variant="h5" color="warning.main">
                      {lowStock}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card sx={{ 
              bgcolor: 'background.paper',
              boxShadow: 3,
              borderRadius: 2
            }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Répartition du stock
                </Typography>
                <Box sx={{ height: 200 }}>
                  <Pie
                    key={`pie-chart-${chartKey}`}
                    data={{
                      labels: ['En stock', 'Stock bas', 'Épuisé'],
                      datasets: [
                        {
                          data: [
                            InStock,
                            lowStock,
                            outOfStock
                          ],
                          backgroundColor: [
                            '#4caf50', //vert
                            '#ff9800', //jaune
                            '#FF0000',//rouge
                          ],
                          borderWidth: 0
                        }
                      ]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'bottom'
                        }
                      }
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  </Box>
)} 

          {/* Mouvement entrées */}
          {selectedTab === 1 && (
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Bons de Réception
                    </Typography>
                    <List>
                      {paginatedBons.map((bon) => (
                        <Accordion 
                          key={bon._id}
                          expanded={selectedBon === bon._id}
                          onChange={() => setSelectedBon(selectedBon === bon._id ? null : bon._id)}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMore />}
                            sx={{
                              backgroundColor: selectedBon === bon._id ? '#e3f2fd' : 'inherit',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Avatar sx={{ bgcolor: bon.statut === 'livré' ? '#4caf50' : '#ff9800', mr: 2 }}>
                                {bon.statut === 'livré' ? <CheckCircle /> : <PendingActions />}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1">
                                  Bon de réception #{bon.numero_Bon}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Fournisseur: {bon.fournisseur?.raison_sociale || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <List>
                              {bon.lignes?.map((article, index) => (
                                <React.Fragment key={index}>
                                  <ListItem>
                                    <ListItemText
                                      primary={article.article.libelle}
                                      secondary={
                                        <React.Fragment>
                                          <Typography component="span" variant="body2" color="text.primary">
                                            Quantité: {article.quantite}
                                          </Typography>
                                          <br />
                                          <Typography component="span" variant="body2" color="text.secondary">
                                            Prix unitaire: {article.prix_unitaire} DT
                                          </Typography>
                                        </React.Fragment>
                                      }
                                    />
                                    <Chip 
                                      label={`Total: ${article.quantite * article.prix_unitaire} DT`}
                                      color="primary"
                                      variant="outlined"
                                    />
                                  </ListItem>
                                  {index < bon.lignes.length - 1 && <Divider />}
                                </React.Fragment>
                              ))}
                            </List>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                Date: {new Date(bon.dateReception).toLocaleDateString()}
                              </Typography>
                              <Typography variant="h6">
                                Total: {bon.lignes?.reduce((acc, art) => acc + (art.quantite * art.prix_unitaire), 0)} DT
                              </Typography>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </List>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                      <Stack spacing={2}>
                        <Pagination 
                          count={Math.ceil(bonsReception.length / itemsPerPage)} 
                          page={page} 
                          onChange={handlePageChange}
                          color="primary"
                          showFirstButton
                          showLastButton
                          sx={{
                            '& .MuiPaginationItem-root': {
                              color: 'primary.main',
                              '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                              },
                            },
                          }}
                        />
                      </Stack>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Fade in={true} timeout={1600}>
                    <Paper sx={{
                      p: 2.5,
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                      borderRadius: '16px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(52, 73, 94, 0.08)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Effet de fond décoratif minimaliste */}
                      <Box sx={{
                        position: 'absolute',
                        top: -30,
                        right: -30,
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(52, 73, 94, 0.05) 0%, rgba(52, 73, 94, 0.02) 100%)',
                        zIndex: 0
                      }} />

                      <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2,
                          pb: 1.5,
                          borderBottom: '1px solid rgba(52, 73, 94, 0.08)'
                        }}>
                          <Box sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            boxShadow: '0 3px 12px rgba(52, 73, 94, 0.2)'
                          }}>
                            <CallReceivedIcon sx={{ color: 'white', fontSize: 20 }} />
                          </Box>
                          <Typography variant="h6" sx={{
                            fontWeight: '600',
                            color: '#2c3e50',
                            fontSize: '1.1rem'
                          }}>
                            Statistiques d'Entrées
                          </Typography>
                        </Box>

                        <Stack spacing={2}>
                          {/* Carte Total des Bons */}
                          <Card sx={{
                            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                            borderRadius: '12px',
                            boxShadow: '0 3px 15px rgba(52, 73, 94, 0.15)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(52, 73, 94, 0.2)'
                            }
                          }}>
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5, fontSize: '0.85rem' }}>
                                    Total des Bons
                                  </Typography>
                                  <Typography variant="h5" sx={{
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '1.5rem'
                                  }}>
                                    {bonsReception.length}
                                  </Typography>
                                </Box>
                                <Box sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '10px',
                                  background: 'rgba(255,255,255,0.15)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backdropFilter: 'blur(10px)'
                                }}>
                                  <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                                    📋
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>

                          {/* Carte Total des Articles */}
                          <Card sx={{
                            background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                            borderRadius: '12px',
                            boxShadow: '0 3px 15px rgba(149, 165, 166, 0.15)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(149, 165, 166, 0.2)'
                            }
                          }}>
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5, fontSize: '0.85rem' }}>
                                    Articles Reçus
                                  </Typography>
                                  <Typography variant="h5" sx={{
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '1.5rem'
                                  }}>
                                    {bonsReception.reduce((acc, bon) =>
                                      acc + (bon.lignes?.reduce((sum, ligne) => sum + ligne.quantite, 0) || 0), 0
                                    )}
                                  </Typography>
                                </Box>
                                <Box sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '10px',
                                  background: 'rgba(255,255,255,0.15)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backdropFilter: 'blur(10px)'
                                }}>
                                  <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                                    📦
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>

                          {/* Carte Dépenses */}
                          <Card sx={{
                            background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                            borderRadius: '12px',
                            boxShadow: '0 3px 15px rgba(52, 73, 94, 0.15)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(52, 73, 94, 0.2)'
                            }
                          }}>
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5, fontSize: '0.85rem' }}>
                                    Dépenses Totales
                                  </Typography>
                                  <Typography variant="h6" sx={{
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '1.1rem'
                                  }}>
                                    {bonsReception.reduce((acc, bon) =>
                                      acc + (bon.lignes?.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0) || 0), 0
                                    ).toLocaleString()} DT
                                  </Typography>
                                </Box>
                                <Box sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '10px',
                                  background: 'rgba(255,255,255,0.15)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backdropFilter: 'blur(10px)'
                                }}>
                                  <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                                    💰
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Stack>
                      </Box>
                    </Paper>
                  </Fade>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Mouvement Sorties */}
          {selectedTab === 2 && (
            <Box sx={{ mb: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Bons de Livraisons
                    </Typography>
                    <List>
                      {paginatedBonsLivraison.map((bon) => (
                        <Accordion 
                          key={bon._id}
                          expanded={selectedBon === bon._id}
                          onChange={() => setSelectedBon(selectedBon === bon._id ? null : bon._id)}
                        >
                          <AccordionSummary
                            expandIcon={<ExpandMore />}
                            sx={{
                              backgroundColor: selectedBon === bon._id ? '#e3f2fd' : 'inherit',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                              <Avatar sx={{ bgcolor: bon.statut === 'livré' ? '#4caf50' : '#ff9800', mr: 2 }}>
                                {bon.statut === 'livré' ? <CheckCircle /> : <PendingActions />}
                              </Avatar>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="subtitle1">
                                  Bon de Livraison #{bon.numero}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Client: {bon.client?.nom_prenom || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails>
                            <List>
                              {bon.lignes?.map((article, index) => (
                                <React.Fragment key={index}>
                                  <ListItem>
                                    <ListItemText
                                      primary={article.article.libelle}
                                      secondary={
                                        <React.Fragment>
                                          <Typography component="span" variant="body2" color="text.primary">
                                            Quantité: {article.quantite}
                                          </Typography>
                                          <br />
                                          <Typography component="span" variant="body2" color="text.secondary">
                                            Prix unitaire: {article.prix_unitaire} DT
                                          </Typography>
                                        </React.Fragment>
                                      }
                                    />
                                    <Chip 
                                      label={`Total: ${article.quantite * article.prix_unitaire} DT`}
                                      color="primary"
                                      variant="outlined"
                                    />
                                  </ListItem>
                                  {index < bon.lignes.length - 1 && <Divider />}
                                </React.Fragment>
                              ))}
                            </List>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                              <Typography variant="body2" color="text.secondary">
                                Date: {new Date(bon.dateLivraison).toLocaleDateString()}
                              </Typography>
                              <Typography variant="h6">
                                Total: {bon.lignes?.reduce((acc, art) => acc + (art.quantite * art.prix_unitaire), 0)} DT
                              </Typography>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      ))}
                    </List>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                      <Stack spacing={2}>
                        <Pagination 
                          count={Math.ceil(bonsLivraison.length / itemsPerPage)} 
                          page={page} 
                          onChange={handlePageChange}
                          color="primary"
                          showFirstButton
                          showLastButton
                          sx={{
                            '& .MuiPaginationItem-root': {
                              color: 'primary.main',
                              '&.Mui-selected': {
                                backgroundColor: 'primary.main',
                                color: 'white',
                              },
                            },
                          }}
                        />
                      </Stack>
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Fade in={true} timeout={1800}>
                    <Paper sx={{
                      p: 2.5,
                      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                      borderRadius: '16px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      border: '1px solid rgba(52, 73, 94, 0.08)',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {/* Effet de fond décoratif minimaliste */}
                      <Box sx={{
                        position: 'absolute',
                        top: -30,
                        left: -30,
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, rgba(52, 73, 94, 0.05) 0%, rgba(52, 73, 94, 0.02) 100%)',
                        zIndex: 0
                      }} />

                      <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 2,
                          pb: 1.5,
                          borderBottom: '1px solid rgba(52, 73, 94, 0.08)'
                        }}>
                          <Box sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 2,
                            boxShadow: '0 3px 12px rgba(52, 73, 94, 0.2)'
                          }}>
                            <ArrowOutwardIcon sx={{ color: 'white', fontSize: 20 }} />
                          </Box>
                          <Typography variant="h6" sx={{
                            fontWeight: '600',
                            color: '#2c3e50',
                            fontSize: '1.1rem'
                          }}>
                            Statistiques de Sorties
                          </Typography>
                        </Box>

                        <Stack spacing={2}>
                          {/* Carte Total des Bons de Ventes */}
                          <Card sx={{
                            background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                            borderRadius: '12px',
                            boxShadow: '0 3px 15px rgba(52, 73, 94, 0.15)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(52, 73, 94, 0.2)'
                            }
                          }}>
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5, fontSize: '0.85rem' }}>
                                    Bons de Ventes
                                  </Typography>
                                  <Typography variant="h5" sx={{
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '1.5rem'
                                  }}>
                                    {bonsLivraison.length}
                                  </Typography>
                                </Box>
                                <Box sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '10px',
                                  background: 'rgba(255,255,255,0.15)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backdropFilter: 'blur(10px)'
                                }}>
                                  <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                                    🧾
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>

                          {/* Carte Total des Articles Sortis */}
                          <Card sx={{
                            background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                            borderRadius: '12px',
                            boxShadow: '0 3px 15px rgba(149, 165, 166, 0.15)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(149, 165, 166, 0.2)'
                            }
                          }}>
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5, fontSize: '0.85rem' }}>
                                    Articles Vendus
                                  </Typography>
                                  <Typography variant="h5" sx={{
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '1.5rem'
                                  }}>
                                    {bonsLivraison.reduce((acc, bon) =>
                                      acc + (bon.lignes?.reduce((sum, ligne) => sum + ligne.quantite, 0) || 0), 0
                                    )}
                                  </Typography>
                                </Box>
                                <Box sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '10px',
                                  background: 'rgba(255,255,255,0.15)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backdropFilter: 'blur(10px)'
                                }}>
                                  <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                                    📤
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>

                          {/* Carte Chiffre d'Affaires */}
                          <Card sx={{
                            background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)',
                            borderRadius: '12px',
                            boxShadow: '0 3px 15px rgba(52, 73, 94, 0.15)',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(52, 73, 94, 0.2)'
                            }
                          }}>
                            <CardContent sx={{ p: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 0.5, fontSize: '0.85rem' }}>
                                    Chiffre d'Affaires
                                  </Typography>
                                  <Typography variant="h6" sx={{
                                    color: 'white',
                                    fontWeight: '700',
                                    fontSize: '1.1rem'
                                  }}>
                                    {bonsLivraison.reduce((acc, bon) =>
                                      acc + (bon.lignes?.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0) || 0), 0
                                    ).toLocaleString()} DT
                                  </Typography>
                                </Box>
                                <Box sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '10px',
                                  background: 'rgba(255,255,255,0.15)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  backdropFilter: 'blur(10px)'
                                }}>
                                  <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                                    💎
                                  </Typography>
                                </Box>
                              </Box>
                            </CardContent>
                          </Card>
                        </Stack>
                      </Box>
                    </Paper>
                  </Fade>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default ConsulterStock;