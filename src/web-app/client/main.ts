import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .then(() => registerServiceWorker())
  .catch(err => console.error(err));

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/service-worker.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
          
          // Check for connectivity and trigger sync when online
          if (navigator.onLine && registration.sync) {
            registration.sync.register('sync-pending-requests');
          }
        })
        .catch(err => {
          console.log('ServiceWorker registration failed: ', err);
        });
    });
  }
}

// Network status detection
window.addEventListener('online', () => {
  console.log('Application is online. Syncing data...');
  
  // Get the service worker registration
  navigator.serviceWorker.ready.then(registration => {
    if (registration.sync) {
      // Register for background sync
      registration.sync.register('sync-pending-requests');
    }
  });
});

window.addEventListener('offline', () => {
  console.log('Application is offline. Working in offline mode.');
});