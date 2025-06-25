import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ExecDocEditor } from './components/ExecDocEditor';
import './styles/accessibility.css';

// Create custom theme with accessibility enhancements
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // WCAG AA compliant blue
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#388e3c', // WCAG AA compliant green
      contrastText: '#ffffff',
    },
    error: {
      main: '#d32f2f', // WCAG AA compliant red
    },
    warning: {
      main: '#f57c00', // WCAG AA compliant orange
    },
    info: {
      main: '#1976d2',
    },
    success: {
      main: '#388e3c',
    },
    background: {
      default: '#ffffff',
      paper: '#fafafa',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    // Ensure good line height for readability
    h1: {
      lineHeight: 1.2,
      fontWeight: 600,
    },
    h2: {
      lineHeight: 1.3,
      fontWeight: 600,
    },
    h3: {
      lineHeight: 1.4,
      fontWeight: 600,
    },
    body1: {
      lineHeight: 1.5, // WCAG recommended line height
    },
    body2: {
      lineHeight: 1.5,
    },
  },
  components: {
    // Enhanced button styles for accessibility
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: '44px', // WCAG touch target size
          textTransform: 'none', // Keep natural casing for readability
          '&:focus-visible': {
            outline: '2px solid #1976d2',
            outlineOffset: '2px',
          },
        },
      },
    },
    // Enhanced input styles for accessibility
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiInputBase-root': {
            minHeight: '44px', // WCAG touch target size
          },
          '& .MuiInputBase-input:focus-visible': {
            outline: '2px solid #1976d2',
            outlineOffset: '2px',
          },
        },
      },
    },
    // Enhanced tab styles for accessibility
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: '44px',
          textTransform: 'none',
          '&:focus-visible': {
            outline: '2px solid #1976d2',
            outlineOffset: '2px',
          },
        },
      },
    },
    // Enhanced icon button styles
    MuiIconButton: {
      styleOverrides: {
        root: {
          minWidth: '44px',
          minHeight: '44px',
          '&:focus-visible': {
            outline: '2px solid #1976d2',
            outlineOffset: '2px',
          },
        },
      },
    },
  },
});

/**
 * Main App Component
 * 
 * Root application component with accessibility setup
 * Features:
 * - WCAG 2.1 AA compliant theme
 * - Global accessibility styles
 * - CssBaseline for consistent styling
 * - Live region setup for screen reader announcements
 */
function App() {
  const handleDocumentChange = (doc: any) => {
    console.log('Document changed:', doc);
  };

  const handleSave = async (doc: any) => {
    console.log('Saving document:', doc);
    // Mock save operation
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="App">
        <ExecDocEditor
          onDocumentChange={handleDocumentChange}
          onSave={handleSave}
          aiEnabled={true}
        />
      </div>
    </ThemeProvider>
  );
}

export default App;