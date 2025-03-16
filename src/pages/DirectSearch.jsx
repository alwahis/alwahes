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
import Layout from '../components/Layout';

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
    destinationCity: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.startingCity || !formData.destinationCity) {
      return;
    }

    navigate('/search-results', {
      state: {
        startingCity: formData.startingCity,
        destinationCity: formData.destinationCity
      }
    });
  };

  return (
    <Layout>
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            بحث عن رحلة
          </Typography>
          
          <Paper elevation={2} sx={{ p: 4, mt: 4 }}>
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

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  disabled={!formData.startingCity || !formData.destinationCity}
                >
                  بحث
                </Button>
              </Stack>
            </form>
          </Paper>
        </Box>
      </Container>
    </Layout>
  );
}
