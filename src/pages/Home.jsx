import { Box, Container, Typography, Paper, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Layout from '../components/Layout';

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Layout title="الصفحة الرئيسية">
      <Container maxWidth="lg">
        <Box
          sx={{
            minHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: { xs: 3, md: 5 },
            py: 4,
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            align="center"
            gutterBottom
            sx={{
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontWeight: 'bold',
              color: theme.palette.primary.main,
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            عالواهس
          </Typography>

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
                gap: 3,
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
              <AddCircleOutlineIcon
                sx={{
                  fontSize: 48,
                  color: theme.palette.primary.main,
                  transition: 'color 0.3s ease',
                }}
              />
              <Typography
                variant="h5"
                align="center"
                sx={{
                  fontWeight: 600,
                  transition: 'color 0.3s ease',
                }}
              >
                طلب رحلة
              </Typography>
            </Paper>

            <Paper
              elevation={2}
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 3,
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
              <DirectionsCarIcon
                sx={{
                  fontSize: 48,
                  color: theme.palette.primary.main,
                  transition: 'color 0.3s ease',
                }}
              />
              <Typography
                variant="h5"
                align="center"
                sx={{
                  fontWeight: 600,
                  transition: 'color 0.3s ease',
                }}
              >
                نشر رحلة
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
};

export default Home;
