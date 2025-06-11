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
  Input,
  FormControl,
  FormLabel,
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import moment from 'moment';
import 'moment/locale/ar';
import Layout from '../components/Layout';
import { createRide, getMatchingRideRequests } from '../services/airtable';
import { uploadImage } from '../utils/cloudinary';

// Helper function to convert file to base64 (keeping this for potential future use)
const convertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};
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
  // Use ISO format (YYYY-MM-DD) which is recognized by moment.js without warnings
  const momentDate = moment(date);
  return momentDate.isValid() ? momentDate.format('YYYY-MM-DD') : '';
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
    price: '',
    whatsappNumber: '',
    note: '',
    carType: '',
    image: null,
    startingCity: '',
    destinationCity: ''
  });
  
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({
          ...prev,
          image: file
        }));
      };
      reader.readAsDataURL(file);
    }
  };

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

      // Upload image to Cloudinary if exists
      let imageData = [];
      if (formData.image) {
        try {
          const uploadResult = await uploadImage(formData.image);
          console.log('Image uploaded to Cloudinary:', uploadResult);
          
          // Format the image data for Airtable
          imageData = [{
            url: uploadResult.secure_url,
            filename: `car-${Date.now()}.${uploadResult.format}`
          }];
        } catch (error) {
          console.error('Error uploading image:', error);
          toast.error('حدث خطأ أثناء رفع الصورة. الرجاء المحاولة مرة أخرى.');
          setLoading(false);
          return;
        }
      }

      // Add all the regular fields
      const rideData = {
        'Name of Driver': formData.name,
        'Starting city': formData.from,
        'Destination city': formData.to,
        'Date': formattedDate,
        'Time': '12:00 PM',
        'Seats Available': "4",
        'Price per Seat': String(formData.price),
        'WhatsApp Number': formData.whatsappNumber,
        'Car Type': formData.carType,
        'Note': formData.note || '',
        'Status': 'Active',
        'image': imageData // Changed from 'Images' to 'image' to match Airtable field name
      };

      console.log('Submitting ride data:', JSON.stringify(rideData, null, 2));
      const newRide = await createRide(rideData);
      
      if (newRide && newRide.records && newRide.records[0]) {
        const rideId = newRide.records[0].id;
        await createRideToken(formData.whatsappNumber, 'published', rideId, rideData);
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
    <Layout>
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="ar">
        <Container maxWidth="sm">
          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography 
              variant="h5" 
              component="h1" 
              gutterBottom 
              align="center"
              sx={{ 
                mb: 4,
                fontWeight: 'bold',
                color: 'text.primary',
                fontSize: '2rem',
                textAlign: 'center',
                width: '100%'
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
                  fullWidth
                  label="نوع السيارة *"
                  name="carType"
                  value={formData.carType}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                  placeholder="مثال: تويوتا كامري 2020"
                  InputProps={{
                    sx: { bgcolor: 'background.paper' }
                  }}
                />

                <Box sx={{ mb: 2 }}>
                  <FormLabel component="legend">صورة السيارة (اختياري)</FormLabel>
                  <Input
                    type="file"
                    inputProps={{ accept: 'image/*' }}
                    onChange={handleImageChange}
                    sx={{ mt: 1 }}
                  />
                  {imagePreview && (
                    <Box sx={{ mt: 2, maxWidth: '100%' }}>
                      <img 
                        src={imagePreview} 
                        alt="Car preview" 
                        style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px' }} 
                      />
                    </Box>
                  )}
                </Box>


                <TextField
                  label="السعر للمقعد الواحد *"
                  name="price"
                  type="text"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  fullWidth
                  size="medium"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">دينار عراقي</InputAdornment>,
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
                  placeholder="مثال: اكدر اخذك من البيت"
                  InputProps={{
                    sx: { bgcolor: 'background.paper' }
                  }}
                />
                
                {/* Image upload feature has been removed */}

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
