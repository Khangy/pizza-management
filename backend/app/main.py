from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import pizzas, toppings
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Pizza Management API")

# Get allowed origins from environment variable or use defaults
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://localhost:5173"
).split(",")

# Configure CORS with dynamic origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(pizzas.router, prefix="/api/pizzas", tags=["pizzas"])
app.include_router(toppings.router, prefix="/api/toppings", tags=["toppings"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Pizza Management API",
        "docs": "/docs",  # Link to API documentation
        "version": "1.0.0"
    }

# Add health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy"}