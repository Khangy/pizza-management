import { mockPizzas, mockToppings } from './mock-data';
import type { Pizza } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const PizzasService = {
  getAll: async (): Promise<Pizza[]> => {
    await delay(500);
    return [...mockPizzas];
  },

  getById: async (id: number): Promise<Pizza> => {
    await delay(500);
    const pizza = mockPizzas.find(p => p.id === id);
    if (!pizza) throw new Error('Pizza not found');
    return { ...pizza };
  },

  create: async (data: { name: string; toppingIds: number[] }): Promise<Pizza> => {
    await delay(500);
    const newPizza: Pizza = {
      id: Math.max(...mockPizzas.map(p => p.id)) + 1,
      name: data.name,
      toppings: mockToppings.filter(t => data.toppingIds.includes(t.id)),
    };
    mockPizzas.push(newPizza);
    return { ...newPizza };
  },

  update: async (id: number, data: { name: string; toppingIds: number[] }): Promise<Pizza> => {
    await delay(500);
    const index = mockPizzas.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Pizza not found');
    mockPizzas[index] = {
      ...mockPizzas[index],
      name: data.name,
      toppings: mockToppings.filter(t => data.toppingIds.includes(t.id)),
    };
    return { ...mockPizzas[index] };
  },

  delete: async (id: number): Promise<void> => {
    await delay(500);
    const index = mockPizzas.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Pizza not found');
    mockPizzas.splice(index, 1);
  },

  checkDuplicate: async (name: string): Promise<boolean> => {
    await delay(500);
    return mockPizzas.some(p => p.name.toLowerCase() === name.toLowerCase());
  },
};