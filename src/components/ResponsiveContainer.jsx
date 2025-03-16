import { Container, Box } from '@mui/material';

// A responsive container component that provides consistent padding and max-width
// across the application for better mobile experience
const ResponsiveContainer = ({ children, maxWidth = 'md', disableGutters = false }) => {
  return (
    <Container 
      maxWidth={maxWidth} 
      disableGutters={disableGutters}
      sx={{
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
        width: '100%'
      }}
    >
      <Box sx={{ 
        width: '100%',
        mx: 'auto'
      }}>
        {children}
      </Box>
    </Container>
  );
};

export default ResponsiveContainer;
