import { mockPizzas, mockToppings } from './mock-data';
import type { Pizza } from '../types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check if two arrays have the same elements
const areArraysEqual = (arr1: number[], arr2: number[]) => {
  if (arr1.length !== arr2.length) return false;
  const sorted1 = [...arr1].sort();
  const sorted2 = [...arr2].sort();
  return sorted1.every((value, index) => value === sorted2[index]);
};

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

  checkDuplicate: async (name: string, toppingIds: number[], currentPizzaId?: number): Promise<{
    isDuplicate: boolean;
    reason?: 'name' | 'toppings';
  }> => {
    await delay(500);
    
    // Check for duplicate name
    const nameExists = mockPizzas.some(p => 
      p.id !== currentPizzaId && 
      p.name.toLowerCase() === name.toLowerCase()
    );
    if (nameExists) {
      return { isDuplicate: true, reason: 'name' };
    }

    // Check for duplicate topping combination
    const toppingCombinationExists = mockPizzas.some(p => {
      if (p.id === currentPizzaId) return false;
      const pizzaToppingIds = p.toppings.map(t => t.id);
      return areArraysEqual(pizzaToppingIds, toppingIds);
    });

    if (toppingCombinationExists) {
      return { isDuplicate: true, reason: 'toppings' };
    }

    return { isDuplicate: false };
  },

  create: async (data: { name: string; toppingIds: number[] }): Promise<Pizza> => {
    await delay(500);
    
    // Check for duplicates before creating
    const { isDuplicate, reason } = await PizzasService.checkDuplicate(data.name, data.toppingIds);
    if (isDuplicate) {
      throw new Error(
        reason === 'name' 
          ? 'A pizza with this name already exists' 
          : 'A pizza with this combination of toppings already exists'
      );
    }

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
    
    // Check for duplicates before updating
    const { isDuplicate, reason } = await PizzasService.checkDuplicate(data.name, data.toppingIds, id);
    if (isDuplicate) {
      throw new Error(
        reason === 'name' 
          ? 'A pizza with this name already exists' 
          : 'A pizza with this combination of toppings already exists'
      );
    }

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
  }
};