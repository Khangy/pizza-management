import api from './api-config';
import type { Pizza } from '../types';

export const PizzasService = {
  getAll: async (): Promise<Pizza[]> => {
    const response = await api.get('/pizzas');
    return response.data;
  },

  getById: async (id: number): Promise<Pizza> => {
    const response = await api.get(`/pizzas/${id}`);
    return response.data;
  },

  create: async (data: { name: string; toppingIds: number[] }): Promise<Pizza> => {
    const response = await api.post('/pizzas', {
      name: data.name,
      topping_ids: data.toppingIds // Note: backend expects snake_case
    });
    return response.data;
  },

  update: async (id: number, data: { name: string; toppingIds: number[] }): Promise<Pizza> => {
    const response = await api.put(`/pizzas/${id}`, {
      name: data.name,
      topping_ids: data.toppingIds // Note: backend expects snake_case
    });
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/pizzas/${id}`);
  },

  checkDuplicate: async (name: string, toppingIds: number[]): Promise<{
    isDuplicate: boolean;
    reason?: 'name' | 'toppings';
  }> => {
    try {
      const response = await api.get('/pizzas');
      const pizzas = response.data as Pizza[];
      
      // Check name duplicate
      const nameExists = pizzas.some(p => 
        p.name.toLowerCase() === name.toLowerCase()
      );
      if (nameExists) {
        return { isDuplicate: true, reason: 'name' };
      }

      // Check toppings duplicate
      const toppingCombinationExists = pizzas.some(pizza => {
        const pizzaToppingIds = pizza.toppings.map(t => t.id);
        return JSON.stringify([...pizzaToppingIds].sort()) === 
               JSON.stringify([...toppingIds].sort());
      });

      if (toppingCombinationExists) {
        return { isDuplicate: true, reason: 'toppings' };
      }

      return { isDuplicate: false };
    } catch (error) {
      console.error('Error checking duplicate pizza:', error);
      return { isDuplicate: false };
    }
  },
};