import { useState } from 'react';
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
  Paper,
  InputAdornment,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import 'moment/locale/ar';
import Layout from '../components/Layout';
import { createRide } from '../services/airtable';
import { createRideToken } from '../utils/deviceHistory';
import { toast } from 'react-hot-toast';

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

const formatTime = (time) => {
  return `"${time.format('hh:mm A')}"`;
};

const formatDate = (date) => {
  return `"${date.format('DD/MM/YYYY')}"`;
};

function PublishRide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [requests, setRequests] = useState([]);
  const [showRequests, setShowRequests] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    from: '',
    to: '',
    date: moment(),
    time: moment(),
    price: '',
    whatsappNumber: '',
    note: '',
    carType: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const validateForm = () => {
    return (
      formData.name &&
      formData.from &&
      formData.to &&
      formData.date &&
      formData.time &&
      formData.price &&
      formData.whatsappNumber &&
      formData.carType
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate required fields
      if (!formData.name || !formData.from || !formData.to || !formData.date || 
          !formData.time || !formData.price || !formData.whatsappNumber) {
        throw new Error('جميع الحقول المطلوبة يجب ملؤها');
      }

      const rideData = {
        'Name of Driver': formData.name,
        'Starting city': formData.from,
        'Destination city': formData.to,
        'Date': formData.date.format('YYYY/MM/DD'),
        'Time': formData.time.format('HH:00'),
        'Seats Available': "4",
        'Price per Seat': String(formData.price),
        'Car Type': formData.carType || '',
        'WhatsApp Number': formData.whatsappNumber,
        'Description': formData.note || '',
      };

      console.log('Submitting ride data:', rideData);
      const newRide = await createRide(rideData);
      
      if (newRide && newRide.id) {
        createRideToken(formData.whatsappNumber, 'published', newRide.id, rideData);
        toast.success('تم نشر الرحلة بنجاح');

        // Navigate to matching requests page
        navigate('/matching-requests', {
          state: {
            rideId: newRide.id,
            from: formData.from,
            to: formData.to,
            date: formData.date.format('YYYY/MM/DD')
          }
        });
      } else {
        throw new Error('فشل في إنشاء الرحلة');
      }

    } catch (error) {
      setError(error.message || 'حدث خطأ أثناء نشر الرحلة. يرجى المحاولة مرة أخرى.');
      console.error('Publish error:', error);
      setLoading(false);
    }
  };

  const formatWhatsAppNumber = (number) => {
    if (!number) return '';
    let cleaned = number.replace(/\D/g, '');
    cleaned = cleaned.replace(/^(00964|964)/, '');
    cleaned = cleaned.replace(/^0/, '');
    return `964${cleaned}`;
  };

  const createWhatsAppMessage = (request) => {
    const message = `السلام عليكم 🌟
لدي رحلة متوفرة تناسب طلبك:
- من ${request.fields['Starting city']} 
- إلى ${request.fields['Destination city']}
- بتاريخ ${moment(request.fields['Date']).format('LL')}

هل ما زلت تبحث عن رحلة؟`;
    return encodeURIComponent(message);
  };

  return (
    <Layout title="نشر رحلة">
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="ar">
        <Container maxWidth="sm">
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography 
              variant="h5" 
              component="h1" 
              gutterBottom 
              align="right"
              sx={{ 
                mb: 4,
                fontWeight: 'medium',
                color: 'text.primary' 
              }}
            >
              نشر رحلة جديدة
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="الاسم *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="medium"
                  InputProps={{
                    sx: { bgcolor: 'background.paper' }
                  }}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    select
                    label="مدينة الانطلاق *"
                    name="from"
                    value={formData.from}
                    onChange={handleChange}
                    required
                    fullWidth
                    size="medium"
                    InputProps={{
                      sx: { bgcolor: 'background.paper' }
                    }}
                  >
                    {IRAQI_CITIES.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    select
                    label="مدينة الوصول *"
                    name="to"
                    value={formData.to}
                    onChange={handleChange}
                    required
                    fullWidth
                    size="medium"
                    InputProps={{
                      sx: { bgcolor: 'background.paper' }
                    }}
                  >
                    {IRAQI_CITIES.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'row',
                  gap: 2,
                  mb: 4,
                }}>
                  <DatePicker
                    label="التاريخ *"
                    value={formData.date}
                    onChange={(newValue) => {
                      setFormData((prev) => ({
                        ...prev,
                        date: newValue,
                      }));
                      setError('');
                    }}
                    format="YYYY/MM/DD"
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true,
                        placeholder: "مثال: 2025/01/23",
                        helperText: "السنة/الشهر/اليوم",
                        error: Boolean(error && !formData.date),
                        dir: 'ltr',
                        size: "medium",
                        sx: {
                          flex: 1,
                        }
                      }
                    }}
                    minDate={moment()}
                  />

                  <TimePicker
                    label="الوقت *"
                    value={formData.time}
                    onChange={(newValue) => {
                      // Set minutes to 0 for the selected hour
                      const timeWithZeroMinutes = newValue.minute(0);
                      setFormData((prev) => ({
                        ...prev,
                        time: timeWithZeroMinutes,
                      }));
                      setError('');
                    }}
                    format="hh A"
                    ampm={true}
                    ampmInClock={true}
                    views={['hours']}
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true,
                        placeholder: "مثال: 11 AM",
                        helperText: "الساعة",
                        error: Boolean(error && !formData.time),
                        dir: 'ltr',
                        size: "medium",
                        sx: {
                          flex: 1,
                        }
                      }
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="السعر لكل شخص"
                    variant="outlined"
                    value={formData.price}
                    onChange={handleChange}
                    name="price"
                    required
                    fullWidth
                    size="medium"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">دينار</InputAdornment>,
                      sx: { bgcolor: 'background.paper' },
                      inputProps: {
                        style: { textAlign: 'left' }
                      }
                    }}
                    type="text"
                  />
                </Box>

                <TextField
                  label="رقم الواتساب *"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="medium"
                  placeholder="مثال: 07801234567"
                  helperText="مثال: 07801234567"
                  InputProps={{
                    sx: { bgcolor: 'background.paper' }
                  }}
                />

                <TextField
                  label="نوع السيارة *"
                  name="carType"
                  value={formData.carType}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="medium"
                  placeholder="مثال: تويوتا كامري 2020"
                  InputProps={{
                    sx: { bgcolor: 'background.paper' }
                  }}
                />

                <TextField
                  label="ملاحظات"
                  variant="outlined"
                  value={formData.note}
                  onChange={handleChange}
                  name="note"
                  multiline
                  rows={4}
                  placeholder="مثال: يمكنني أن آخذك من البيت"
                  helperText="معلومات إضافية عن الرحلة (اختياري)"
                  fullWidth
                  size="medium"
                  InputProps={{
                    sx: { bgcolor: 'background.paper' }
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={loading || !validateForm()}
                  sx={{
                    mt: 2,
                    py: 1.5,
                    fontSize: '1.1rem'
                  }}
                >
                  {loading ? 'جاري النشر...' : 'نشر الرحلة'}
                </Button>
              </Stack>
            </form>

            {showRequests && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom align="center">
                  طلبات الرحلات المتطابقة
                </Typography>
                
                {requests.length === 0 ? (
                  <Typography align="center" color="text.secondary">
                    لا توجد طلبات رحلات متطابقة في الوقت الحالي
                  </Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {requests.map((request) => (
                      <Paper key={request.id} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>
                          {request.fields['Starting city']} إلى {request.fields['Destination city']}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                          التاريخ: {moment(request.fields['Date']).format('LL')}
                        </Typography>
                        <Typography>
                          عدد المقاعد المطلوبة: {request.fields['Seats']}
                        </Typography>
                        {request.fields['Description'] && (
                          <Typography>
                            ملاحظات: {request.fields['Description']}
                          </Typography>
                        )}
                        {request.fields['WhatsApp Number'] && (
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<i className="fa-brands fa-whatsapp" />}
                            href={`https://wa.me/${formatWhatsAppNumber(request.fields['WhatsApp Number'])}?text=${createWhatsAppMessage(request)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ mt: 2 }}
                          >
                            تواصل مع الراكب
                          </Button>
                        )}
                      </Paper>
                    ))}
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Container>
      </LocalizationProvider>
    </Layout>
  );
}

export default PublishRide;
