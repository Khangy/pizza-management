from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import pizzas, toppings

app = FastAPI(title="Pizza Management API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(pizzas.router, prefix="/api/pizzas", tags=["pizzas"])
app.include_router(toppings.router, prefix="/api/toppings", tags=["toppings"])

@app.get("/")
async def root():
    return {"message": "Welcome to Pizza Management API"}