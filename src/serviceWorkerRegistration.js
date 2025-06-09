// Enhanced service worker registration with better cross-browser support
const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  // [::1] is the IPv6 localhost address.
  window.location.hostname === '[::1]' ||
  // 127.0.0.1/8 is considered localhost for IPv4.
  /^127(?:\.(?:25[0-5]|2[0-4]\d|[01]?\d\d?)){3}$/.test(window.location.hostname) ||
  // Localhost through domain names
  window.location.hostname.endsWith('.localhost') ||
  // Test server
  window.location.hostname === '0.0.0.0' ||
  // Local network testing
  /^192\.168\.\d{1,3}\.\d{1,3}$/.test(window.location.hostname)
);

// Check if service workers are supported
const isServiceWorkerSupported = () => {
  return 'serviceWorker' in navigator &&
    (window.location.protocol === 'https:' || isLocalhost) &&
    window.navigator.userAgent.indexOf('MSIE ') === -1 &&
    window.navigator.userAgent.indexOf('Trident/') === -1; // IE 11
};

// Configuration object for service worker registration
const defaultConfig = {
  onSuccess: null,
  onUpdate: null
};

export function register(config = defaultConfig) {
  // Check for service worker support and HTTPS in production
  if (process.env.NODE_ENV === 'production' && isServiceWorkerSupported()) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            'This web app is being served cache-first by a service ' +
              'worker. To learn more, visit https://bit.ly/CRA-PWA'
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

async function registerValidSW(swUrl, config = defaultConfig) {
  try {
    // Check if the service worker exists before registering
    const response = await fetch(swUrl, { headers: { 'Service-Worker': 'script' } });
    
    // Check if the service worker exists and is a valid JS file
    const contentType = response.headers.get('content-type');
    if (response.status === 404 || (contentType != null && !contentType.includes('javascript'))) {
      throw new Error(`Service worker not found at ${swUrl}`);
    }

    // Register the service worker
    const registration = await navigator.serviceWorker.register(swUrl, {
      scope: '/',
      type: 'module',
      updateViaCache: 'none'
    });

    // Track updates
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New content is available
            console.log('New content is available; please refresh.');
            if (config && config.onUpdate) {
              config.onUpdate(registration);
            }
          } else {
            // Content is cached for offline use
            console.log('Content is cached for offline use.');
            if (config && config.onSuccess) {
              config.onSuccess(registration);
            }
          }
        }
      };
    };

    // Handle controller changes
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    return registration;
  } catch (error) {
    console.error('Error during service worker registration:', error);
    throw error;
  }
}

async function checkValidServiceWorker(swUrl, config = defaultConfig) {
  try {
    // Check if the service worker can be found. If it can't reload the page.
    const response = await fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
      cache: 'no-store'  // Ensure we're not getting a cached version
  });
    
    // Ensure service worker exists, and that we really are getting a JS file.
    const contentType = response.headers.get('content-type');
    if (response.status === 404 || (contentType != null && !contentType.includes('javascript'))) {
      // No service worker found. Probably a different app. Reload the page.
      console.log('No service worker found. Unregistering...');
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      window.location.reload();
    } else {
      // Service worker found. Proceed as normal.
      console.log('Service worker found. Proceeding with registration...');
      registerValidSW(swUrl, config);
    }
  } catch (error) {
    console.error('Error checking service worker:', error);
    console.log('No internet connection found or other error. App may run in limited mode.');
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
