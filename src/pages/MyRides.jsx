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
import { getDriverRidesAndRequests, deleteRide, deleteRideRequest } from '../services/airtable';

const MyRides = () => {
  const [rides, setRides] = useState([]);
  const [rideRequests, setRideRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

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

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      setLoading(true);
      if (itemToDelete.type === 'ride') {
        await deleteRide(itemToDelete.id);
        setRides(rides.filter(ride => ride.id !== itemToDelete.id));
        toast.success('تم حذف الرحلة بنجاح');
      } else {
        await deleteRideRequest(itemToDelete.id);
        setRideRequests(rideRequests.filter(request => request.id !== itemToDelete.id));
        toast.success('تم حذف الطلب بنجاح');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error(error.message);
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleDeleteClick = (item, type) => {
    setItemToDelete({ ...item, type });
    setDeleteDialogOpen(true);
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
                  <Tab label={`طلبات الركاب (${rideRequests.length})`} />
                  <Tab label={`رحلاتي (${rides.length})`} />
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
                              </Stack>
                            </Box>
                            <IconButton 
                              onClick={() => handleDeleteClick(request, 'request')}
                              color="error"
                              sx={{ mt: -1, mr: -1 }}
                            >
                              <DeleteIcon />
                            </IconButton>
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
                                    من: {ride.fields['Starting city']} - {ride.fields['starting area']}
                                  </Typography>
                                  <Typography>
                                    إلى: {ride.fields['Destination city']} - {ride.fields['destination area']}
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
                                </Stack>
                              </Box>
                              <IconButton 
                                onClick={() => handleDeleteClick(ride, 'ride')}
                                color="error"
                                sx={{ mt: -1, mr: -1 }}
                              >
                                <DeleteIcon />
                              </IconButton>
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

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>
            {itemToDelete?.type === 'ride' ? 'حذف الرحلة' : 'حذف الطلب'}
          </DialogTitle>
          <DialogContent>
            <Typography>
              {itemToDelete?.type === 'ride' 
                ? 'هل أنت متأكد من حذف هذه الرحلة؟'
                : 'هل أنت متأكد من حذف هذا الطلب؟'
              }
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>إلغاء</Button>
            <Button onClick={handleDelete} color="error" autoFocus>
              حذف
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Layout>
  );
};

export default MyRides;
