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
  Link,
  Grid,
  Divider,
} from '@mui/material';
import { 
  ArrowForward, 
  Person, 
  Search, 
  DirectionsCar,
  Facebook as FacebookIcon,
  Instagram as InstagramIcon 
} from '@mui/icons-material';

const pages = [
  { title: 'نشر رحلة', path: '/publish-ride' },
  { title: 'بحث عن رحلة', path: '/request-ride' },
  { title: 'رحلاتي', path: '/my-rides' },
];

// Mobile navigation
const mobilePages = [
  { title: 'نشر رحلة', path: '/publish-ride' },
  { title: 'بحث عن رحلة', path: '/request-ride' },
  { title: 'رحلاتي', path: '/my-rides' },
];

const Layout = ({ children, title }) => {
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
                flexGrow: 0, 
                display: 'flex',
                cursor: 'pointer',
                justifyContent: { xs: 'center', md: 'flex-start' },
                alignItems: 'center',
                '&:hover': {
                  opacity: 0.8,
                },
                mr: 2
              }}
            >
              <Typography 
                variant="h6" 
                component="div"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.5rem',
                  color: 'white'
                }}
              >
                عالواهس
              </Typography>
            </Typography>
            
            {title && (
              <Typography
                variant="h6"
                noWrap
                component="div"
                sx={{ 
                  flexGrow: 1,
                  textAlign: 'center'
                }}
              >
                {title}
              </Typography>
            )}

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
                aria-label="العودة للصفحة السابقة"
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
          {mobilePages.map((page, index) => (
            <BottomNavigationAction
              key={index}
              label={page.title}
              icon={
                page.path === '/publish-ride' ? <DirectionsCar /> :
                page.path === '/request-ride' ? <Search /> :
                <Person />
              }
            />
          ))}
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
        <Container maxWidth="lg">
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                عالواهس
              </Typography>
              <Typography variant="body2" color="text.secondary">
                منصة لمشاركة الرحلات والتنقل بين المدن العراقية
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                روابط سريعة
              </Typography>
              <Box component="nav">
                <Link 
                  component="button" 
                  variant="body2" 
                  onClick={() => navigate('/')}
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  الرئيسية
                </Link>
                <Link 
                  component="button" 
                  variant="body2" 
                  onClick={() => navigate('/publish-ride')}
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  نشر رحلة
                </Link>
                <Link 
                  component="button" 
                  variant="body2" 
                  onClick={() => navigate('/request-ride')}
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  بحث عن رحلة
                </Link>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                تواصل معنا
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <IconButton 
                  href="https://www.facebook.com/profile.php?id=61572519516458"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  sx={{ 
                    color: '#3b5998',
                    backgroundColor: 'rgba(59, 89, 152, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(59, 89, 152, 0.2)',
                    }
                  }}
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton 
                  href="https://www.instagram.com/alwahes1?igsh=ZHV3dnZwZGsxNXA="
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  sx={{ 
                    color: '#e1306c',
                    backgroundColor: 'rgba(225, 48, 108, 0.1)',
                    '&:hover': {
                      backgroundColor: 'rgba(225, 48, 108, 0.2)',
                    }
                  }}
                >
                  <InstagramIcon />
                </IconButton>
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary" align="center">
            {new Date().getFullYear()} عالواهس. جميع الحقوق محفوظة
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
