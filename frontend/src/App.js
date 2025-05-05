import React from 'react';
import { 
  ThemeProvider, 
  createTheme,
  CssBaseline,
  Alert,
  Snackbar,
  Box
} from '@mui/material';
import WelcomeScreen from './components/WelcomeScreen';
import CameraCapture from './components/CameraCapture';
import PromptInput from './components/PromptInput';
import GeneratingScreen from './components/GeneratingScreen';
import ResultScreen from './components/ResultScreen';
import PrintingScreen from './components/PrintingScreen';
import CompleteScreen from './components/CompleteScreen';
import { useAppState } from './context/AppStateContext';

// Tạo theme cho ứng dụng
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },
  },
});

const App = () => {
  const { 
    currentState, 
    error, 
    clearError,
    APP_STATES 
  } = useAppState();
  
  // Render component tương ứng với state hiện tại
  const renderCurrentScreen = () => {
    switch (currentState) {
      case APP_STATES.WELCOME:
        return <WelcomeScreen />;
      case APP_STATES.CAPTURE:
        return <CameraCapture />;
      case APP_STATES.PROMPT:
        return <PromptInput />;
      case APP_STATES.GENERATING:
        return <GeneratingScreen />;
      case APP_STATES.RESULTS:
        return <ResultScreen />;
      case APP_STATES.PRINTING:
        return <PrintingScreen />;
      case APP_STATES.COMPLETE:
        return <CompleteScreen />;
      default:
        return <WelcomeScreen />;
    }
  };
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* Main Container */}
      <Box className={
        currentState === APP_STATES.WELCOME || currentState === APP_STATES.COMPLETE ? 
        'fullscreen-container' : 'container'
      }>
        {renderCurrentScreen()}
      </Box>
      
      {/* Error Alert */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={clearError}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={clearError}
          severity="error"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {error}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default App;
