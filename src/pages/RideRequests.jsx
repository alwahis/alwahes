import React, { useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Box,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import 'moment/locale/ar';
import Layout from '../components/Layout';
import { getRideRequests, getDriverRides } from '../services/airtable';

const RideRequests = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [verified, setVerified] = useState(false);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading requests for WhatsApp number:', whatsappNumber);
      
      // First get all rides for this driver
      const driverRides = await getDriverRides(whatsappNumber);
      console.log('Driver rides returned:', driverRides);
      
      if (!driverRides || driverRides.length === 0) {
        setError('لم يتم العثور على أي رحلات منشورة لهذا الرقم');
        setLoading(false);
        return;
      }

      // Then get all requests matching those rides
      const rideRequests = await getRideRequests(driverRides);
      console.log('Ride requests returned:', rideRequests);
      
      if (!rideRequests || rideRequests.length === 0) {
        setError('لا توجد طلبات رحلات حالياً');
      } else {
        setRequests(rideRequests);
      }
    } catch (error) {
      console.error('Error in loadRequests:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل الطلبات');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!whatsappNumber) {
      setError('الرجاء إدخال رقم الواتساب');
      return;
    }
    
    // Format the WhatsApp number to ensure it starts with +
    const formattedNumber = whatsappNumber.startsWith('+') 
      ? whatsappNumber 
      : `+${whatsappNumber}`;
    setWhatsappNumber(formattedNumber);
    
    console.log('Verifying WhatsApp number:', formattedNumber);
    setVerified(true);
    await loadRequests();
  };

  const handleWhatsAppClick = (requestWhatsapp) => {
    const message = encodeURIComponent(
      `مرحباً، أنا سائق الرحلة. تم استلام طلبك للرحلة.`
    );
    window.open(
      `https://wa.me/${requestWhatsapp}?text=${message}`,
      '_blank'
    );
  };

  return (
    <Layout title="طلبات الرحلات">
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="ar">
        <Container maxWidth="sm">
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              طلبات الرحلات
            </Typography>

            {!verified ? (
              <Box sx={{ mt: 4 }}>
                <Typography gutterBottom>
                  الرجاء إدخال رقم الواتساب الخاص بك لعرض طلبات الرحلات
                </Typography>
                <form onSubmit={handleVerify}>
                  <Stack spacing={2}>
                    <TextField
                      label="رقم الواتساب"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      required
                      fullWidth
                      placeholder="مثال: +9647801234567"
                      helperText="الرجاء إدخال نفس الرقم الذي استخدمته لنشر الرحلات"
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                    >
                      عرض الطلبات
                    </Button>
                  </Stack>
                </form>
              </Box>
            ) : (
              <>
                {error && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}

                <Stack spacing={2}>
                  {requests.map((request) => (
                    <Card key={request.id}>
                      <CardContent>
                        <Stack spacing={2}>
                          <Typography>
                            من: {request.fields['Starting Point']}
                          </Typography>
                          <Typography>
                            إلى: {request.fields['Destination']}
                          </Typography>
                          <Typography>
                            التاريخ: {request.fields['Date']}
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={() => handleWhatsAppClick(request.fields['WhatsApp Number'])}
                            fullWidth
                            startIcon={<WhatsAppIcon />}
                          >
                            تواصل مع الراكب
                          </Button>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </>
            )}
          </Box>
        </Container>
      </LocalizationProvider>
    </Layout>
  );
};

export default RideRequests;
