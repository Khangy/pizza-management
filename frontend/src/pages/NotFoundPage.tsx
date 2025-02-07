import { Container, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        404: Not Found
      </Typography>
      <Typography variant="h5" component="p" gutterBottom>
        The page you're looking for doesn't exist.
      </Typography>
      <Button 
        component={RouterLink} 
        to="/" 
        variant="contained" 
        sx={{ mt: 2 }}
      >
        Go to Home
      </Button>
    </Container>
  );
}