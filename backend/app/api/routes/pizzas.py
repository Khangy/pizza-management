from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...db.database import get_db
from ...models.models import Pizza, Topping
from ...schemas.schemas import PizzaCreate, Pizza as PizzaSchema

router = APIRouter()

@router.get("/", response_model=List[PizzaSchema])
def get_pizzas(db: Session = Depends(get_db)):
    return db.query(Pizza).all()

@router.post("/", response_model=PizzaSchema)
def create_pizza(pizza: PizzaCreate, db: Session = Depends(get_db)):
    # Check if pizza name already exists
    db_pizza = db.query(Pizza).filter(Pizza.name.ilike(pizza.name)).first()
    if db_pizza:
        raise HTTPException(status_code=400, detail="Pizza name already exists")
    
    # Get all toppings
    toppings = db.query(Topping).filter(Topping.id.in_(pizza.topping_ids)).all()
    if len(toppings) != len(pizza.topping_ids):
        raise HTTPException(status_code=400, detail="Some toppings not found")
    
    # Check if pizza with same toppings exists
    existing_pizzas = db.query(Pizza).all()
    for existing_pizza in existing_pizzas:
        if set(t.id for t in existing_pizza.toppings) == set(pizza.topping_ids):
            raise HTTPException(
                status_code=400, 
                detail="A pizza with this combination of toppings already exists"
            )
    
    new_pizza = Pizza(name=pizza.name, toppings=toppings)
    db.add(new_pizza)
    db.commit()
    db.refresh(new_pizza)
    return new_pizza

@router.get("/{pizza_id}", response_model=PizzaSchema)
def get_pizza(pizza_id: int, db: Session = Depends(get_db)):
    pizza = db.query(Pizza).filter(Pizza.id == pizza_id).first()
    if not pizza:
        raise HTTPException(status_code=404, detail="Pizza not found")
    return pizza

@router.put("/{pizza_id}", response_model=PizzaSchema)
def update_pizza(pizza_id: int, pizza: PizzaCreate, db: Session = Depends(get_db)):
    db_pizza = db.query(Pizza).filter(Pizza.id == pizza_id).first()
    if not db_pizza:
        raise HTTPException(status_code=404, detail="Pizza not found")
    
    # Check if new name already exists
    existing_pizza = db.query(Pizza).filter(Pizza.name.ilike(pizza.name)).first()
    if existing_pizza and existing_pizza.id != pizza_id:
        raise HTTPException(status_code=400, detail="Pizza name already exists")
    
    # Get all toppings
    toppings = db.query(Topping).filter(Topping.id.in_(pizza.topping_ids)).all()
    if len(toppings) != len(pizza.topping_ids):
        raise HTTPException(status_code=400, detail="Some toppings not found")
    
    # Check if pizza with same toppings exists
    existing_pizzas = db.query(Pizza).all()
    for existing_pizza in existing_pizzas:
        if existing_pizza.id != pizza_id and \
           set(t.id for t in existing_pizza.toppings) == set(pizza.topping_ids):
            raise HTTPException(
                status_code=400, 
                detail="A pizza with this combination of toppings already exists"
            )
    
    db_pizza.name = pizza.name
    db_pizza.toppings = toppings
    db.commit()
    db.refresh(db_pizza)
    return db_pizza

@router.delete("/{pizza_id}")
def delete_pizza(pizza_id: int, db: Session = Depends(get_db)):
    pizza = db.query(Pizza).filter(Pizza.id == pizza_id).first()
    if not pizza:
        raise HTTPException(status_code=404, detail="Pizza not found")
    
    db.delete(pizza)
    db.commit()
    return {"message": "Pizza deleted"}