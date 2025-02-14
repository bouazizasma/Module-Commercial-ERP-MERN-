import { createTheme, ThemeProvider } from '@mui/material/styles';
import ListeBonCommandeFournisseur from './pages/Achat/ListeBonCommandeFournisseurs';
import React from 'react';

const theme = createTheme({
  palette: {
    mode: 'light', // ou 'dark' si vous utilisez un thème sombre
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <ListeBonCommandeFournisseur />
    </ThemeProvider>
  );
}

export default App;