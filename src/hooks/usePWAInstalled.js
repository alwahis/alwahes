import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the app is running as an installed PWA
 * @returns {boolean} - True if the app is installed as a PWA
 */
const usePWAInstalled = () => {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is running in standalone mode (installed PWA)
    const checkIfInstalled = () => {
      // iOS detection
      const isIOSPWA = window.navigator.standalone;
      
      // Android/desktop detection
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      
      setIsInstalled(isIOSPWA || isStandalone);
    };

    // Check on initial load
    checkIfInstalled();

    // Also check when the display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e) => {
      setIsInstalled(e.matches);
    };

    // Add listener (using the appropriate method based on browser support)
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      // Older browsers
      mediaQuery.addListener(handleChange);
    }

    // Clean up
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.removeListener) {
        // Older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  return isInstalled;
};

export default usePWAInstalled;
