import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import theme, { cacheRtl } from './theme';
import Home from './pages/Home';
import SearchRides from './pages/SearchRides';
import SearchResults from './pages/SearchResults';
import PublishRide from './pages/PublishRide';
import MyRides from './pages/MyRides';
import RequestRide from './pages/RequestRide';
import MatchingRequests from './pages/MatchingRequests';
import AllRideRequests from './pages/AllRideRequests';
import { Toaster } from 'react-hot-toast';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ar } from 'date-fns/locale';

function App() {
  return (
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
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search-rides" element={<SearchRides />} />
              <Route path="/search-results" element={<SearchResults />} />
              <Route path="/results" element={<SearchResults />} />
              <Route path="/publish-ride" element={<PublishRide />} />
              <Route path="/my-rides" element={<MyRides />} />
              <Route path="/request-ride" element={<RequestRide />} />
              <Route path="/matching-requests" element={<MatchingRequests />} />
              <Route path="/all-ride-requests" element={<AllRideRequests />} />
            </Routes>
          </Router>
        </LocalizationProvider>
      </ThemeProvider>
    </CacheProvider>
  );
}

export default App;
