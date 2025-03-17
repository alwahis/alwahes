import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  TextField,
  Button,
  Stack,
  Typography,
  Alert,
  Box,
  Container,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import { createRideRequest } from '../services/airtable';
import { isValidPhoneNumber } from '../utils/phoneNumber';
import 'moment/locale/ar';

moment.locale('ar');

const cities = [
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
  'سامراء'
];

const RequestRide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startingCity, destinationCity, date } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    startingCity: startingCity || '',
    destinationCity: destinationCity || '',
    date: date ? moment(date) : moment(),
    seats: '',
    whatsappNumber: '',
    note: '',
  });

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('الرجاء إدخال الاسم');
      return false;
    }
    if (!formData.startingCity.trim()) {
      setError('الرجاء اختيار مدينة الانطلاق');
      return false;
    }
    if (!formData.destinationCity.trim()) {
      setError('الرجاء اختيار مدينة الوصول');
      return false;
    }
    if (!formData.whatsappNumber.trim()) {
      setError('الرجاء إدخال رقم الواتساب');
      return false;
    }
    if (!isValidPhoneNumber(formData.whatsappNumber)) {
      setError('رقم الواتساب يجب أن يكون 11 رقماً');
      return false;
    }
    if (!formData.seats || formData.seats < 1) {
      setError('الرجاء إدخال عدد المقاعد المطلوبة');
      return false;
    }
    if (!formData.date) {
      setError('الرجاء اختيار تاريخ الرحلة');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const rideRequest = {
        ...formData,
        date: formData.date.format('YYYY/MM/DD'),
      };

      console.log('Submitting form data:', rideRequest);
      const newRequest = await createRideRequest(rideRequest);

      // Show success message
      toast.success('تم إرسال طلب الرحلة بنجاح!');

      // Navigate to search results to show matching published rides
      // Don't pass date parameter to show all rides regardless of date
      navigate('/search-results', {
        state: {
          startingCity: formData.startingCity,
          destinationCity: formData.destinationCity
          // Date is intentionally omitted to show all rides regardless of date
        }
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setError(error.message || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };
  


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  return (
    <Layout>
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="ar">
        <Container maxWidth="sm">
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              طلب رحلة جديدة
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <form onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  label="الاسم"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  fullWidth
                  error={Boolean(error && !formData.name.trim())}
                  size="medium"
                />
                
                <TextField
                  select
                  label="مدينة الانطلاق"
                  name="startingCity"
                  value={formData.startingCity}
                  onChange={handleChange}
                  required
                  fullWidth
                  error={Boolean(error && !formData.startingCity.trim())}
                  size="medium"
                >
                  {cities.map((city) => (
                    <MenuItem key={city} value={city}>
                      {city}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  select
                  label="مدينة الوصول"
                  name="destinationCity"
                  value={formData.destinationCity}
                  onChange={handleChange}
                  required
                  fullWidth
                  error={Boolean(error && !formData.destinationCity.trim())}
                  size="medium"
                >
                  {cities.map((city) => (
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

                <TextField
                  label="عدد المقاعد المطلوبة"
                  name="seats"
                  type="number"
                  value={formData.seats}
                  onChange={handleChange}
                  required
                  fullWidth
                  inputProps={{ min: 1 }}
                  error={Boolean(error && (!formData.seats || formData.seats < 1))}
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
                  label="ملاحظات إضافية"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
                  size="medium"
                  placeholder="مثال: اريد سيارة تاخذني من البيت بحي الجامعة"
                  helperText="مثال: اريد سيارة تاخذني من البيت بحي الجامعة"
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
                  disabled={loading}
                >
                  {loading ? 'جاري الإرسال...' : 'إرسال الطلب'}
                </Button>
              </Stack>
            </form>
          </Box>
        </Container>
      </LocalizationProvider>
    </Layout>
  );
};

export default RequestRide;
