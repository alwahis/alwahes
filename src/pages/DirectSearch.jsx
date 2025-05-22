import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Stack,
  Typography,
  Box,
  Container,
  MenuItem,
  Paper
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import moment from 'moment';
import 'moment/locale/ar';
import Layout from '../components/Layout';

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

export default function DirectSearch() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    startingCity: '',
    destinationCity: '',
    date: moment().startOf('day')
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({ ...prev, date }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.startingCity || !formData.destinationCity) {
      setError('الرجاء اختيار مدينتي الانطلاق والوصول');
      return;
    }

    if (!formData.date) {
      setError('الرجاء اختيار تاريخ الرحلة');
      return;
    }

    navigate('/search-results', {
      state: {
        startingCity: formData.startingCity,
        destinationCity: formData.destinationCity,
        date: formData.date.format('YYYY-MM-DD')
      }
    });
  };

  return (
    <Layout>
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="ar">
        <Container maxWidth="md">
          <Box sx={{ py: 4 }}>
            <Typography variant="h4" align="center" gutterBottom>
              بحث عن رحلة
            </Typography>
            
            <Paper elevation={2} sx={{ p: 4, mt: 4 }}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    select
                    label="مدينة الانطلاق"
                    name="startingCity"
                    value={formData.startingCity}
                    onChange={handleChange}
                    required
                    fullWidth
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
                    size="medium"
                  >
                    {cities.map((city) => (
                      <MenuItem key={city} value={city}>
                        {city}
                      </MenuItem>
                    ))}
                  </TextField>

                  
                  <DatePicker
                    label="تاريخ الرحلة"
                    value={formData.date}
                    onChange={handleDateChange}
                    minDate={moment().startOf('day')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        required
                        size="medium"
                      />
                    )}
                  />


                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    disabled={!formData.startingCity || !formData.destinationCity || !formData.date}
                  >
                    بحث
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Box>
        </Container>
      </LocalizationProvider>
    </Layout>
  );
}
