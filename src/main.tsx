import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { CompanySettingsProvider } from './context/CompanySettingsContext';
import './styles.css';
import './styles/enterprise-layout.css';
import './styles/landing.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <CompanySettingsProvider>
        <App />
      </CompanySettingsProvider>
    </ThemeProvider>
  </StrictMode>,
);
