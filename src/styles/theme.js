import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#FF5722', // Dark orange
      light: '#FF8A65',
      dark: '#E64A19',
    },
    secondary: {
      main: '#FFA726', // Light orange
      light: '#FFB74D',
      dark: '#F57C00',
    },
    background: {
      default: '#FBE9E7',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Cairo, sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          padding: '8px 24px',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme;
