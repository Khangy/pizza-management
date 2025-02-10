import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ToppingsPage from '../../pages/ToppingsPage';
import { ToppingsService } from '../../services/toppings-service';
import { useApi } from '../../hooks/useApi';

// Mock the hooks and services
vi.mock('../../hooks/useApi', () => ({
  useApi: vi.fn()
}));

vi.mock('../../services/toppings-service', () => ({
  ToppingsService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('ToppingsPage', () => {
  // Setup default mocks before each test
  beforeEach(() => {
    vi.resetAllMocks();
    (useApi as any).mockReturnValue({
      data: [],
      loading: false,
      error: null,
      execute: vi.fn(),
    });
  });

  // 1. Basic Rendering Tests
  describe('Page Rendering', () => {
    it('renders the page title', () => {
      render(<ToppingsPage />);
      expect(screen.getByText('Manage Toppings')).toBeInTheDocument();
    });

    it('renders the add topping button', () => {
      render(<ToppingsPage />);
      expect(screen.getByText('Add New Topping')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      (useApi as any).mockReturnValue({
        data: null,
        loading: true,
        error: null,
        execute: vi.fn(),
      });

      render(<ToppingsPage />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('shows error state', () => {
      (useApi as any).mockReturnValue({
        data: null,
        loading: false,
        error: 'Failed to load toppings',
        execute: vi.fn(),
      });

      render(<ToppingsPage />);
      expect(screen.getByText('Failed to load toppings')).toBeInTheDocument();
    });
  });

  // 2. Add Topping Tests
  describe('Adding Toppings', () => {
    it('opens add topping dialog when clicking add button', async () => {
      render(<ToppingsPage />);
      await userEvent.click(screen.getByText('Add New Topping'));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText('Topping Name')).toBeInTheDocument();
    });

    it('validates empty topping name', async () => {
      render(<ToppingsPage />);
      await userEvent.click(screen.getByText('Add New Topping'));
      await userEvent.click(screen.getByText('Save'));
      expect(screen.getByText('Topping name is required')).toBeInTheDocument();
    });

    it('successfully adds a new topping', async () => {
      const newTopping = { id: 1, name: 'Pepperoni', pizzas: [] };
      (ToppingsService.create as any).mockResolvedValue(newTopping);

      render(<ToppingsPage />);
      await userEvent.click(screen.getByText('Add New Topping'));
      await userEvent.type(screen.getByLabelText('Topping Name'), 'Pepperoni');
      await userEvent.click(screen.getByText('Save'));

      await waitFor(() => {
        expect(ToppingsService.create).toHaveBeenCalledWith('Pepperoni');
        expect(screen.getByText('Topping created successfully')).toBeInTheDocument();
      });
    });
  });

  // 3. Delete Topping Tests
  describe('Deleting Toppings', () => {
    const mockToppings = [
      { id: 1, name: 'Pepperoni', pizzas: [] }
    ];

    it('disables delete button for toppings used in pizzas', () => {
      const toppingsWithPizzas = [
        { 
          id: 1, 
          name: 'Pepperoni', 
          pizzas: [{ id: 1, name: 'Pizza 1' }] 
        }
      ];

      (useApi as any).mockReturnValue({
        data: toppingsWithPizzas,
        loading: false,
        error: null,
        execute: vi.fn(),
      });

      render(<ToppingsPage />);
      
      // Change this to find button by icon
      const deleteButton = screen.getByTestId('delete-button-1');
      expect(deleteButton).toBeDisabled();
      expect(screen.getByText('Used in 1 pizza(s)')).toBeInTheDocument();
    });

    it('shows confirmation dialog before deleting unused topping', async () => {
      (useApi as any).mockReturnValue({
        data: mockToppings,
        loading: false,
        error: null,
        execute: vi.fn(),
      });

      render(<ToppingsPage />);
      
      // Click the delete icon button
      const deleteButton = screen.getByTestId('delete-button-1');
      await userEvent.click(deleteButton);

      // Verify confirmation dialog
      expect(screen.getByText(/Are you sure you want to delete the topping "Pepperoni"/i)).toBeInTheDocument();
    });

    it('successfully deletes topping after confirmation', async () => {
      (useApi as any).mockReturnValue({
        data: mockToppings,
        loading: false,
        error: null,
        execute: vi.fn(),
      });

      render(<ToppingsPage />);
      
      // Click delete button
      const deleteButton = screen.getByTestId('delete-button-1');
      await userEvent.click(deleteButton);
      
      // Click confirm in dialog
      const confirmButton = screen.getByRole('button', { name: /delete$/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(ToppingsService.delete).toHaveBeenCalledWith(1);
        expect(screen.getByText('Topping deleted successfully')).toBeInTheDocument();
      });
    });
  });

  // 4. Edit Topping Tests
  describe('Editing Toppings', () => {
    const mockToppings = [
      { id: 1, name: 'Pepperoni', pizzas: [] }
    ];

    it('opens edit dialog with current topping name', async () => {
      (useApi as any).mockReturnValue({
        data: mockToppings,
        loading: false,
        error: null,
        execute: vi.fn(),
      });

      render(<ToppingsPage />);
      
      // Click the edit icon button
      const editButton = screen.getByTestId('edit-button-1');
      await userEvent.click(editButton);

      // Check if dialog opens with current name
      const input = screen.getByLabelText('Topping Name');
      expect(input).toHaveValue('Pepperoni');
    });

    it('successfully updates topping name', async () => {
      (useApi as any).mockReturnValue({
        data: mockToppings,
        loading: false,
        error: null,
        execute: vi.fn(),
      });

      render(<ToppingsPage />);
      
      // Click edit button
      const editButton = screen.getByTestId('edit-button-1');
      await userEvent.click(editButton);

      // Update name
      const input = screen.getByLabelText('Topping Name');
      await userEvent.clear(input);
      await userEvent.type(input, 'Super Pepperoni');
      
      // Save changes
      const saveButton = screen.getByRole('button', { name: 'Save' });
      await userEvent.click(saveButton);

      await waitFor(() => {
        expect(ToppingsService.update).toHaveBeenCalledWith(1, 'Super Pepperoni');
        expect(screen.getByText('Topping updated successfully')).toBeInTheDocument();
      });
    });
  });
});