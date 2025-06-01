import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#283593', // Bleu foncé
      light: '#5f5fc4',
      dark: '#001064',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff4081', // Rose vif
      light: '#ff79b0',
      dark: '#c60055',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f5f5f5', // Gris très clair
      paper: '#ffffff',   // Blanc pur
    },
    text: {
      primary: '#212121', // Noir presque pur
      secondary: '#757575', // Gris moyen
    },
    divider: 'rgba(0, 0, 0, 0.12)', // Gris très léger
    action: {
      active: 'rgba(0, 0, 0, 0.54)',
      hover: 'rgba(0, 0, 0, 0.04)',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#7986cb', // Bleu plus clair (version éclaircie pour dark mode)
      light: '#aab6fe',
      dark: '#49599a',
      contrastText: '#000000',
    },
    secondary: {
      main: '#ff4081', // Rose (peut rester identique)
      light: '#ff79b0',
      dark: '#c60055',
      contrastText: '#000000',
    },
    background: {
      default: '#121212', // Noir profond
      paper: '#1e1e1e',   // Gris très foncé
    },
    text: {
      primary: '#ffffff', // Blanc pur
      secondary: '#b0b0b0', // Gris clair
    },
    divider: 'rgba(255, 255, 255, 0.12)', // Blanc très transparent
    action: {
      active: '#ffffff',
      hover: 'rgba(255, 255, 255, 0.08)',
    },
    // Ajouts spécifiques pour les éléments communs
    grey: {
      50: '#fafafa',  // Très clair (light)
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0', // Gris clair
      400: '#bdbdbd', // Gris moyen
      500: '#9e9e9e',
      600: '#757575',
      700: '#616161', // Gris foncé
      800: '#424242',
      900: '#212121', // Très foncé (dark)
      A100: '#d5d5d5',
      A200: '#aaaaaa',
      A400: '#303030', // Gris très foncé
      A700: '#616161',
    },
  },
  components: {
    // Personnalisations spécifiques des composants
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: '#1e1e1e',
          color: '#ffffff',
        },
      },
    },
  },
});