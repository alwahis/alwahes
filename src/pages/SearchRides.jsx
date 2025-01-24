import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Stack,
  Typography,
  Container,
  Alert,
  Box,
  MenuItem,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import Layout from '../components/Layout';
import { searchRides } from '../services/airtable';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import { getDeviceRides } from '../utils/deviceHistory';
import 'moment/locale/ar';

// Configure moment to use Arabic locale
moment.locale('ar');

const IRAQI_CITIES = [
  'بغداد',
  'البصرة',
  'الموصل',
  'أربيل',
  'كركوك',
  'النجف',
  'كربلاء',
  'الحلة',
  'الناصرية',
  'الديوانية',
  'السماوة',
  'الكوت',
  'العمارة',
  'الرمادي',
  'بعقوبة',
  'السليمانية',
  'دهوك',
  'الفلوجة',
  'تكريت',
  'سامراء',
];

function SearchRides() {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);
  const [deviceHistory, setDeviceHistory] = useState([]);
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: moment(),
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rides, setRides] = useState([]);

  useEffect(() => {
    // Load device history on component mount
    const history = getDeviceRides();
    setDeviceHistory(history);
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.from || !formData.to || !formData.date) {
        throw new Error('الرجاء إدخال جميع المعلومات المطلوبة');
      }

      // Format date to YYYY/MM/DD to match Airtable format
      const formattedDate = moment(formData.date).format('YYYY/MM/DD');
      console.log('Form data:', formData);
      console.log('Formatted date:', formattedDate);

      const response = await searchRides(formData.from, formData.to, formattedDate);
      setRides(response);
    } catch (error) {
      setError(error.message || 'حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

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

  const createWhatsAppMessage = (ride) => {
    const message = `السلام عليكم 🌟

أريد الحجز في رحلتك:
- من ${ride.fields['Starting city']} ${ride.fields['starting area'] ? `(${ride.fields['starting area']})` : ''}
- إلى ${ride.fields['Destination city']} ${ride.fields['destination area'] ? `(${ride.fields['destination area']})` : ''}
- التاريخ: ${moment(ride.fields['Date']).format('DD/MM/YYYY')}
- الوقت: ${ride.fields['Time']}
- عدد المقاعد المتوفرة: ${ride.fields['Seats']}
- نوع السيارة: ${ride.fields['Car Type'] || 'غير محدد'}

هل المقاعد متوفرة؟ 🚗`;

    return encodeURIComponent(message);
  };

  return (
    <Layout title="البحث عن رحلات">
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="ar">
        <Container maxWidth="sm">
          <Paper 
            elevation={3} 
            sx={{ 
              p: { xs: 2, sm: 4 },
              mt: { xs: 2, sm: 4 },
              mb: { xs: 2, sm: 4 },
              mx: { xs: -2, sm: 0 }
            }}
          >
            <Box sx={{ width: '100%', mb: 3 }}>
              <Tabs 
                value={selectedTab} 
                onChange={handleTabChange} 
                centered
                sx={{
                  '& .MuiTab-root': {
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }
                }}
              >
                <Tab label="بحث عن رحلة" />
                <Tab label="سجل البحث" />
              </Tabs>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {selectedTab === 0 ? (
              <form onSubmit={handleSubmit}>
                <Stack spacing={{ xs: 2, sm: 3 }} sx={{ mb: 4 }}>
                  <TextField
                    select
                    label="مدينة الانطلاق"
                    name="from"
                    value={formData.from}
                    onChange={handleFormChange}
                    required
                    fullWidth
                    size="medium"
                    error={error && !formData.from}
                  >
                    {IRAQI_CITIES.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="مدينة الوصول"
                    name="to"
                    value={formData.to}
                    onChange={handleFormChange}
                    required
                    fullWidth
                    size="medium"
                    error={error && !formData.to}
                  >
                    {IRAQI_CITIES.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </TextField>

                  <DatePicker
                    label="التاريخ"
                    value={formData.date}
                    onChange={(newValue) => {
                      setFormData((prev) => ({ ...prev, date: newValue }));
                      setError('');
                    }}
                    format="YYYY/MM/DD"
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true,
                        placeholder: "مثال: 2025/01/23",
                        helperText: "السنة/الشهر/اليوم",
                        error: error && !formData.date,
                        dir: 'ltr',
                        size: "medium"
                      },
                      mobilePaper: {
                        sx: {
                          '& .MuiPickersCalendarHeader-label': {
                            fontSize: '1rem'
                          }
                        }
                      }
                    }}
                    minDate={moment()}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={loading}
                    sx={{
                      py: { xs: 1.5, sm: 2 },
                      fontSize: { xs: '1rem', sm: '1.1rem' }
                    }}
                  >
                    {loading ? 'جاري البحث...' : 'بحث'}
                  </Button>
                </Stack>
              </form>
            ) : (
              <List sx={{ width: '100%' }}>
                {deviceHistory.length === 0 ? (
                  <Typography 
                    align="center" 
                    color="text.secondary"
                    sx={{ py: 2 }}
                  >
                    لا يوجد سجل بحث على هذا الجهاز
                  </Typography>
                ) : (
                  deviceHistory.map((item, index) => (
                    <div key={item.ride_id}>
                      <ListItem 
                        alignItems="flex-start"
                        sx={{ px: { xs: 0, sm: 2 } }}
                      >
                        <ListItemText
                          primary={
                            <Typography variant="subtitle1">
                              {item.details.from} ← {item.details.to}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.secondary"
                              >
                                {moment(item.details.date).format('YYYY/MM/DD')}
                                {item.details.time && ` - ${item.details.time}`}
                              </Typography>
                              {item.details.seats && (
                                <Typography
                                  component="div"
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  عدد المقاعد: {item.details.seats}
                                  {item.details.price && ` - السعر: ${item.details.price} دينار`}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                      {index < deviceHistory.length - 1 && <Divider />}
                    </div>
                  ))
                )}
              </List>
            )}
            {rides.length > 0 ? (
              <Box sx={{ mt: 4 }}>
                {rides.map((ride) => (
                  <Card key={ride.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h6" component="div" gutterBottom>
                        {ride.fields['Starting city']} → {ride.fields['Destination city']}
                      </Typography>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography color="text.secondary" gutterBottom>
                            <strong>المنطقة:</strong> {ride.fields['starting area'] || 'غير محدد'} → {ride.fields['destination area'] || 'غير محدد'}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography color="text.secondary" gutterBottom>
                            <strong>التاريخ:</strong> {moment(ride.fields['Date']).format('DD/MM/YYYY')}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography color="text.secondary" gutterBottom>
                            <strong>الوقت:</strong> {ride.fields['Time']}
                          </Typography>
                        </Grid>
                        
                        <Grid item xs={12} sm={6}>
                          <Typography color="text.secondary" gutterBottom>
                            <strong>المقاعد المتوفرة:</strong> {ride.fields['Seats']}
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography color="text.secondary" gutterBottom>
                            <strong>السعر:</strong> {ride.fields['Price']} دينار
                          </Typography>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                          <Typography color="text.secondary" gutterBottom>
                            <strong>نوع السيارة:</strong> {ride.fields['Car Type'] || 'غير محدد'}
                          </Typography>
                        </Grid>

                        {ride.fields['Note'] && (
                          <Grid item xs={12}>
                            <Typography color="text.secondary" gutterBottom>
                              <strong>ملاحظات:</strong> {ride.fields['Note']}
                            </Typography>
                          </Grid>
                        )}
                      </Grid>

                      {ride.fields['WhatsApp Number'] && (
                        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<WhatsAppIcon />}
                            href={`https://wa.me/${formatWhatsAppNumber(ride.fields['WhatsApp Number'])}?text=${createWhatsAppMessage(ride)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            fullWidth
                          >
                            تواصل مع السائق
                          </Button>
                          <Button
                            variant="outlined"
                            color="success"
                            onClick={() => {
                              const number = formatWhatsAppNumber(ride.fields['WhatsApp Number']);
                              navigator.clipboard.writeText(number);
                            }}
                          >
                            نسخ الرقم
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Alert severity="info" sx={{ mt: 4 }}>
                لا توجد رحلات متوفرة للمسار المطلوب في هذا التاريخ
              </Alert>
            )}
          </Paper>
        </Container>
      </LocalizationProvider>
    </Layout>
  );
}

export default SearchRides;
