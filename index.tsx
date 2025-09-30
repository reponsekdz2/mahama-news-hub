import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SettingsProvider } from './contexts/SettingsContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext';
import { SavedArticlesProvider } from './contexts/SavedArticlesContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <SettingsProvider>
      <LanguageProvider>
        <AuthProvider>
          <SavedArticlesProvider>
            <App />
          </SavedArticlesProvider>
        </AuthProvider>
      </LanguageProvider>
    </SettingsProvider>
  </React.StrictMode>
);
