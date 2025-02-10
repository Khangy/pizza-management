import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Alert,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { PizzasService } from '../services/pizzas-service';
import { ToppingsService } from '../services/toppings-service';
import { useApi } from '../hooks/useApi';
import type { Pizza, Topping } from '../types';

export default function PizzasPage() {
  // State management
  const { data: pizzas, loading: pizzasLoading, error: pizzasError, execute: executePizzas } = useApi<Pizza[]>();
  const { data: toppings, loading: toppingsLoading, execute: executeToppings } = useApi<Topping[]>();
  
  const [open, setOpen] = useState(false);
  const [editingPizza, setEditingPizza] = useState<Pizza | null>(null);
  const [newPizzaName, setNewPizzaName] = useState('');
  const [selectedToppings, setSelectedToppings] = useState<number[]>([]);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    open: boolean;
    pizzaId: number | null;
    pizzaName: string;
  }>({
    open: false,
    pizzaId: null,
    pizzaName: '',
  });

  // Load data on component mount
  useEffect(() => {
    loadPizzas();
    loadToppings();
  }, []);

  const loadPizzas = async () => {
    try {
      await executePizzas(PizzasService.getAll);
    } catch (error) {
      console.error('Failed to load pizzas:', error);
    }
  };

  const loadToppings = async () => {
    try {
      await executeToppings(ToppingsService.getAll);
    } catch (error) {
      console.error('Failed to load toppings:', error);
    }
  };

  const handleAddPizza = () => {
    setOpen(true);
    setEditingPizza(null);
    setNewPizzaName('');
    setSelectedToppings([]);
    setFormError('');
  };

  const handleEditPizza = (pizza: Pizza) => {
    setOpen(true);
    setEditingPizza(pizza);
    setNewPizzaName(pizza.name);
    setSelectedToppings(pizza.toppings.map(t => t.id));
    setFormError('');
  };

  const handleDeleteClick = (pizza: Pizza) => {
    setDeleteConfirmation({
      open: true,
      pizzaId: pizza.id,
      pizzaName: pizza.name,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteConfirmation.pizzaId) {
      try {
        await PizzasService.delete(deleteConfirmation.pizzaId);
        setSuccessMessage('Pizza deleted successfully');
        await loadPizzas();
      } catch (error) {
        setSuccessMessage('Failed to delete pizza');
      }
    }
    setDeleteConfirmation({ open: false, pizzaId: null, pizzaName: '' });
  };

  const handleSave = async () => {
    if (!newPizzaName.trim()) {
      setFormError('Pizza name is required');
      return;
    }

    if (selectedToppings.length === 0) {
      setFormError('Please select at least one topping');
      return;
    }

    try {
      const data = {
        name: newPizzaName,
        toppingIds: selectedToppings,
      };

      if (editingPizza) {
        await PizzasService.update(editingPizza.id, data);
        setSuccessMessage('Pizza updated successfully');
      } else {
        await PizzasService.create(data);
        setSuccessMessage('Pizza created successfully');
      }

      setOpen(false);
      setNewPizzaName('');
      setSelectedToppings([]);
      await loadPizzas();
    } catch (error: any) {
      if (error.response?.status === 400) {
        setFormError(error.response.data.detail);
      } else {
        setFormError('Failed to save pizza');
      }
    }
  };

  const isLoading = pizzasLoading || toppingsLoading;

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" component="h1" gutterBottom>
        Manage Pizzas
      </Typography>

      {pizzasError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {pizzasError}
        </Alert>
      )}

      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddPizza}
        sx={{ mb: 2 }}
      >
        Create New Pizza
      </Button>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {pizzas?.map((pizza) => (
            <Grid item xs={12} sm={6} md={4} key={pizza.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {pizza.name}
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {pizza.toppings.map((topping) => (
                      <Chip
                        key={topping.id}
                        label={topping.name}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditPizza(pizza)}
                    data-testid={`edit-button-${pizza.id}`}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeleteClick(pizza)}
                    data-testid={`delete-button-${pizza.id}`}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Dialog */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingPizza ? 'Edit Pizza' : 'Create New Pizza'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Pizza Name"
            fullWidth
            value={newPizzaName}
            onChange={(e) => setNewPizzaName(e.target.value)}
            error={!!formError}
            helperText={formError}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth error={!!formError && selectedToppings.length === 0}>
            <InputLabel id="toppings-label">Toppings</InputLabel>
            <Select
              labelId="toppings-label"
              multiple
              value={selectedToppings}
              onChange={(e) => setSelectedToppings(e.target.value as number[])}
              label="Toppings"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip
                      key={value}
                      label={toppings?.find(t => t.id === value)?.name}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {toppings?.map((topping) => (
                <MenuItem key={topping.id} value={topping.id}>
                  {topping.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} color="primary" variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmation.open}
        onClose={() => setDeleteConfirmation({ open: false, pizzaId: null, pizzaName: '' })}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the pizza "{deleteConfirmation.pizzaName}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirmation({ open: false, pizzaId: null, pizzaName: '' })}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
          >
            Delete
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