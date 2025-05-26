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
  Stack
} from '@mui/material';
import { 
  Search, 
  Add, 
  ArrowUpward,
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
  const [chartKey, setChartKey] = useState(0);
  
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
  
  const filteredArticles = articles.filter(article =>
    article.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.code.toLowerCase().includes(searchTerm.toLowerCase())
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
          <Typography variant="h4" gutterBottom>
            Consultation du Stock
          </Typography>

          <Tabs 
        value={selectedTab} 
        onChange={(e, newValue) => setSelectedTab(newValue)} 
        sx={{ 
        mb: 3,
        '& .MuiTab-root': {  // Style pour chaque onglet individuel
        mx: 1,             // Marge horizontale de 8px (1 unité = 8px)
        minWidth: 0,        // Permet aux onglets de se comprimer si nécessaire
        padding: '6px 12px' // Padding interne
        },
        '& .MuiTabs-flexContainer': {  // Style pour le conteneur des onglets
        gap: 35,            // Espace de 16px entre les onglets (2 unités = 16px)
        }
  }}
>
  <Tab icon={<Timeline />} label="Vue d'ensemble" />
  <Tab icon={<TrendingDownIcon />} label="Entrées" />
  <Tab icon={<TrendingUp />} label="Sorties" />
</Tabs>
          {/* Cartes de synthèse modernisées */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {/* Carte Articles totaux */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                borderLeft: '4px solid #4e73df',
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
                borderRadius: '12px',
                height: '100%',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px 0 rgba(0,0,0,0.12)'
                }
              }}>
                <CardContent sx={{ position: 'relative', p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                        Articles totaux
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e3a59' }}>
                        {totalArticles}
                      </Typography>
                    </Box>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: '#e0e6ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Inventory sx={{ color: '#4e73df', fontSize: 28 }} />
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </CardContent>
              </Card>
            </Grid>

            {/* Carte Stock total */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                borderLeft: '4px solid #36b9cc',
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
                borderRadius: '12px',
                height: '100%',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px 0 rgba(0,0,0,0.12)'
                }
              }}>
                <CardContent sx={{ position: 'relative', p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                        Stock total
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e3a59' }}>
                        {totalStock}
                      </Typography>
                    </Box>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: '#d8f1f5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Warehouse sx={{ color: '#36b9cc', fontSize: 28 }} />
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </CardContent>
              </Card>
            </Grid>

            {/* Carte Total entrées */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                borderLeft: '4px solid #e74a3b',
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
                borderRadius: '12px',
                height: '100%',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px 0 rgba(0,0,0,0.12)'
                }
              }}>
                <CardContent sx={{ position: 'relative', p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                        Total Des Achats
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e3a59' }}>
                        {bonsReception.reduce((acc, bon) => 
                          acc + (bon.lignes?.reduce((sum, ligne) => sum + ligne.quantite, 0) || 0), 0)}
                      </Typography>
                    </Box>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: '#fbe2e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <CallReceivedIcon sx={{ color: '#e74a3b', fontSize: 28 }} />
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </CardContent>
              </Card>
            </Grid>

            {/* Carte Total sorties */}
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{
                borderLeft: '4px solid #1cc88a',
                boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
                borderRadius: '12px',
                height: '100%',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 25px 0 rgba(0,0,0,0.12)'
                }
              }}>
                <CardContent sx={{ position: 'relative', p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
                        Total Des Ventes
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#2e3a59' }}>
                        {bonsLivraison.reduce((acc, bon) => 
                          acc + (bon.lignes?.reduce((sum, ligne) => sum + ligne.quantite, 0) || 0), 0)}
                      </Typography>
                    </Box>
                    <Box sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      bgcolor: '#d1f3e8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <ArrowOutwardIcon sx={{ color: '#1cc88a', fontSize: 28 }} />
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Vue d'ensemble avec graphiques */}
       
          {/* Vue d'ensemble avec graphiques */}
          {selectedTab === 0 && (
         <Box sx={{ mb: 3 }}>
         <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
        {/* Recherche + btn ajouter article */}
        <Box sx={{ mb: 4 }}>
          {/* Barre de recherche et bouton modernisés */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            gap: 2
          }}>
            <TextField
              variant="outlined"
              size="small"
              placeholder="Rechercher un article..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                flexGrow: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  backgroundColor: '#f8f9fa',
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#bdbdbd',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2',
                    boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#757575' }} />
                  </InputAdornment>
                ),
              }}
            />
            
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<Add />}
              sx={{
                borderRadius: '8px',
                textTransform: 'none',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                px: 3,
                py: 1,
                '&:hover': {
                  boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                }
              }}
            >
              Ajouter un article
            </Button>
          </Box>

          {/* Tableau modernisé */}
          <Paper sx={{ 
            borderRadius: '12px', 
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    backgroundColor: '#f8f9fa',
                    '& th': {
                      fontWeight: 600,
                      color: '#2e3a59',
                      borderBottom: '2px solid #e0e0e0'
                    }
                  }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Nom
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <ArrowUpward fontSize="inherit" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Stock  Minimum 
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <ArrowUpward fontSize="inherit" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Stock  Maximum 
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <ArrowUpward fontSize="inherit" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        Stock actuel
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <ArrowUpward fontSize="inherit" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell>Statu</TableCell>
                  </TableRow>
                </TableHead>
                
                <TableBody>
                  {filteredArticles.map((article) => {
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
                          '&:hover': { backgroundColor: '#f5f7ff' }
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500 }}>{article.libelle}</TableCell>
                        <TableCell>{article.quantiteMin || 'N/A'}</TableCell>
                         <TableCell sx={{ fontWeight: 600 }}>{article.Nombre_unite} </TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{article.quantiteMax} </TableCell>
                         <TableCell>
                          <Chip 
                            label={status.label} 
                            size="small"
                            sx={{ 
                              backgroundColor: statusColors[status.label].bgcolor,
                              color: statusColors[status.label].color,
                              fontWeight: 500,
                              borderRadius: '6px'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
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
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Statistiques d'entrées
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Card sx={{ bgcolor: '#e3f2fd' }}>
                          <CardContent>
                            <Typography variant="h6">Total des Bons d'Entrées</Typography>
                            <Typography variant="h4">{bonsReception.length}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12}>
                        <Card sx={{ bgcolor: '#e3f2fd' }}>
                          <CardContent>
                            <Typography variant="h6">Total des articles Entrées</Typography>
                            <Typography variant="h4">
                              {bonsReception.reduce((acc, bon) => 
                                acc + (bon.lignes?.reduce((sum, ligne) => sum + ligne.quantite, 0) || 0), 0
                              )}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12}>
                        <Card sx={{ bgcolor: '#e3f2fd' }}>
                          <CardContent>
                            <Typography variant="h6">Dépenses</Typography>
                            <Typography variant="h4">
                            {bonsReception.reduce((acc, bon) => 
                                acc + (bon.lignes?.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0) || 0), 0
                              )} DT
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Paper>
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
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Statistiques des Sorties
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Card sx={{ bgcolor: '#e3f2fd' }}>
                          <CardContent>
                            <Typography variant="h6">Total des Bons de Ventes</Typography>
                            <Typography variant="h4">{bonsLivraison.length}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12}>
                        <Card sx={{ bgcolor: '#e3f2fd' }}>
                          <CardContent>
                            <Typography variant="h6">Total des articles Sorties</Typography>
                            <Typography variant="h4">
                              {bonsLivraison.reduce((acc, bon) => 
                                acc + (bon.lignes?.reduce((sum, ligne) => sum + ligne.quantite, 0) || 0), 0
                              )}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12}>
                        <Card sx={{ bgcolor: '#e3f2fd' }}>
                          <CardContent>
                            <Typography variant="h6">Chiffres d'Affaires</Typography>
                            <Typography variant="h4">
                              {bonsLivraison.reduce((acc, bon) => 
                                acc + (bon.lignes?.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0) || 0), 0
                              )} DT
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Paper>
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