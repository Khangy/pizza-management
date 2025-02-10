export interface Topping {
  id: number;
  name: string;
  pizzas: Pizza[];
}

export interface Pizza {
  id: number;
  name: string;
  toppings: Topping[];
}