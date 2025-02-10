import api from './api-config';
import type { Topping } from '../types';

export const ToppingsService = {
  getAll: async (): Promise<Topping[]> => {
    const response = await api.get('/toppings');
    return response.data;
  },

  getById: async (id: number): Promise<Topping> => {
    const response = await api.get(`/toppings/${id}`);
    return response.data;
  },

  create: async (name: string): Promise<Topping> => {
    const response = await api.post('/toppings', { name });
    return response.data;
  },

  update: async (id: number, name: string): Promise<Topping> => {
    const response = await api.put(`/toppings/${id}`, { name });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/toppings/${id}`);
  },

  checkDuplicate: async (name: string): Promise<boolean> => {
    try {
      const response = await api.get(`/toppings`);
      const toppings = response.data as Topping[];
      return toppings.some(t => 
        t.name.toLowerCase() === name.toLowerCase()
      );
    } catch (error) {
      console.error('Error checking duplicate topping:', error);
      return false;
    }
  },
};