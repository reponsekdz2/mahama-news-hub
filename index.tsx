import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: Add .tsx extension to module imports
import App from './App.tsx';
// Fix: Add .tsx extension to module imports
import { SettingsProvider } from './contexts/SettingsContext.tsx';
// Fix: Add .tsx extension to module imports
import { LanguageProvider } from './contexts/LanguageContext.tsx';
// Fix: Add .tsx extension to module imports
import { AuthProvider } from './contexts/AuthContext.tsx';
// Fix: Add .tsx extension to module imports
import { LibraryProvider } from './contexts/LibraryContext.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <LanguageProvider>
          <LibraryProvider>
            <App />
          </LibraryProvider>
        </LanguageProvider>
      </SettingsProvider>
    </AuthProvider>
  </React.StrictMode>
);