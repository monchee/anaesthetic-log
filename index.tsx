import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { registerSW } from 'virtual:pwa-register';
import { purgeStale } from '@shared/utils/ttlStorage';

// Sweep any expired patient/clinical data before the app mounts, so stale
// data never lingers on a shared workstation even if the relevant screen is
// never opened this session.
purgeStale();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

const UNLOCK_KEY = 'dream:unlocked';

function isUnlocked(): boolean {
  try { return sessionStorage.getItem(UNLOCK_KEY) === 'true'; }
  catch { return false; }
}

// Register Service Worker with improved update flow
const updateSW = registerSW({
  onNeedRefresh() {
    if (!isUnlocked()) {
      // Gate is showing — no work to lose, activate silently
      updateSW(true);
    } else {
      // User is in the app — show persistent toast
      // updateSW(true) calls skipWaiting on the waiting SW then reloads,
      // preventing the toast from looping (plain reload() leaves the new SW
      // waiting, so onNeedRefresh fires again on every reload).
      import('./src/shared/utils/toast-config').then(({ showToast }) => {
        showToast.update(() => updateSW(true));
      });
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
  onRegistered(registration) {
    console.log('Service Worker registered:', registration?.scope);

    // Check for updates every 5 minutes
    if (registration) {
      setInterval(() => {
        registration.update();
      }, 5 * 60 * 1000);

      // Visibility change — catch "back from lunch" faster than 5-min poll
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update();
        }
      });
    }
  },
  onRegisterError(error) {
    console.log('Service Worker registration error:', error);
  }
});
