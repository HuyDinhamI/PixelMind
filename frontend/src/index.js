import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './assets/animations.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { AppStateProvider } from './context/AppStateContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AppStateProvider>
        <App />
      </AppStateProvider>
    </BrowserRouter>
  </React.StrictMode>
);
