import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  MenuItem,
  Stack,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import 'moment/locale/ar';
import Layout from '../components/Layout';

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
  'الديوانية',
  'الكوت',
  'العمارة',
  'الناصرية',
  'السماوة',
  'الرمادي',
  'فلوجة',
  'بعقوبة',
  'الخالص',
  'سامراء',
];

export default function SearchRides() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    date: moment(),
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    try {
      if (!formData.from || !formData.to || !formData.date) {
        throw new Error('جميع الحقول مطلوبة');
      }

      // Format date to YYYY/MM/DD to match Airtable format
      const formattedDate = formData.date.format('YYYY/MM/DD');
      
      // Navigate to search results page with query parameters
      navigate('/search-results', {
        state: {
          startingCity: formData.from,
          destinationCity: formData.to,
          date: formattedDate
        }
      });
      
    } catch (error) {
      setError(error.message || 'حدث خطأ أثناء البحث. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <Layout>
      <Container maxWidth="sm">
        <Typography variant="h4" component="h1" gutterBottom align="center">
          البحث عن رحلة
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={3}>
            <TextField
              select
              label="من *"
              value={formData.from}
              onChange={(e) => setFormData({ ...formData, from: e.target.value })}
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
              label="إلى *"
              value={formData.to}
              onChange={(e) => setFormData({ ...formData, to: e.target.value })}
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

            <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="ar">
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
                    InputProps: {
                      sx: { bgcolor: 'background.paper' }
                    }
                  }
                }}
                minDate={moment()}
              />
            </LocalizationProvider>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
            >
              بحث
            </Button>
          </Stack>
        </Box>
      </Container>
    </Layout>
  );
}
