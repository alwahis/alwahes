import { useState, useEffect } from 'react';
import { Snackbar, Alert, Box, Typography } from '@mui/material';
import WifiOffIcon from '@mui/icons-material/WifiOff';
import WifiIcon from '@mui/icons-material/Wifi';

// Component to detect and display network status
const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showReconnected, setShowReconnected] = useState(false);

  useEffect(() => {
    // Function to update online status
    const handleOnline = () => {
      setIsOnline(true);
      setShowReconnected(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle closing the reconnected notification
  const handleCloseReconnected = () => {
    setShowReconnected(false);
  };

  return (
    <>
      {/* Offline notification */}
      <Snackbar
        open={!isOnline}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="warning"
          icon={<WifiOffIcon />}
          sx={{
            width: '100%',
            alignItems: 'center',
            backgroundColor: '#FFF3E0',
            color: '#E65100',
            '& .MuiAlert-icon': {
              color: '#E65100',
            },
          }}
        >
          <Typography variant="body2">
            أنت غير متصل بالإنترنت. بعض الميزات قد لا تعمل.
          </Typography>
        </Alert>
      </Snackbar>

      {/* Reconnected notification */}
      <Snackbar
        open={showReconnected}
        autoHideDuration={3000}
        onClose={handleCloseReconnected}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          icon={<WifiIcon />}
          sx={{
            width: '100%',
            alignItems: 'center',
            backgroundColor: '#E8F5E9',
            color: '#2E7D32',
            '& .MuiAlert-icon': {
              color: '#2E7D32',
            },
          }}
        >
          <Typography variant="body2">
            تم استعادة الاتصال بالإنترنت
          </Typography>
        </Alert>
      </Snackbar>
    </>
  );
};

export default NetworkStatus;
