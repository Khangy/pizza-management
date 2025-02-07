import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { ToppingsService } from '../services/toppings-service';
import { useApi } from '../hooks/useApi';
import type { Topping } from '../types';

export default function ToppingsPage() {
  // State management
  const { data: toppings, loading, error: apiError, execute } = useApi<Topping[]>();
  const [open, setOpen] = useState(false);
  const [editingTopping, setEditingTopping] = useState<Topping | null>(null);
  const [newToppingName, setNewToppingName] = useState('');
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load toppings on component mount
  useEffect(() => {
    loadToppings();
  }, []);

  const loadToppings = async () => {
    try {
      await execute(ToppingsService.getAll);
    } catch (error) {
      console.error('Failed to load toppings:', error);
    }
  };

  const handleAddTopping = () => {
    setOpen(true);
    setEditingTopping(null);
    setNewToppingName('');
    setFormError('');
  };

  const handleEditTopping = (topping: Topping) => {
    setOpen(true);
    setEditingTopping(topping);
    setNewToppingName(topping.name);
    setFormError('');
  };

  const handleDeleteTopping = async (id: number) => {
    try {
      await ToppingsService.delete(id);
      setSuccessMessage('Topping deleted successfully');
      await loadToppings();
    } catch (error) {
      setSuccessMessage('Failed to delete topping');
    }
  };

  const handleSave = async () => {
    if (!newToppingName.trim()) {
      setFormError('Topping name is required');
      return;
    }

    try {
      const isDuplicate = await ToppingsService.checkDuplicate(newToppingName);
      if (isDuplicate && (!editingTopping || editingTopping.name !== newToppingName)) {
        setFormError('This topping already exists');
        return;
      }

      if (editingTopping) {
        await ToppingsService.update(editingTopping.id, newToppingName);
        setSuccessMessage('Topping updated successfully');
      } else {
        await ToppingsService.create(newToppingName);
        setSuccessMessage('Topping created successfully');
      }

      setOpen(false);
      setNewToppingName('');
      await loadToppings();
    } catch (error) {
      setFormError('Failed to save topping');
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Manage Toppings
      </Typography>

      {apiError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {apiError}
        </Alert>
      )}

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddTopping}
        sx={{ mb: 2 }}
      >
        Add New Topping
      </Button>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <CircularProgress />
        </div>
      ) : (
        <List>
          {toppings?.map((topping) => (
            <ListItem
              key={topping.id}
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 1,
                mb: 1,
              }}
            >
              <ListItemText primary={topping.name} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleEditTopping(topping)}
                  sx={{ mr: 1 }}
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteTopping(topping.id)}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingTopping ? 'Edit Topping' : 'Add New Topping'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Topping Name"
            fullWidth
            value={newToppingName}
            onChange={(e) => setNewToppingName(e.target.value)}
            error={!!formError}
            helperText={formError}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message Snackbar */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSuccessMessage('')} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {successMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
}