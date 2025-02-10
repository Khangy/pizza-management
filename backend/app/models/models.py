from sqlalchemy import Column, Integer, String, Table, ForeignKey
from sqlalchemy.orm import relationship
from ..db.database import Base

# Association table for Pizza-Topping relationship
pizza_toppings = Table(
    'pizza_toppings',
    Base.metadata,
    Column('pizza_id', Integer, ForeignKey('pizzas.id')),
    Column('topping_id', Integer, ForeignKey('toppings.id'))
)

class Pizza(Base):
    __tablename__ = "pizzas"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    toppings = relationship("Topping", secondary=pizza_toppings, back_populates="pizzas")

class Topping(Base):
    __tablename__ = "toppings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    pizzas = relationship("Pizza", secondary=pizza_toppings, back_populates="toppings")