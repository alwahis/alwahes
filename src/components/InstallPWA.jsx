import { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Component to detect if the app can be installed as a PWA
// and show an installation prompt
const InstallPWA = () => {
  const [supportsPWA, setSupportsPWA] = useState(false);
  const [promptInstall, setPromptInstall] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for the beforeinstallprompt event
    const handler = (e) => {
      e.preventDefault();
      setSupportsPWA(true);
      setPromptInstall(e);
      
      // Show the prompt after 3 seconds if the user hasn't seen it before
      const hasSeenPrompt = localStorage.getItem('pwaPromptSeen');
      if (!hasSeenPrompt) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Handle the installation
  const handleInstallClick = (e) => {
    e.preventDefault();
    if (!promptInstall) {
      return;
    }
    
    promptInstall.prompt();
    promptInstall.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
        setIsInstalled(true);
      }
      setPromptInstall(null);
      setShowPrompt(false);
      // Mark that the user has seen the prompt
      localStorage.setItem('pwaPromptSeen', 'true');
    });
  };

  // Handle dismissing the prompt
  const handleDismiss = () => {
    setShowPrompt(false);
    // Mark that the user has seen the prompt
    localStorage.setItem('pwaPromptSeen', 'true');
  };

  // Don't show anything if PWA is not supported or already installed
  if (!supportsPWA || isInstalled || !showPrompt) {
    return null;
  }

  return (
    <Box className="install-prompt">
      <IconButton 
        onClick={handleDismiss}
        sx={{ 
          position: 'absolute', 
          top: 8, 
          right: 8,
          color: 'text.secondary',
          padding: '8px'
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
      
      <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
        تثبيت التطبيق
      </Typography>
      
      <Typography variant="body2" sx={{ mb: 2 }}>
        قم بتثبيت تطبيق عالواهس على جهازك للوصول السريع بدون متصفح
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleInstallClick}
        sx={{ fontWeight: 'bold' }}
      >
        تثبيت التطبيق
      </Button>
    </Box>
  );
};

export default InstallPWA;
