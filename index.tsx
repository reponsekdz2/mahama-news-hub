import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { SettingsProvider } from './contexts/SettingsContext.tsx';
import { LanguageProvider } from './contexts/LanguageContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { LibraryProvider } from './contexts/LibraryContext.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import { urlBase64ToUint8Array } from './utils/pushHelper.ts';
import { subscribeToPushNotifications } from './services/pushService.ts';


// Prevent ServiceWorker registration on sandboxed domains like *.usercontent.goog to avoid cross-origin errors.
const isSandbox = window.location.origin.includes('usercontent.goog');

if ('serviceWorker' in navigator && !isSandbox) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
        // Ask for push notification permission after successful SW registration
        askForPushPermission(registration);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
} else if ('serviceWorker' in navigator) {
    console.log('Service worker registration skipped in sandbox environment.');
}

const askForPushPermission = async (registration: ServiceWorkerRegistration) => {
    // We only ask for permission if the user is logged in
    const user = localStorage.getItem('user');
    if (!user) return;

    const permission = await window.Notification.requestPermission();
    if (permission !== 'granted') {
        console.log('Push notification permission not granted.');
        return;
    }
    
    // Check if a subscription already exists
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
        console.log('User is already subscribed to push notifications.');
        // Optionally, send the subscription to your server again to ensure it's up-to-date
        const token = JSON.parse(user).token;
        await subscribeToPushNotifications(existingSubscription, token);
        return;
    }
    
    // Subscribe the user
    try {
        const VAPID_PUBLIC_KEY = 'BNo5Y_Nl0m_y_--iLxlL0t6ZkLIFg-2-r_gL61db-SW337yv022x3_8a_d_x_1y_r-Z_f_4Xw_1w2Z3_A4b_C5d_E';
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
        
        // Send the subscription object to your backend
        const token = JSON.parse(user).token;
        await subscribeToPushNotifications(subscription, token);
        console.log('Successfully subscribed to push notifications.');

    } catch (error) {
        console.error('Failed to subscribe to push notifications:', error);
    }
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <SettingsProvider>
          <LanguageProvider>
            <LibraryProvider>
              <App />
            </LibraryProvider>
          </LanguageProvider>
        </SettingsProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);