import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Stack
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Layout from '../components/Layout';
import { searchRides } from '../services/airtable';
import moment from 'moment';
import { toast } from 'react-hot-toast';
import 'moment/locale/ar';

moment.locale('ar');

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const startingCity = searchParams.get('from');
        const destinationCity = searchParams.get('to');
        const date = searchParams.get('date');

        console.log('Raw search params:', { startingCity, destinationCity, date });

        if (!startingCity || !destinationCity || !date) {
          console.log('Missing required search params');
          navigate('/search-rides');
          return;
        }

        const foundRides = await searchRides({
          startingCity,
          destinationCity,
          date,
        });

        console.log('Found rides:', foundRides);

        if (!foundRides || foundRides.length === 0) {
          setRides([]);
          return;
        }

        // Format the rides data from Airtable records
        const formattedRides = foundRides.map(record => ({
          id: record.id,
          startingCity: record.fields['Starting city'],
          startingArea: record.fields['starting area'],
          destinationCity: record.fields['Destination city'],
          destinationArea: record.fields['destination area'],
          date: record.fields['Date'],
          time: record.fields['Time'],
          seats: record.fields['Seats Available'],
          price: record.fields['Price per Seat'],
          whatsappNumber: record.fields['WhatsApp Number'],
          driverName: record.fields['Name of Driver'],
          carType: record.fields['Car Type'],
          description: record.fields['Description']
        }));

        console.log('Formatted rides:', formattedRides);
        setRides(formattedRides);
      } catch (error) {
        console.error('Error fetching rides:', error);
        toast.error('حدث خطأ أثناء البحث عن الرحلات');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams, navigate]);

  const handleNewSearch = () => {
    navigate('/search-rides');
  };

  const handleRequestRide = () => {
    const navigationState = {
      startingCity: searchParams.get('from'),
      destinationCity: searchParams.get('to'),
      date: searchParams.get('date'),
    };
    navigate('/request-ride', { state: navigationState });
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Typography align="center">جاري التحميل...</Typography>
        </Container>
      </Layout>
    );
  }

  if (rides.length === 0) {
    return (
      <Layout>
        <Container maxWidth="sm" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
          <Typography variant="h5" component="h1" gutterBottom>
            لم يتم العثور على رحلات متطابقة
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            للأسف لا توجد رحلات متاحة بين {searchParams.get('from')} و {searchParams.get('to')} في {moment(searchParams.get('date')).format('LL')}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            يمكنك طلب رحلة وسيتواصل معك السائقون قريباً عبر واتساب
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              onClick={handleRequestRide}
              size="large"
              color="primary"
              sx={{ 
                fontSize: '1.1rem',
                py: 1.5,
                px: 4 
              }}
            >
              طلب رحلة
            </Button>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            نتائج البحث
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" gutterBottom>
            تم العثور على {rides.length} رحلة متاحة
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {rides.map((ride) => (
            <Grid item xs={12} key={ride.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {ride.startingCity} → {ride.destinationCity}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    التاريخ: {moment(ride.date).format('LL')}
                  </Typography>
                  <Typography>السعر: {ride.price} دينار</Typography>
                  <Typography>السائق: {ride.driverName}</Typography>
                  <Typography>المنطقة: من {ride.startingArea} إلى {ride.destinationArea}</Typography>
                  <Typography>الوقت: {ride.time}</Typography>
                  <Typography>المقاعد المتاحة: {ride.seats}</Typography>
                  <Typography>نوع السيارة: {ride.carType}</Typography>
                  {ride.description && (
                    <Typography>ملاحظات: {ride.description}</Typography>
                  )}
                  {ride.whatsappNumber && (
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<WhatsAppIcon />}
                      href={`whatsapp://send?phone=${ride.whatsappNumber}&text=السلام عليكم 🌟\nشفت إعلانك على تطبيق عالواهس. \nأريد أسأل عن الرحلة:\n- من ${ride.startingCity} (${ride.startingArea})\n- إلى ${ride.destinationCity} (${ride.destinationArea})\n- بتاريخ ${moment(ride.date).format('LL')}\n- الساعة ${ride.time}\n\nهل الرحلة متوفرة؟`}
                      sx={{ mt: 2 }}
                    >
                      تواصل عبر واتساب
                    </Button>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Layout>
  );
};

export default SearchResults;
