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

const RideCard = ({ ride }) => {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `مرحبا، أنا مهتم برحلتك من ${ride.fields['Starting Point']} إلى ${
        ride.fields['Destination']
      } بتاريخ ${ride.fields['Date']}`
    );
    window.open(
      `https://wa.me/${ride.fields['WhatsApp Number']}?text=${message}`,
      '_blank'
    );
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" component="div" gutterBottom>
              {ride.fields['Name of Driver']}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationOnIcon color="primary" />
              <Typography>
                من: {ride.fields['Starting Point']}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocationOnIcon color="primary" />
              <Typography>
                إلى: {ride.fields['Destination']}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <EventIcon color="primary" />
              <Typography>
                التاريخ: {ride.fields['Date']}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon color="primary" />
              <Typography>
                الوقت: {ride.fields['Time'] || 'غير محدد'}
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AirlineSeatReclineNormalIcon color="primary" />
              <Typography>
                المقاعد المتاحة: {ride.fields['Seats Available'] || 0}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoneyIcon color="primary" />
              <Typography>
                السعر لكل مقعد: {ride.fields['Price per Seat'] || 0} د.ع
              </Typography>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <DirectionsCarIcon color="primary" />
              <Typography>
                نوع السيارة: {ride.fields['Car Type'] || 'غير محدد'}
              </Typography>
            </Box>
            {ride.fields['Description'] && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography>
                  ملاحظات: {ride.fields['Description']}
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
