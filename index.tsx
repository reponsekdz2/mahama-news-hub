
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// FIX: Import SettingsProvider to make the theme context available to the entire app.
import { SettingsProvider } from './contexts/SettingsContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* FIX: Wrap the App component with SettingsProvider to enable theme functionality. */}
    <SettingsProvider>
      <App />
    </SettingsProvider>
  </React.StrictMode>
);
