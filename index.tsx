import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { registerSW } from 'virtual:pwa-register';
import { purgeStale } from '@shared/utils/ttlStorage';
import { initPwaUpdatePolicy } from '@shared/utils/pwaUpdatePolicy';

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

// Register Service Worker with safer update policy:
// - Silently auto-activates waiting SW and reloads once when at the PIN gate / locked state.
// - Retains persistent update prompt toast when unlocked to preserve clinical drafts and workflows.
// - Uses explicit skipWaiting without clientsClaim to avoid infinite reload loops.
initPwaUpdatePolicy(registerSW);
