import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import ListIcon from '@mui/icons-material/List';
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InboxIcon from "@mui/icons-material/MoveToInbox";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../appStore";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import InventoryIcon from '@mui/icons-material/Inventory';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import SellIcon from '@mui/icons-material/Sell';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AirplayIcon from '@mui/icons-material/Airplay';
import RoofingIcon from '@mui/icons-material/Roofing';
import {
  Home,
  People,
  Business,
  Inventory,
  Category,
  ShoppingCart,
  Receipt,
  Warehouse,
  Dashboard,
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import Typography from "@mui/material/Typography";

const drawerWidth = 280;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  backgroundColor: "#ffffff",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
  boxShadow: "4px 0 20px rgba(0, 0, 0, 0.08)",
  borderRight: "1px solid #e2e8f0",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.easeOut,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(8)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(9)} + 1px)`,
  },
  backgroundColor: "#ffffff",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%)",
  boxShadow: "4px 0 20px rgba(0, 0, 0, 0.08)",
  borderRight: "1px solid #e2e8f0",
});

const Drawer = styled(MuiDrawer)(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
    boxSizing: "border-box",
    ...(open && openedMixin(theme)),
    ...(!open && closedMixin(theme)),
    // Styles globaux pour la scrollbar
    '&::-webkit-scrollbar': {
      width: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(100, 116, 139, 0.3)',
      borderRadius: '4px',
      '&:hover': {
        backgroundColor: 'rgba(100, 116, 139, 0.5)',
      },
    },
    // Pour Firefox
    scrollbarWidth: 'thin',
    scrollbarColor: 'rgba(100, 116, 139, 0.3) transparent',

  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 2),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
  background: 'rgba(59, 130, 246, 0.05)',
  borderBottom: '1px solid #e2e8f0',
}));

const MenuItem = styled(ListItemButton)(({ theme }) => ({
  margin: '4px 8px',
  borderRadius: '8px',
  padding: '8px 12px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    transform: 'translateX(4px)',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#3b82f6',
    '&:hover': {
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
    },
    '& .MuiListItemIcon-root': {
      color: '#3b82f6',
    },
  },
}));

const MenuItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiTypography-root': {
    color: '#475569',
    fontWeight: 500,
    fontSize: '0.9rem',
  },
  '&.Mui-selected .MuiTypography-root': {
    color: '#3b82f6',
  },
}));

const MenuItemIcon = styled(ListItemIcon)(({ theme }) => ({
  color: '#64748b',
  minWidth: '40px !important',
  '&.Mui-selected': {
    color: '#3b82f6',
  },
}));

const SubMenuItem = styled(ListItemButton)(({ theme }) => ({
  padding: '6px 12px 6px 36px',
  margin: '2px 8px',
  borderRadius: '6px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    transform: 'translateX(4px)',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    color: '#10b981',
    '&:hover': {
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
    },
    '& .MuiListItemIcon-root': {
      color: '#10b981',
    },
  },
}));

const SubMenuIcon = styled(ListItemIcon)(({ theme }) => ({
  color: '#64748b',
  minWidth: '36px !important',
  '&.Mui-selected': {
    color: '#10b981',
  },
}));

const SubMenuText = styled(ListItemText)(({ theme }) => ({
  '& .MuiTypography-root': {
    color: '#64748b',
    fontSize: '0.85rem',
  },
  '&.Mui-selected .MuiTypography-root': {
    color: '#10b981',
  },
}));

const LogoText = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '1.2rem',
  background: 'linear-gradient(90deg, #3b82f6 0%, #1e40af 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  letterSpacing: '0.5px',
}));

export default function Sidenav() {
  const theme = useTheme();
  const navigate = useNavigate();
  const open = useAppStore((state) => state.dopen);
  const [openSubMenu, setOpenSubMenu] = React.useState(false);
  const [openAchatSubMenu, setOpenAchatSubMenu] = React.useState(false);
  const [openVentesSubMenu, setOpenVentesSubMenu] = React.useState(false);
  const [openClientsSubMenu, setOpenClientsSubMenu] = React.useState(false);
  const [selectedItem, setSelectedItem] = React.useState("");

  const handleSubMenuClick = (event) => {
    event.stopPropagation();
    setOpenSubMenu(!openSubMenu);
  };

  const handleAchatSubMenuClick = (event) => {
    event.stopPropagation();
    setOpenAchatSubMenu(!openAchatSubMenu);
  };

  const handleVentestSubMenuClick = (event) => {
    event.stopPropagation();
    setOpenVentesSubMenu(!openVentesSubMenu);
  };

  const handleClientstSubMenuClick = (event) => {
    event.stopPropagation();
    setOpenClientsSubMenu(!openClientsSubMenu);
  };

  const handleItemClick = (path, itemName) => {
    navigate(path);
    setSelectedItem(itemName);
  };

  const menuItems = [
    { text: "Dashboard", icon: <AutoGraphIcon />, path: "/Dashbord" },
    { text: "Fournisseurs", icon: <Business />, path: "/Fournisseur" },
    {
      text: "Clients",
      icon: <People />,
      submenu: [
        { text: "Liste des Clients", path: "/Client" },
        { text: "Secteur", path: "/Secteur" },
        { text: "BanqueClient", path: "/BanqueClient" },
        { text: "Region", path: "/Region" },
      ],
    },
    {
      text: "Articles",
      icon: <Inventory />,
      submenu: [
        { text: "Liste des Articles", path: "/article" },
        { text: "Famille Article", path: "/FamilleArticle" },
        { text: "Catégorie Article", path: "/CategorieArticle" },
      ],
    },
    {
      text: "Achats",
      icon: <ShoppingCart />,
      submenu: [
        { text: "Saisie BCF", path: "/BonCommandeFournisseur" },
        { text: "Liste des BonCommandeF", path: "/ListeBonCommandeFournisseur" },
        { text: "Saisie BEF", path: "/BonReceptionFournisseur" },
        { text: "Liste des BEF", path: "/ListeBonReceptionFournisseur" },
        { text: "Liste des Factures", path: "/ListeFactures" },
        { text: "Facture par Fournisseur", path: "/FactureParFournisseur" },
        { text: "Paiement Fournisseur", path: "/PaiementFournisseur" },
        { text: "Liste des Paiements", path: "/ListePaiements" },
        { text: "Banque", path: "/Banque" },
      ],
    },
    {
      text: "Ventes",
      icon: <SellIcon/>,
      submenu: [
        { text: "Saisie Devis", path: "/SaisieDevis" },
        { text: "Liste des Devis", path: "/ListeDevisClient" },
        { text: "Saisie BonCMDClient", path: "/SaisieBonCommandeClient" },
        { text: "Liste des BonCMDClient", path: "/ListeBonCommandeClient" },
        { text: "Saisie BL Client", path: "/SaisieBonLivraisonClient" },
        { text: "Liste des BonLivraison", path: "/ListeBonLivraisonClient" },
        { text: "ListeFacturesClient", icon: <DriveEtaIcon/>, path: "/ListeFacturesClient" },
        { text: "FactureParClient", icon: <DriveEtaIcon/>, path: "/FactureParClient" },
        { text: "ReglementClient", icon: <DriveEtaIcon/>, path: "/ReglementClient" },
        { text: "ListeDesReglements", icon: <DriveEtaIcon/>, path: "/ListeRegelement" },
        { text: "Vehicule", icon: <DriveEtaIcon/>, path: "/Vehicule" },
      ],
    },
    { text: "Dépôt", icon: <Warehouse />, path: "/Depot" },
    { text: "Caisse", icon: <AirplayIcon/>, path: "/Caisse" },
    { text: "STOCK", icon: <ShowChartIcon/>, path: "/ConsulterStock" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          {open ? (
            <LogoText variant="h6">Gestion Stock</LogoText>
          ) : (
            <LogoText variant="h6">GS</LogoText>
          )}
        </DrawerHeader>
        <Divider sx={{ borderColor: '#e2e8f0' }} />
        <List sx={{
          padding: '8px',
          overflowY: 'auto',
          height: 'calc(100vh - 64px)',
          '& .MuiListItemButton-root': {
            paddingLeft: '16px',

          }
        }}>
          {menuItems.map((item) => (
            <React.Fragment key={item.text}>
              {item.submenu ? (
                <>
                  <MenuItem
                    onClick={
                      item.text === "Articles"
                        ? handleSubMenuClick
                        : item.text === "Achats"
                        ? handleAchatSubMenuClick
                        : item.text === "Ventes"
                        ? handleVentestSubMenuClick
                        : item.text === "Clients"
                        ? handleClientstSubMenuClick
                        : undefined
                    }
                    selected={selectedItem === item.text}
                  >
                    <MenuItemIcon>
                      {item.icon}
                    </MenuItemIcon>
                    <MenuItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                    {open && (
                      item.text === "Articles" ?
                      (openSubMenu ? <ExpandLess sx={{ color: '#64748b' }} /> : <ExpandMore sx={{ color: '#64748b' }} />) :
                      item.text === "Achats" ?
                      (openAchatSubMenu ? <ExpandLess sx={{ color: '#64748b' }} /> : <ExpandMore sx={{ color: '#64748b' }} />) :
                      item.text === "Ventes" ?
                      (openVentesSubMenu ? <ExpandLess sx={{ color: '#64748b' }} /> : <ExpandMore sx={{ color: '#64748b' }} />) :
                      item.text === "Clients" ?
                      (openClientsSubMenu ? <ExpandLess sx={{ color: '#64748b' }} /> : <ExpandMore sx={{ color: '#64748b' }} />) :
                      null
                    )}
                  </MenuItem>
                  <Collapse
                    in={
                      item.text === "Articles"
                        ? openSubMenu
                        : item.text === "Achats"
                        ? openAchatSubMenu
                        : item.text === "Ventes"
                        ? openVentesSubMenu
                        : item.text === "Clients"
                        ? openClientsSubMenu
                        : false
                    }
                    timeout="auto"
                    unmountOnExit
                  >
                    <List component="div" disablePadding>
                      {item.submenu.map((subItem) => (
                        <SubMenuItem
                          key={subItem.text}
                          onClick={() => handleItemClick(subItem.path, item.text)}
                          selected={selectedItem === item.text}
                        >
                          <SubMenuIcon>
                            {subItem.text === "Liste des Articles" ? (
                              <ListIcon />
                            ) : subItem.text === "Famille Article" ? (
                              <Category />
                            ) : subItem.text === "Liste des Clients" ? (
                              <ListIcon />
                            ) : subItem.text === "Secteur" ? (
                              <LocationOnIcon />
                            ) : subItem.text === "Region" ? (
                              <RoofingIcon />
                            ) : subItem.text === "BanqueClient" ? (
                              <AccountBalanceIcon />
                            ) : (
                              <Inventory />
                            )}
                          </SubMenuIcon>
                          <SubMenuText primary={subItem.text} sx={{ opacity: open ? 1 : 0 }} />
                        </SubMenuItem>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <MenuItem
                  onClick={() => handleItemClick(item.path, item.text)}
                  selected={selectedItem === item.text}
                >
                  <MenuItemIcon>
                    {item.icon}
                  </MenuItemIcon>
                  <MenuItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                </MenuItem>
              )}
            </React.Fragment>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}