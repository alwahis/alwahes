// This file is used to register the service worker for the PWA
import { registerSW } from 'virtual:pwa-register';

// Enhanced service worker registration with better user experience
const updateSW = registerSW({
  // Called when a new service worker is available
  onNeedRefresh() {
    // Create a custom update notification instead of using a browser confirm dialog
    const updateContainer = document.createElement('div');
    updateContainer.className = 'sw-update-container';
    updateContainer.style.position = 'fixed';
    updateContainer.style.bottom = '70px';
    updateContainer.style.left = '20px';
    updateContainer.style.right = '20px';
    updateContainer.style.padding = '16px';
    updateContainer.style.backgroundColor = '#fff';
    updateContainer.style.borderRadius = '12px';
    updateContainer.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    updateContainer.style.zIndex = '9999';
    updateContainer.style.textAlign = 'center';
    updateContainer.style.direction = 'rtl';
    
    updateContainer.innerHTML = `
      <div style="margin-bottom: 12px; font-weight: bold; font-size: 16px;">تحديث جديد متاح</div>
      <div style="margin-bottom: 16px; font-size: 14px;">هناك نسخة جديدة من التطبيق متاحة. قم بالتحديث للحصول على أحدث الميزات والتحسينات.</div>
      <div style="display: flex; justify-content: center; gap: 12px;">
        <button id="sw-update-button" style="background-color: #f57c00; color: white; border: none; padding: 8px 16px; border-radius: 8px; font-weight: bold; cursor: pointer;">تحديث الآن</button>
        <button id="sw-dismiss-button" style="background-color: #e0e0e0; color: #333; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer;">لاحقاً</button>
      </div>
    `;
    
    document.body.appendChild(updateContainer);
    
    // Add event listeners to buttons
    document.getElementById('sw-update-button').addEventListener('click', () => {
      updateSW(true); // The true parameter skips the waiting phase
      document.body.removeChild(updateContainer);
    });
    
    document.getElementById('sw-dismiss-button').addEventListener('click', () => {
      document.body.removeChild(updateContainer);
    });
  },
  
  // Called when the service worker is ready to handle offline requests
  onOfflineReady() {
    // Show a notification that the app is ready for offline use
    const offlineContainer = document.createElement('div');
    offlineContainer.style.position = 'fixed';
    offlineContainer.style.top = '20px';
    offlineContainer.style.left = '50%';
    offlineContainer.style.transform = 'translateX(-50%)';
    offlineContainer.style.padding = '12px 20px';
    offlineContainer.style.backgroundColor = '#4caf50';
    offlineContainer.style.color = 'white';
    offlineContainer.style.borderRadius = '8px';
    offlineContainer.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    offlineContainer.style.zIndex = '9999';
    offlineContainer.style.textAlign = 'center';
    offlineContainer.style.direction = 'rtl';
    
    offlineContainer.textContent = 'التطبيق جاهز للعمل بدون اتصال بالإنترنت';
    
    document.body.appendChild(offlineContainer);
    
    // Remove the notification after 3 seconds
    setTimeout(() => {
      if (document.body.contains(offlineContainer)) {
        document.body.removeChild(offlineContainer);
      }
    }, 3000);
    
    console.log('التطبيق جاهز للعمل بدون اتصال بالإنترنت');
  },
  
  // Called when there's an error during registration
  onRegisterError(error) {
    console.error('Service worker registration error:', error);
  }
});

// Function to check for updates periodically
function checkForUpdates() {
  // Check for updates every hour
  setInterval(() => {
    console.log('Checking for app updates...');
    updateSW(false); // The false parameter means it won't skip the waiting phase
  }, 60 * 60 * 1000); // 1 hour in milliseconds
}

// Start checking for updates
checkForUpdates();

export default updateSW;
