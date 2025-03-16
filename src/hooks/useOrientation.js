import { useState, useEffect } from 'react';

/**
 * Custom hook to detect and handle device orientation changes
 * @returns {Object} - Orientation information
 */
const useOrientation = () => {
  // Initialize with the current orientation
  const [orientation, setOrientation] = useState({
    type: window.screen.orientation ? window.screen.orientation.type : 'portrait-primary',
    angle: window.screen.orientation ? window.screen.orientation.angle : 0,
    isPortrait: isPortraitMode(),
    isLandscape: !isPortraitMode(),
  });

  // Helper function to determine if the device is in portrait mode
  function isPortraitMode() {
    if (window.screen.orientation) {
      return window.screen.orientation.type.includes('portrait');
    }
    // Fallback for browsers that don't support screen.orientation
    return window.innerHeight > window.innerWidth;
  }

  useEffect(() => {
    // Function to update orientation state
    const updateOrientation = () => {
      const type = window.screen.orientation ? window.screen.orientation.type : 'portrait-primary';
      const angle = window.screen.orientation ? window.screen.orientation.angle : 0;
      const isPortrait = isPortraitMode();
      
      setOrientation({
        type,
        angle,
        isPortrait,
        isLandscape: !isPortrait,
      });
    };

    // Listen for orientation changes
    if (window.screen.orientation) {
      window.screen.orientation.addEventListener('change', updateOrientation);
    } else {
      // Fallback for browsers that don't support screen.orientation
      window.addEventListener('resize', updateOrientation);
    }

    // Clean up
    return () => {
      if (window.screen.orientation) {
        window.screen.orientation.removeEventListener('change', updateOrientation);
      } else {
        window.removeEventListener('resize', updateOrientation);
      }
    };
  }, []);

  return orientation;
};

export default useOrientation;
