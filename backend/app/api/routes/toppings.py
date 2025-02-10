from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ...db.database import get_db
from ...models.models import Topping
from ...schemas.schemas import ToppingCreate, Topping as ToppingSchema

router = APIRouter()

@router.get("/", response_model=List[ToppingSchema])
def get_toppings(db: Session = Depends(get_db)):
    return db.query(Topping).all()

@router.post("/", response_model=ToppingSchema)
def create_topping(topping: ToppingCreate, db: Session = Depends(get_db)):
    # Check if topping already exists
    db_topping = db.query(Topping).filter(Topping.name.ilike(topping.name)).first()
    if db_topping:
        raise HTTPException(status_code=400, detail="Topping already exists")
    
    new_topping = Topping(name=topping.name)
    db.add(new_topping)
    db.commit()
    db.refresh(new_topping)
    return new_topping

@router.get("/{topping_id}", response_model=ToppingSchema)
def get_topping(topping_id: int, db: Session = Depends(get_db)):
    topping = db.query(Topping).filter(Topping.id == topping_id).first()
    if not topping:
        raise HTTPException(status_code=404, detail="Topping not found")
    return topping

@router.put("/{topping_id}", response_model=ToppingSchema)
def update_topping(topping_id: int, topping: ToppingCreate, db: Session = Depends(get_db)):
    db_topping = db.query(Topping).filter(Topping.id == topping_id).first()
    if not db_topping:
        raise HTTPException(status_code=404, detail="Topping not found")
    
    # Check if new name already exists
    existing_topping = db.query(Topping).filter(Topping.name.ilike(topping.name)).first()
    if existing_topping and existing_topping.id != topping_id:
        raise HTTPException(status_code=400, detail="Topping name already exists")
    
    db_topping.name = topping.name
    db.commit()
    db.refresh(db_topping)
    return db_topping

@router.delete("/{topping_id}")
def delete_topping(topping_id: int, db: Session = Depends(get_db)):
    topping = db.query(Topping).filter(Topping.id == topping_id).first()
    if not topping:
        raise HTTPException(status_code=404, detail="Topping not found")
    
    # Check if topping is used in any pizzas
    if topping.pizzas:
        # Return 400 with list of pizzas using this topping
        pizza_names = [pizza.name for pizza in topping.pizzas]
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Cannot delete topping as it is used in existing pizzas",
                "pizzas": pizza_names
            }
        )
    
    db.delete(topping)
    db.commit()
    return {"message": "Topping deleted"}