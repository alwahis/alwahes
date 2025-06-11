import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
  CardMedia,
  CardActionArea,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';
import ImageIcon from '@mui/icons-material/Image';

// Helper function to safely get field values with defaults
const getFieldValue = (ride, fieldName, defaultValue = 'غير محدد') => {
  return ride.fields && ride.fields[fieldName] ? ride.fields[fieldName] : defaultValue;
};

const RideCard = ({ ride }) => {
  // Extract data with defaults to prevent undefined values
  const driverName = getFieldValue(ride, 'Name of Driver');
  const startPoint = getFieldValue(ride, 'Starting Point') || getFieldValue(ride, 'Starting city');
  const destination = getFieldValue(ride, 'Destination') || getFieldValue(ride, 'Destination city');
  const time = getFieldValue(ride, 'Time');
  const date = getFieldValue(ride, 'Date');
  const seatsAvailable = getFieldValue(ride, 'Seats Available', '1');
  const pricePerSeat = getFieldValue(ride, 'Price per Seat', '0');
  const carType = getFieldValue(ride, 'Car Type');
  const description = getFieldValue(ride, 'Description', '');
  const whatsappNumber = getFieldValue(ride, 'WhatsApp Number', '07850244072');
  
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `مرحبا، أنا مهتم برحلتك من ${startPoint} إلى ${destination}`
    );
    window.open(
      `https://wa.me/${whatsappNumber}?text=${message}`,
      '_blank'
    );
  };

  // Get the first image URL if available
  const imageUrl = ride.fields?.image?.[0]?.url || null;
  
  // Format the date for display
  const formattedDate = new Date(date).toLocaleDateString('ar-IQ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Card elevation={3}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
        {/* Left side - Image */}
        <Box sx={{ width: { xs: '100%', sm: '200px' }, flexShrink: 0 }}>
          {imageUrl ? (
            <CardActionArea onClick={() => window.open(imageUrl, '_blank')}>
              <CardMedia
                component="img"
                image={imageUrl}
                alt={`${carType} - ${driverName}`}
                sx={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRight: { sm: '1px solid rgba(0, 0, 0, 0.12)' },
                  borderBottom: { xs: '1px solid rgba(0, 0, 0, 0.12)', sm: 'none' }
                }}
              />
            </CardActionArea>
          ) : (
            <Box 
              sx={{
                width: '100%',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'action.hover',
                color: 'text.secondary',
                flexDirection: 'column',
                gap: 1,
                borderRight: { sm: '1px solid rgba(0, 0, 0, 0.12)' },
                borderBottom: { xs: '1px solid rgba(0, 0, 0, 0.12)', sm: 'none' }
              }}
            >
              <ImageIcon fontSize="large" />
              <Typography variant="body2">لا توجد صورة</Typography>
            </Box>
          )}
        </Box>
        
        {/* Right side - Details */}
        <Box sx={{ flex: 1, p: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <Box component="span" sx={{ fontWeight: 'medium' }}>الوقت:</Box> {time}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <Box component="span" sx={{ fontWeight: 'medium' }}>السائق:</Box> {driverName}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <Box component="span" sx={{ fontWeight: 'medium' }}>نوع السيارة:</Box> {carType}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <Box component="span" sx={{ fontWeight: 'medium' }}>المقاعد المتاحة:</Box> {seatsAvailable}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
              السعر لكل مقعد: {pricePerSeat} د.ع
            </Typography>
            
            {description && (
              <Box sx={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
                p: 2,
                borderRadius: 1,
                borderRight: '3px solid',
                borderColor: 'primary.main',
                mb: 2
              }}>
                <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                  {description}
                </Typography>
              </Box>
            )}
            
            <Button
              variant="contained"
              startIcon={<WhatsAppIcon />}
              onClick={handleWhatsAppClick}
              fullWidth
              size="large"
              sx={{ mt: 2, py: 1.5 }}
            >
              تواصل عبر الواتساب
            </Button>
          </Box>
          
        </Box>
      </Box>
    </Card>
  );
};

export default RideCard;
