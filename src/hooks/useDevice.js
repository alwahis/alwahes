import { useState, useEffect } from 'react';

/**
 * Custom hook to detect device type and screen size
 * @returns {Object} - Device information
 */
const useDevice = () => {
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isIOS: false,
    isAndroid: false,
    isSafari: false,
    isChrome: false,
    isFirefox: false,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    touchSupport: false,
  });

  useEffect(() => {
    // Function to detect device type and features
    const detectDevice = () => {
      const ua = navigator.userAgent;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Detect mobile/tablet/desktop
      const isMobile = width < 768;
      const isTablet = width >= 768 && width < 1024;
      const isDesktop = width >= 1024;
      
      // Detect OS
      const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/.test(ua);
      
      // Detect browser
      const isSafari = /Safari/.test(ua) && !/Chrome/.test(ua);
      const isChrome = /Chrome/.test(ua) && !/Edge/.test(ua);
      const isFirefox = /Firefox/.test(ua);
      
      // Detect touch support
      const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      setDevice({
        isMobile,
        isTablet,
        isDesktop,
        isIOS,
        isAndroid,
        isSafari,
        isChrome,
        isFirefox,
        screenWidth: width,
        screenHeight: height,
        touchSupport,
      });
    };

    // Detect on initial load
    detectDevice();

    // Listen for resize events
    window.addEventListener('resize', detectDevice);

    // Clean up
    return () => {
      window.removeEventListener('resize', detectDevice);
    };
  }, []);

  return device;
};

export default useDevice;
