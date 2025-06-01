import * as React from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Button,
  TextField,
  Avatar,
  CircularProgress
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Lock as LockIcon,
  AccountCircle as AccountIcon,
  DarkMode as DarkModeIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../appStore';
import MenuItem from '@mui/material/MenuItem';
import Sidenav from "../navbar/Sidenav";
import Navbar from "../navbar/Navbar";
import { toast } from 'react-toastify';
import { styled, useTheme } from '@mui/material/styles'; 
const SettingsContainer = styled(Container)(({ theme }) => ({
  paddingTop: theme.spacing(4),
  paddingBottom: theme.spacing(4),
}));

const SettingsPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
 background: theme.palette.background.paper
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.main,
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: 'rgba(40, 53, 147, 0.05)',
  },
}));

const ThemeButton = styled(Button)(({ theme, active }) => ({
  margin: theme.spacing(0.5),
  border: active ? `2px solid ${theme.palette.primary.main}` : '1px solid #ddd',
  fontWeight: active ? 'bold' : 'normal',
}));

export default function SettingsPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const {
    dopen,
    mode,
    toggleMode,
    notificationsEnabled,
    toggleNotifications
  } = useAppStore();

  const [language, setLanguage] = React.useState('fr');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  return (
    <>
     <Navbar />
          <Box height={364} />
          <Sidenav />
          
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        p: 3,
        marginLeft: dopen ? '240px' : '0',
        transition: 'margin-left 0.3s ease',
        backgroundColor: theme.palette.background.default,
      }}
    >
      <SettingsContainer maxWidth="md">
        <SettingsPaper elevation={3}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <SettingsIcon sx={{ fontSize: 32, mr: 2, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Paramètres
            </Typography>
          </Box>

          {/* Section Apparence */}
          <Box mb={4}>
            <SectionTitle variant="h6">
              <PaletteIcon /> Apparence
            </SectionTitle>
            <Divider sx={{ mb: 2 }} />

            <List>
              <StyledListItem>
                <ListItemIcon>
                  <DarkModeIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Mode sombre" 
                  secondary="Activer/désactiver le mode sombre" 
                />
                <Switch
                  checked={mode === 'dark'}
                  onChange={toggleMode}
                  color="primary"
                />
              </StyledListItem>
            </List>
          </Box>

          {/* Section Notifications */}
          <Box mb={4}>
            <SectionTitle variant="h6">
              <NotificationsIcon /> Notifications
            </SectionTitle>
            <Divider sx={{ mb: 2 }} />

            <List>
              <StyledListItem>
                <ListItemIcon>
                  <NotificationsIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Notifications" 
                  secondary="Activer/désactiver les notifications" 
                />
                <Switch
                  checked={notificationsEnabled}
                  onChange={toggleNotifications}
                  color="primary"
                />
              </StyledListItem>
            </List>
          </Box>

          {/* Section Langue */}
          <Box mb={4}>
            <SectionTitle variant="h6">
              <LanguageIcon /> Langue
            </SectionTitle>
            <Divider sx={{ mb: 2 }} />

            <List>
              <StyledListItem>
                <ListItemIcon>
                  <LanguageIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Langue de l'application" 
                  secondary="Choisissez votre langue préférée" 
                />
                <TextField
                  select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  variant="outlined"
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  <MenuItem value="fr">Français</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                  <MenuItem value="es">Español</MenuItem>
                </TextField>
              </StyledListItem>
            </List>
          </Box>

        

          {/* Section Compte */}
          <Box mb={4}>
            <SectionTitle variant="h6">
              <AccountIcon /> Compte
            </SectionTitle>
            <Divider sx={{ mb: 2 }} />

            <List>
              <StyledListItem>
                <ListItemIcon>
                  <LogoutIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Déconnexion" 
                  secondary="Se déconnecter de votre compte" 
                />
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleLogout}
                  startIcon={<LogoutIcon />}
                >
                  Déconnexion
                </Button>
              </StyledListItem>
            </List>
          </Box>
        </SettingsPaper>
      </SettingsContainer>
    </Box>
    </>
  );
}