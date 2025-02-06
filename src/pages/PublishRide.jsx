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
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import moment from 'moment';
import 'moment/locale/ar';
import Layout from '../components/Layout';
import { createRide, getMatchingRideRequests } from '../services/airtable';
import { createRideToken } from '../utils/deviceHistory';
import { toast } from 'react-hot-toast';
import { isValidPhoneNumber } from '../utils/phoneNumber';

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
  return time ? time.format('HH:mm') : '';
};

const formatDate = (date) => {
  if (!date) return '';
  const momentDate = moment(date);
  return momentDate.isValid() ? momentDate.format('YYYY/MM/DD') : '';
};

function PublishRide() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    from: '',
    to: '',
    date: moment(),
    time: moment().startOf('hour'),
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
    if (!formData.name) {
      setError('الرجاء إدخال اسم السائق');
      return false;
    }
    if (!formData.from || !formData.to) {
      setError('الرجاء تحديد نقطة الانطلاق والوصول');
      return false;
    }
    if (!formData.whatsappNumber.trim()) {
      setError('رقم الواتساب مطلوب');
      return false;
    }
    if (!isValidPhoneNumber(formData.whatsappNumber)) {
      setError('رقم الواتساب يجب أن يكون 11 رقماً');
      return false;
    }
    if (!formData.date) {
      setError('الرجاء تحديد التاريخ');
      return false;
    }
    if (!formData.time) {
      setError('الرجاء تحديد الوقت');
      return false;
    }
    if (!formData.price) {
      setError('الرجاء تحديد السعر');
      return false;
    }
    if (!formData.carType) {
      setError('الرجاء تحديد نوع السيارة');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formattedDate = formatDate(formData.date);
      console.log('Publishing ride with date:', formattedDate);

      const rideData = {
        'Name of Driver': formData.name,
        'Starting city': formData.from,
        'Destination city': formData.to,
        'Date': formattedDate,
        'Time': formatTime(formData.time),
        'Seats Available': "4",
        'Price per Seat': String(formData.price),
        'WhatsApp Number': formData.whatsappNumber,
        'Car Type': formData.carType,
        'Note': formData.note || '',
        'Status': 'Active'
      };

      const newRide = await createRide(rideData);
      
      if (newRide) {
        await createRideToken(formData.whatsappNumber, 'published', newRide.id, rideData);
        toast.success('تم نشر الرحلة بنجاح');
        
        // Navigate to matching requests page
        navigate('/matching-requests', {
          state: {
            from: formData.from,
            to: formData.to,
            date: formattedDate,
            price: formData.price,
            note: formData.note
          }
        });
      }
    } catch (err) {
      console.error('Error publishing ride:', err);
      setError(err.message || 'حدث خطأ أثناء نشر الرحلة');
    } finally {
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
- من ${formData.from} 
- إلى ${formData.to}
- بتاريخ ${moment(formData.date).format('LL')}
- السعر: ${formData.price} دينار
${formData.note ? `- ملاحظات: ${formData.note}` : ''}

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
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="اسم السائق *"
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

                <TextField
                  select
                  label="نقطة الانطلاق *"
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
                  label="الوجهة *"
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

                <DatePicker
                  label="التاريخ *"
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
                      error: Boolean(error && !formData.date),
                      dir: 'ltr',
                      size: "medium",
                      sx: {
                        '& .MuiInputBase-root': {
                          bgcolor: 'background.paper'
                        }
                      }
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

                <TimePicker
                  label="وقت المغادرة *"
                  value={formData.time}
                  onChange={(newValue) => {
                    setFormData((prev) => ({ ...prev, time: newValue }));
                    setError('');
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      fullWidth
                      size="medium"
                      InputProps={{
                        ...params.InputProps,
                        sx: { bgcolor: 'background.paper' }
                      }}
                    />
                  )}
                />

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
                  error={formData.whatsappNumber && !isValidPhoneNumber(formData.whatsappNumber)}
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
                  InputProps={{
                    sx: { bgcolor: 'background.paper' }
                  }}
                />

                <TextField
                  label="السعر للمقعد الواحد *"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="medium"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">IQD</InputAdornment>,
                    sx: { bgcolor: 'background.paper' }
                  }}
                />

                <TextField
                  label="ملاحظات إضافية"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  fullWidth
                  size="medium"
                  InputProps={{
                    sx: { bgcolor: 'background.paper' }
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  sx={{
                    mt: 2,
                    bgcolor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                    },
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
