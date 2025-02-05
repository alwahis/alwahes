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
        navigate('/');
        return;
      }

      try {
        const data = await getMatchingRideRequests(
          rideData.from,
          rideData.to,
          rideData.date
        );
        setRequests(data);
      } catch (error) {
        console.error('Error loading requests:', error);
        setError('حدث خطأ أثناء تحميل الطلبات. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, [rideData, navigate]);

  const formatWhatsAppNumber = (number) => {
    let cleaned = number.replace(/\D/g, '');
    if (!cleaned.startsWith('964')) {
      cleaned = cleaned.replace(/^0+/, '');
      cleaned = '964' + cleaned;
    }
    return cleaned;
  };

  const formatRequest = (request) => {
    return {
      id: request.id,
      startingCity: request.fields['Starting city'],
      destinationCity: request.fields['Destination city'],
      date: request.fields['Date'],
      seats: request.fields['Seats'],
      whatsappNumber: request.fields['WhatsApp Number'],
      note: request.fields['Note']
    };
  };

  const createWhatsAppMessage = (request) => {
    const message = `السلام عليكم 

أني سائق على تطبيق عالواهس.
شفت طلب رحلتك وأريد أخبرك أنه عندي رحلة تناسبك:
- من ${rideData.from}
- إلى ${rideData.to}
- بتاريخ ${moment(rideData.date).format('LL')}

هل تريد تفاصيل أكثر؟`;

    return encodeURIComponent(message);
  };

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
          <Typography align="center">جاري تحميل الطلبات المطابقة...</Typography>
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
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {requests.length === 0 ? (
          <Alert severity="info">
            سيتواصل معك الركاب قريباً عبر الواتساب، يرجى البقاء متصلاً
          </Alert>
        ) : (
          <Grid container spacing={3}>
            {requests.map((request) => {
              const formattedRequest = formatRequest(request);
              return (
                <Grid item xs={12} key={formattedRequest.id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {formattedRequest.startingCity} إلى {formattedRequest.destinationCity}
                      </Typography>
                      <Typography>التاريخ: {moment(formattedRequest.date).format('LL')}</Typography>
                      <Typography>عدد المقاعد: {formattedRequest.seats}</Typography>
                      {formattedRequest.note && (
                        <Typography>ملاحظات: {formattedRequest.note}</Typography>
                      )}
                      {formattedRequest.whatsappNumber && (
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={<WhatsAppIcon />}
                          href={`https://wa.me/${formatWhatsAppNumber(formattedRequest.whatsappNumber)}?text=${createWhatsAppMessage(request)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ mt: 2 }}
                        >
                          تواصل عبر واتساب
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Container>
    </Layout>
  );
};

export default MatchingRequests;
