import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import Layout from '../components/Layout';
import { getMatchingRideRequests } from '../services/airtable';
import moment from 'moment';
import 'moment/locale/ar';

moment.locale('ar');

const MatchingRequests = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const rideData = location.state;

  useEffect(() => {
    const loadRequests = async () => {
      if (!rideData) {
        console.error('No ride data provided');
        navigate('/');
        return;
      }

      try {
        setLoading(true);
        setError('');
        console.log('Loading requests for:', rideData);
        
        const data = await getMatchingRideRequests(
          rideData.from,
          rideData.to,
          rideData.date
        );

        console.log('Received requests:', data);
        setRequests(data || []);
        setError('');
      } catch (error) {
        console.error('Error loading requests:', error);
        setError(error.message || 'حدث خطأ أثناء تحميل الطلبات. يرجى المحاولة مرة أخرى.');
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [rideData, navigate]);

  const formatWhatsAppNumber = (number) => {
    if (!number) return '';
    
    // Remove any non-digit characters
    let cleaned = number.replace(/\D/g, '');
    
    // Remove leading zeros
    cleaned = cleaned.replace(/^0+/, '');
    
    // If number starts with 7, add Iraq country code
    if (cleaned.startsWith('7')) {
      cleaned = '964' + cleaned;
    }
    // If number doesn't have country code, add Iraq country code
    else if (!cleaned.startsWith('964')) {
      cleaned = '964' + cleaned;
    }
    
    return cleaned;
  };

  const formatRequest = (request) => {
    if (!request?.fields) {
      console.error('Invalid request data:', request);
      return null;
    }

    return {
      id: request.id,
      startingCity: request.fields['Starting city'] || '',
      startingArea: request.fields['starting area'] || '',
      destinationCity: request.fields['Destination city'] || '',
      destinationArea: request.fields['destination area'] || '',
      date: request.fields['Date'] || '',
      seats: request.fields['Seats'] || '',
      whatsappNumber: request.fields['WhatsApp Number'] || '',
      note: request.fields['Note'] || ''
    };
  };

  const createWhatsAppMessage = (request) => {
    const formattedRequest = formatRequest(request);
    const message = `السلام عليكم 🌟

عندي رحلة من ${rideData.from} إلى ${rideData.to}
- التاريخ: ${moment(rideData.date).format('DD/MM/YYYY')}
- الوقت: ${rideData.time || 'سيتم تحديده لاحقاً'}

هل تريد الحجز؟ 🚗`;

    return encodeURIComponent(message);
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="md">
          <Box 
            sx={{ 
              mt: 4, 
              mb: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <CircularProgress />
            <Typography>جاري تحميل الطلبات المطابقة...</Typography>
          </Box>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          الطلبات المطابقة لرحلتك
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            تفاصيل رحلتك:
          </Typography>
          <Typography>
            من {rideData.from} إلى {rideData.to}
          </Typography>
          <Typography>
            التاريخ: {moment(rideData.date).format('LL')}
          </Typography>
        </Box>

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              '& .MuiAlert-message': {
                width: '100%',
                textAlign: 'center'
              }
            }}
          >
            {error}
          </Alert>
        )}

        {requests.length === 0 ? (
          <Alert 
            severity="info"
            sx={{ 
              '& .MuiAlert-message': {
                width: '100%',
                textAlign: 'center'
              }
            }}
          >
            لا توجد طلبات مطابقة لرحلتك حالياً
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {requests.map((request) => {
              const formattedRequest = formatRequest(request);
              if (!formattedRequest) return null;
              
              return (
                <Grid item xs={12} key={formattedRequest.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {formattedRequest.startingCity} → {formattedRequest.destinationCity}
                      </Typography>
                      <Typography>
                        المنطقة: {formattedRequest.startingArea || 'غير محدد'} → {formattedRequest.destinationArea || 'غير محدد'}
                      </Typography>
                      <Typography>التاريخ: {moment(formattedRequest.date).format('LL')}</Typography>
                      <Typography>عدد المقاعد: {formattedRequest.seats}</Typography>
                      {formattedRequest.note && (
                        <Typography>ملاحظات: {formattedRequest.note}</Typography>
                      )}
                      {formattedRequest.whatsappNumber && (
                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<WhatsAppIcon />}
                            href={`https://wa.me/${formatWhatsAppNumber(formattedRequest.whatsappNumber)}?text=${createWhatsAppMessage(request)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            fullWidth
                          >
                            تواصل عبر واتساب
                          </Button>
                          <Button
                            variant="outlined"
                            color="success"
                            onClick={() => {
                              // Copy number to clipboard
                              const number = formatWhatsAppNumber(formattedRequest.whatsappNumber);
                              navigator.clipboard.writeText(number);
                            }}
                          >
                            نسخ الرقم
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate('/my-rides')}
          >
            عرض رحلاتي
          </Button>
        </Box>
      </Container>
    </Layout>
  );
};

export default MatchingRequests;
