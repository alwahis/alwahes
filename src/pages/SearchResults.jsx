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
import RideCard from '../components/RideCard';

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

  // Function to fetch all rides directly from Airtable API for debugging purposes
  const fetchAllRides = async () => {
    try {
      console.log('DEBUG: Fetching all published rides directly from Airtable API for debugging...');
      
      // Get API key and base ID from environment variables
      const apiKey = import.meta.env.VITE_AIRTABLE_API_KEY;
      const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;
      
      if (!apiKey || !baseId) {
        throw new Error('Missing Airtable API key or base ID');
      }
      
      console.log('DEBUG: API Key exists:', !!apiKey);
      console.log('DEBUG: Base ID exists:', !!baseId);
      
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
      console.log('DEBUG: All published rides count:', data.records.length);
      
      // Log all rides for debugging
      data.records.forEach(record => {
        // Log all available fields for this record
        console.log('DEBUG: All fields for record:', record.id, record.fields);
        
        console.log('DEBUG: Available ride:', {
          id: record.id,
          from: record.fields['Starting city'],
          to: record.fields['Destination city'],
          date: record.fields['Date'],
          driver: record.fields['Name of Driver'],
          seats: record.fields['Seats Available'],
          price: record.fields['Price per Seat'],
          carType: record.fields['Car Type'],
          notes: record.fields['Notes']
        });
      });
      
      return data.records;
    } catch (err) {
      console.error('DEBUG: Error fetching all rides:', err);
      return [];
    }
  };

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('DEBUG: Raw search params:', searchParams);

        if (!searchParams?.startingCity || !searchParams?.destinationCity) {
          console.log('DEBUG: Missing required search parameters, redirecting to request-ride');
          navigate('/request-ride');
          return;
        }
        
        // Date is intentionally not used for searching to show all rides regardless of date
        console.log('DEBUG: Search parameters details:', {
          startingCity: searchParams.startingCity,
          startingCityType: typeof searchParams.startingCity,
          startingCityLength: searchParams.startingCity.length,
          startingCityChars: Array.from(searchParams.startingCity).map(c => c.charCodeAt(0)),
          destinationCity: searchParams.destinationCity,
          destinationCityType: typeof searchParams.destinationCity,
          destinationCityLength: searchParams.destinationCity.length,
          destinationCityChars: Array.from(searchParams.destinationCity).map(c => c.charCodeAt(0))
        });

        console.log('DEBUG: Searching for rides from', searchParams.startingCity, 'to', searchParams.destinationCity);
        
        // First, fetch all rides for debugging purposes
        const allRides = await fetchAllRides();
        console.log('DEBUG: Total rides in database:', allRides.length);
        
        // Pass the selected date to filter rides within a week
        const results = await searchRides({
          startingCity: searchParams.startingCity,
          destinationCity: searchParams.destinationCity,
          date: searchParams.date // Pass the selected date
        });
        
        console.log('DEBUG: Search results:', results);
        console.log('DEBUG: Number of results:', results.length);
        
        // Process results to ensure all required fields are present
        const processedResults = results.map(ride => {
          // Ensure the ride has a fields object
          if (!ride.fields) {
            ride.fields = {};
          }
          
          // Make sure all necessary fields exist with defaults
          const defaultFields = {
            'Name of Driver': 'عالواهس',
            'Starting Point': searchParams.startingCity,
            'Destination': searchParams.destinationCity,
            'Starting city': searchParams.startingCity,
            'Destination city': searchParams.destinationCity,
            'Date': moment().format('YYYY-MM-DD'),
            'Time': 'غير محدد',
            'Seats Available': '1',
            'Price per Seat': '0',
            'Car Type': 'غير محدد',
            'WhatsApp Number': '07850244072'
          };
          
          // Apply defaults for missing fields
          Object.keys(defaultFields).forEach(key => {
            if (!ride.fields[key]) {
              ride.fields[key] = defaultFields[key];
            }
          });
          
          return ride;
        });
        
        // Sort rides by date (ascending - earliest first)
        const sortedRides = [...processedResults].sort((a, b) => {
          const dateA = a.fields['Date'] ? new Date(a.fields['Date']) : new Date(0);
          const dateB = b.fields['Date'] ? new Date(b.fields['Date']) : new Date(0);
          return dateA - dateB; // Earliest first
        });
        
        setRides(sortedRides);
      } catch (err) {
        console.error('Error fetching results:', err);
        setRides([]);
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

  console.log('Render - rides state:', rides);
  console.log('Render - rides length:', rides.length);

  return (
    <Layout>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          الرحلات المنشورة المطابقة
        </Typography>
        
        <Typography variant="h6" component="h2" gutterBottom align="right" sx={{ mb: 3 }}>
          تفاصيل رحلتك:
        </Typography>
        
        <Typography align="right" sx={{ mb: 1 }}>
          من {searchParams.startingCity} إلى {searchParams.destinationCity}
        </Typography>
        
        <Typography align="right" sx={{ mb: 4 }}>
          التاريخ: {searchParams.date ? moment(searchParams.date).format('LL') : moment().format('LL')}
        </Typography>

        {rides.length === 0 ? (
          <Box textAlign="center">
            <Card sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  لا توجد رحلات مطابقة
                </Typography>
                <Typography sx={{ mb: 2 }}>
                  لم نجد رحلات مطابقة لبحثك. يمكنك التواصل مع فريق عالواهس للمساعدة.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  href={`https://wa.me/${formatWhatsAppNumber('07850244072')}?text=${encodeURIComponent(
                    `السلام عليكم، أبحث عن رحلة من ${searchParams.startingCity} إلى ${searchParams.destinationCity}. هل يمكنك توفير هذه الرحلة؟`
                  )}`}
                  target="_blank"
                  fullWidth
                >
                  تواصل مع عالواهس
                </Button>
              </CardContent>
            </Card>
            
            <Button
              variant="outlined"
              color="primary"
              onClick={() => navigate('/request-ride')}
              sx={{ mt: 2 }}
            >
              طلب رحلة جديدة
            </Button>
          </Box>
        ) : (
          <Box>
            <Grid container spacing={3}>
              {rides.map((ride) => (
                <Grid item xs={12} key={ride.id}>
                  <RideCard ride={ride} />
                </Grid>
              ))}
            </Grid>
            
            <Box textAlign="center" sx={{ mt: 4 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => navigate('/request-ride')}
              >
                طلب رحلة جديدة
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </Layout>
  );
}
