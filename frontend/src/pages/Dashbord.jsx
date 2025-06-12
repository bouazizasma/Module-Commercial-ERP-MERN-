import React, { useEffect, useState } from 'react';
import Box from "@mui/material/Box";
import InputAdornment from '@mui/material/InputAdornment';
import {
  FormControl,
  InputLabel,
  Select,
  Paper,
  IconButton,
  Fade,
  Zoom,
  Slide,
  Avatar,
  Chip,
  LinearProgress,
  CircularProgress,
  Tooltip,
  Divider
} from '@mui/material';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { format, parseISO, startOfWeek, endOfWeek, subDays, isAfter, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Sidenav from "../navbar/Sidenav";
import Navbar from "../navbar/Navbar";
import { Bar, Line, Doughnut, Pie } from 'react-chartjs-2';
import Tabs from '@mui/material/Tabs';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PrintIcon from '@mui/icons-material/Print';
import Button from '@mui/material/Button';
import Tab from '@mui/material/Tab';
// Nouvelles icônes pour le dashboard moderne
import DashboardIcon from '@mui/icons-material/Dashboard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import InventoryIcon from '@mui/icons-material/Inventory';
import PeopleIcon from '@mui/icons-material/People';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BusinessIcon from '@mui/icons-material/Business';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement
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
  ArcElement,
  Title,
  ChartTooltip,
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
  backgroundColor: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
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

  // Fonction globale pour formater les nombres avec point comme séparateur
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };
  
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [bonsReception, setBonsReception] = useState([]);
  const [bonsLivraison, setBonsLivraison] = useState([]);
  const [articles, setArticles] = useState([]);
  const [paiement, setPaiement] = useState([]);
  const [reglement, setReglement] = useState([]);

  const [availableMonths, setAvailableMonths] = useState([]);
  const [showPaiementDetails, setShowPaiementDetails] = useState(false);
  const [paiementTableMonth, setPaiementTableMonth] = useState('');
    const [showReglementDetails, setShowReglementDetails] = useState(false);
  const [reglementTableMonth, setReglementTableMonth] = useState('');
  const [activeTab, setActiveTab] = useState(0); // 0: Espèces, 1: Chèques, 2: Effets
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [dateFilterType, setDateFilterType] = useState('month'); // 'day' ou 'month'
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedMonthForCharts, setSelectedMonthForCharts] = useState(format(new Date(), 'yyyy-MM'));
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
const generatePDF = () => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const now = new Date();
  const dateStr = format(now, 'dd/MM/yyyy HH:mm');
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Couleurs corporate
  const primaryColor = [44, 62, 80]; // #2c3e50
  const secondaryColor = [149, 165, 166]; // #95a5a6
  const accentColor = [52, 152, 219]; // #3498db
  const textColor = [44, 62, 80];
  const lightGray = [248, 249, 250];

  // === EN-TÊTE MODERNE ===
  // Arrière-plan dégradé pour l'en-tête
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Logo/Icône entreprise (simulé)
  doc.setFillColor(255, 255, 255);
  doc.circle(25, 22, 8, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('€', 22, 26);

  // Titre principal
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RAPPORT COMMERCIAL', 45, 20);

  // Sous-titre
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Analyse des Paiements et Performance', 45, 28);

  // Date et période
  doc.setFontSize(10);
  doc.text(`Généré le: ${dateStr}`, 45, 35);
  const selectedPeriod = selectedMonth ?
    format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy', { locale: fr }) :
    'Toutes périodes';
  doc.text(`Période: ${selectedPeriod}`, 45, 40);

  // Ligne décorative
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(2);
  doc.line(15, 50, pageWidth - 15, 50);

  // === SECTION RÉSUMÉ EXÉCUTIF ===
  let currentY = 65;

  // Titre section
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSUMÉ EXÉCUTIF', 15, currentY);

  // Cadre pour les KPIs
  currentY += 10;
  doc.setFillColor(...lightGray);
  doc.roundedRect(15, currentY, pageWidth - 30, 35, 3, 3, 'F');

  // Fonction pour formater les nombres avec point comme séparateur
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // KPIs en colonnes
  const kpiData = [
    { label: 'Chiffre d\'Affaires', value: `${formatNumber(chiffreAffaire)} DT`, icon: '📈' },
    { label: 'Total Encaissé', value: `${formatNumber(TotalDespaiement)} DT`, icon: '💰' },
    { label: 'Articles Vendus', value: `${articlesVendus}`, icon: '📦' },
    { label: 'Livraisons', value: `${filteredBonsLivraison.length}`, icon: '🚚' }
  ];

  const kpiWidth = (pageWidth - 40) / 4;
  kpiData.forEach((kpi, index) => {
    const x = 20 + (index * kpiWidth);
    const y = currentY + 8;

    // Icône
    doc.setFontSize(16);
    doc.text(kpi.icon, x, y);

    // Valeur
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(kpi.value, x + 8, y);

    // Label
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...textColor);
    doc.text(kpi.label, x + 8, y + 6);
  });

  currentY += 50;

  // === DONNÉES DÉTAILLÉES ===
  const especes = getEspeces(filteredPaiementTable);
  const cheques = getCheques(filteredPaiementTable);
  const effets = getEffets(filteredPaiementTable);

  // Fonction moderne pour ajouter une section
  const addModernSection = (title, data, columns, icon) => {
    if (data.length > 0) {
      // Vérifier si on a assez d'espace, sinon nouvelle page
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 20;
      }

      // Titre de section avec icône
      doc.setFillColor(...primaryColor);
      doc.roundedRect(15, currentY, pageWidth - 30, 12, 2, 2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${icon} ${title}`, 20, currentY + 8);

      // Nombre d'éléments
      doc.setFontSize(10);
      doc.text(`(${data.length} transaction${data.length > 1 ? 's' : ''})`, pageWidth - 50, currentY + 8);

      currentY += 18;

      // Tableau moderne
      doc.autoTable({
        startY: currentY,
        head: [columns.map(col => col.header)],
        body: data.map(item => columns.map(col => col.accessor(item))),
        margin: { left: 15, right: 15 },
        styles: {
          fontSize: 9,
          cellPadding: 4,
          textColor: textColor,
          lineColor: [220, 220, 220],
          lineWidth: 0.5
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 25 },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 40 }
        }
      });

      currentY = doc.lastAutoTable.finalY + 15;

      // Total de la section
      const total = data.reduce((sum, item) => sum + (item.montant || 0), 0);
      doc.setFillColor(...secondaryColor);
      doc.roundedRect(pageWidth - 80, currentY - 10, 65, 8, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: ${formatNumber(total)} DT`, pageWidth - 75, currentY - 5);

      currentY += 5;
    }
  };

  // Sections de paiements
  addModernSection('PAIEMENTS EN ESPÈCES', especes, [
    { header: 'N° Paiement', accessor: (e) => e.numero || '-' },
    { header: 'Date', accessor: (e) => e.creationDate ? format(parseISO(e.creationDate), 'dd/MM/yyyy') : '-' },
    { header: 'Montant (DT)', accessor: (e) => formatNumber(e.montant) }
  ], '💵');

  addModernSection('PAIEMENTS PAR CHÈQUE', cheques, [
    { header: 'N° Paiement', accessor: (c) => c.numero || '-' },
    { header: 'Date', accessor: (c) => c.creationDate ? format(parseISO(c.creationDate), 'dd/MM/yyyy') : '-' },
    { header: 'Montant (DT)', accessor: (c) => formatNumber(c.montant) },
    { header: 'Banque', accessor: (c) => c.banque?.libelle || '-' }
  ], '🏦');

  addModernSection('PAIEMENTS PAR EFFET', effets, [
    { header: 'N° Paiement', accessor: (ef) => ef.numero || '-' },
    { header: 'Date', accessor: (ef) => ef.creationDate ? format(parseISO(ef.creationDate), 'dd/MM/yyyy') : '-' },
    { header: 'Date échéance', accessor: (ef) => ef.dateEcheance ? format(parseISO(ef.dateEcheance), 'dd/MM/yyyy') : '-' },
    { header: 'Montant (DT)', accessor: (ef) => formatNumber(ef.montant) }
  ], '📄');

  // === PIED DE PAGE MODERNE ===
  const addFooter = () => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Ligne décorative
      doc.setDrawColor(...secondaryColor);
      doc.setLineWidth(0.5);
      doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

      // Informations pied de page
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text('Rapport généré automatiquement par le système de gestion commerciale', 15, pageHeight - 15);
      doc.text(`Page ${i} sur ${pageCount}`, pageWidth - 30, pageHeight - 15);
      doc.text(`© ${new Date().getFullYear()} - Confidentiel`, 15, pageHeight - 10);
      doc.text(dateStr, pageWidth - 50, pageHeight - 10);
    }
  };

  addFooter();

  // Enregistrer le PDF avec nom moderne
  doc.save(`Rapport_Commercial_${format(now, 'yyyyMMdd_HHmm')}.pdf`);
};

  // Fonctions pour filtrer les reglement par type
  const getEspecesReglement = (reglements) => {
    return reglements.flatMap(p => 
      p.details?.especes?.map(e => ({
        ...e,
        type: 'Espèce',
        creationDate: p.dateCreation
      })) || []
    );
  };

  const getChequesReglement = (reglements) => {
    return reglements.flatMap(p => 
      p.details?.cheques?.map(c => ({
        ...c,
        type: 'Chèque',
        creationDate: p.dateCreation
      })) || []
    );
  };

  const getEffetsReglement = (reglements) => {
    return reglements.flatMap(p => 
      p.details?.effets?.map(ef => ({
        ...ef,
        type: 'Effet',
        creationDate: p.dateCreation
      })) || []
    );
  };
  const reglementTableMonths = Array.from(
    new Set(reglement.map(p => p.dateCreation ? format(parseISO(p.dateCreation), 'yyyy-MM') : null).filter(Boolean))
  ).sort((a, b) => b.localeCompare(a));

  const filteredReglementTable = reglement.filter(p => {
    if (!reglementTableMonth) return true;
    if (!p.dateCreation) return false;
    return format(parseISO(p.dateCreation), 'yyyy-MM') === reglementTableMonth;
  });
