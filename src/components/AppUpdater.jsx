import { useState, useEffect } from 'react';
import { Snackbar, Alert, Button, Typography } from '@mui/material';
import UpdateIcon from '@mui/icons-material/Update';
import updateSW from '../registerSW';

/**
 * Component to handle app updates
 * This component periodically checks for updates and provides a UI for users to update the app
 */
const AppUpdater = () => {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
  useEffect(() => {
    // Function to check for updates
    const checkForUpdates = () => {
      // We'll use a custom event to communicate with the service worker
      window.addEventListener('sw-update-available', () => {
        setUpdateAvailable(true);
      });
      
      // Check for updates every 30 minutes when the app is open
      const interval = setInterval(() => {
        // This will trigger the service worker to check for updates
        // If an update is found, it will fire the 'sw-update-available' event
        try {
          updateSW(false); // false means don't skip waiting
        } catch (error) {
          console.error('Error checking for updates:', error);
        }
      }, 30 * 60 * 1000); // 30 minutes
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('sw-update-available', () => {
          setUpdateAvailable(true);
        });
      };
    };
    
    // Start checking for updates
    checkForUpdates();
  }, []);
  
  // Handle the update
  const handleUpdate = () => {
    try {
      updateSW(true); // true means skip waiting
      setUpdateAvailable(false);
    } catch (error) {
      console.error('Error updating app:', error);
    }
  };
  
  // Handle dismissing the update notification
  const handleDismiss = () => {
    setUpdateAvailable(false);
  };
  
  return (
    <Snackbar
      open={updateAvailable}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      sx={{ mb: 7 }} // Add margin to avoid overlap with bottom navigation
    >
      <Alert
        severity="info"
        sx={{
          width: '100%',
          alignItems: 'center',
          backgroundColor: '#FFF3E0',
          color: '#E65100',
        }}
        icon={<UpdateIcon />}
        action={
          <>
            <Button
              color="primary"
              size="small"
              onClick={handleUpdate}
              sx={{ mr: 1 }}
            >
              تحديث
            </Button>
            <Button
              color="inherit"
              size="small"
              onClick={handleDismiss}
            >
              لاحقاً
            </Button>
          </>
        }
      >
        <Typography variant="body2">
          تحديث جديد متاح للتطبيق
        </Typography>
      </Alert>
    </Snackbar>
  );
};

export default AppUpdater;
