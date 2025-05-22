import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Grid, 
  Paper, 
  useTheme, 
  Card, 
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import SecurityIcon from '@mui/icons-material/Security';
import PhoneIcon from '@mui/icons-material/Phone';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SEO from '../components/SEO';

const cities = ['بغداد', 'البصرة', 'أربيل', 'الموصل', 'كربلاء', 'النجف', 'السليمانية', 'دهوك'];

const testimonials = [
  {
    name: 'أحمد محمد',
    text: 'منصة عالواهس سهلت علي العثور على رحلات مناسبة بين بغداد والبصرة بأسعار معقولة.',
    city: 'بغداد'
  },
  {
    name: 'سارة علي',
    text: 'كسائق، ساعدتني المنصة على ملء المقاعد الفارغة في سيارتي وتوفير تكاليف الوقود.',
    city: 'أربيل'
  },
  {
    name: 'محمد جاسم',
    text: 'تطبيق رائع وسهل الاستخدام، وجدت رحلة مشتركة إلى النجف في دقائق معدودة.',
    city: 'كربلاء'
  }
];

const features = [
  {
    icon: <SearchIcon fontSize="large" color="primary" />,
    title: 'بحث سهل وسريع',
    description: 'ابحث عن رحلات بين المدن العراقية بسهولة وسرعة.'
  },
  {
    icon: (
      <Typography 
        variant="h5" 
        color="primary"
        sx={{ fontWeight: 'bold', fontFamily: 'Tajawal, Arial, sans-serif' }}
      >
        عالواهس
      </Typography>
    ),
    title: 'نشر رحلتك',
    description: 'شارك رحلتك مع الآخرين ووفر تكاليف السفر',
  },
  {
    icon: <LocationOnIcon fontSize="large" color="primary" />,
    title: 'تغطية واسعة',
    description: 'نغطي جميع المدن الرئيسية في العراق.'
  },
  {
    icon: <SecurityIcon fontSize="large" color="primary" />,
    title: 'أمان وموثوقية',
    description: 'منصة آمنة وموثوقة لمشاركة الرحلات.'
  }
];

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeCity, setActiveCity] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCity((prev) => (prev + 1) % cities.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "عالواهس - منصة مشاركة الرحلات",
    "url": "https://www.alwahes.com",
    "applicationCategory": "TransportationApplication",
    "operatingSystem": "Web",
    "description": "منصة عالواهس لمشاركة الرحلات والتنقل بين المدن العراقية بسهولة وأمان",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "IQD"
    },
    "author": {
      "@type": "Organization",
      "name": "عالواهس",
      "url": "https://www.alwahes.com"
    }
  };

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <SEO 
        title="عالواهس - منصة مشاركة الرحلات في العراق"
        description="منصة عالواهس لمشاركة الرحلات والتنقل بين المدن العراقية بسهولة وأمان. وفر في تكاليف السفر وساهم في تقليل الازدحام."
        structuredData={structuredData}
      />
      
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url('/hero-background.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          py: { xs: 8, md: 12 },
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <Container maxWidth="lg">
          <Typography 
            variant="h1" 
            component="h1" 
            sx={{ 
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 'bold',
              mb: 2
            }}
          >
            عالواهس
          </Typography>
          
          <Typography 
            variant="h2" 
            component="h2" 
            sx={{ 
              fontSize: { xs: '1.5rem', md: '2.5rem' },
              mb: 4,
              color: theme.palette.primary.main
            }}
          >
            منصة مشاركة الرحلات في العراق
          </Typography>
          
          <Typography 
            variant="h3" 
            component="div" 
            sx={{ 
              fontSize: { xs: '1.2rem', md: '1.8rem' },
              mb: 6,
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            سافر بين{' '}
            <Box 
              component="span" 
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 'bold',
                display: 'inline-block',
                minWidth: { xs: '80px', md: '120px' }
              }}
            >
              {cities[activeCity]}
            </Box>{' '}
            وجميع المدن العراقية بسهولة وبتكلفة أقل
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large" 
              component={RouterLink}
              to="/request-ride"
              startIcon={<SearchIcon />}
              sx={{ 
                py: 1.5, 
                px: 4, 
                fontSize: '1.1rem',
                borderRadius: '30px'
              }}
            >
              ابحث عن رحلة
            </Button>
            
            <Button 
              variant="outlined" 
              size="large"
              component={RouterLink}
              to="/publish-ride" 
              startIcon={
                <Typography 
                  sx={{ 
                    fontWeight: 'bold', 
                    fontFamily: 'Tajawal, Arial, sans-serif',
                    fontSize: '1.2rem'
                  }}
                >
                  عالواهس
                </Typography>
              }
              sx={{ 
                py: 1.5, 
                px: 4, 
                fontSize: '1.1rem',
                borderRadius: '30px',
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
            >
              نشر رحلة
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: '#f9f9f9' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            component="h2" 
            align="center"
            sx={{ 
              mb: 6,
              fontWeight: 'bold',
              color: theme.palette.primary.main
            }}
          >
            مميزات منصة عالواهس
          </Typography>
          
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper 
                  elevation={2}
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-10px)'
                    }
                  }}
                >
                  <Box sx={{ mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* How It Works Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            component="h2" 
            align="center"
            sx={{ 
              mb: 6,
              fontWeight: 'bold'
            }}
          >
            كيف تعمل المنصة؟
          </Typography>
          
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ position: 'relative', height: '100%', minHeight: '300px' }}>
                <Box
                  component="img"
                  src="/app-screenshot.png"
                  alt="تطبيق عالواهس"
                  sx={{
                    width: '100%',
                    maxWidth: '400px',
                    height: 'auto',
                    borderRadius: '10px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                    display: 'block',
                    mx: 'auto'
                  }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <List>
                <ListItem sx={{ mb: 3 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>1</Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                        اختر وجهتك
                      </Typography>
                    } 
                    secondary="حدد مدينة الانطلاق والوجهة التي ترغب بالسفر إليها"
                  />
                </ListItem>
                
                <ListItem sx={{ mb: 3 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>2</Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                        ابحث عن رحلات متاحة
                      </Typography>
                    } 
                    secondary="استعرض الرحلات المتاحة واختر ما يناسبك من حيث الوقت والسعر"
                  />
                </ListItem>
                
                <ListItem sx={{ mb: 3 }}>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>3</Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                        تواصل مع السائق
                      </Typography>
                    } 
                    secondary="تواصل مباشرة مع السائق عبر واتساب للاتفاق على تفاصيل الرحلة"
                  />
                </ListItem>
                
                <ListItem>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>4</Avatar>
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                        استمتع برحلتك
                      </Typography>
                    } 
                    secondary="سافر بأمان وراحة مع توفير في التكاليف"
                  />
                </ListItem>
              </List>
              
              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Button 
                  variant="contained" 
                  size="large"
                  component={RouterLink}
                  to="/"
                  sx={{ 
                    py: 1.5, 
                    px: 4, 
                    fontSize: '1.1rem',
                    borderRadius: '30px'
                  }}
                >
                  جرب المنصة الآن
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Benefits Section */}
      <Box sx={{ py: 8, backgroundColor: theme.palette.primary.main, color: 'white' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            component="h2" 
            align="center"
            sx={{ 
              mb: 6,
              fontWeight: 'bold',
              color: 'white'
            }}
          >
            فوائد مشاركة الرحلات
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 0 } }}>
                <AccessTimeIcon sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                  توفير الوقت والمال
                </Typography>
                <Typography variant="body1">
                  وفر في تكاليف الوقود والصيانة من خلال مشاركة رحلتك مع آخرين
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 0 } }}>
                <PeopleIcon sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                  تقليل الازدحام
                </Typography>
                <Typography variant="body1">
                  ساهم في تقليل الازدحام المروري وتلوث البيئة بتقليل عدد السيارات
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center' }}>
                <PhoneIcon sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h5" component="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                  سهولة التواصل
                </Typography>
                <Typography variant="body1">
                  تواصل مباشر وسهل بين السائقين والركاب عبر تطبيق واتساب
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Testimonials Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            component="h2" 
            align="center"
            sx={{ 
              mb: 6,
              fontWeight: 'bold'
            }}
          >
            آراء المستخدمين
          </Typography>
          
          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.08)'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        mb: 3,
                        fontStyle: 'italic',
                        position: 'relative',
                        '&:before': {
                          content: '"""',
                          fontSize: '3rem',
                          color: 'rgba(0,0,0,0.1)',
                          position: 'absolute',
                          top: '-20px',
                          right: '-10px'
                        }
                      }}
                    >
                      {testimonial.text}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        sx={{ 
                          bgcolor: theme.palette.primary.main,
                          mr: 2
                        }}
                      >
                        {testimonial.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.city}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Cities Coverage Section */}
      <Box sx={{ py: 8, backgroundColor: '#f9f9f9' }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h2" 
            component="h2" 
            align="center"
            sx={{ 
              mb: 2,
              fontWeight: 'bold'
            }}
          >
            نغطي جميع المدن العراقية
          </Typography>
          
          <Typography 
            variant="h6" 
            component="h3" 
            align="center"
            color="text.secondary"
            sx={{ mb: 6 }}
          >
            رحلات يومية بين المدن الرئيسية
          </Typography>
          
          <Grid container spacing={2} justifyContent="center">
            {cities.map((city, index) => (
              <Grid item key={index}>
                <Paper 
                  sx={{ 
                    py: 1, 
                    px: 3, 
                    borderRadius: '20px',
                    backgroundColor: index % 2 === 0 ? theme.palette.primary.main : 'white',
                    color: index % 2 === 0 ? 'white' : 'inherit',
                    boxShadow: index % 2 === 0 ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
                    border: index % 2 === 0 ? 'none' : `1px solid ${theme.palette.divider}`
                  }}
                >
                  <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                    {city}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box 
        sx={{ 
          py: 8, 
          backgroundColor: theme.palette.primary.main,
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h3" 
            component="h2"
            sx={{ 
              mb: 3,
              fontWeight: 'bold'
            }}
          >
            جاهز للانطلاق؟
          </Typography>
          
          <Typography 
            variant="h6" 
            component="p"
            sx={{ mb: 4 }}
          >
            انضم إلى آلاف المستخدمين الذين يستفيدون من منصة عالواهس يومياً
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Button 
              variant="contained" 
              size="large"
              component={RouterLink}
              to="/"
              sx={{ 
                py: 1.5, 
                px: 4, 
                fontSize: '1.1rem',
                borderRadius: '30px',
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)'
                }
              }}
            >
              استخدم المنصة الآن
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box sx={{ py: 6, backgroundColor: '#222', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                عالواهس
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                منصة مشاركة الرحلات الأولى في العراق. نهدف إلى تسهيل التنقل بين المدن العراقية وتوفير تكاليف السفر.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                {/* Social Media Icons */}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                روابط سريعة
              </Typography>
              <Box component="nav">
                <List disablePadding>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <Button 
                      component={RouterLink} 
                      to="/"
                      sx={{ color: 'white' }}
                    >
                      الصفحة الرئيسية
                    </Button>
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <Button 
                      component={RouterLink} 
                      to="/search-results"
                      sx={{ color: 'white' }}
                    >
                      بحث عن رحلات
                    </Button>
                  </ListItem>
                  <ListItem disablePadding sx={{ mb: 1 }}>
                    <Button 
                      component={RouterLink} 
                      to="/publish-ride"
                      sx={{ color: 'white' }}
                    >
                      نشر رحلة
                    </Button>
                  </ListItem>
                  <ListItem disablePadding>
                    <Button 
                      component={RouterLink} 
                      to="/my-rides"
                      sx={{ color: 'white' }}
                    >
                      رحلاتي
                    </Button>
                  </ListItem>
                </List>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Typography variant="h6" component="h3" sx={{ mb: 2, fontWeight: 'bold' }}>
                تواصل معنا
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                البريد الإلكتروني: info@alwahes.com
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                واتساب: +964 XXX XXX XXXX
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
          
          <Typography variant="body2" align="center" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} عالواهس. جميع الحقوق محفوظة.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
