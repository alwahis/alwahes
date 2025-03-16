import { useState, useEffect } from 'react';
import { Snackbar, Alert, Button, Typography, Box } from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import { processOfflineQueue } from '../utils/offlineCache';

// Component to handle offline actions and synchronization
const OfflineManager = () => {
  const [hasPendingActions, setHasPendingActions] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const [actionCount, setActionCount] = useState(0);

  // Check for pending offline actions
  useEffect(() => {
    const checkOfflineQueue = () => {
      try {
        const queue = JSON.parse(localStorage.getItem('alwahes_offline_queue') || '[]');
        setHasPendingActions(queue.length > 0);
        setActionCount(queue.length);
      } catch (error) {
        console.error('Error checking offline queue:', error);
      }
    };

    // Check when component mounts
    checkOfflineQueue();

    // Check when the app comes back online
    const handleOnline = () => {
      checkOfflineQueue();
    };

    window.addEventListener('online', handleOnline);

    // Clean up
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  // Handle synchronization of offline actions
  const handleSync = async () => {
    if (!navigator.onLine) {
      return; // Can't sync when offline
    }

    setIsSyncing(true);

    try {
      // Process the offline queue
      // This would typically call your API endpoints
      const processed = await processOfflineQueue(async (action, data) => {
        // In a real app, you would implement the actual API calls here
        // For now, we'll just simulate a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('Processing offline action:', action, data);
        return true;
      });

      // Update state
      setActionCount(0);
      setHasPendingActions(false);
      setSyncComplete(true);

      // Hide the sync complete message after 3 seconds
      setTimeout(() => {
        setSyncComplete(false);
      }, 3000);
    } catch (error) {
      console.error('Error syncing offline actions:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle closing the sync complete notification
  const handleSyncCompleteClose = () => {
    setSyncComplete(false);
  };

  if (!hasPendingActions && !syncComplete) {
    return null;
  }

  return (
    <>
      {/* Pending actions notification */}
      <Snackbar
        open={hasPendingActions && !isSyncing}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 7 }} // Add margin to avoid overlap with bottom navigation
      >
        <Alert
          severity="info"
          sx={{
            width: '100%',
            alignItems: 'center',
            backgroundColor: '#E3F2FD',
            color: '#0D47A1',
          }}
          action={
            <Button
              color="primary"
              size="small"
              onClick={handleSync}
              startIcon={<SyncIcon />}
              disabled={!navigator.onLine}
            >
              مزامنة
            </Button>
          }
        >
          <Typography variant="body2">
            {actionCount} {actionCount === 1 ? 'عملية' : 'عمليات'} بانتظار المزامنة
          </Typography>
        </Alert>
      </Snackbar>

      {/* Syncing indicator */}
      <Snackbar
        open={isSyncing}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 7 }}
      >
        <Alert
          severity="info"
          sx={{
            width: '100%',
            alignItems: 'center',
            backgroundColor: '#E3F2FD',
            color: '#0D47A1',
          }}
          icon={<SyncIcon sx={{ animation: 'spin 2s linear infinite' }} />}
        >
          <Typography variant="body2">
            جاري مزامنة البيانات...
          </Typography>
        </Alert>
      </Snackbar>

      {/* Sync complete notification */}
      <Snackbar
        open={syncComplete}
        autoHideDuration={3000}
        onClose={handleSyncCompleteClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ mb: 7 }}
      >
        <Alert
          severity="success"
          sx={{
            width: '100%',
            alignItems: 'center',
            backgroundColor: '#E8F5E9',
            color: '#2E7D32',
          }}
        >
          <Typography variant="body2">
            تمت المزامنة بنجاح
          </Typography>
        </Alert>
      </Snackbar>

      {/* Add a spinning animation for the sync icon */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
};

export default OfflineManager;
