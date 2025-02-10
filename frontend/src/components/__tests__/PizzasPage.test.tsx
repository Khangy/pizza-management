import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PizzasPage from '../../pages/PizzasPage';
import { PizzasService } from '../../services/pizzas-service';
import { ToppingsService } from '../../services/toppings-service';
import { useApi } from '../../hooks/useApi';

// Mock the hooks and services
vi.mock('../../hooks/useApi', () => ({
  useApi: vi.fn()
}));

vi.mock('../../services/pizzas-service', () => ({
  PizzasService: {
    getAll: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../services/toppings-service', () => ({
  ToppingsService: {
    getAll: vi.fn(),
  },
}));

describe('PizzasPage', () => {
  const mockToppings = [
    { id: 1, name: 'Pepperoni', pizzas: [] },
    { id: 2, name: 'Mushrooms', pizzas: [] },
    { id: 3, name: 'Onions', pizzas: [] },
  ];

  const mockPizzas = [
    {
      id: 1,
      name: 'Pepperoni Pizza',
      toppings: [mockToppings[0]],
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    
    // Mock both useApi calls with default values
    (useApi as any).mockImplementation((initialValue?: any) => ({
      data: initialValue,
      loading: false,
      error: null,
      execute: vi.fn(),
    }));
  });

  // 1. Basic Rendering Tests
  describe('Page Rendering', () => {
    it('renders the page title', () => {
      render(<PizzasPage />);
      expect(screen.getByText('Manage Pizzas')).toBeInTheDocument();
    });

    it('renders the create pizza button', () => {
      render(<PizzasPage />);
      expect(screen.getByText('Create New Pizza')).toBeInTheDocument();
    });

    it('shows loading state', () => {
      (useApi as any).mockImplementation(() => ({
        data: null,
        loading: true,
        error: null,
        execute: vi.fn(),
      }));

      render(<PizzasPage />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });
  });

  // 2. Create Pizza Tests
  describe('Creating Pizzas', () => {
    beforeEach(() => {
      (useApi as any)
        .mockImplementationOnce(() => ({
          data: mockPizzas,
          loading: false,
          error: null,
          execute: vi.fn(),
        }))
        .mockImplementationOnce(() => ({
          data: mockToppings,
          loading: false,
          error: null,
          execute: vi.fn(),
        }));
    });

    it('opens create pizza dialog', async () => {
      render(<PizzasPage />);
      await userEvent.click(screen.getByText('Create New Pizza'));
      
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/Pizza Name/i)).toBeInTheDocument();
    });

    it('shows validation error for empty name', async () => {
      render(<PizzasPage />);
      await userEvent.click(screen.getByText('Create New Pizza'));
      await userEvent.click(screen.getByText('Save'));
      
      expect(screen.getByText('Pizza name is required')).toBeInTheDocument();
    });

    it('shows validation error for no toppings selected', async () => {
      render(<PizzasPage />);
      await userEvent.click(screen.getByText('Create New Pizza'));
      await userEvent.type(screen.getByLabelText(/Pizza Name/i), 'Test Pizza');
      await userEvent.click(screen.getByText('Save'));
      
      expect(screen.getByText('Please select at least one topping')).toBeInTheDocument();
    });
  });

  // 3. Edit Pizza Tests
  describe('Editing Pizzas', () => {
    beforeEach(() => {
      (useApi as any)
        .mockImplementationOnce(() => ({
          data: mockPizzas,
          loading: false,
          error: null,
          execute: vi.fn(),
        }))
        .mockImplementationOnce(() => ({
          data: mockToppings,
          loading: false,
          error: null,
          execute: vi.fn(),
        }));
    });

    it('opens edit dialog with pizza data', async () => {
      render(<PizzasPage />);
      
      // Wait for the pizza card to be rendered
      await waitFor(() => {
        expect(screen.getByText('Pepperoni Pizza')).toBeInTheDocument();
      });

      const editButton = screen.getByTestId('edit-button-1');
      await userEvent.click(editButton);

      expect(screen.getByLabelText(/Pizza Name/i)).toHaveValue('Pepperoni Pizza');
    });
  });

  // 4. Delete Pizza Tests
  describe('Deleting Pizzas', () => {
    beforeEach(() => {
      (useApi as any)
        .mockImplementationOnce(() => ({
          data: mockPizzas,
          loading: false,
          error: null,
          execute: vi.fn(),
        }))
        .mockImplementationOnce(() => ({
          data: mockToppings,
          loading: false,
          error: null,
          execute: vi.fn(),
        }));
    });

    it('shows delete confirmation dialog', async () => {
      render(<PizzasPage />);
      
      // Wait for the pizza card to be rendered
      await waitFor(() => {
        expect(screen.getByText('Pepperoni Pizza')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-button-1');
      await userEvent.click(deleteButton);

      expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
    });

    it('deletes pizza after confirmation', async () => {
      render(<PizzasPage />);
      
      await waitFor(() => {
        expect(screen.getByText('Pepperoni Pizza')).toBeInTheDocument();
      });

      const deleteButton = screen.getByTestId('delete-button-1');
      await userEvent.click(deleteButton);

      const confirmButton = screen.getByRole('button', { name: /delete$/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(PizzasService.delete).toHaveBeenCalledWith(1);
      });
    });
  });
});