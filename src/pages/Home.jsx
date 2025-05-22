import { Box, Typography, Paper, useTheme, useMediaQuery, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AddRoadIcon from '@mui/icons-material/AddRoad';
import Layout from '../components/Layout';
import ResponsiveContainer from '../components/ResponsiveContainer';
import SEO from '../components/SEO';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // Structured data for rich results
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "عالواهس - منصة مشاركة الرحلات",
    "url": "https://www.alwahes.com",
    "applicationCategory": "TransportationApplication",
    "operatingSystem": "Web, iOS, Android",
    "description": "منصة عالواهس لمشاركة الرحلات والتنقل بين المدن العراقية بسهولة وأمان",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IQD"
    },
    "author": {
      "@type": "Organization",
      "name": "عالواهس",
      "url": "https://www.alwahes.com",
      "logo": "https://www.alwahes.com/icons/logo.svg",
      "sameAs": [
        "https://www.facebook.com/profile.php?id=61572519516458",
        "https://www.instagram.com/alwahes1?igsh=ZHV3dnZwZGsxNXA="
      ]
    }
  };

  return (
    <Layout>
      <SEO 
        title="عالواهس - منصة مشاركة الرحلات للمدن العراقية | Alwahes"
        description="عالواهس هي منصة عراقية لمشاركة الرحلات والتنقل بين المدن العراقية. وفر المال والوقت من خلال العثور على رحلات مشتركة أو نشر رحلتك الخاصة."
        canonicalUrl="https://www.alwahes.com/"
        structuredData={structuredData}
      />
      <ResponsiveContainer maxWidth="lg">
        <Box
          sx={{
            minHeight: { xs: 'calc(100vh - 120px)', md: '80vh' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: { xs: 3, md: 5 },
            py: { xs: 2, md: 4 },
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 2,
              width: '100%',
              maxWidth: '350px'
            }}
          >
            <img
              src="/images/logo-full.png"
              alt="عالواهس Logo"
              style={{
                width: '100%',
                height: 'auto',
                margin: '0 auto 10px auto',
                borderRadius: '8px'
              }}
            />
          </Box>

          <Typography
            variant="h5"
            align="center"
            color="text.secondary"
            sx={{
              maxWidth: '600px',
              mb: 4,
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              lineHeight: 1.6,
            }}
          >
            منصة لمشاركة الرحلات والتنقل بين المدن العراقية
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 4,
              width: '100%',
              maxWidth: '800px',
            }}
          >
            <Paper
              elevation={2}
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: theme.palette.background.paper,
                '&:hover': {
                  transform: 'translateY(-8px)',
                  backgroundColor: theme.palette.primary.main,
                  '& .MuiSvgIcon-root, & .MuiTypography-root': {
                    color: '#fff',
                  },
                },
              }}
              onClick={() => navigate('/request-ride')}
            >
              <SearchIcon
                sx={{
                  fontSize: 48,
                  color: theme.palette.primary.main,
                  transition: 'color 0.3s ease',
                }}
              />
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    transition: 'color 0.3s ease',
                    mb: 1
                  }}
                >
                  بحث عن رحلة
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    transition: 'color 0.3s ease',
                  }}
                >
                  للمسافرين - ابحث عن رحلة تناسبك
                </Typography>
              </Box>
            </Paper>

            <Paper
              elevation={2}
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: theme.palette.background.paper,
                '&:hover': {
                  transform: 'translateY(-8px)',
                  backgroundColor: theme.palette.primary.main,
                  '& .MuiSvgIcon-root, & .MuiTypography-root': {
                    color: '#fff',
                  },
                },
              }}
              onClick={() => navigate('/publish-ride')}
            >
              <AddRoadIcon 
                sx={{
                  fontSize: 48,
                  color: theme.palette.primary.main,
                  transition: 'color 0.3s ease',
                }}
              />
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    transition: 'color 0.3s ease',
                    mb: 1
                  }}
                >
                  نشر رحلة
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    transition: 'color 0.3s ease',
                  }}
                >
                  للسائقين - أعلن عن رحلتك القادمة
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </ResponsiveContainer>
    </Layout>
  );
};

export default Home;
