import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  CircularProgress, 
  Button, 
  TextField,
  Tabs,
  Tab,
  Card,
  CardContent,
  Stack,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import { getDriverRidesAndRequests, cancelRide, cancelRideRequest } from '../services/airtable';

const MyRides = () => {
  const [rides, setRides] = useState([]);
  const [rideRequests, setRideRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!whatsappNumber.trim()) {
      setError('الرجاء إدخال رقم الواتساب');
      return;
    }

    setError('');
    setLoading(true);
    try {
      const data = await getDriverRidesAndRequests(whatsappNumber);
      setRides(data.rides);
      setRideRequests(data.requests);
      if (data.rides.length === 0) {
        toast.error('لم يتم العثور على رحلات لهذا الرقم');
      }
    } catch (error) {
      toast.error(error.message || 'حدث خطأ أثناء البحث عن الرحلات');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCancelRide = async (rideId) => {
    try {
      await cancelRide(rideId);
      toast.success('تم إلغاء الرحلة بنجاح');
      // Update the rides list
      setRides(rides.map(ride => 
        ride.id === rideId 
          ? { ...ride, fields: { ...ride.fields, Status: 'cancelled' } }
          : ride
      ));
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في إلغاء الرحلة');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await cancelRideRequest(requestId);
      toast.success('تم إلغاء الطلب بنجاح');
      // Update the requests list
      setRideRequests(rideRequests.map(request => 
        request.id === requestId 
          ? { ...request, fields: { ...request.fields, Status: 'cancelled' } }
          : request
      ));
    } catch (error) {
      toast.error(error.message || 'حدث خطأ في إلغاء الطلب');
    }
  };

  return (
    <Layout title="رحلاتي">
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Paper 
            component="form" 
            onSubmit={handleSearch}
            elevation={2} 
            sx={{ 
              p: { xs: 2, md: 4 },
              mb: 4,
              textAlign: 'center'
            }}
          >
            <Typography variant="h5" component="h1" gutterBottom>
              رحلاتي
            </Typography>
            
            <TextField
              label="رقم الواتساب"
              variant="outlined"
              value={whatsappNumber}
              onChange={(e) => {
                setWhatsappNumber(e.target.value);
                setError('');
              }}
              error={!!error}
              helperText={error || 'مثال: 07801234567'}
              placeholder="07801234567"
              fullWidth
              sx={{ mb: 2 }}
            />
            
            <Button
              variant="contained"
              type="submit"
              disabled={loading}
              fullWidth
            >
              {loading ? <CircularProgress size={24} /> : 'بحث'}
            </Button>
          </Paper>

          {(rides.length > 0 || rideRequests.length > 0) && (
            <>
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={activeTab} onChange={handleTabChange} centered>
                  <Tab label={`طلبات الركاب (${rideRequests.filter(r => r.fields.Status !== 'cancelled').length})`} />
                  <Tab label={`رحلاتي (${rides.filter(r => r.fields.Status !== 'cancelled').length})`} />
                </Tabs>
              </Box>

              {activeTab === 0 && (
                <Grid container spacing={3}>
                  {rideRequests.map((request) => (
                    <Grid item xs={12} key={request.id}>
                      <Card>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="h6" gutterBottom>
                                {request.fields['Name']}
                              </Typography>

                              <Stack spacing={1}>
                                <Typography>
                                  من: {request.fields['Starting city']} - {request.fields['starting area']}
                                </Typography>
                                <Typography>
                                  إلى: {request.fields['Destination city']} - {request.fields['destination area']}
                                </Typography>
                                <Typography>
                                  التاريخ: {request.fields['Date']}
                                </Typography>
                                <Typography>
                                  المقاعد المطلوبة: {request.fields['Seats']}
                                </Typography>
                                {request.fields['Note'] && (
                                  <Typography>
                                    ملاحظات: {request.fields['Note']}
                                  </Typography>
                                )}
                                {request.fields.Status === 'cancelled' ? (
                                  <Typography color="error" sx={{ mt: 2, fontWeight: 'medium' }}>
                                    ملغي
                                  </Typography>
                                ) : (
                                  <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleCancelRequest(request.id)}
                                    sx={{ mt: 2 }}
                                  >
                                    إلغاء الطلب
                                  </Button>
                                )}
                              </Stack>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {activeTab === 1 && (
                <Grid container spacing={3}>
                  {rides.map((ride) => (
                    ride?.fields && (
                      <Grid item xs={12} key={ride.id}>
                        <Card>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Box>
                                <Stack spacing={1}>
                                  <Typography>
                                    من: {ride.fields['Starting city']} {ride.fields['starting area']}
                                  </Typography>
                                  <Typography>
                                    إلى: {ride.fields['Destination city']} {ride.fields['Destination area']}
                                  </Typography>
                                  <Typography>
                                    التاريخ: {ride.fields['Date']}
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
                                  <Typography>
                                    نوع السيارة: {ride.fields['Car Type']}
                                  </Typography>
                                  {ride.fields['Description'] && (
                                    <Typography>
                                      ملاحظات: {ride.fields['Description']}
                                    </Typography>
                                  )}
                                  {ride.fields.Status === 'cancelled' ? (
                                    <Typography color="error" sx={{ mt: 2, fontWeight: 'medium' }}>
                                      ملغي
                                    </Typography>
                                  ) : (
                                    <Button
                                      variant="contained"
                                      color="error"
                                      onClick={() => handleCancelRide(ride.id)}
                                      sx={{ mt: 2 }}
                                    >
                                      إلغاء الرحلة
                                    </Button>
                                  )}
                                </Stack>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                  ))}
                </Grid>
              )}
            </>
          )}
        </Box>
      </Container>
    </Layout>
  );
};

export default MyRides;
