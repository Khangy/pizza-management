import type { Topping, Pizza } from '../types';

export const mockToppings: Topping[] = [
  { id: 1, name: 'Pepperoni' },
  { id: 2, name: 'Mushrooms' },
  { id: 3, name: 'Onions' },
  { id: 4, name: 'Sausage' },
  { id: 5, name: 'Bell Peppers' },
  { id: 6, name: 'Extra Cheese' },
];

export const mockPizzas: Pizza[] = [
  {
    id: 1,
    name: 'Pepperoni',
    toppings: [mockToppings[0], mockToppings[5]], // Pepperoni and Extra Cheese
  },
  {
    id: 2,
    name: 'Veggie',
    toppings: [mockToppings[1], mockToppings[2], mockToppings[4]], // Mushrooms, Onions, Bell Peppers
  },
  {
    id: 3,
    name: 'Meat Lovers',
    toppings: [mockToppings[0], mockToppings[3]], // Pepperoni and Sausage
  },
];