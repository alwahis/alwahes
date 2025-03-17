import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Box,
} from '@mui/material';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import EventIcon from '@mui/icons-material/Event';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PersonIcon from '@mui/icons-material/Person';

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

  return (
    <Card elevation={3}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <PersonIcon color="primary" />
              <Typography variant="h6" component="div" gutterBottom>
                {driverName}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationOnIcon color="primary" />
              <Typography>
                من: {startPoint}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon color="primary" />
              <Typography>
                إلى: {destination}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <EventIcon color="primary" />
              <Typography>
                التاريخ: {date}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon color="primary" />
              <Typography>
                الوقت: {time}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AirlineSeatReclineNormalIcon color="primary" />
              <Typography>
                المقاعد المتاحة: {seatsAvailable}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoneyIcon color="primary" />
              <Typography>
                السعر لكل مقعد: {pricePerSeat} د.ع
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <DirectionsCarIcon color="primary" />
              <Typography>
                نوع السيارة: {carType}
              </Typography>
            </Box>
            {description && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography>
                  ملاحظات: {description}
                </Typography>
              </Box>
            )}
            <Button
              variant="contained"
              startIcon={<WhatsAppIcon />}
              onClick={handleWhatsAppClick}
              fullWidth
            >
              تواصل عبر الواتساب
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RideCard;
