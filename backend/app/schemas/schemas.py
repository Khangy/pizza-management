from pydantic import BaseModel
from typing import List, Optional

# Base models
class ToppingBase(BaseModel):
    name: str

class PizzaBase(BaseModel):
    name: str

# Create models
class ToppingCreate(ToppingBase):
    pass

class PizzaCreate(PizzaBase):
    topping_ids: List[int]

# Simple models for relationships
class ToppingSimple(ToppingBase):
    id: int

    class Config:
        orm_mode = True

class PizzaSimple(PizzaBase):
    id: int

    class Config:
        orm_mode = True

# Full models
class Topping(ToppingBase):
    id: int
    pizzas: List[PizzaSimple] = []

    class Config:
        orm_mode = True

class Pizza(PizzaBase):
    id: int
    toppings: List[ToppingSimple]

    class Config:
        orm_mode = True