import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Paper, Grid, TextField, IconButton, ListItemIcon, Typography } from "@mui/material";
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
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InboxIcon from "@mui/icons-material/MoveToInbox";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../appStore";
import Collapse from "@mui/material/Collapse";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import InventoryIcon from '@mui/icons-material/Inventory';
import DriveEtaIcon from '@mui/icons-material/DriveEta';
import SellIcon from '@mui/icons-material/Sell';
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

const drawerWidth = 280;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  backgroundColor: "#f5f5f5",
  borderRight: "1px solid #e0e0e0",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  backgroundColor: "#f5f5f5",
  borderRight: "1px solid #e0e0e0",
});

const Drawer = styled(MuiDrawer)(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    '& .MuiDrawer-paper': openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    '& .MuiDrawer-paper': closedMixin(theme),
  }),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
  backgroundColor: '#f5f5f5',
  borderBottom: '1px solid #e0e0e0',
}));

const MenuItem = styled(ListItemButton)(({ theme }) => ({
  '&:hover': {
    backgroundColor: '#e0e0e0',
  },
  '&.Mui-selected': {
    backgroundColor: '#e0e0e0',
    '&:hover': {
      backgroundColor: '#e0e0e0',
    },
    '& .MuiListItemIcon-root': {
      color: '#333',
    },
    '& .MuiListItemText-primary': {
      color: '#333',
    },
  },
}));

const MenuItemText = styled(ListItemText)(({ theme }) => ({
  '& .MuiTypography-root': {
    color: '#333',
  },
}));

const MenuItemIcon = styled(ListItemIcon)(({ theme }) => ({
  color: '#333',
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  margin: "4px 8px",
  borderRadius: "8px",
  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  "&.Mui-selected": {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 0.25)",
    },
  },
}));

const StyledListItemText = styled(ListItemText)(({ theme }) => ({
  "& .MuiListItemText-primary": {
    color: "white",
    fontWeight: 500,
  },
  "& .MuiListItemText-secondary": {
    color: "rgba(255, 255, 255, 0.7)",
  },
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
    { text: "Dashboard", icon: <Dashboard />, path: "/Dashbord" },
    { text: "Fournisseurs", icon: <Business />, path: "/Fournisseur" },
    { text: "Clients", 
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
        { text: "ListeFacturesClient",  icon : <DriveEtaIcon/>,path: "/ListeFacturesClient" },
        { text: "FactureParClient",  icon : <DriveEtaIcon/>,path: "/FactureParClient" },
        { text: "ReglementClient",  icon : <DriveEtaIcon/>,path: "/ReglementClient" },
        { text: "ListeDesReglements",  icon : <DriveEtaIcon/>,path: "/ListeRegelement" },

        { text: "Vehicule",  icon : <DriveEtaIcon/>,path: "/Vehicule" },



      ],
    },
    { text: "Dépôt", icon: <Warehouse />, path: "/Depot" },
    { text: "Caisse", path: "/Caisse" },

  ];

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%", px: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold", color: "#333" }}>
              {open ? "Gestion Stock" : "GS"}
            </Typography>
          </Box>
        </DrawerHeader>
        <Divider sx={{ backgroundColor: "#e0e0e0" }} />
        <List>
          {menuItems.map((item, index) => (
            <React.Fragment key={item.text}>
              {item.submenu ? (
                <>
                  <ListItemButton
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
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      "&:hover": {
                        backgroundColor: "#e0e0e0",
                      },
                      backgroundColor:
                        selectedItem === item.text
                          ? "#e0e0e0"
                          : "transparent",
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 3 : "auto",
                        justifyContent: "center",
                        color: "#333",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.text}
                      sx={{ 
                        opacity: open ? 1 : 0,
                        color: "#333"
                      }}
                    />
                    {open &&
                      (item.text === "Articles" ? (
                        openSubMenu ? (
                          <ExpandLess sx={{ color: "#333" }} />
                        ) : (
                          <ExpandMore sx={{ color: "#333" }} />
                        )
                      ) : item.text === "Achats" ? (
                        openAchatSubMenu ? (
                          <ExpandLess sx={{ color: "#333" }} />
                        ) : (
                          <ExpandMore sx={{ color: "#333" }} />
                        )
                      ) 
                      : item.text === "Ventes" ? (
                        openVentesSubMenu ? (
                          <ExpandLess sx={{ color: "#333" }} />
                        ) : (
                          <ExpandMore sx={{ color: "#333" }} />
                        )
                      ) 
                      : item.text === "Clients" ? (
                        openClientsSubMenu ? (
                          <ExpandLess sx={{ color: "#333" }} />
                        ) : (
                          <ExpandMore sx={{ color: "#333" }} />
                        )
                      ) 
                      : null)}
                  </ListItemButton>
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
                        <ListItemButton
                          key={subItem.text}
                          onClick={() => handleItemClick(subItem.path, item.text)}
                          sx={{
                            minHeight: 48,
                            justifyContent: open ? "initial" : "center",
                            px: 2.5,
                            pl: open ? 4 : 2.5,
                            "&:hover": {
                              backgroundColor: "#e0e0e0",
                            },
                          }}
                        >
                          <ListItemIcon
                            sx={{
                              minWidth: 0,
                              mr: open ? 3 : "auto",
                              justifyContent: "center",
                              color: "#333",
                            }}
                          >
                            {subItem.text === "Liste des Articles" ? (
                              <ListIcon />
                            ) : subItem.text === "Famille Article" ? (
                              <Category />
                            )
                            : subItem.text === "Liste des Clients" ? (
                              <ListIcon />
                            )
                            : subItem.text === "Secteur" ? (
                              <LocationOnIcon />
                            )
                            : subItem.text === "Region" ? (
                              <LocationOnIcon />
                            )
                             : (
                              <Inventory />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={subItem.text}
                            sx={{ 
                              opacity: open ? 1 : 0,
                              color: "#333"
                            }}
                          />
                        </ListItemButton>
                      ))}
                    </List>
                  </Collapse>
                </>
              ) : (
                <ListItemButton
                  onClick={() => handleItemClick(item.path, item.text)}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                    },
                    backgroundColor:
                      selectedItem === item.text
                        ? "#e0e0e0"
                        : "transparent",
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                      color: "#333",
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.text}
                    sx={{ 
                      opacity: open ? 1 : 0,
                      color: "#333"
                    }}
                  />
                </ListItemButton>
              )}
            </React.Fragment>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}