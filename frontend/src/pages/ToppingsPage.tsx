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
  DialogContentText,
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
  const [deleteError, setDeleteError] = useState<{
    open: boolean;
    message: string;
    pizzas?: string[];
  }>({
    open: false,
    message: '',
  });

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
    } catch (error: any) {
      if (error.response?.status === 400 && error.response?.data?.detail?.pizzas) {
        setDeleteError({
          open: true,
          message: error.response.data.detail.message,
          pizzas: error.response.data.detail.pizzas,
        });
      } else {
        setSuccessMessage('Failed to delete topping');
      }
    }
  };

  const handleSave = async () => {
    if (!newToppingName.trim()) {
      setFormError('Topping name is required');
      return;
    }

    try {
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
    } catch (error: any) {
      if (error.response?.status === 400) {
        setFormError(error.response.data.detail);
      } else {
        setFormError('Failed to save topping');
      }
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
              <ListItemText 
                primary={topping.name}
                secondary={topping.pizzas?.length > 0 
                  ? `Used in ${topping.pizzas.length} pizza(s)` 
                  : 'Not in use'
                }
              />
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
                  disabled={topping.pizzas?.length > 0}
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

      {/* Delete Error Dialog */}
      <Dialog
        open={deleteError.open}
        onClose={() => setDeleteError({ open: false, message: '' })}
      >
        <DialogTitle>Cannot Delete Topping</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {deleteError.message}
          </DialogContentText>
          {deleteError.pizzas && deleteError.pizzas.length > 0 && (
            <>
              <DialogContentText sx={{ mt: 2 }}>
                This topping is used in the following pizzas:
              </DialogContentText>
              <List>
                {deleteError.pizzas.map((pizza, index) => (
                  <ListItem key={index}>• {pizza}</ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteError({ open: false, message: '' })}
            color="primary"
          >
            Close
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