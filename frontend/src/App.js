import React from 'react';
import { 
  ThemeProvider, 
  createTheme,
  CssBaseline,
  Alert,
  Snackbar,
  Box,
  Fade,
  Slide,
  Grow
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
  
  // Hàm xác định kiểu transition dựa trên state
  const getTransitionType = (state) => {
    switch (state) {
      case APP_STATES.WELCOME:
      case APP_STATES.COMPLETE:
        return "fade";
      case APP_STATES.RESULTS:
      case APP_STATES.GENERATING:
        return "grow";
      default:
        return "slide";
    }
  };
  
  // Render component tương ứng với state hiện tại
  const renderCurrentScreen = () => {
    const screen = (() => {
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
    })();
    
    // Wrap với transition tương ứng
    const transitionType = getTransitionType(currentState);
    
    if (transitionType === "fade") {
      return (
        <Fade in={true} timeout={800}>
          <div className="fade-in-down">{screen}</div>
        </Fade>
      );
    } else if (transitionType === "grow") {
      return (
        <Grow in={true} timeout={600}>
          <div>{screen}</div>
        </Grow>
      );
    } else {
      return (
        <Slide direction="right" in={true} mountOnEnter unmountOnExit timeout={400}>
          <div className="slide-in-right">{screen}</div>
        </Slide>
      );
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
        <div className="page-content">
          {renderCurrentScreen()}
        </div>
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
