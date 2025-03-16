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
        
        // Don't pass date parameter to show all rides regardless of date
        const results = await searchRides({
          startingCity: searchParams.startingCity,
          destinationCity: searchParams.destinationCity
        });
        
        console.log('DEBUG: Search results:', results);
        console.log('DEBUG: Number of results:', results.length);
        
        if (results.length > 0) {
          console.log('DEBUG: First result:', results[0]);
          console.log('DEBUG: First result fields:', results[0].fields);
        } else {
          console.log('DEBUG: No results found - will show default result');
          
          // If no results found through searchRides, try manual filtering
          console.log('DEBUG: Attempting manual filtering of all rides...');
          const manuallyFilteredRides = allRides.filter(ride => {
            const startCity = (ride.fields['Starting city'] || '').toLowerCase().trim();
            const destCity = (ride.fields['Destination city'] || '').toLowerCase().trim();
            const searchStartCity = searchParams.startingCity.toLowerCase().trim();
            const searchDestCity = searchParams.destinationCity.toLowerCase().trim();
            
            const startMatches = startCity === searchStartCity || 
                               startCity.includes(searchStartCity) || 
                               searchStartCity.includes(startCity);
                               
            const destMatches = destCity === searchDestCity || 
                              destCity.includes(searchDestCity) || 
                              searchDestCity.includes(destCity);
            
            return startMatches && destMatches;
          });
          
          if (manuallyFilteredRides.length > 0) {
            // Sort manually filtered rides by date (most recent first)
            const sortedRides = [...manuallyFilteredRides].sort((a, b) => {
              const dateA = a.fields['Date'] ? new Date(a.fields['Date']) : new Date(0);
              const dateB = b.fields['Date'] ? new Date(b.fields['Date']) : new Date(0);
              return dateB - dateA; // Most recent first
            });
            
            setRides(sortedRides);
            return;
          }
        }
        
        // Sort rides by date (most recent first)
        const sortedRides = [...results].sort((a, b) => {
          const dateA = a.fields['Date'] ? new Date(a.fields['Date']) : new Date(0);
          const dateB = b.fields['Date'] ? new Date(b.fields['Date']) : new Date(0);
          return dateB - dateA; // Most recent first
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

        {console.log('Rendering condition - rides length:', rides.length)}
        {rides.length === 0 ? (
          <Box textAlign="center">
            <Card sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  الرحلات المنشورة المطابقة
                </Typography>
                <Typography>
                  اسم السائق: عالواهس
                </Typography>
                <Typography>
                  رقم الواتساب: 07850244072
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    href={`https://wa.me/${formatWhatsAppNumber('07850244072')}?text=${encodeURIComponent(
                      `السلام عليكم، أبحث عن رحلة من ${searchParams.startingCity} إلى ${searchParams.destinationCity}. هل يمكنك توفير هذه الرحلة؟`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth
                    sx={{ 
                      py: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1
                    }}
                  >
                    <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                      </svg>
                      تواصل عبر واتساب
                    </Box>
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ) : (
          <Stack spacing={3}>
            {rides.map((ride) => {
              // Make sure all required fields exist
              const startingCity = ride.fields['Starting city'] || 'غير محدد';
              const destinationCity = ride.fields['Destination city'] || 'غير محدد';
              const whatsappNumber = ride.fields['WhatsApp Number'] || '07850244072';
              const seatsAvailable = ride.fields['Seats Available'] || '1';
              const driverName = ride.fields['Name of Driver'] || 'غير محدد';
              const carType = ride.fields['Car Type'] || 'غير محدد';
              
              // Use the correct field name for price
              const price = ride.fields['Price per Seat'] || 'غير محدد';
              
              // Image display functionality has been removed
              
              const notes = ride.fields['Notes'] || '';
              
              return (
                <Card key={ride.id} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                  <CardContent sx={{ p: 0 }}>
                    {/* Image display functionality has been removed */}
                    <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                      <Typography variant="h6" component="h3" gutterBottom align="right">
                        {startingCity} إلى {destinationCity}
                      </Typography>
                      <Typography align="right">
                        السائق: {driverName}
                      </Typography>
                      <Typography align="right">
                        نوع السيارة: {carType}
                      </Typography>
                      <Typography align="right">
                        السعر: {price}
                      </Typography>
                      <Typography align="right">
                        عدد المقاعد: {seatsAvailable}
                      </Typography>
                      {notes && (
                        <Typography align="right" sx={{ mt: 1 }}>
                          ملاحظات: {notes}
                        </Typography>
                      )}
                    </Box>
                    
                    <Box sx={{ p: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        href={`https://wa.me/${formatWhatsAppNumber(whatsappNumber)}?text=${encodeURIComponent(
                          `السلام عليكم، شفت إعلانك عن رحلة من ${startingCity} إلى ${destinationCity}. هل المقاعد ما زالت متوفرة؟`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        fullWidth
                        sx={{ 
                          py: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1
                        }}
                      >
                        <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#fff">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                          </svg>
                          تواصل عبر واتساب
                        </Box>
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        )}
      </Container>
    </Layout>
  );
}
