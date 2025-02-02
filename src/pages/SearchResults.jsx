import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Alert,
  Stack,
  Card,
  CardContent
} from '@mui/material';
import moment from 'moment';
import 'moment/locale/ar';
import Layout from '../components/Layout';
import { searchRides } from '../services/airtable';

moment.locale('ar');

// Helper function to format WhatsApp numbers
function formatWhatsAppNumber(number) {
  if (!number) return '';
  let cleaned = number.replace(/\D/g, '');
  cleaned = cleaned.replace(/^0+/, '');
  if (cleaned.startsWith('7')) {
    cleaned = '964' + cleaned;
  } else if (!cleaned.startsWith('964')) {
    cleaned = '964' + cleaned;
  }
  return cleaned;
}

export default function SearchResults() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = location.state;

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('Raw search params:', searchParams);

        if (!searchParams?.startingCity || !searchParams?.destinationCity || !searchParams?.date) {
          navigate('/request-ride');
          return;
        }

        const results = await searchRides({
          startingCity: searchParams.startingCity,
          destinationCity: searchParams.destinationCity,
          date: searchParams.date,
        });

        setRides(results);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('حدث خطأ أثناء البحث عن الرحلات. يرجى المحاولة مرة أخرى.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <Layout>
        <Container maxWidth="md">
          <Typography align="center">جاري البحث...</Typography>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom align="center">
          نتائج البحث
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {rides.length === 0 ? (
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>لا توجد رحلات متطابقة</Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>
              سيتواصل معك السائقون قريباً
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {rides.map((ride) => (
              <Grid item xs={12} key={ride.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {ride.fields['Starting city']} إلى {ride.fields['Destination city']}
                    </Typography>
                    <Typography color="textSecondary" gutterBottom>
                      التاريخ: {moment(ride.fields['Date']).format('YYYY/MM/DD')}
                    </Typography>
                    <Typography>
                      الوقت: {ride.fields['Time']}
                    </Typography>
                    <Typography>
                      المقاعد المتاحة: {ride.fields['Seats Available']}
                    </Typography>
                    <Typography>
                      السعر للمقعد: {ride.fields['Price per Seat']} دينار
                    </Typography>
                    {ride.fields['Car Type'] && (
                      <Typography>
                        نوع السيارة: {ride.fields['Car Type']}
                      </Typography>
                    )}
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        href={`https://wa.me/${formatWhatsAppNumber(ride.fields['WhatsApp Number'])}?text=${encodeURIComponent(
                          `السلام عليكم، شفت إعلانك عن رحلة من ${ride.fields['Starting city']} إلى ${ride.fields['Destination city']} بتاريخ ${moment(ride.fields['Date']).format('YYYY/MM/DD')} الساعة ${ride.fields['Time']}. هل المقاعد ما زالت متوفرة؟`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        تواصل مع السائق
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Layout>
  );
}
