import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  Container,
  IconButton,
  BottomNavigation,
  BottomNavigationAction,
} from '@mui/material';
import { ArrowForward, Person } from '@mui/icons-material';

const pages = [
  { title: 'البحث عن رحلة', path: '/search-rides' },
  { title: 'نشر رحلة', path: '/publish-ride' },
  { title: 'رحلاتي', path: '/my-rides' },
];

// Mobile navigation shows only My Rides
const mobilePages = [
  { title: 'رحلاتي', path: '/my-rides' },
];

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getCurrentPageValue = () => {
    const index = mobilePages.findIndex(page => page.path === location.pathname);
    return index >= 0 ? index : 0; // Default to first tab if not found
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static" color="primary">
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              component="div"
              onClick={() => navigate('/')}
              sx={{ 
                flexGrow: 1, 
                display: 'flex',
                cursor: 'pointer',
                justifyContent: { xs: 'center', md: 'flex-start' },
                '&:hover': {
                  opacity: 0.8,
                },
              }}
            >
              عالواهس
            </Typography>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, ml: 'auto' }}>
              {pages.map((page) => (
                <Button
                  key={page.path}
                  onClick={() => navigate(page.path)}
                  sx={{ 
                    my: 2, 
                    color: 'white', 
                    display: 'block',
                    backgroundColor: location.pathname === page.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  }}
                >
                  {page.title}
                </Button>
              ))}
            </Box>

            {location.pathname !== '/' && (
              <IconButton
                color="inherit"
                onClick={() => navigate(-1)}
                sx={{ ml: 2 }}
              >
                <ArrowForward />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      <Container 
        component="main" 
        maxWidth="lg" 
        sx={{ 
          flexGrow: 1,
          py: 4,
          display: 'flex',
          flexDirection: 'column',
          mb: { xs: 7, md: 0 } // Add margin bottom on mobile for the navigation
        }}
      >
        {children}
      </Container>

      {/* Mobile Bottom Navigation */}
      <Box 
        component="nav"
        sx={{ 
          display: { xs: 'block', md: 'none' }, 
          width: '100%', 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          zIndex: 1000,
          borderTop: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper'
        }}
      >
        <BottomNavigation
          value={getCurrentPageValue()}
          onChange={(event, newValue) => {
            navigate(mobilePages[newValue].path);
          }}
          showLabels
          sx={{
            bgcolor: 'primary.main',
            '& .MuiBottomNavigationAction-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              minWidth: 0,
              padding: '6px 12px 8px',
              '&.Mui-selected': {
                color: 'white',
              },
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem',
              '&.Mui-selected': {
                fontSize: '0.75rem',
              },
            },
          }}
        >
          <BottomNavigationAction
            label={mobilePages[0].title}
            icon={<Person />}
          />
        </BottomNavigation>
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: (theme) =>
            theme.palette.mode === 'light'
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary" align="center">
            {new Date().getFullYear()} عالواهس. جميع الحقوق محفوظة
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
