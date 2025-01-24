import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  CircularProgress,
  TextField,
  MenuItem,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import 'moment/locale/ar';
import Layout from '../components/Layout';
import { getAllRideRequests } from '../services/airtable';

const cities = [
  'بغداد',
  'البصرة',
  'النجف',
  'كربلاء',
  'الناصرية',
  'الديوانية',
  'الحلة',
  'الكوت',
  'العمارة',
  'الرمادي',
  'تكريت',
  'بعقوبة',
  'الموصل',
  'كركوك',
  'السماوة',
];

const AllRideRequests = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [filteredRequests, setFilteredRequests] = useState([]);

  useEffect(() => {
    loadRequests();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      setFilteredRequests(requests.filter(request => 
        request.startingCity.includes(selectedCity)
      ));
    } else {
      setFilteredRequests(requests);
    }
  }, [selectedCity, requests]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Starting to load ride requests...');
      const rideRequests = await getAllRideRequests();
      console.log('Received ride requests:', rideRequests);
      
      if (!rideRequests) {
        console.error('No ride requests returned');
        setError('لا توجد طلبات رحلات حالياً');
        setRequests([]);
      } else if (rideRequests.length === 0) {
        console.log('Empty ride requests array returned');
        setError('لا توجد طلبات رحلات حالياً');
        setRequests([]);
      } else {
        console.log('Setting ride requests:', rideRequests);
        setRequests(rideRequests);
        setFilteredRequests(rideRequests);
        setError('');
      }
    } catch (error) {
      console.error('Error in loadRequests:', error);
      setError(error.message || 'حدث خطأ أثناء تحميل الطلبات. يرجى المحاولة مرة أخرى');
      setRequests([]);
      setFilteredRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestClick = () => {
    setDialogOpen(true);
  };

  const handlePublishRide = () => {
    setDialogOpen(false);
    navigate('/publish-ride');
  };

  return (
    <Layout title="طلبات الرحلات">
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="ar">
        <Container maxWidth="sm">
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              طلبات الرحلات
            </Typography>

            <Box sx={{ mb: 3 }}>
              <TextField
                select
                fullWidth
                label="تصفية حسب مدينة الانطلاق"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                sx={{ backgroundColor: 'white' }}
              >
                <MenuItem value="">
                  <em>الكل</em>
                </MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert 
                severity={error.includes('لا توجد') ? 'info' : 'error'} 
                sx={{ 
                  mt: 2,
                  '& .MuiAlert-message': {
                    width: '100%',
                    textAlign: 'center'
                  }
                }}
              >
                {error}
              </Alert>
            ) : filteredRequests.length === 0 ? (
              <Alert 
                severity="info" 
                sx={{ 
                  mt: 2,
                  '& .MuiAlert-message': {
                    width: '100%',
                    textAlign: 'center'
                  }
                }}
              >
                لا توجد طلبات تطابق التصفية المحددة
              </Alert>
            ) : (
              <Stack spacing={2}>
                {filteredRequests.map((request) => (
                  <Card 
                    key={request.id}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 6,
                      },
                    }}
                    onClick={handleRequestClick}
                  >
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                          {request.startingCity}
                        </Box>
                        <Box component="span" sx={{ mx: 1, color: 'text.secondary' }}>
                          ←
                        </Box>
                        <Box component="span" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                          {request.destinationCity}
                        </Box>
                      </Typography>
                      <Typography color="text.secondary">
                        {moment(request.date).format('DD/MM/YYYY')}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Stack>
            )}
          </Box>

          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {"نشر رحلة للتواصل"}
            </DialogTitle>
            <DialogContent>
              <Typography>
                لتتمكن من التواصل مع صاحب الطلب، يجب عليك نشر رحلة أولاً
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>إلغاء</Button>
              <Button onClick={handlePublishRide} autoFocus>
                نشر رحلة
              </Button>
            </DialogActions>
          </Dialog>
        </Container>
      </LocalizationProvider>
    </Layout>
  );
};

export default AllRideRequests;
