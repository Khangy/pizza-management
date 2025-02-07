export interface Topping {
    id: number;
    name: string;
  }
  
  export interface Pizza {
    id: number;
    name: string;
    toppings: Topping[];
  }