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
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import { createRideRequest } from '../services/airtable';
import 'moment/locale/ar';

moment.locale('ar');

const RequestRide = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { startingCity, destinationCity, date } = location.state || {};

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    startingCity: startingCity || '',
    startingArea: '',
    destinationCity: destinationCity || '',
    destinationArea: '',
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

      // Navigate to search results to show available rides
      navigate('/search-results', {
        search: `?from=${formData.startingCity}&to=${formData.destinationCity}&date=${formData.date.format('YYYY/MM/DD')}`
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
    <Layout title="طلب رحلة">
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
                  label="مدينة الانطلاق"
                  value={formData.startingCity}
                  disabled
                  fullWidth
                />

                <TextField
                  label="منطقة الانطلاق"
                  name="startingArea"
                  value={formData.startingArea}
                  onChange={handleChange}
                  required
                  fullWidth
                  error={Boolean(error && !formData.startingArea.trim())}
                  helperText="مثال: الكراج الموحد"
                  placeholder="الكراج الموحد"
                  size="medium"
                />

                <TextField
                  label="مدينة الوصول"
                  value={formData.destinationCity}
                  disabled
                  fullWidth
                />

                <TextField
                  label="منطقة الوصول"
                  name="destinationArea"
                  value={formData.destinationArea}
                  onChange={handleChange}
                  required
                  fullWidth
                  error={Boolean(error && !formData.destinationArea.trim())}
                  helperText="مثال: حي الجامعة"
                  placeholder="حي الجامعة"
                  size="medium"
                />

                <DatePicker
                  label="التاريخ"
                  value={formData.date ? moment(formData.date) : null}
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
                  label="عدد المقاعد"
                  name="seats"
                  type="number"
                  value={formData.seats}
                  onChange={handleChange}
                  required
                  fullWidth
                  error={Boolean(error && !formData.seats)}
                  size="medium"
                  inputProps={{ min: 1, max: 8 }}
                />

                <TextField
                  label="رقم الواتساب"
                  name="whatsappNumber"
                  value={formData.whatsappNumber}
                  onChange={handleChange}
                  required
                  fullWidth
                  error={Boolean(error && !formData.whatsappNumber)}
                  helperText="مثال: 07801234567"
                  placeholder="07801234567"
                  size="medium"
                />

                <TextField
                  label="ملاحظات إضافية"
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  fullWidth
                  multiline
                  rows={3}
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
