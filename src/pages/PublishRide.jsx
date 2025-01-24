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
import Layout from '../components/Layout';
import { createRide } from '../services/airtable';
import { createRideToken } from '../utils/deviceHistory';
import 'moment/locale/ar';

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
  const [formData, setFormData] = useState({
    name: '',
    from: '',
    fromArea: '',
    to: '',
    toArea: '',
    date: moment(),
    time: moment(),
    seats: '',
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
      formData.seats &&
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
      const rideData = {
        ...formData,
        date: formData.date.format('YYYY/MM/DD'),
        time: formData.time.format('hh:mm A'),
        displayDate: formatDate(formData.date),
        displayTime: formatTime(formData.time)
      };

      const newRide = await createRide(rideData);
      createRideToken(formData.whatsappNumber, 'published', newRide.id, rideData);
      navigate('/matching-requests', { 
        state: { 
          rideId: newRide.id,
          from: formData.from,
          to: formData.to,
          date: formData.date.format('YYYY/MM/DD')
        } 
      });
    } catch (error) {
      setError(error.message || 'حدث خطأ أثناء نشر الرحلة. يرجى المحاولة مرة أخرى.');
      console.error('Publish error:', error);
    } finally {
      setLoading(false);
    }
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
                    label="منطقة الانطلاق"
                    name="fromArea"
                    value={formData.fromArea}
                    onChange={handleChange}
                    fullWidth
                    size="medium"
                    placeholder="الكراج الموحد"
                    helperText="مثال: الكراج الموحد"
                    InputProps={{
                      sx: { bgcolor: 'background.paper' }
                    }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
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

                  <TextField
                    label="منطقة الوصول"
                    name="toArea"
                    value={formData.toArea}
                    onChange={handleChange}
                    fullWidth
                    size="medium"
                    placeholder="حي الجامعة"
                    helperText="مثال: حي الجامعة"
                    InputProps={{
                      sx: { bgcolor: 'background.paper' }
                    }}
                  />
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
                      setFormData((prev) => ({
                        ...prev,
                        time: newValue,
                      }));
                      setError('');
                    }}
                    format="hh:mm A"
                    ampm={true}
                    ampmInClock={true}
                    slotProps={{
                      textField: {
                        required: true,
                        fullWidth: true,
                        placeholder: "مثال: 11:50 AM",
                        helperText: "الساعة:الدقيقة",
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
                    label="عدد المقاعد *"
                    name="seats"
                    type="number"
                    value={formData.seats}
                    onChange={handleChange}
                    required
                    fullWidth
                    size="medium"
                    inputProps={{ min: 1, max: 8 }}
                    InputProps={{
                      sx: { bgcolor: 'background.paper' }
                    }}
                  />

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
          </Box>
        </Container>
      </LocalizationProvider>
    </Layout>
  );
}

export default PublishRide;
