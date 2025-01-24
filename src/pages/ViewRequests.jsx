import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Box,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-hot-toast';
import Layout from '../components/Layout';
import { getRideRequests } from '../services/airtable';

const ViewRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const data = await getRideRequests();
      setRequests(data);
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل طلبات الرحلات');
    } finally {
      setLoading(false);
    }
  };

  const handleWhatsAppClick = (request) => {
    const message = encodeURIComponent(
      `مرحبا، لدي رحلة متاحة من ${request.fields['Starting Point']} إلى ${
        request.fields.Destination
      } بتاريخ ${request.fields.Date}`
    );
    window.open(
      `https://wa.me/${request.fields['WhatsApp Number']}?text=${message}`,
      '_blank'
    );
  };

  if (loading) {
    return (
      <Layout title="طلبات الرحلات">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '50vh',
          }}
        >
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="طلبات الرحلات">
      {requests.length > 0 ? (
        <Stack spacing={2}>
          {requests.map((request) => (
            <Card key={request.id}>
              <CardContent>
                <Stack spacing={2}>
                  <Typography>
                    من: {request.fields['Starting Point']}
                  </Typography>
                  <Typography>إلى: {request.fields.Destination}</Typography>
                  <Typography>التاريخ: {request.fields.Date}</Typography>
                  <Button
                    variant="contained"
                    onClick={() => handleWhatsAppClick(request)}
                    fullWidth
                  >
                    تواصل عبر الواتساب
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Stack>
      ) : (
        <Typography variant="h6" textAlign="center">
          لا توجد طلبات رحلات حالياً
        </Typography>
      )}
    </Layout>
  );
};

export default ViewRequests;
