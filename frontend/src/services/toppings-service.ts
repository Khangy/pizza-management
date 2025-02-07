import { mockToppings } from './mock-data';
import type { Topping } from '../types';

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const ToppingsService = {
  getAll: async (): Promise<Topping[]> => {
    await delay(500); // Simulate network delay
    return [...mockToppings];
  },

  getById: async (id: number): Promise<Topping> => {
    await delay(500);
    const topping = mockToppings.find(t => t.id === id);
    if (!topping) throw new Error('Topping not found');
    return { ...topping };
  },

  create: async (name: string): Promise<Topping> => {
    await delay(500);
    const newTopping: Topping = {
      id: Math.max(...mockToppings.map(t => t.id)) + 1,
      name,
    };
    mockToppings.push(newTopping);
    return { ...newTopping };
  },

  update: async (id: number, name: string): Promise<Topping> => {
    await delay(500);
    const index = mockToppings.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Topping not found');
    mockToppings[index] = { ...mockToppings[index], name };
    return { ...mockToppings[index] };
  },

  delete: async (id: number): Promise<void> => {
    await delay(500);
    const index = mockToppings.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Topping not found');
    mockToppings.splice(index, 1);
  },

  checkDuplicate: async (name: string): Promise<boolean> => {
    await delay(500);
    return mockToppings.some(t => t.name.toLowerCase() === name.toLowerCase());
  },
};