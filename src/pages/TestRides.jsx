import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Link,
  Alert
} from '@mui/material';
import Layout from '../components/Layout';

// Simple test component to display all published rides
export default function TestRides() {
  const [loading, setLoading] = useState(true);
  const [publishedRides, setPublishedRides] = useState([]);
  const [error, setError] = useState('');

  // Function to fetch all published rides directly from Airtable API
  const fetchAllRides = async () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching all published rides directly from Airtable API...');
      
      // Get API key and base ID from environment variables
      const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
      const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
      
      if (!apiKey || !baseId) {
        throw new Error('Missing Airtable API key or base ID');
      }
      
      console.log('API Key exists:', !!apiKey);
      console.log('Base ID exists:', !!baseId);
      console.log('Base ID:', baseId);
      
      // Fetch data directly from Airtable API
      const response = await fetch(
        `https://api.airtable.com/v0/${baseId}/Published%20Rides?filterByFormula=NOT(%7BCancelled%7D)`,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Airtable API error: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      console.log('All published rides:', data.records.length);
      
      // Log all rides for debugging
      data.records.forEach(record => {
        console.log('Ride:', {
          id: record.id,
          from: record.fields['Starting city'],
          to: record.fields['Destination city'],
          date: record.fields['Date'],
          driver: record.fields['Name of Driver'],
          seats: record.fields['Seats Available']
        });
      });
      
      setPublishedRides(data.records);
    } catch (err) {
      console.error('Error fetching rides:', err);
      setError('حدث خطأ أثناء جلب الرحلات: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Load all rides on component mount
  useEffect(() => {
    fetchAllRides();
  }, []);

  return (
    <Layout>
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          جميع الرحلات المنشورة
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            إجمالي الرحلات: {publishedRides.length}
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary"
            onClick={fetchAllRides}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'تحديث'}
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : publishedRides.length === 0 ? (
          <Alert severity="info">
            لا توجد رحلات منشورة حالياً
          </Alert>
        ) : (
          <Grid container spacing={2}>
            {publishedRides.map((ride) => (
              <Grid item xs={12} key={ride.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {ride.fields['Starting city'] || 'غير محدد'} إلى {ride.fields['Destination city'] || 'غير محدد'}
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography>
                          <strong>التاريخ:</strong> {ride.fields['Date'] || 'غير محدد'}
                        </Typography>
                        <Typography>
                          <strong>الوقت:</strong> {ride.fields['Time'] || 'غير محدد'}
                        </Typography>
                        <Typography>
                          <strong>المقاعد المتاحة:</strong> {ride.fields['Seats Available'] || '0'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography>
                          <strong>السائق:</strong> {ride.fields['Name of Driver'] || 'غير محدد'}
                        </Typography>
                        <Typography>
                          <strong>رقم الواتساب:</strong> {ride.fields['WhatsApp Number'] || 'غير محدد'}
                        </Typography>
                        <Typography>
                          <strong>السعر للمقعد:</strong> {ride.fields['Price per Seat'] || 'غير محدد'} دينار
                        </Typography>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                      <Link href={`https://airtable.com/appvPskDRSPvlR9Mv/tblXQZZ6VXvhzh7nL/${ride.id}`} target="_blank" rel="noopener">
                        عرض في Airtable
                      </Link>
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
