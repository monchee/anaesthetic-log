import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { registerSW } from 'virtual:pwa-register';

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

// Create a custom update notification element
const createUpdateNotification = () => {
  const notification = document.createElement('div');
  notification.id = 'pwa-update-notification';
  notification.className = 'fixed top-4 right-4 z-[9999] bg-gradient-to-r from-[#8055f1] to-[#6b42d1] text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-4 max-w-md animate-in slide-in-from-top-2 fade-in duration-300';
  notification.innerHTML = `
    <div class="flex-1">
      <div class="font-bold text-sm mb-1">New Version Available</div>
      <div class="text-xs text-white/90">A new version of the application is ready to install.</div>
    </div>
    <div class="flex gap-2">
      <button id="pwa-update-dismiss" class="px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 rounded-md transition-colors">Later</button>
      <button id="pwa-update-refresh" class="px-3 py-1.5 text-xs font-semibold bg-white text-[#8055f1] hover:bg-white/90 rounded-md transition-colors">Update Now</button>
    </div>
  `;
  document.body.appendChild(notification);

  // Add event listeners
  const dismissBtn = document.getElementById('pwa-update-dismiss');
  const refreshBtn = document.getElementById('pwa-update-refresh');

  dismissBtn?.addEventListener('click', () => {
    notification.remove();
  });

  refreshBtn?.addEventListener('click', () => {
    notification.remove();
    window.location.reload();
  });

  // Auto-dismiss after 30 seconds
  setTimeout(() => {
    if (document.body.contains(notification)) {
      notification.remove();
    }
  }, 30000);
};

// Register Service Worker with improved update notification
registerSW({
  onNeedRefresh() {
    // Remove any existing notification first
    const existing = document.getElementById('pwa-update-notification');
    if (existing) existing.remove();

    // Show custom update notification
    createUpdateNotification();
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
    }
  },
  onRegisterError(error) {
    console.log('Service Worker registration error:', error);
  }
});