const generatePDFReglement = () => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const now = new Date();
  const dateStr = format(now, 'dd/MM/yyyy HH:mm');
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // Fonction pour formater les nombres avec point comme séparateur
  const formatNumber = (number) => {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Couleurs corporate
  const primaryColor = [44, 62, 80]; // #2c3e50
  const secondaryColor = [149, 165, 166]; // #95a5a6
  const accentColor = [52, 152, 219]; // #3498db
  const textColor = [44, 62, 80];
  const lightGray = [248, 249, 250];

  // === EN-TÊTE MODERNE ===
  // Arrière-plan dégradé pour l'en-tête
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');



  // Titre principal
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('RAPPORT COMMERCIAL', 45, 20);

  // Sous-titre
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('Analyse des Reglements et Performance', 45, 28);

  // Date et période
  doc.setFontSize(10);
  doc.text(`Généré le: ${dateStr}`, 45, 35);
  const selectedPeriod = selectedMonth ?
    format(parseISO(`${selectedMonth}-01`), 'MMMM yyyy', { locale: fr }) :
    'Toutes périodes';
  doc.text(`Période: ${selectedPeriod}`, 45, 40);

  // Ligne décorative
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(2);
  doc.line(15, 50, pageWidth - 15, 50);

  // === DONNÉES DÉTAILLÉES ===
  const especes = getEspecesReglement(filteredReglementTable);
  const cheques = getChequesReglement(filteredReglementTable);
  const effets = getEffetsReglement(filteredReglementTable);

  // === SECTION RÉSUMÉ EXÉCUTIF ===
  let currentY = 65;

  // Titre section
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RÉSUMÉ DES REGLEMENTS', 15, currentY);

  // Cadre pour les KPIs
  currentY += 10;
  doc.setFillColor(...lightGray);
  doc.roundedRect(15, currentY, pageWidth - 30, 35, 3, 3, 'F');


  // Fonction moderne pour ajouter une section
  const addModernSection = (title, data, columns) => {
    if (data.length > 0) {
      // Vérifier si on a assez d'espace, sinon nouvelle page
      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 20;
      }

      // Titre de section avec icône
      doc.setFillColor(...primaryColor);
      doc.roundedRect(15, currentY, pageWidth - 30, 12, 2, 2, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(` ${title}`, 20, currentY + 8);

      // Nombre d'éléments
      doc.setFontSize(10);
      doc.text(`(${data.length} transaction${data.length > 1 ? 's' : ''})`, pageWidth - 50, currentY + 8);

      currentY += 18;

      // Tableau moderne
      doc.autoTable({
        startY: currentY,
        head: [columns.map(col => col.header)],
        body: data.map(item => columns.map(col => col.accessor(item))),
        margin: { left: 15, right: 15 },
        styles: {
          fontSize: 9,
          cellPadding: 4,
          textColor: textColor,
          lineColor: [220, 220, 220],
          lineWidth: 0.5
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250]
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { cellWidth: 25 },
          2: { cellWidth: 30, halign: 'right' },
          3: { cellWidth: 40 }
        }
      });

      currentY = doc.lastAutoTable.finalY + 15;

      // Total de la section
      const total = data.reduce((sum, item) => sum + (item.montant || 0), 0);
      doc.setFillColor(...secondaryColor);
      doc.roundedRect(pageWidth - 80, currentY - 10, 65, 8, 1, 1, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total: ${formatNumber(total)} DT`, pageWidth - 75, currentY - 5);

      currentY += 5;
    }
  };

  // Sections de Reglements
  addModernSection('RÈGLEMENTS EN ESPÈCES', especes, [
    { header: 'N° Règlement', accessor: (e) => e.numero || '-' },
    { header: 'Date', accessor: (e) => e.creationDate ? format(parseISO(e.creationDate), 'dd/MM/yyyy') : '-' },
    { header: 'Montant (DT)', accessor: (e) => formatNumber(e.montant) }
  ], '💵');

  addModernSection('RÈGLEMENTS PAR CHÈQUE', cheques, [
    { header: 'N° Règlement', accessor: (c) => c.numero || '-' },
    { header: 'Date', accessor: (c) => c.creationDate ? format(parseISO(c.creationDate), 'dd/MM/yyyy') : '-' },
    { header: 'Montant (DT)', accessor: (c) => formatNumber(c.montant) },
    { header: 'Banque', accessor: (c) => c.banque?.libelle || '-' }
  ], '🏦');

  addModernSection('RÈGLEMENTS PAR EFFET', effets, [
    { header: 'N° Règlement', accessor: (ef) => ef.numero || '-' },
    { header: 'Date', accessor: (ef) => ef.creationDate ? format(parseISO(ef.creationDate), 'dd/MM/yyyy') : '-' },
    { header: 'Date échéance', accessor: (ef) => ef.dateEcheance ? format(parseISO(ef.dateEcheance), 'dd/MM/yyyy') : '-' },
    { header: 'Montant (DT)', accessor: (ef) => formatNumber(ef.montant) }
  ], '📄');

  // === PIED DE PAGE MODERNE ===
  const addFooter = () => {
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      // Ligne décorative
      doc.setDrawColor(...secondaryColor);
      doc.setLineWidth(0.5);
      doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);

      // Informations pied de page
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Page ${i} sur ${pageCount}`, pageWidth - 30, pageHeight - 15);
      doc.text(`© ${new Date().getFullYear()} - Confidentiel`, 15, pageHeight - 10);
      doc.text(dateStr, pageWidth - 50, pageHeight - 10);
    }
  };

  addFooter();

  // Enregistrer le PDF avec nom moderne
  doc.save(`Rapport_Reglements_${format(now, 'yyyyMMdd_HHmm')}.pdf`);
};
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bonsReceptionRes, bonsLivraisonRes, articlesRes, paiementRes , reglementRes] = await Promise.all([
          axios.get('http://localhost:5000/achat/BEF/all'),
          axios.get('http://localhost:5000/ventes/bons-Livraison'),
          axios.get('http://localhost:5000/article/articles'),
          axios.get('http://localhost:5000/paiement/tous'),
          axios.get('http://localhost:5000/ReglementClient/tous')
        ]);

        setBonsReception(bonsReceptionRes.data);
        setBonsLivraison(bonsLivraisonRes.data);
        setArticles(articlesRes.data);
        setPaiement(paiementRes.data);
        setReglement(reglementRes.data);
        setLastUpdate(new Date());

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
        reglementRes.data.forEach(reglement => {
          if (reglement.dateCreation) {
            const date = parseISO(reglement.dateCreation);
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  // Fonctions de filtrage pour les graphiques
  const handleDateFilterChange = (event) => {
    setDateFilterType(event.target.value);
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleMonthForChartsChange = (event) => {
    setSelectedMonthForCharts(event.target.value);
  };

  // Filtrage pour les cartes (utilise selectedMonth)
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

  const filteredReglement = reglement.filter(reglement => {
    if (!reglement.dateCreation) return false;
    const bonDate = format(parseISO(reglement.dateCreation), 'yyyy-MM');
    return bonDate === selectedMonth;
  });

  const filteredBonsReception = bonsReception.filter(bon => {
    if (!bon.dateReception) return false;
    const bonDate = format(parseISO(bon.dateReception), 'yyyy-MM');
    return bonDate === selectedMonth;
  });

  // Filtrage pour les graphiques (utilise dateFilterType et selectedDate/selectedMonthForCharts)
  const filteredBonsLivraisonForCharts = bonsLivraison.filter(bon => {
    if (!bon.dateLivraison) return false;
    if (dateFilterType === 'day') {
      const bonDate = format(parseISO(bon.dateLivraison), 'yyyy-MM-dd');
      return bonDate === selectedDate;
    } else {
      const bonDate = format(parseISO(bon.dateLivraison), 'yyyy-MM');
      return bonDate === selectedMonthForCharts;
    }
  });

  const filteredPaiementForCharts = paiement.filter(paiement => {
    if (!paiement.dateCreation) return false;
    if (dateFilterType === 'day') {
      const paiementDate = format(parseISO(paiement.dateCreation), 'yyyy-MM-dd');
      return paiementDate === selectedDate;
    } else {
      const paiementDate = format(parseISO(paiement.dateCreation), 'yyyy-MM');
      return paiementDate === selectedMonthForCharts;
    }
  });

  const filteredBonsReceptionForCharts = bonsReception.filter(bon => {
    if (!bon.dateReception) return false;
    if (dateFilterType === 'day') {
      const bonDate = format(parseISO(bon.dateReception), 'yyyy-MM-dd');
      return bonDate === selectedDate;
    } else {
      const bonDate = format(parseISO(bon.dateReception), 'yyyy-MM');
      return bonDate === selectedMonthForCharts;
    }
  });

  const chiffreAffaire = filteredBonsLivraison.reduce((acc, bon) => 
    acc + (bon.lignes?.reduce((sum, ligne) => sum + (ligne.quantite * ligne.prix_unitaire), 0) || 0), 0
  );

  const TotalDespaiement = filteredPaiement.reduce((acc, p) => 
    acc + (p.details?.especes?.reduce((s, e) => s + e.montant, 0) || 0) +
    (p.details?.cheques?.reduce((s, c) => s + c.montant, 0) || 0) +
    (p.details?.effets?.reduce((s, ef) => s + ef.montant, 0) || 0)
  , 0);

  const TotalDesReglement = filteredReglement.reduce((acc, p) =>
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
      <Box height={1200} />
      <Box sx={{
        display: "flex",
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        minHeight: "calc(100vh - 80px)",
        overflow: "hidden"
      }}>
        <DashboardContainer>
          <Sidenav />
          <MainContent>
            {/* Header moderne du Dashboard */}
            <Fade in={true} timeout={800}>
              <Box sx={{
                textAlign: 'center',
                mb: 4,
                p: 4,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                color: 'Black',
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
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  animation: 'pulse 3s ease-in-out infinite alternate'
                }} />

                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <DashboardIcon sx={{ fontSize: 48, mb: 2 }} />
                  <Typography variant="h3" sx={{
                    fontWeight: 'bold',
                   color: '#1e293b',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                    mb: 1
                  }}>
                    Tableau de Bord
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 3 , color: '2px 2px 4px rgba(0,0,0,0.3)',}}>
                    Vue d'ensemble de votre activité commerciale
                  </Typography>

                  {/* Indicateurs rapides avec vraies données */}
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: 4,
                    flexWrap: 'wrap'
                  }}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' , color:'black' }}>
                        {TotalDespaiement.toLocaleString('fr-FR')}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'black' }}>DT Encaissés</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold'  , color:'black' }}>
                        {chiffreAffaire.toLocaleString('fr-FR')}
                      </Typography>
                      <Typography variant="body2" color='black'>DT Chiffre d'Affaires</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' , color:'black' }}>
                        {articlesVendus}
                      </Typography>
                      <Typography variant="body2" color='black'>Articles Vendus</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" sx={{ fontWeight: 'bold'  , color:'black' }}>
                        {filteredBonsLivraison.length}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'black' }} >Livraisons</Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Fade>
  {/* Sélecteurs de filtrage */}
  <Box sx={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3,
    gap: 2,
    flexWrap: 'wrap'
  }}>
    {/* Sélecteur de période pour les cartes */}
    <FormControl size="small" sx={{
      minWidth: 180,
      '& .MuiOutlinedInput-root': {
        borderRadius: '20px',
        backgroundColor: theme.palette.background.paper,
        boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
        '&.Mui-focused': {
          boxShadow: `0 0 0 2px rgba(52, 73, 94, 0.3)`,
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
          color: '#2c3e50',
        }
      }
    }}>
      <InputLabel>Période (Cartes)</InputLabel>
      <Select
        value={selectedMonth}
        onChange={handleMonthChange}
        label="Période (Cartes)"
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
                  backgroundColor: `rgba(52, 73, 94, 0.1)`,
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

  {/* Sélecteurs de date pour les graphiques */}
  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
    {/* Type de filtrage */}
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel>Type</InputLabel>
      <Select
        value={dateFilterType}
        onChange={handleDateFilterChange}
        label="Type"
        sx={{
          borderRadius: '20px',
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
        }}
      >
        <MenuItem value="month">Par Mois</MenuItem>
        <MenuItem value="day">Par Jour</MenuItem>
      </Select>
    </FormControl>

    {/* Sélecteur conditionnel */}
    {dateFilterType === 'day' ? (
      <TextField
        type="date"
        size="small"
        label="Date"
        value={selectedDate}
        onChange={handleDateChange}
        InputLabelProps={{ shrink: true }}
        sx={{
          minWidth: 160,
          '& .MuiOutlinedInput-root': {
            borderRadius: '20px',
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
          }
        }}
      />
    ) : (
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel>Mois (Graphiques)</InputLabel>
        <Select
          value={selectedMonthForCharts}
          onChange={handleMonthForChartsChange}
          label="Mois (Graphiques)"
          sx={{
            borderRadius: '20px',
            backgroundColor: theme.palette.background.paper,
            boxShadow: '0 1px 6px rgba(0,0,0,0.1)',
          }}
        >
          {availableMonths.map((month) => (
            <MenuItem key={month} value={month}>
              {format(parseISO(`${month}-01`), 'MMM yyyy', { locale: fr })}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    )}

    {/* Indicateur de filtrage actif */}
    <Chip
      icon={<FilterListIcon />}
      label={dateFilterType === 'day'
        ? `Jour: ${format(parseISO(selectedDate), 'dd/MM/yyyy', { locale: fr })}`
        : `Mois: ${format(parseISO(`${selectedMonthForCharts}-01`), 'MMM yyyy', { locale: fr })}`
      }
      variant="outlined"
      sx={{
        borderRadius: '20px',
        backgroundColor: 'rgba(52, 73, 94, 0.1)',
        borderColor: '#2c3e50',
        color: '#2c3e50',
        fontWeight: 'bold'
      }}
    />
  </Box>
</Box>
       
{/* Cartes de statistiques modernisées */}
          <Fade in={true} timeout={1000}>
            <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in={true} timeout={600}>
                  <StatCard
                    onClick={() => setShowPaiementDetails(!showPaiementDetails)}
                    sx={{
                      cursor: 'pointer',
                      border: showPaiementDetails ? '3px solid #3b82f6' : '1px solid #e2e8f0',
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      color: '#1e293b',
                      position: 'relative',
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.1)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 12px 40px rgba(59, 130, 246, 0.2)',
                        border: '1px solid #3b82f6'
                      }
                    }}
                  >
                    {/* Effet de brillance */}
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 80,
                      height: 80,
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)',
                      borderRadius: '50%',
                      transform: 'translate(30%, -30%)'
                    }} />

                    <CardContent sx={{ p: isMobile ? 2 : 3, position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography
                          variant={isMobile ? "subtitle1" : "h6"}
                          sx={{ fontWeight: 'bold', color: '#1e293b' }}
                        >
                          Paiements
                        </Typography>
                      </Box>
                      <Typography
                        variant={isMobile ? "h6" : "h4"}
                        component="div"
                        sx={{ fontWeight: 'bold', color: '#0f172a' }}
                      >
                        {formatNumber(TotalDespaiement)} DT
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, opacity: 0.7, '&:hover': { opacity: 1 } }}>
                        <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, color: '#3b82f6' }} />
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Cliquez pour détails
                        </Typography>
                      </Box>
                    </CardContent>
                  </StatCard>
                </Zoom>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Zoom in={true} timeout={800}>
                  <StatCard
                    onClick={() => setShowReglementDetails(!showReglementDetails)}
                    sx={{
                      background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                      color: '#1e293b',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: showReglementDetails ? '3px solid #10b981' : '1px solid #e2e8f0',
                      boxShadow: '0 4px 20px rgba(16, 185, 129, 0.1)',
                      '&:hover': {
                        transform: 'translateY(-8px) scale(1.02)',
                        boxShadow: '0 12px 40px rgba(16, 185, 129, 0.2)',
                        border: '1px solid #10b981'
                      }
                    }}>
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 80,
                      height: 80,
                      background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.05) 100%)',
                      borderRadius: '50%',
                      transform: 'translate(30%, -30%)'
                    }} />

                    <CardContent sx={{ p: isMobile ? 2 : 3, position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <TrendingDownIcon sx={{ fontSize: 32, mr: 1, color: '#10b981' }} />
                        <Typography
                          variant={isMobile ? "subtitle1" : "h6"}
                          sx={{ fontWeight: 'bold', color: '#1e293b' }}
                        >
                          Règlements
                        </Typography>
                      </Box>
                      <Typography
                        variant={isMobile ? "h6" : "h4"}
                        component="div"
                        sx={{ fontWeight: 'bold', color: '#0f172a' }}
                      >
                        {formatNumber(TotalDesReglement)} DT
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', opacity: 0.8 }}>
                        Règlements totaux
                      </Typography>
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mt: 1,
                        opacity: 0.7,
                        '&:hover': { opacity: 1 }
                      }}>
                        <TrendingUpIcon sx={{ fontSize: 16, mr: 0.5, color: '#10b981' }} />
                        <Typography variant="caption" sx={{ color: '#64748b' }}>
                          Cliquez pour détails
                        </Typography>
                      </Box>
                    </CardContent>
                  </StatCard>
                </Zoom>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Zoom in={true} timeout={1000}>
                  <StatCard sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    color: '#1e293b',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(139, 92, 246, 0.1)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 12px 40px rgba(139, 92, 246, 0.2)',
                      border: '1px solid #8b5cf6'
                    }
                  }}>
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 80,
                      height: 80,
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                      borderRadius: '50%',
                      transform: 'translate(30%, -30%)'
                    }} />

                    <CardContent sx={{ p: isMobile ? 2 : 3, position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <ShoppingCartIcon sx={{ fontSize: 32, mr: 1, color: '#8b5cf6' }} />
                        <Typography
                          variant={isMobile ? "subtitle1" : "h6"}
                          sx={{ fontWeight: 'bold', color: '#1e293b' }}
                        >
                          Articles Vendus
                        </Typography>
                      </Box>
                      <Typography
                        variant={isMobile ? "h6" : "h4"}
                        component="div"
                        sx={{ fontWeight: 'bold', color: '#0f172a' }}
                      >
                        {articlesVendus}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', opacity: 0.8 }}>
                        Unités vendues
                      </Typography>
                    </CardContent>
                  </StatCard>
                </Zoom>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Zoom in={true} timeout={1200}>
                  <StatCard sx={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    color: '#1e293b',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(245, 158, 11, 0.1)',
                    '&:hover': {
                      transform: 'translateY(-8px) scale(1.02)',
                      boxShadow: '0 12px 40px rgba(245, 158, 11, 0.2)',
                      border: '1px solid #f59e0b'
                    }
                  }}>
                    <Box sx={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 80,
                      height: 80,
                      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                      borderRadius: '50%',
                      transform: 'translate(30%, -30%)'
                    }} />

                    <CardContent sx={{ p: isMobile ? 2 : 3, position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <InventoryIcon sx={{ fontSize: 32, mr: 1, color: '#f59e0b' }} />
                        <Typography
                          variant={isMobile ? "subtitle1" : "h6"}
                          sx={{ fontWeight: 'bold', color: '#1e293b' }}
                        >
                          Articles Achetés
                        </Typography>
                      </Box>
                      <Typography
                        variant={isMobile ? "h6" : "h4"}
                        component="div"
                        sx={{ fontWeight: 'bold', color: '#0f172a' }}
                      >
                        {articlesAchetés}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748b', opacity: 0.8 }}>
                        Unités achetées
                      </Typography>
                    </CardContent>
                  </StatCard>
                </Zoom>
              </Grid>
            </Grid>
          </Fade>

          {/* Section Notifications et Alertes */}
          <Fade in={true} timeout={1200}>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{
                mb: 3,
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #2c3e50, #34495e)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <NotificationsIcon sx={{ color: '#2c3e50' }} />
                Notifications & Alertes
              </Typography>

              <Grid container spacing={2}>
                {/* Alerte Stock Faible */}
                <Grid item xs={12} md={4}>
                  <Card sx={{
                    background:'linear-gradient(135deg,rgba(247, 173, 173, 0.3) 0%,rgb(248, 248, 248) 100%)',
                    boxShadow: '0 4px 20px rgba(149, 165, 166, 0.1) ',
                    border: '1px solid rgba(149, 165, 166, 0.3)',
                    borderRadius: 2,
                    color: 'black',
                    '&:hover': { transform: 'translateY(-2px)', transition: 'all 0.3s ease' }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <WarningIcon sx={{  mr: 1 }} />
                        <Typography variant="h6" sx={{  fontWeight: 'bold' }}>
                          Stock Faible
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: 'black' }}>
                        {articles.filter(article => article.Nombre_unite === article.quantiteMin || article.Nombre_unite < article.quantiteMin).length} articles en rupture
                      </Typography>
                      
                    </CardContent>
                  </Card>
                </Grid>

                {/* Paiements Récents */}
                <Grid item xs={12} md={4}>
                  <Card sx={{
                    background: 'linear-gradient(135deg,rgb(190, 228, 103) 0%,rgb(248, 248, 248) 100%)',
                    color: 'black',
                    borderRadius: 2,
                    '&:hover': { transform: 'translateY(-2px)', transition: 'all 0.3s ease' }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <InfoIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Paiements Récents
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {filteredPaiement.length} paiements ce mois
                      </Typography>
                      
                    </CardContent>
                  </Card>
                </Grid>
                {/* Performance */}
                <Grid item xs={12} md={4}>
                  <Card sx={{
                    background: 'linear-gradient(135deg,rgb(150, 198, 230) 0%,rgb(248, 248, 248) 100%)',
                    color: 'black',
                    borderRadius: 2,
                    '&:hover': { transform: 'translateY(-2px)', transition: 'all 0.3s ease' }
                  }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <CheckCircleIcon sx={{ mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                          Performance
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {filteredBonsLivraison.length} livraisons réussies
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Fade>

          {/* Section Graphiques avec titre moderne */}
          <Fade in={true} timeout={1400}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{
                mb: 3,
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #2c3e50, #34495e)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <AssessmentIcon sx={{ color: '#2c3e50' }} />
                Analyse des Ventes
              </Typography>
            </Box>
          </Fade>

{/*Les Charts Ventes  */}
          <Slide direction="up" in={true} timeout={1000}>
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
                      labels: filteredBonsLivraisonForCharts.reduce((acc, bon) => {
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
                        data: filteredBonsLivraisonForCharts.reduce((acc, bon) => {
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
                      labels: filteredBonsLivraisonForCharts.reduce((acc, bon) => {
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
                        data: filteredBonsLivraisonForCharts.reduce((acc, bon) => {
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
          </Slide>

          {/*Les Charts Achats  */}
          <Fade in={true} timeout={1600}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" sx={{
                mb: 3,
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #95a5a6, #7f8c8d)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}>
                <BusinessIcon sx={{ color: '#95a5a6' }} />
                Analyse des Achats
              </Typography>
            </Box>
          </Fade>

          <Slide direction="up" in={true} timeout={1200}>
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
                      labels: filteredBonsReceptionForCharts.reduce((acc, bon) => {
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
                        data: filteredBonsReceptionForCharts.reduce((acc, bon) => {
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
                      labels: filteredBonsReceptionForCharts.reduce((acc, bon) => {
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
                        data: filteredBonsReceptionForCharts.reduce((acc, bon) => {
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
          </Slide>
      
          {/* Styles CSS pour les animations */}
          <style jsx>{`
            @keyframes pulse {
              0% { opacity: 0.8; }
              100% { opacity: 1; }
            }
          `}</style>

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
      ><Box 
  sx={{ 
    backgroundColor: 'rgba(112, 106, 136, 0.73)',
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
  <Box>
    <Button 
      variant="contained" 
      color="rgba(0, 0, 0, 0.82)"
      onClick={(e) => {
        e.stopPropagation();
        generatePDF();
      }}
      sx={{ 
        mr: 2,
        textTransform: 'none',
        borderRadius: '8px',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
          backgroundColor: "rgba(0,0,0,0.05)"
        }
      }}
      startIcon={<PrintIcon />}
    >
      Imprimer
    </Button>
    <IconButton color="rgba(0, 0, 0, 0.9)">
      {showPaiementDetails ? <ExpandMoreIcon /> : <ExpandLessIcon />}
    </IconButton>
  </Box>
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
              backgroundColor: `rgba(52, 73, 94, 0.1)`,
              '&:hover': {
                backgroundColor: `rgba(52, 73, 94, 0.2)`,
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
                                <TableCell>{formatNumber(e.montant)} DT</TableCell>
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
                                <TableCell>{formatNumber(c.montant)} DT</TableCell>
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
                                <TableCell>{formatNumber(ef.montant)} DT</TableCell>
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

      {/* Section Détails des Règlements */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 280,
          right: 0,
          zIndex: 1200,
          transition: 'all 0.3s ease',
          transform: showReglementDetails ? 'translateY(0)' : 'translateY(100%)',
          boxShadow: '0 -5px 20px rgba(0, 0, 0, 0.11)',
          maxHeight: '70vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{
          backgroundColor: '#10b981',
          color: 'white',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }}
        onClick={() => setShowReglementDetails(!showReglementDetails)}
        >
          <Typography variant="h6" sx={{ ml: 2 }}>
            Détails des règlements
          </Typography>
          <Box>
            <Button
              variant="contained"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                generatePDFReglement();
              }}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white',
                mr: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.3)'
                }
              }}
              startIcon={<PrintIcon />}
            >
              Imprimer
            </Button>
            <IconButton color="rgba(0, 0, 0, 0.9)">
              {showReglementDetails ? <ExpandMoreIcon /> : <ExpandLessIcon />}
            </IconButton>
          </Box>
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
    value={reglementTableMonth}
    onChange={e => setReglementTableMonth(e.target.value)}
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
              backgroundColor: `rgba(52, 73, 94, 0.1)`,
              '&:hover': {
                backgroundColor: `rgba(52, 73, 94, 0.2)`,
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
    {reglementTableMonths.map(month => (
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

            {/* Onglets pour Règlements */}
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

            {/* Contenu des onglets pour Règlements */}
            <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <TableContainer sx={{ maxHeight: '50vh' }}>
                <Table stickyHeader size="small" aria-label="Détails des règlements">
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
                    {filteredReglementTable.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={activeTab === 0 ? 3 : activeTab === 1 ? 5 : 4} align="center" sx={{ py: 3 }}>
                          <Typography color="text.secondary">
                            Aucun règlement trouvé pour ce mois
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      (() => {
                        let data = [];
                        switch(activeTab) {
                          case 0: // Espèces
                            data = getEspecesReglement(filteredReglementTable);
                            return data.map((e, i) => (
                              <ModernTableRow key={`espece-reglement-${i}`}>
                                <TableCell>Espèce</TableCell>
                                <TableCell>{formatNumber(e.montant)} DT</TableCell>
                                <TableCell>
                                  {e.creationDate ? format(parseISO(e.creationDate), 'dd/MM/yyyy') : '-'}
                                </TableCell>
                              </ModernTableRow>
                            ));
                          case 1: // Chèques
                            data = getChequesReglement(filteredReglementTable);
                            return data.map((c, i) => (
                              <ModernTableRow key={`cheque-reglement-${i}`}>
                                <TableCell>Chèque</TableCell>
                                <TableCell>{formatNumber(c.montant)} DT</TableCell>
                                <TableCell>
                                  {c.creationDate ? format(parseISO(c.creationDate), 'dd/MM/yyyy') : '-'}
                                </TableCell>
                                <TableCell>
                                  {c.banque ? c.banque.libelle : '-'}
                                </TableCell>
                              </ModernTableRow>
                            ));
                          case 2: // Effets
                            data = getEffetsReglement(filteredReglementTable);
                            return data.map((ef, i) => (
                              <ModernTableRow key={`effet-reglement-${i}`}>
                                <TableCell>Effet</TableCell>
                                <TableCell>{formatNumber(ef.montant)} DT</TableCell>
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