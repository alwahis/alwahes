import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Paper, 
  BottomNavigation, 
  BottomNavigationAction, 
  Box
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import RequestPageIcon from '@mui/icons-material/RequestPage';

// Mobile bottom navigation component
const MobileNavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [value, setValue] = useState(0);

  // Update the selected tab based on the current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setValue(0);
    else if (path === '/search-results' || path === '/results') setValue(1);
    else if (path === '/publish-ride') setValue(2);
    else if (path === '/my-rides') setValue(3);
    else if (path === '/request-ride') setValue(4);
    else setValue(0); // Default to home for other routes
  }, [location]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/search-results');
        break;
      case 2:
        navigate('/publish-ride');
        break;
      case 3:
        navigate('/my-rides');
        break;
      case 4:
        navigate('/request-ride');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <Box className="mobile-only" sx={{ width: '100%', position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          borderTopLeftRadius: 16, 
          borderTopRightRadius: 16,
          overflow: 'hidden'
        }}
      >
        <BottomNavigation
          value={value}
          onChange={handleChange}
          showLabels
          sx={{
            height: 'calc(56px + env(safe-area-inset-bottom))',
            paddingBottom: 'env(safe-area-inset-bottom)',
            '& .MuiBottomNavigationAction-root': {
              minWidth: 'auto',
              padding: '6px 0',
              color: 'text.secondary',
            },
            '& .Mui-selected': {
              color: 'primary.main',
            }
          }}
        >
          <BottomNavigationAction label="الرئيسية" icon={<HomeIcon />} />
          <BottomNavigationAction label="بحث" icon={<SearchIcon />} />
          <BottomNavigationAction 
            label="نشر رحلة" 
            icon={
              <Box 
                sx={{ 
                  bgcolor: 'primary.main', 
                  borderRadius: '50%', 
                  p: 1,
                  transform: 'translateY(-8px)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                <AddIcon sx={{ color: 'white' }} />
              </Box>
            } 
          />
          <BottomNavigationAction label="رحلاتي" icon={<PersonIcon />} />
          <BottomNavigationAction label="طلب رحلة" icon={<RequestPageIcon />} />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default MobileNavBar;
