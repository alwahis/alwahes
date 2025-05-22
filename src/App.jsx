import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import { CssBaseline, Box } from '@mui/material';
import theme, { cacheRtl } from './theme';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import PublishRide from './pages/PublishRide';
import MyRides from './pages/MyRides';
import RequestRide from './pages/RequestRide';
import MatchingRequests from './pages/MatchingRequests';
import AllRideRequests from './pages/AllRideRequests';
import Test from './test';
import TestRides from './pages/TestRides';
import LandingPage from './pages/LandingPage';
import { Toaster } from 'react-hot-toast';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ar } from 'date-fns/locale';
import { Analytics } from '@vercel/analytics/react';
import InstallPWA from './components/InstallPWA';
import MobileNavBar from './components/MobileNavBar';
import NetworkStatus from './components/NetworkStatus';
import PullToRefresh from './components/PullToRefresh';
import OfflineManager from './components/OfflineManager';
import AppUpdater from './components/AppUpdater';
import { useState } from 'react';
import { HelmetProvider } from 'react-helmet-async';

function App() {
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle refresh function
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // In a real app, you might want to reload data from APIs here
    // For now, we'll just simulate a delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  return (
    <HelmetProvider>
      <CacheProvider value={cacheRtl}>
        <ThemeProvider theme={theme}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ar}>
            <CssBaseline />
            <Router>
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    background: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    fontFamily: theme.typography.fontFamily,
                    fontSize: '1rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
                  },
                }}
              />
              <Analytics />
              <InstallPWA />
              <NetworkStatus />
              <OfflineManager />
              <AppUpdater />
              <PullToRefresh onRefresh={handleRefresh}>
                <Box sx={{ pb: { xs: '56px', sm: 0 } }}>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/landing" element={<LandingPage />} />
                    <Route path="/search-results" element={<SearchResults />} />
                    <Route path="/results" element={<SearchResults />} />
                    <Route path="/publish-ride" element={<PublishRide />} />
                    <Route path="/my-rides" element={<MyRides />} />
                    <Route path="/request-ride" element={<RequestRide />} />
                    <Route path="/matching-requests" element={<MatchingRequests />} />
                    <Route path="/all-ride-requests" element={<AllRideRequests />} />
                    <Route path="/test-rides" element={<TestRides />} />
                  </Routes>
                  <MobileNavBar />
                </Box>
              </PullToRefresh>
            </Router>
          </LocalizationProvider>
        </ThemeProvider>
      </CacheProvider>
    </HelmetProvider>
  );
}

export default App;
