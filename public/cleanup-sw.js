// This script helps clean up any existing service workers and caches
// It should be run in the browser console to reset the service worker state

// Unregister all service workers
async function unregisterAllServiceWorkers() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (let registration of registrations) {
    console.log('Unregistering service worker:', registration);
    await registration.unregister();
  }
  console.log('All service workers unregistered');
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => {
      console.log('Deleting cache:', cacheName);
      return caches.delete(cacheName);
    })
  );
  console.log('All caches deleted');
}

// Run cleanup
async function cleanup() {
  try {
    await unregisterAllServiceWorkers();
    await clearAllCaches();
    console.log('Cleanup complete. Please refresh the page.');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// Execute cleanup
cleanup();
